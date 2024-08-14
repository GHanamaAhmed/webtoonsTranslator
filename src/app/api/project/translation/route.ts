import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { imageAnnotatorClient } from "@/lib/utils";
import { createMaskImage } from "@/lib/aiTools/delteObjects";
import fs from "fs";
import sharp from "sharp";
import { exec } from "child_process";
import path from "path";
const baseDir = process.env.BASE_DIR;
const modelPath = process.env.MODEL_PATH;
const indir = process.env.INDIR;
const outdir = process.env.OUTDIR;
const scriptPath = process.env.SCRIPT_PATH;

export async function POST(req: NextRequest) {
  try {
    const indir = `${baseDir}/test/input/${Date.now()}`;
    const outdir = `${baseDir}/test/output/${Date.now()}`;
    const ids = await req.json();
    const urls = (await cloudinary.v2.api.resources_by_ids(ids)).resources.map(
      (image) => image.secure_url
    );
    // create folder is not exsist
    if (fs.existsSync(indir)) {
      fs.mkdirSync(indir);
    }
    // fetch the image from the URL
    const buffers = await Promise.all(
      urls.map((url) =>
        fetch(url).then(async (res) => Buffer.from(await res.arrayBuffer()))
      )
    );
    // const command = `conda run -n lama python ${scriptPath} model.path=${modelPath} indir=${indir} outdir=${outdir}`;
    await Promise.all(
      buffers.map(async (buffer, index) => {
        await sharp(buffers[0]).png().toFile(`${indir}/${index}`);
      })
    );
    // perform text detection on the image
    // const iAnnotateImageResponse = await Promise.all(
    //   buffers.map(async (buffer) => {
    //     const [result] = await imageAnnotatorClient.textDetection(buffer);
    //     return result;
    //   })
    // );
    // const bufferMasks = await Promise.all(
    //   buffers.map(
    //     async (buffer, index) =>
    //       await createMaskImage(buffer, iAnnotateImageResponse[index], 1.2)
    //   )
    // );
    return new NextResponse("", {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("", {
      status: 500,
    });
  }
}
