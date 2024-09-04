import { NextRequest } from "next/server";
import cloudinary, { UploadApiResponse } from "cloudinary";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { withMiddleware } from "@/lib/utils";
import { translationMiddleware } from "@/middlewares/transaltionMiddleware";
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handlePost(req: NextRequest) {
  try {
    const formData = await req.formData();
    const images = formData.getAll("images") as File[];
    const timestamp = Date.now();
    const uploadPromises = images.map(async (image, index) => {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = await sharp(Buffer.from(arrayBuffer)).webp().toBuffer();
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: process.env.CLOUDINARY_FOLDER,
              use_filename: true,
              timestamp,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      });
    });
    // Wait for all uploads to complete
    const uploadResults = (await Promise.all(
      uploadPromises
    )) as UploadApiResponse[];
    return new NextResponse(JSON.stringify(uploadResults), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return new NextResponse(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}

async function handleDelete(req: NextRequest) {
  try {
    const ids: string[] = await req.json();
    await new Promise((resolve, reject) => {
      cloudinary.v2.api.delete_resources(ids, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return new NextResponse(JSON.stringify({}), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}

export const POST = async (req: NextRequest) =>
  withMiddleware(req, [translationMiddleware], handlePost);

export const DELETE = async (req: NextRequest) =>
  withMiddleware(req, [], handleDelete);
