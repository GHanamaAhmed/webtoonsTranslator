import { NextRequest, NextResponse } from "next/server";
import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { combineBlocks, imageAnnotatorClient } from "@/lib/utilsServer";
import { createMaskImage } from "@/lib/aiTools/delteObjects";
import sharp from "sharp";
import { translateText } from "@/lib/aiTools/translate";
import { overlayTranslatedText } from "@/lib/aiTools/overLayTranslatedText";
import Bottleneck from "bottleneck";
import { chunkArray, withMiddleware } from "@/lib/utils";
import axios from "axios";
import { google as googleTranslate } from "@google-cloud/translate/build/protos/protos";
import { google as googleVison } from "@google-cloud/vision/build/protos/protos";
import { translationMiddleware } from "@/middlewares/transaltionMiddleware";
import { db } from "@/lib/db";
const baseDir = process.env.BASE_DIR;
const modelPath = process.env.MODEL_PATH;
const scriptPath = process.env.SCRIPT_PATH;
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
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
      targetLanguage: string;
      chapterId: string;
      projectId: string;
    } = await req?.json();
    const ids = body.ids;
    const targetLanguage = body.targetLanguage;
    const urls = ids.map((id) => cloudinary.v2.url(id));
    // Fetch the images from the URLs
    const buffers = await Promise.all(
      urls.map(async (url) =>
        fetch(url).then(async (res) => Buffer.from(await res.arrayBuffer()))
      )
    );
    // Convert WebP images to PNG for processing
    const pngBuffers = await Promise.all(
      buffers.map(async (buffer) => sharp(buffer).png().toBuffer())
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
    // Create masks based on text detection
    const bufferMasks = await Promise.all(
      pngBuffers.map(
        async (buffer, index) =>
          await createMaskImage(buffer, iAnnotateImageResponse[index], 1.1)
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
      const { data }: { data: string[] } = await axios.post(
        "http://localhost:5000/predict",
        {
          model_path: "big-lama",
          urls: ids.map((id, i) => ({
            image: cloudinary.v2.url(id),
            mask: uploadedMasks[i].secure_url,
          })),
        }
      );
      deletedText = data;
    } else {
      throw new Error("Unsupported model type");
    }
    // Continue with translation and overlay as before
    const fullTextAnnotations = iAnnotateImageResponse.map((res) => {
      return res.fullTextAnnotation;
    });
    const blocksText = fullTextAnnotations.map((fullTextAnnotation) => {
      return combineBlocks(fullTextAnnotation || {});
    });
    const translatedBlocksText: googleTranslate.cloud.translation.v3.ITranslateTextResponse[] =
      [];
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
          const response = await translateText(
            currentTextBatch,
            targetLanguage
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
        const response = await translateText(currentTextBatch, targetLanguage);

        // Add the translated text responses to the final array
        translatedBlocksText.push(response);
      });
    }
    const translatedBuffers = await Promise.all(
      deletedText.map(async (url, index) => {
        return await overlayTranslatedText(
          await sharp(
            Buffer.from(await fetch(url).then((res) => res.arrayBuffer()))
          )
            .png()
            .toBuffer(),
          translatedBlocksText[index].translations?.map((translation, i) => {
            return {
              text: translation.translatedText || "",
              boundingBox: blocksText[index][i].boundingBox,
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
    // const pages = Promise.all(
    //   Array.from({ length: ids.length }).map((_, index) => {
    //     return db.page.create({
    //       data: {
    //         chapterId: body.chapterId,
    //         originalImageUrl: ids[index],
    //         deletedTextImageUrl: deletedText[index],
    //         textBlocks: {
    //           create:
    //             blocksText[index]?.map((block, i) => {
    //               return {
    //                 text: block.text || "",
    //                 x: block.boundingBox?.vertices?.[0].x,
    //                 y: block.boundingBox?.vertices?.[0].y,
    //                 width:
    //                   block.boundingBox?.vertices?.[1].x! -
    //                   block.boundingBox?.vertices?.[0].x!,
    //                 height:
    //                   block.boundingBox?.vertices?.[2].y! -
    //                   block.boundingBox?.vertices?.[0].y!,

    //               };
    //             }) || [],
    //         },
    //       },
    //     });
    //   })
    // );
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
export const POST = (req: NextRequest) =>
  withMiddleware(req, [translationMiddleware], handlePost);
