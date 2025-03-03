import path from "path";
import { google } from "@google-cloud/vision/build/protos/protos";
import sharp from "sharp";
import fs from "fs";
import { exec } from "child_process";
import axios from "axios";
import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

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

export async function lamaLocal(
  scriptPath: string,
  modelPath: string,
  indir: string,
  outdir: string
): Promise<void> {
  const command = `conda run -n lama python ${scriptPath} model.path=${modelPath} indir=${indir} outdir=${outdir}`;
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        fs.rmSync(indir, { recursive: true, force: true });
        fs.rmSync(outdir, { recursive: true, force: true });
        reject(new Error(`Error: ${error.message}`));
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

export async function magicApiObjectRemover(
  image: string,
  mask: string
): Promise<string | undefined> {
  try {
    // First API request to delete the object and get the request ID
    const { request_id }: { request_id: string } = await axios
      .post(
        "https://api.magicapi.dev/api/v1/magicapi/objectremover/objectremover",
        { mask, image },
        {
          headers: {
            accept: "application/json",
            "x-magicapi-key": process.env.X_MAGICAPI_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res.data);

    // Function to check the status of the request

    // Start checking the status until it's succeeded or an error occurs
    return await checkStatus(request_id);
  } catch (error) {
    console.error("Error with magic API object remover:", error);
    throw error;
  }
}
async function checkStatus(request_id: string): Promise<string | undefined> {
  const response = await axios.get(
    "https://api.magicapi.dev/api/v1/magicapi/objectremover/predictions/" +
    request_id,
    {
      headers: {
        accept: "application/json",
        "x-magicapi-key": process.env.X_MAGICAPI_KEY,
      },
    }
  );
  const {
    status,
    result,
    message,
  }: {
    status: string;
    result?: string;
    message?: string;
  } = response.data;
  if (response.status === 200) {
    return result;
  } else if (response.status === 201) {
    // Wait for a few seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    return checkStatus(request_id); // Recall the function to check the status again
  } else {
    // If the status is not starting or succeeded, throw an error
    throw new Error(`Error processing request: ${message || "Unknown error"}`);
  }
}

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export { cloudinary };

