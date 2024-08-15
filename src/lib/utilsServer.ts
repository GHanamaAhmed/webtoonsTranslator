import { type ClassValue, clsx } from "clsx";
import path from "path";
import credentials from "@/intense-climber-374014-04ed221a9eb2.json";
import { VertexAI } from "@google-cloud/vertexai";
import { google } from "@google-cloud/vision/build/protos/protos";
import sharp from "sharp";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { TranslationServiceClient } from "@google-cloud/translate";

// Creates a client
export const imageAnnotatorClient = new ImageAnnotatorClient({
  keyFilename: path.join(
    process.cwd(),
    "src",
    "intense-climber-374014-04ed221a9eb2.json"
  ),
});
export const vertex_ai = new VertexAI({
  project: credentials.project_id,
  googleAuthOptions: {
    credentials,
  },
});
export const translationClient = new TranslationServiceClient({
  keyFilename: path.join(
    process.cwd(),
    "src",
    "intense-climber-374014-04ed221a9eb2.json"
  ),
});

// Combines blocks into an array of objects with text and bounding box
export function combineBlocks(
  fullTextAnnotation: google.cloud.vision.v1.ITextAnnotation
): Array<{
  text: string;
  boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
}> {
  const blocksData: Array<{
    text: string;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
  }> = [];

  if (fullTextAnnotation?.pages) {
    fullTextAnnotation.pages.forEach((page) => {
      page.blocks?.forEach((block) => {
        let blockText = "";
        block.paragraphs?.forEach((paragraph) => {
          paragraph.words?.forEach((word) => {
            const symbols = word.symbols || [];
            blockText += symbols.map((s) => s.text).join("") + " ";
          });
        });

        blocksData.push({
          text: blockText.trim(),
          boundingBox: block.boundingBox || null,
        });
      });
    });
  }

  return blocksData;
}

export async function convertAndProcessImage(
  inputPath: string,
  outputPath: string
) {
  try {
    // Convert WebP to png using Sharp
    await sharp(inputPath).png().toFile(outputPath);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

export function isWebPFile(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".webp";
}
