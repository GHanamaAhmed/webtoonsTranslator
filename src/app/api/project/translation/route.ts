import { NextRequest, NextResponse } from "next/server";
import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { combineBlocks, imageAnnotatorClient } from "@/lib/utilsServer";
import { createMaskImage } from "@/lib/aiTools/delteObjects";
import fs from "fs";
import sharp from "sharp";
import { exec } from "child_process";
import { translateText } from "@/lib/aiTools/translate";
import { overlayTranslatedText } from "@/lib/aiTools/overLayTranslatedText";
const baseDir = process.env.BASE_DIR;
const modelPath = process.env.MODEL_PATH;
const scriptPath = process.env.SCRIPT_PATH;
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function POST(req: NextRequest) {
  try {
    const folderName = Date.now();
    const indir = `${baseDir}/test/input/${folderName}`;
    const outdir = `${baseDir}/test/output/${folderName}`;
    const ids = await req.json();
    const urls = (await cloudinary.v2.api.resources_by_ids(ids)).resources.map(
      (image) => image.secure_url
    );
    // create folder is not exsist
    if (!fs.existsSync(indir)) {
      fs.mkdirSync(indir);
    }
    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir);
    }
    // fetch the image from the URL
    const buffers = await Promise.all(
      urls.map(
        async (url) =>
          await fetch(url).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
          )
      )
    );
    await Promise.all(
      buffers.map(async (buffer, index) => {
        await sharp(buffers[0]).png().toFile(`${indir}/image${index}.png`);
      })
    );
    // perform text detection on the image
    const iAnnotateImageResponse = await Promise.all(
      buffers.map(async (buffer) => {
        const [result] = await imageAnnotatorClient.textDetection(buffer);
        return result;
      })
    );
    const bufferMasks = await Promise.all(
      buffers.map(
        async (buffer, index) =>
          await createMaskImage(buffer, iAnnotateImageResponse[index], 1.2)
      )
    );
    const timestamp = Date.now();
    const uploadPromises1 = bufferMasks.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: process.env.CLOUDINARY_MASKED_FOLDER,
              use_filename: true,
              timestamp,
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
          .end(buffer);
      });
    });
    // Run all upload promises in parallel
    Promise.all(uploadPromises1);
    await Promise.all(
      bufferMasks.map(async (buffer, index) => {
        await sharp(buffer).png().toFile(`${indir}/image${index}_mask.png`);
      })
    );
    const command = `conda run -n lama python ${scriptPath} model.path=${modelPath} indir=${indir} outdir=${outdir}`;
    return await new Promise((resolve) => {
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          // remove files
          fs.rmSync(indir, { recursive: true, force: true });
          fs.rmSync(outdir, { recursive: true, force: true });
          return resolve(
            new NextResponse(`Error: ${error.message}`, { status: 500 })
          );
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);

        const deletedTextBuffers = await Promise.all(
          bufferMasks.map(async (buffer, index) => {
            return await sharp(`${outdir}/image${index}_mask.png`).toBuffer();
          })
        );
        const uploadPromises2 = deletedTextBuffers.map((buffer) => {
          return new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_DELETED_TEXT_FOLDER,
                  use_filename: true,
                  timestamp,
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
              .end(buffer);
          });
        });
        // Run all upload promises in parallel

        await Promise.all(uploadPromises2);
        // remove files
        fs.rmSync(indir, { recursive: true, force: true });
        fs.rmSync(outdir, { recursive: true, force: true });
        const fullTextAnnotations = iAnnotateImageResponse.map((res) => {
          return res.fullTextAnnotation;
        });
        const blocksText = fullTextAnnotations.map((fullTextAnnotation) => {
          return combineBlocks(fullTextAnnotation || {});
        });
        const translatedBlocksText = await Promise.all(
          blocksText.map(async (blocks, index) => {
            return translateText(
              blocks.map((block) => block.text),
              "ar"
            );
          })
        );
        const translatedBuffers = await Promise.all(
          deletedTextBuffers.map(async (buffer, index) => {
            return await overlayTranslatedText(
              buffer,
              translatedBlocksText[index].translations?.map(
                (translation, i) => {
                  return {
                    text: translation.translatedText || "",
                    boundingBox: blocksText[index][i].boundingBox,
                  };
                }
              ) || []
            );
          })
        );
        const uploadPromises3 = translatedBuffers.map((buffer) => {
          return new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_TRANSLATED_FOLDER,
                  use_filename: true,
                  timestamp,
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
              .end(buffer);
          });
        });
        // Run all upload promises in parallel
        const translatedBuffersUploaded: UploadApiResponse[] =
          await Promise.all(uploadPromises3);
        resolve(
          new NextResponse(JSON.stringify(translatedBuffersUploaded), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
      });
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("", {
      status: 500,
    });
  }
}
