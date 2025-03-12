import { NextRequest, NextResponse } from "next/server";
import { cloudinary, combineBlocks } from "@/lib/utilsServer";
import { imageAnnotatorClient } from "@/lib/aiTools/apiClients";
import sharp from "sharp";
import { googleTranslateTextBasic } from "@/lib/aiTools/google/translate";
import { mergeNearbyBlocksForJapanese } from "@/lib/aiTools/overLayTranslatedText";
import { chunkArray, withMiddleware } from "@/lib/utils";
import { loadImage } from "canvas";
import type { google as googleVision } from "@google-cloud/vision/build/protos/protos";
import {
  characterLimiter,
  requestLimiter,
  visionLimiter,
} from "@/lib/limiters";
import { translationMiddleware } from "@/middlewares/transaltionMiddleware";
async function handlePost(req: NextRequest) {
  try {
    // 1. Request Parsing and Setup
    const body: { ids: string[]; targerLanguageCode: string } =
      await req.json();
    const { ids, targerLanguageCode } = body;
    const urls = ids.map((id) => cloudinary.v2.url(id));

    // Download images and convert them to PNG buffers
    const pngBuffers = await Promise.all(
      urls.map(async (url) =>
        fetch(url).then(async (res) =>
          sharp(await res.arrayBuffer())
            .png()
            .toBuffer()
        )
      )
    );
    // Load images via canvas (if needed later)
    const canvasImages = await Promise.all(
      pngBuffers.map((buffer) => loadImage(buffer))
    );

    // 2. Text Detection via Google Vision API
    const pngBuffersChunk = chunkArray<Buffer>(pngBuffers, 16);
    const visionResponses: googleVision.cloud.vision.v1.IAnnotateImageResponse[] =
      [];
    for (const batch of pngBuffersChunk) {
      const textDetectionRequests: googleVision.cloud.vision.v1.IAnnotateImageRequest[] =
        batch.map((buffer) => ({
          image: { content: buffer.toString("base64") },
          features: [
            {
              type: "TEXT_DETECTION",
            },
          ],
        }));
      const [result] = await visionLimiter.schedule(() =>
        imageAnnotatorClient.batchAnnotateImages({
          requests: textDetectionRequests,
        })
      );
      visionResponses.push(...(result.responses || []));
    }

    // 3. Text Block Combination and Adjustment
    const combinedBlocks = visionResponses.map((res) =>
      combineBlocks(res.fullTextAnnotation || {})
    );
    const blocksText = await Promise.all(
      combinedBlocks.map(async (blocks, index) => {
        // Adjust for Japanese text grouping if needed
        const locale = visionResponses[index].textAnnotations?.[0]?.locale;
        if (locale === "ja") {
          // Map each block to add the required "image" property using canvasImages[index]
          const blocksWithImage = blocks.map((block) => ({
            ...block,
            image: canvasImages[index],
          }));
          return mergeNearbyBlocksForJapanese(
            blocksWithImage,
            95,
            "defaultFont"
          );
        }
        return blocks;
      })
    );
    // 4. Translation Preparation and Execution
    const characterLimit = 5000;
    let translatedResults: string[][] = [];
    let currentTextBatch: string[] = [];
    let currentCharacterCount = 0;

    // Loop through each image's text blocks
    for (let i = 0; i < blocksText.length; i++) {
      const blockTexts = blocksText[i].map(
        (block: { text: string }) => block.text
      );
      const blockCharacterCount = blockTexts.reduce(
        (sum: number, text: string) => sum + text.length,
        0
      );
      if (currentCharacterCount + blockCharacterCount > characterLimit) {
        await characterLimiter.schedule(async () => {
          const response = await requestLimiter.schedule(() =>
            googleTranslateTextBasic(currentTextBatch, targerLanguageCode)
          );
          translatedResults.push(response);
        });
        currentTextBatch = blockTexts;
        currentCharacterCount = blockCharacterCount;
      } else {
        currentTextBatch = currentTextBatch.concat(blockTexts);
        currentCharacterCount += blockCharacterCount;
      }
    }
    if (currentTextBatch.length > 0) {
      await characterLimiter.schedule(async () => {
        const response = await requestLimiter.schedule(() =>
          googleTranslateTextBasic(currentTextBatch, targerLanguageCode)
        );
        translatedResults.push(response);
      });
    }
    // 5. Response to Client
    return new NextResponse(
      JSON.stringify({ translatedTexts: translatedResults }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const POST = async (req: NextRequest) =>
  await withMiddleware(req, [translationMiddleware], handlePost);
