import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { cloudinary } from "@/lib/utilsServer";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return new NextResponse(null, {
        status: 401,
      });
    }

    const { ids }: { ids: string[]; targetLanguageCode: string } =
      await req.json();

    // Fetch cloudinary URLs
    const images = ids.map((id) => cloudinary.v2.url(id));

    // Retrieve translated images from database
    const res = await Promise.all(
      images.map(
        async (image) =>
          await db.translatedImage.findUnique({
            where: {
              imageUrl: image,
              page: {
                chapter: {
                  project: {
                    userId: session.user.id,
                  },
                },
              },
            },
          })
      )
    );

    // Filter for valid results
    const webps = res.filter((r) => r !== null).map((r) => r!.imageUrl);

    if (webps.length === 0) {
      return new NextResponse(null, {
        status: 400,
      });
    }

    // Convert images to PNG format
    const pngBuffers = await Promise.all(
      webps.map(async (webp) => {
        const arrayBuffer = await fetch(webp!)
          .then((res) => res.arrayBuffer())
          .catch(() => null);
        if (arrayBuffer) {
          return sharp(Buffer.from(arrayBuffer)).png().toBuffer();
        }
        return null;
      })
    );

    const validPngBuffers = pngBuffers.filter((buffer) => buffer !== null);

    // Handle single image response
    if (validPngBuffers.length === 1) {
      const buffer = validPngBuffers[0];
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
        },
      });
    }

    // Create a zip for multiple images
    const zip = new JSZip();
    validPngBuffers.forEach((buffer, index) => {
      zip.file(`image${index + 1}.png`, buffer);
    });

    const zipFile = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipFile, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${Date.now()}.zip`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
    });
  }
}
