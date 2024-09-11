import path from "path";
import fs from "fs";
import { google } from "@google-cloud/vision/build/protos/protos";
import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D as CanvasCtx,
} from "canvas";
import { defaultFonts } from "@/constants";
// Register the custom font

defaultFonts.forEach((e) => {
  const fontPath = path.join(
    process.cwd(),
    "src",
    "fonts",
    "noto-sans",
    e.fileName
  );
  registerFont(fontPath, { family: e.fontName });
});
function getOptimalFontSize(
  ctx: CanvasCtx,
  text: string,
  fontName: string,
  maxWidth: number,
  maxHeight: number,
  padding: number = 1
): number {
  // Larger range of font sizes
  const fontSizes = [64, 58, 52, 48, 40, 32, 28, 24, 20, 16, 12, 8, 6]; // Start from larger font sizes

  for (let i = 0; i < fontSizes.length; i++) {
    const fontSize = fontSizes[i];
    ctx.font = `${fontSize}px "${fontName}"`;

    // Wrap the text to fit within maxWidth
    const lines = wrapText(ctx, text, fontName, maxWidth, fontSize);
    const lineHeight = fontSize * 1.2; // Adjust line height
    const longLineWidth = ctx.measureText(
      lines.reduce((a, b) => (a.length > b.length ? a : b), "")
    ).width;
    // Calculate total height of all lines and compare with maxHeight
    if (
      lines.length * lineHeight <= maxHeight &&
      longLineWidth <= maxWidth * 1.4
    ) {
      return fontSize; // Return the largest size that fits
    }
  }

  // If no sizes fit, return the smallest available font size
  return fontSizes[fontSizes.length - 1];
}

