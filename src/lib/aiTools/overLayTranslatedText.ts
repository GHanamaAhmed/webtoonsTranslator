import path from "path";
import fs from "fs";
import { google } from "@google-cloud/vision/build/protos/protos";
import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D as CanvasCtx,
} from "canvas";

// Register the custom font
const fontPath = path.join(
  process.cwd(),
  "src",
  "fonts",
  "ar",
  "Typsetting Fonts",
  "للكلام",
  "الشونين + السينين",
  "Al-hadith",
  "al-hadith2.ttf"
);
const fontName = "al-hadith2";
registerFont(fontPath, { family: fontName });

// Function to wrap text to fit within a specified width
function wrapText(
  ctx: CanvasCtx,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + word + " ";
    ctx.font = `${fontSize}px "${fontName}"`;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine = testLine;
    }
  }

  lines.push(currentLine.trim());
  return lines;
}

// Function to determine the optimal font size
function getOptimalFontSize(
  ctx: CanvasCtx,
  text: string,
  maxWidth: number,
  maxHeight: number
): number {
  let fontSize = 16; // Starting font size
  const minFontSize = 8; // Minimum font size
  const maxFontSize = 100; // Maximum font size to avoid excessive size

  // Increase font size to the maximum limit that fits within the box
  while (fontSize < maxFontSize) {
    ctx.font = `${fontSize}px "${fontName}"`;
    const lines = wrapText(ctx, text, maxWidth, fontSize);
    const lineHeight = fontSize * 1.2; // Line height multiplier

    if (lines.length * lineHeight <= maxHeight) {
      fontSize++;
    } else {
      break; // Exit loop when text no longer fits
    }
  }

  // Return the previous font size as it fits
  return fontSize - 1 > minFontSize ? fontSize - 1 : minFontSize;
}

// Function to draw text with wrapping and dynamic font size
function drawText(
  ctx: CanvasCtx,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  textAlign: CanvasTextAlign
) {
  const fontSize = getOptimalFontSize(ctx, text, maxWidth, maxHeight);
  const lineHeight = fontSize * 1.2; // Line height multiplier
  const lines = wrapText(ctx, text, maxWidth, fontSize);

  ctx.textAlign = textAlign; // Set text alignment
  ctx.font = `${fontSize}px "${fontName}"`;

  lines.forEach((line, index) => {
    let drawX = x;

    // Adjust x position based on text alignment
    if (textAlign === "right") {
      drawX += maxWidth; // Start from the right side of the bounding box
    } else if (textAlign === "center") {
      drawX += maxWidth / 2; // Center text within the bounding box
    }

    ctx.fillText(line, drawX, y + index * lineHeight);
  });
}

export async function overlayTranslatedText(
  buffer: Buffer,
  translatedBlocks: Array<{
    text: string;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
  }>
) {
  try {
    // Load the base image
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d") as CanvasCtx;

    // Draw the base image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Set up text styles using the registered font
    ctx.fillStyle = "black";
    ctx.textAlign = "center"; // Align text horizontally
    ctx.textBaseline = "middle"; // Align text vertically

    for (const block of translatedBlocks) {
      if (block.boundingBox) {
        const vertices = block.boundingBox.vertices || [];
        if (vertices.length >= 2) {
          const [topLeft, , bottomRight] = vertices;
          if (topLeft && bottomRight) {
            const x = topLeft.x || 0;
            const y = topLeft.y || 0;
            const boxWidth = (bottomRight.x || 0) - x;
            const boxHeight = (bottomRight.y || 0) - y;
            if (boxWidth > 0 && boxHeight > 0) {
              // Determine text alignment based on language or other criteria
              const textAlign = "center";
              drawText(ctx, block.text, x, y, boxWidth, boxHeight, textAlign);
            } else {
              console.warn(
                `Invalid dimensions for text "${
                  block.text
                }" with bounding box: ${JSON.stringify(vertices)}`
              );
            }
          }
        }
      }
    }
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Error overlaying translated text:", error);
  }
}
