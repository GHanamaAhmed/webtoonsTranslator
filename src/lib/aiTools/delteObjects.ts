import { createCanvas, loadImage } from "canvas";
import { google } from "@google-cloud/vision/build/protos/protos";
// Function to create a mask image with sizeMultiplier
export async function createMaskImage(
  buffer: Buffer,
  boundingBoxs: google.cloud.vision.v1.IBoundingPoly[],
  sizeMultiplier: number // Add sizeMultiplier parameter
) {
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, image.width, image.height);

  ctx.fillStyle = "white";
  boundingBoxs?.forEach((boundingBox) => {
    const vertices = boundingBox.vertices;
    if (vertices && vertices.length === 4) {
      const x1 = vertices[0].x || 0;
      const y1 = vertices[0].y || 0;
      const x2 = vertices[2].x || 0;
      const y2 = vertices[2].y || 0;

      // Calculate padding based on sizeMultiplier
      const width = x2 - x1;
      const height = y2 - y1;
      const paddingX = (width * (sizeMultiplier - 1)) / 2;
      const paddingY = (height * (sizeMultiplier - 1)) / 2;

      const paddedX1 = Math.max(x1 - paddingX, 0);
      const paddedY1 = Math.max(y1 - paddingY, 0);
      const paddedX2 = Math.min(x2 + paddingX, image.width);
      const paddedY2 = Math.min(y2 + paddingY, image.height);

      ctx.beginPath();
      ctx.moveTo(paddedX1, paddedY1);
      ctx.lineTo(paddedX2, paddedY1);
      ctx.lineTo(paddedX2, paddedY2);
      ctx.lineTo(paddedX1, paddedY2);
      ctx.closePath();
      ctx.fill();
    }
  });

  const bufferOutPut = canvas.toBuffer("image/png");
  return bufferOutPut;
}