// Function to wrap text
function wrapText(
  ctx: CanvasCtx,
  text: string,
  fontName: string,
  maxWidth: number,
  fontSize: number
): string[] {
  ctx.font = `${fontSize}px "${fontName}"`;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = `${currentLine}${word} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine !== "") {
      lines.push(currentLine);
      currentLine = `${word} `;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines;
}

// Function to draw text with wrapping and dynamic font size
function drawText(
  ctx: CanvasCtx,
  text: string,
  fontName: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  textAlign: CanvasTextAlign,
  fillColor: string = "rgb(0, 0, 0)",
  outlineColor: string = "rgb(255, 255, 255)",
  outlineWidth: boolean = false
) {
  const fontSize = getOptimalFontSize(ctx, text, fontName, maxWidth, maxHeight);
  const lineHeight = fontSize * 1.2;
  const lines = wrapText(ctx, text, fontName, maxWidth, fontSize);

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = outlineColor;
  const scaledOutlineWidth = Math.max(1, fontSize * 0.05);
  ctx.lineWidth = 0;

  ctx.textAlign = textAlign;
  ctx.font = `${fontSize}px "${fontName}"`;

  // Calculate the total height of the text block
  const totalTextHeight = lines.length * lineHeight;

  // Adjust y position to center vertically
  let drawY = y + (maxHeight - totalTextHeight) / 2;

  lines.forEach((line, index) => {
    let drawX = x;

    if (textAlign === "right") {
      drawX += maxWidth;
    } else if (textAlign === "center") {
      drawX += maxWidth / 2;
    }

    ctx.strokeText(line, drawX, drawY + index * lineHeight);
    ctx.fillText(line, drawX, drawY + index * lineHeight);
  });
}

export async function overlayTranslatedText(
  buffer: Buffer,
  fontName: string,
  translatedBlocks: Array<{
    text: string;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
    fillColor: string;
    outlineColor: string;
    outline: boolean;
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
              drawText(
                ctx,
                block.text,
                fontName,
                x,
                y,
                boxWidth,
                boxHeight,
                "center",
                block.fillColor,
                block.outlineColor,
                block.outline
              );
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

export async function detectTextColorAndOutline(
  buffer: Buffer,
  fullTextAnnotation: google.cloud.vision.v1.ITextAnnotation
): Promise<
  {
    avgColor: {
      r: number;
      g: number;
      b: number;
    };
    hasOutline: boolean;
    outlineColor: {
      r: number;
      g: number;
      b: number;
    } | null;
  }[]
> {
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d") as CanvasCtx;
  ctx.drawImage(image, 0, 0);
  const res: {
    avgColor: {
      r: number;
      g: number;
      b: number;
    };
    hasOutline: boolean;
    outlineColor: {
      r: number;
      g: number;
      b: number;
    } | null;
  }[] = [];

  fullTextAnnotation.pages?.forEach((page) => {
    page.blocks?.map((block) => {
      const firstParagraph = block.paragraphs?.[0];
      const firstWord = firstParagraph?.words?.[0];
      const firstSymbol = firstWord?.symbols?.[0];

      if (firstSymbol) {
        const vertices = firstSymbol.boundingBox?.vertices;

        if (vertices && vertices.length === 4) {
          const x1 = vertices[0].x || 0;
          const y1 = vertices[0].y || 0;
          const x2 = vertices[2].x || 0;
          const y2 = vertices[2].y || 0;

          const letterWidth = x2 - x1;
          const letterHeight = y2 - y1;

          const imageData = ctx.getImageData(x1, y1, letterWidth, letterHeight);

          const avgColor = calculateAverageColor(imageData as ImageData);
          const { hasOutline, outlineColor } = detectOutlineWithColor(
            ctx,
            x1,
            y1,
            letterWidth,
            letterHeight
          );

          res.push({ avgColor, hasOutline, outlineColor });
        }
      }
    });
  });
  res;
  return res;
}

export function mergeDetectTextColorAndOutline(
  blockData: {
    avgColor: {
      r: number;
      g: number;
      b: number;
    };
    hasOutline: boolean;
    outlineColor: {
      r: number;
      g: number;
      b: number;
    } | null;
  }[],
  mergedBlocksIndexs: (number[] | undefined)[]
): {
  avgColor: {
    r: number;
    g: number;
    b: number;
  };
  hasOutline: boolean;
  outlineColor: {
    r: number;
    g: number;
    b: number;
  } | null;
}[] {
  // Merge blocks based on `mergedBlocksIndexs`
  const mergedResults = mergedBlocksIndexs.map((indexes) => {
    if (!indexes || indexes.length === 0) return null;

    // Initialize variables for merging colors and outlines
    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let outlineCount = 0;
    let outlineR = 0,
      outlineG = 0,
      outlineB = 0;
    let hasOutline = false;

    // Combine the colors and outlines of the blocks in `indexes`
    indexes.forEach((blockIndex) => {
      const block = blockData[blockIndex];
      if (!block) return;

      // Accumulate the average color
      totalR += block.avgColor.r;
      totalG += block.avgColor.g;
      totalB += block.avgColor.b;

      // Accumulate the outline color if the block has one
      if (block.hasOutline && block.outlineColor) {
        outlineCount++;
        hasOutline = true;
        outlineR += block.outlineColor.r;
        outlineG += block.outlineColor.g;
        outlineB += block.outlineColor.b;
      }
    });

    // Calculate the average color for the merged block
    const avgColor = {
      r: Math.round(totalR / indexes.length),
      g: Math.round(totalG / indexes.length),
      b: Math.round(totalB / indexes.length),
    };

    // Calculate the average outline color for the merged block (if applicable)
    const outlineColor = hasOutline
      ? {
          r: Math.round(outlineR / outlineCount),
          g: Math.round(outlineG / outlineCount),
          b: Math.round(outlineB / outlineCount),
        }
      : null;

    return {
      avgColor,
      hasOutline,
      outlineColor,
    };
  });

  return mergedResults.filter((res) => res !== null) as {
    avgColor: {
      r: number;
      g: number;
      b: number;
    };
    hasOutline: boolean;
    outlineColor: {
      r: number;
      g: number;
      b: number;
    } | null;
  }[];
}

function calculateAverageColor(imageData: any) {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;
  let validPixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    // Check if the pixel is grayish
    if (
      Math.abs(red - green) > 15 ||
      Math.abs(green - blue) > 15 ||
      Math.abs(blue - red) > 15
    ) {
      r += red;
      g += green;
      b += blue;
      validPixelCount++;
    }
  }

  if (validPixelCount > 0) {
    r = Math.floor(r / validPixelCount);
    g = Math.floor(g / validPixelCount);
    b = Math.floor(b / validPixelCount);
  } else {
    r = g = b = 0;
  }

  return { r, g, b };
}

function detectOutlineWithColor(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number
): {
  hasOutline: boolean;
  outlineColor: { r: number; g: number; b: number } | null;
} {
  const edgeThreshold = 20;
  const edgeImageData = ctx.getImageData(x, y, width, height);
  const edgeData = edgeImageData.data;

  let r = 0,
    g = 0,
    b = 0;
  let outlinePixelCount = 0;
  let hasOutline = false;

  // Simple edge detection by checking contrast
  for (let i = 0; i < edgeData.length; i += 4) {
    const red = edgeData[i];
    const green = edgeData[i + 1];
    const blue = edgeData[i + 2];
    const alpha = edgeData[i + 3];

    const gray = 0.3 * red + 0.59 * green + 0.11 * blue;

    if (
      Math.abs(red - gray) > edgeThreshold ||
      Math.abs(green - gray) > edgeThreshold ||
      Math.abs(blue - gray) > edgeThreshold
    ) {
      r += red;
      g += green;
      b += blue;
      outlinePixelCount++;
      hasOutline = true;
    }
  }

  if (outlinePixelCount > 0) {
    r = Math.floor(r / outlinePixelCount);
    g = Math.floor(g / outlinePixelCount);
    b = Math.floor(b / outlinePixelCount);
  }

  return {
    hasOutline,
    outlineColor: hasOutline ? { r, g, b } : null,
  };
}

// Function to calculate distance between two bounding boxes
function calculateDistance(
  bbox1: google.cloud.vision.v1.IBoundingPoly,
  bbox2: google.cloud.vision.v1.IBoundingPoly
): number {
  const vertices1 = bbox1.vertices || [];
  const vertices2 = bbox2.vertices || [];

  if (vertices1.length < 2 || vertices2.length < 2) return Infinity;

  const [topLeft1, , bottomRight1] = vertices1;
  const [topLeft2, , bottomRight2] = vertices2;

  const centerX1 =
    (topLeft1.x || 0) + ((bottomRight1.x || 0) - (topLeft1.x || 0)) / 2;
  const centerY1 =
    (topLeft1.y || 0) + ((bottomRight1.y || 0) - (topLeft1.y || 0)) / 2;
  const centerX2 =
    (topLeft2.x || 0) + ((bottomRight2.x || 0) - (topLeft2.x || 0)) / 2;
  const centerY2 =
    (topLeft2.y || 0) + ((bottomRight2.y || 0) - (topLeft2.y || 0)) / 2;

  return Math.sqrt(
    Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2)
  );
}

const mergeBoundingBoxes = (
  box1: google.cloud.vision.v1.IBoundingPoly,
  box2: google.cloud.vision.v1.IBoundingPoly
): google.cloud.vision.v1.IBoundingPoly => {
  // Helper function to extract coordinates from vertices
  const getCoordinates = (box: google.cloud.vision.v1.IBoundingPoly) => {
    const vertices = box.vertices || [];
    const coordinates = {
      xMin: Infinity,
      yMin: Infinity,
      xMax: -Infinity,
      yMax: -Infinity,
    };

    vertices.forEach((vertex) => {
      // Ensure vertex coordinates are numbers
      const x = vertex.x ?? NaN;
      const y = vertex.y ?? NaN;

      if (!isNaN(x)) {
        coordinates.xMin = Math.min(coordinates.xMin, x);
        coordinates.xMax = Math.max(coordinates.xMax, x);
      }

      if (!isNaN(y)) {
        coordinates.yMin = Math.min(coordinates.yMin, y);
        coordinates.yMax = Math.max(coordinates.yMax, y);
      }
    });

    // Ensure we don't have Infinity values
    coordinates.xMin = isFinite(coordinates.xMin) ? coordinates.xMin : 0;
    coordinates.xMax = isFinite(coordinates.xMax) ? coordinates.xMax : 0;
    coordinates.yMin = isFinite(coordinates.yMin) ? coordinates.yMin : 0;
    coordinates.yMax = isFinite(coordinates.yMax) ? coordinates.yMax : 0;

    return coordinates;
  };

  const coords1 = getCoordinates(box1);
  const coords2 = getCoordinates(box2);

  return {
    vertices: [
      {
        x: Math.min(coords1.xMin, coords2.xMin),
        y: Math.min(coords1.yMin, coords2.yMin),
      },
      {
        x: Math.max(coords1.xMax, coords2.xMax),
        y: Math.min(coords1.yMin, coords2.yMin),
      },
      {
        x: Math.max(coords1.xMax, coords2.xMax),
        y: Math.max(coords1.yMax, coords2.yMax),
      },
      {
        x: Math.min(coords1.xMin, coords2.xMin),
        y: Math.max(coords1.yMax, coords2.yMax),
      },
    ],
  };
};

// Function to merge nearby Japanese blocks with font size adjustment
export async function mergeNearbyBlocksForJapanese(
  blocks: Array<{
    text: string;
    buffer: Buffer;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
  }>,
  baseThreshold: number,
  fontName: string
): Promise<
  Array<{
    blocksIndex: number[];
    text: string;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
  }>
> {
  const mergedBlocks: Array<{
    blocksIndex: number[];
    text: string;
    boundingBox: google.cloud.vision.v1.IBoundingPoly | null;
  }> = [];

  // Function to scale threshold based on font size
  const getScaledThreshold = (fontSize: number): number => {
    return baseThreshold * (fontSize / 16); // Example scaling, assuming base font size of 16px
  };

  const isNearby = (
    box1: google.cloud.vision.v1.IBoundingPoly,
    box2: google.cloud.vision.v1.IBoundingPoly,
    fontSize: number
  ): boolean => {
    const distance = calculateDistance(box1, box2);
    const threshold = getScaledThreshold(fontSize);
    return distance < threshold;
  };

  const usedIndices: Set<number> = new Set();

  for (let i = 0; i < blocks.length; i++) {
    if (usedIndices.has(i)) continue;

    const currentBlock = blocks[i];
    if (!currentBlock.boundingBox) continue;

    let mergedText = currentBlock.text;
    let mergedBlocksIndex = [i];
    let mergedBoundingBox = { ...currentBlock.boundingBox };

    for (let j = i + 1; j < blocks.length; j++) {
      if (usedIndices.has(j)) continue;

      const otherBlock = blocks[j];
      const [topLeft, , bottomRight] = blocks[i].boundingBox?.vertices || [];
      if (topLeft && bottomRight) {
        const x = topLeft.x || 0;
        const y = topLeft.y || 0;
        const boxWidth = (bottomRight.x || 0) - x;
        const boxHeight = (bottomRight.y || 0) - y;
        // Load the base image
        const image = await loadImage(blocks[i].buffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d") as CanvasCtx;
        const fontSize = getOptimalFontSize(
          ctx,
          blocks[i].text,
          fontName,
          boxWidth,
          boxHeight,
          1.5
        );
        if (
          !otherBlock.boundingBox ||
          !isNearby(currentBlock.boundingBox, otherBlock.boundingBox, fontSize)
        )
          continue;

        console.log(mergedText + " near to " + otherBlock.text);

        mergedText += " " + otherBlock.text;
        mergedBlocksIndex.push(j);
        mergedBoundingBox = mergeBoundingBoxes(
          mergedBoundingBox,
          otherBlock.boundingBox
        );

        usedIndices.add(j); // Mark this block as used
      }
    }

    mergedBlocks.push({
      blocksIndex: mergedBlocksIndex,
      text: mergedText,
      boundingBox: mergedBoundingBox,
    });
  }

  return mergedBlocks;
}
