import { NextRequest, NextResponse } from "next/server";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { cloudinary, combineBlocks } from "@/lib/utilsServer";
import { imageAnnotatorClient } from "@/lib/aiTools/apiClients";
import { createMaskImage } from "@/lib/aiTools/delteObjects";
import sharp from "sharp";
import {
  googleTranslateTextAdvanced,
  googleTranslateTextBasic,
} from "@/lib/aiTools/google/translate";
import {
  detectTextColorAndOutline,
  mergeDetectTextColorAndOutline,
  mergeNearbyBlocksForJapanese,
  overlayTranslatedText,
} from "@/lib/aiTools/overLayTranslatedText";
import Bottleneck from "bottleneck";
import {
  chunkArray,
  getDefaultFontFamilyFromCode,
  withMiddleware,
} from "@/lib/utils";
import axios from "axios";
import { google as googleTranslate } from "@google-cloud/translate/build/protos/protos";
import { google as googleVison } from "@google-cloud/vision/build/protos/protos";
import { translationMiddleware } from "@/middlewares/transaltionMiddleware";
import { db } from "@/lib/db";
import { defaultFonts } from "@/constants";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { Image, loadImage } from "canvas";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
const { RUNPOD_API_KEY, ENDPOINT_ID } = process.env;
import runpodSdk from "runpod-sdk";

const runpod = runpodSdk(RUNPOD_API_KEY as string);
const endpoint = runpod.endpoint(ENDPOINT_ID as string);

// Rate limiter configuration based on free tier limits

// Limiter for character processing
const characterLimiter = new Bottleneck({
  minTime: (60 * 1000) / 6000000, // Converts 6,000,000 characters per minute to ms per character
  maxConcurrent: 5, // Example concurrency level for character processing
});

// Limiter for translation requests
const requestLimiter = new Bottleneck({
  minTime: (60 * 1000) / 6000, // Converts 6,000 requests per minute to ms per request
  maxConcurrent: 10, // Example concurrency level for translation requests
});

// Limiter for Vision API requests
const visionLimiter = new Bottleneck({
  minTime: (60 * 1000) / 1800, // Correctly aligns with 1,800 requests per minute as 30 requests per second
  maxConcurrent: 10, // Number of concurrent requests
});

async function handlePost(req: NextRequest) {
  try {
    const body: {
      ids: string[];
      targerLanguageCode: string;
      chapterId: string;
    } = await req?.json();
    const session = await getServerSession(options);
    const ids = body.ids;
    const targerLanguageCode = body.targerLanguageCode;
    const urls = ids.map((id) => cloudinary.v2.url(id));
    const pngBuffers = await Promise.all(
      urls.map(async (url) =>
        fetch(url).then(async (res) =>
          sharp(await res.arrayBuffer())
            .png()
            .toBuffer()
        )
      )
    );
    const canvasImages = await Promise.all(
      pngBuffers.map((buffer) => loadImage(buffer))
    );
    const pngBuffersChunk = chunkArray<Buffer>(pngBuffers, 16);
    const iAnnotateImageResponse: googleVison.cloud.vision.v1.IAnnotateImageResponse[] =
      [];
    // Process each batch sequentially (you can adjust this to run concurrently if needed)
    for (const batch of pngBuffersChunk) {
      const textDetectionRequests: googleVison.cloud.vision.v1.IAnnotateImageRequest[] =
        batch.map((image) => ({
          image: { content: image.toString("base64") }, // Base64 encoded image
          features: [{ type: "TEXT_DETECTION" }], // Use TEXT_DETECTION for text annotation
        }));
      const [result] = await visionLimiter.schedule(() =>
        imageAnnotatorClient.batchAnnotateImages({
          requests: textDetectionRequests,
        })
      );
      iAnnotateImageResponse.push(...result.responses!);
    }
    // Continue with translation and overlay as before
    const fullTextAnnotations = iAnnotateImageResponse.map((res) => {
      return res.fullTextAnnotation;
    });

    const combinedBlock: {
      text: string;
      boundingBox: googleVison.cloud.vision.v1.IBoundingPoly | null;
    }[][] = fullTextAnnotations.map((fullTextAnnotation) => {
      return combineBlocks(fullTextAnnotation || {});
    });
    const blocksText: {
      blocksIndex?: number[];
      text: string;
      boundingBox: googleVison.cloud.vision.v1.IBoundingPoly | null;
    }[][] = await Promise.all(
      combinedBlock.map((blocks, index) => {
        if (iAnnotateImageResponse[index].textAnnotations?.[0].locale == "ja")
          return mergeNearbyBlocksForJapanese(
            blocks.map((e, i) => ({ ...e, image: canvasImages[index] })),
            95,
            defaultFonts.find(
              (font) =>
                font.lngCode ==
                iAnnotateImageResponse[index].textAnnotations?.[0].locale
            )?.fontName || ""
          );
        return blocks;
      })
    );
    // Create masks based on text detection
    const bufferMasks = await Promise.all(
      canvasImages.map(
        async (image, index) =>
          await createMaskImage(
            image,
            blocksText[index].map((e) => e.boundingBox || {}),
            1.2
          )
      )
    );
    // Convert masks to WebP format and upload to Cloudinary
    const uploadPromises1 = bufferMasks.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        sharp(buffer)
          .webp()
          .toBuffer()
          .then((webpBuffer) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_MASKED_FOLDER,
                  use_filename: true,
                  timestamp: Date.now(),
                  unique_filename: true,
                },
                (error, result) => {
                  if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                  } else {
                    resolve(result as UploadApiResponse);
                  }
                }
              )
              .end(webpBuffer);
          })
          .catch(reject);
      });
    });
    const uploadedMasks = await Promise.all(uploadPromises1);

    const modelType = req.headers.get("model-type") || "lama";
    let deletedText: string[];
    if (modelType === "lama") {
      const res= await endpoint?.runSync(
        {
          input: {
            urls: ids.map((id, i) => ({
              image: cloudinary.v2.url(id),
              mask: uploadedMasks[i].secure_url,
            })),
          }
        }
      );
      deletedText = res?.output.results
    } else {
      throw new Error("Unsupported model type");
    }
    let canvasDeletedTextImages = await Promise.all(
      deletedText.map((url) =>
        fetch(url)
          .then(async (res) => await res.arrayBuffer())
          .then(async (arrayBuffer) => sharp(arrayBuffer).png().toBuffer())
          .then(async (buffer) => await loadImage(buffer))
      )
    );

    const translatedBlocksText: string[][] = [];
    const characterLimit = 5000;
    let currentTextBatch: string[] = [];
    let currentIndexesBatch: number[][] = [];
    let currentCharacterCount = 0;

    for (let i = 0; i < blocksText.length; i++) {
      const blocks = blocksText[i];

      // Calculate total characters in the current blocks
      const blockTexts = blocks.map((block) => block.text);
      const blockCharacterCount = blockTexts.reduce(
        (sum, text) => sum + text.length,
        0
      );

      // Check if adding the current blocks exceeds the character limit
      if (currentCharacterCount + blockCharacterCount > characterLimit) {
        // If it does, translate the accumulated blocks
        await characterLimiter.schedule(() => Promise.resolve());
        requestLimiter.schedule(async () => {
          const response = await googleTranslateTextBasic(
            currentTextBatch,
            targerLanguageCode
          );
          // Add the translated text responses to the final array in the same order
          translatedBlocksText.push(response);
        });

        // Reset the batch and character count
        currentTextBatch = blockTexts;
        currentIndexesBatch = blocks.map((_, index) => [i, index]);
        currentCharacterCount = blockCharacterCount;
      } else {
        // If it doesn't exceed, add blocks to the current batch
        currentTextBatch = currentTextBatch.concat(blockTexts);
        currentIndexesBatch = currentIndexesBatch.concat(
          blocks.map((_, index) => [i, index])
        );
        currentCharacterCount += blockCharacterCount;
      }
    }

    // Translate any remaining blocks
    if (currentTextBatch.length > 0) {
      await characterLimiter.schedule(async () => {
        const response = await googleTranslateTextBasic(
          currentTextBatch,
          targerLanguageCode
        );

        // Add the translated text responses to the final array
        translatedBlocksText.push(response);
      });
    }
    let textColorAndOutline = await Promise.all(
      Array.from({ length: ids.length }).map(
        async (_, i) =>
          await detectTextColorAndOutline(
            canvasImages[i],
            iAnnotateImageResponse[i].fullTextAnnotation || {}
          )
      )
    );
    textColorAndOutline = textColorAndOutline.map((blocks, index) => {
      if (iAnnotateImageResponse[index].textAnnotations?.[0].locale == "ja")
        return mergeDetectTextColorAndOutline(
          blocks,
          blocksText[index].map((e) => e.blocksIndex)
        );
      return blocks;
    });
    const translatedBuffers = await Promise.all(
      canvasDeletedTextImages.map(async (image, index) => {
        return await overlayTranslatedText(
          image,
          getDefaultFontFamilyFromCode(targerLanguageCode.toLowerCase()) || "",
          translatedBlocksText[index].map((translatedText, i) => {
            return {
              text: translatedText || "",
              boundingBox: blocksText[index][i].boundingBox,
              fillColor: `rgb(${textColorAndOutline[index][i].avgColor.r},${textColorAndOutline[index][i].avgColor.g},${textColorAndOutline[index][i].avgColor.b})`,
              outlineColor: `rgb(${textColorAndOutline[index][i].outlineColor?.r ||
                textColorAndOutline[index][i].avgColor.r
                },${textColorAndOutline[index][i].outlineColor?.g ||
                textColorAndOutline[index][i].avgColor.g
                },${textColorAndOutline[index][i].outlineColor?.b ||
                textColorAndOutline[index][i].avgColor.b
                })`,
              outline: textColorAndOutline[index][i].hasOutline,
            };
          }) || []
        );
      })
    );

    const uploadPromises3 = translatedBuffers.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        sharp(buffer)
          .webp()
          .toBuffer()
          .then((webpBuffer) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_TRANSLATED_FOLDER,
                  use_filename: true,
                  timestamp: Date.now(),
                  unique_filename: true,
                },
                (error, result) => {
                  if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                  } else {
                    resolve(result as UploadApiResponse);
                  }
                }
              )
              .end(webpBuffer);
          })
          .catch(reject);
      });
    });
    const translatedBuffersUploaded: UploadApiResponse[] = await Promise.all(
      uploadPromises3
    );
    await Promise.all(
      Array.from({ length: ids.length }).map((_, index) => {
        return db.page.create({
          data: {
            chapterId: body.chapterId,
            originalImageUrl: urls[index],
            deletedTextImageUrl: deletedText[index],
            translatedImage: {
              create: {
                imageUrl: translatedBuffersUploaded[index].secure_url,
                languageCode: targerLanguageCode,
              },
            },
            textBlocks: {
              createMany: {
                data:
                  blocksText[index]?.map((block, i) => {
                    return {
                      text: block.text || "",
                      languageCode:
                        iAnnotateImageResponse[index].textAnnotations?.[0]
                          .locale || "",
                      boundingPoly:
                        (block.boundingBox?.vertices as InputJsonValue[]) || [],
                      fontFamily:
                        defaultFonts.find(
                          (font) =>
                            font.lngCode ==
                            iAnnotateImageResponse[index].textAnnotations?.[0]
                              .locale
                        )?.fontName || "",
                      textColor: `rgb(${textColorAndOutline[index][i].avgColor.r},${textColorAndOutline[index][i].avgColor.g},${textColorAndOutline[index][i].avgColor.b})`,
                      outlineColor: textColorAndOutline[index][i].hasOutline
                        ? `rgb(${textColorAndOutline[index][i].outlineColor?.r},${textColorAndOutline[index][i].outlineColor?.g},${textColorAndOutline[index][i].outlineColor?.b})`
                        : "",
                    };
                  }) || [],
              },
            },
            maskImageUrl: uploadedMasks[index].secure_url,
          },
        });
      })
    );
    if (req.subscriptionId) {
      await db.subscription.update({
        where: {
          id: req.subscriptionId,
        },
        data: {
          usedQuantity: {
            increment: ids.length,
          },
        },
      });
    } else {
      if (req.transactionId) {
        await db.payment.update({
          where: {
            id: req.transactionId,
          },
          data: {
            usedQuantity: {
              increment: ids.length,
            },
          },
        });
      } else {
        return new NextResponse(null, { status: 401 }); // Unauthorized if user
      }
    }
    return new NextResponse(JSON.stringify(translatedBuffersUploaded), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("", {
      status: 500,
    });
  }
}
export const POST = async (req: NextRequest) =>
  await withMiddleware(req, [translationMiddleware], handlePost);
