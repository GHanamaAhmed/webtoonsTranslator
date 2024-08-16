import { NextRequest, NextResponse } from "next/server";
import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import {
  combineBlocks,
  imageAnnotatorClient,
  lamaLocal,
  magicApiObjectRemover,
} from "@/lib/utilsServer";
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
    const ids = await req.json();
    const urls = (await cloudinary.v2.api.resources_by_ids(ids)).resources.map(
      (image) => image.secure_url
    );

    // Fetch the images from the URLs
    const buffers = await Promise.all(
      urls.map(async (url) =>
        fetch(url).then(async (res) => Buffer.from(await res.arrayBuffer()))
      )
    );

    // Convert WebP images to PNG for processing
    const pngBuffers = await Promise.all(
      buffers.map(async (buffer) => sharp(buffer).png().toBuffer())
    );

    // Perform text detection on the PNG images
    const iAnnotateImageResponse = await Promise.all(
      pngBuffers.map(async (buffer) => {
        const [result] = await imageAnnotatorClient.textDetection(buffer);
        return result;
      })
    );
    // const iAnnotateImageResponse = [
    //   {
    //     faceAnnotations: [],
    //     landmarkAnnotations: [],
    //     logoAnnotations: [],
    //     labelAnnotations: [],
    //     textAnnotations: [
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "en",
    //         description:
    //           "2\nTHOUGH\nNOT ON THE\nSAME LEVEL\nAS MINE\nOBVIOUSLY\nอ\n5\nHONESTLY,\nI THOUGHT I\nHAD GOTTEN\nGREAT TRAINING\nFROM MY SERIES\nOF BATTLES WITH\nSAITAMA...\nBUT FLASH'S\nGROWTH WAS\nBEYOND\nIMAGINATION",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 119,
    //               y: 45,
    //             },
    //             {
    //               x: 774,
    //               y: 45,
    //             },
    //             {
    //               x: 774,
    //               y: 1042,
    //             },
    //             {
    //               x: 119,
    //               y: 1042,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "2",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 120,
    //               y: 327,
    //             },
    //             {
    //               x: 130,
    //               y: 324,
    //             },
    //             {
    //               x: 134,
    //               y: 335,
    //             },
    //             {
    //               x: 124,
    //               y: 338,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "THOUGH",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 140,
    //               y: 916,
    //             },
    //             {
    //               x: 238,
    //               y: 916,
    //             },
    //             {
    //               x: 238,
    //               y: 936,
    //             },
    //             {
    //               x: 140,
    //               y: 936,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "NOT",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 119,
    //               y: 941,
    //             },
    //             {
    //               x: 168,
    //               y: 941,
    //             },
    //             {
    //               x: 168,
    //               y: 963,
    //             },
    //             {
    //               x: 119,
    //               y: 963,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "ON",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 175,
    //               y: 941,
    //             },
    //             {
    //               x: 207,
    //               y: 941,
    //             },
    //             {
    //               x: 207,
    //               y: 963,
    //             },
    //             {
    //               x: 175,
    //               y: 963,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "THE",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 216,
    //               y: 941,
    //             },
    //             {
    //               x: 261,
    //               y: 941,
    //             },
    //             {
    //               x: 261,
    //               y: 963,
    //             },
    //             {
    //               x: 216,
    //               y: 963,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "SAME",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 119,
    //               y: 967,
    //             },
    //             {
    //               x: 188,
    //               y: 967,
    //             },
    //             {
    //               x: 188,
    //               y: 988,
    //             },
    //             {
    //               x: 119,
    //               y: 988,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "LEVEL",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 193,
    //               y: 967,
    //             },
    //             {
    //               x: 261,
    //               y: 967,
    //             },
    //             {
    //               x: 261,
    //               y: 988,
    //             },
    //             {
    //               x: 193,
    //               y: 988,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "AS",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 140,
    //               y: 993,
    //             },
    //             {
    //               x: 175,
    //               y: 993,
    //             },
    //             {
    //               x: 175,
    //               y: 1014,
    //             },
    //             {
    //               x: 140,
    //               y: 1014,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "MINE",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 179,
    //               y: 993,
    //             },
    //             {
    //               x: 240,
    //               y: 993,
    //             },
    //             {
    //               x: 240,
    //               y: 1014,
    //             },
    //             {
    //               x: 179,
    //               y: 1014,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "OBVIOUSLY",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 119,
    //               y: 1018,
    //             },
    //             {
    //               x: 255,
    //               y: 1017,
    //             },
    //             {
    //               x: 255,
    //               y: 1041,
    //             },
    //             {
    //               x: 119,
    //               y: 1042,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "อ",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 144,
    //               y: 237,
    //             },
    //             {
    //               x: 153,
    //               y: 232,
    //             },
    //             {
    //               x: 158,
    //               y: 241,
    //             },
    //             {
    //               x: 149,
    //               y: 246,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "5",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 157,
    //               y: 261,
    //             },
    //             {
    //               x: 167,
    //               y: 258,
    //             },
    //             {
    //               x: 171,
    //               y: 269,
    //             },
    //             {
    //               x: 161,
    //               y: 272,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "HONESTLY",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 605,
    //               y: 45,
    //             },
    //             {
    //               x: 729,
    //               y: 45,
    //             },
    //             {
    //               x: 729,
    //               y: 67,
    //             },
    //             {
    //               x: 605,
    //               y: 67,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: ",",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 725,
    //               y: 45,
    //             },
    //             {
    //               x: 736,
    //               y: 45,
    //             },
    //             {
    //               x: 736,
    //               y: 67,
    //             },
    //             {
    //               x: 725,
    //               y: 67,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "I",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 598,
    //               y: 71,
    //             },
    //             {
    //               x: 610,
    //               y: 71,
    //             },
    //             {
    //               x: 610,
    //               y: 93,
    //             },
    //             {
    //               x: 598,
    //               y: 93,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "THOUGHT",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 612,
    //               y: 70,
    //             },
    //             {
    //               x: 729,
    //               y: 69,
    //             },
    //             {
    //               x: 729,
    //               y: 92,
    //             },
    //             {
    //               x: 612,
    //               y: 93,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "I",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 734,
    //               y: 70,
    //             },
    //             {
    //               x: 744,
    //               y: 70,
    //             },
    //             {
    //               x: 744,
    //               y: 92,
    //             },
    //             {
    //               x: 734,
    //               y: 92,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "HAD",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 595,
    //               y: 97,
    //             },
    //             {
    //               x: 641,
    //               y: 97,
    //             },
    //             {
    //               x: 641,
    //               y: 119,
    //             },
    //             {
    //               x: 595,
    //               y: 119,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "GOTTEN",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 649,
    //               y: 97,
    //             },
    //             {
    //               x: 746,
    //               y: 98,
    //             },
    //             {
    //               x: 746,
    //               y: 120,
    //             },
    //             {
    //               x: 649,
    //               y: 119,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "GREAT",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 570,
    //               y: 123,
    //             },
    //             {
    //               x: 650,
    //               y: 123,
    //             },
    //             {
    //               x: 650,
    //               y: 146,
    //             },
    //             {
    //               x: 570,
    //               y: 146,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "TRAINING",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 657,
    //               y: 123,
    //             },
    //             {
    //               x: 773,
    //               y: 123,
    //             },
    //             {
    //               x: 773,
    //               y: 146,
    //             },
    //             {
    //               x: 657,
    //               y: 146,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "FROM",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 570,
    //               y: 149,
    //             },
    //             {
    //               x: 635,
    //               y: 148,
    //             },
    //             {
    //               x: 635,
    //               y: 171,
    //             },
    //             {
    //               x: 570,
    //               y: 172,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "MY",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 643,
    //               y: 149,
    //             },
    //             {
    //               x: 682,
    //               y: 149,
    //             },
    //             {
    //               x: 682,
    //               y: 171,
    //             },
    //             {
    //               x: 643,
    //               y: 171,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "SERIES",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 686,
    //               y: 148,
    //             },
    //             {
    //               x: 772,
    //               y: 147,
    //             },
    //             {
    //               x: 772,
    //               y: 170,
    //             },
    //             {
    //               x: 686,
    //               y: 171,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "OF",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 566,
    //               y: 175,
    //             },
    //             {
    //               x: 597,
    //               y: 175,
    //             },
    //             {
    //               x: 597,
    //               y: 197,
    //             },
    //             {
    //               x: 566,
    //               y: 197,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "BATTLES",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 604,
    //               y: 175,
    //             },
    //             {
    //               x: 707,
    //               y: 175,
    //             },
    //             {
    //               x: 707,
    //               y: 197,
    //             },
    //             {
    //               x: 604,
    //               y: 197,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "WITH",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 714,
    //               y: 175,
    //             },
    //             {
    //               x: 774,
    //               y: 175,
    //             },
    //             {
    //               x: 774,
    //               y: 197,
    //             },
    //             {
    //               x: 714,
    //               y: 197,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "SAITAMA",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 606,
    //               y: 202,
    //             },
    //             {
    //               x: 715,
    //               y: 202,
    //             },
    //             {
    //               x: 715,
    //               y: 224,
    //             },
    //             {
    //               x: 606,
    //               y: 224,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "...",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 711,
    //               y: 202,
    //             },
    //             {
    //               x: 737,
    //               y: 202,
    //             },
    //             {
    //               x: 737,
    //               y: 224,
    //             },
    //             {
    //               x: 711,
    //               y: 224,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "BUT",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 576,
    //               y: 760,
    //             },
    //             {
    //               x: 626,
    //               y: 760,
    //             },
    //             {
    //               x: 626,
    //               y: 783,
    //             },
    //             {
    //               x: 576,
    //               y: 783,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "FLASH'S",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 632,
    //               y: 760,
    //             },
    //             {
    //               x: 732,
    //               y: 760,
    //             },
    //             {
    //               x: 732,
    //               y: 783,
    //             },
    //             {
    //               x: 632,
    //               y: 783,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "GROWTH",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 568,
    //               y: 788,
    //             },
    //             {
    //               x: 674,
    //               y: 788,
    //             },
    //             {
    //               x: 674,
    //               y: 812,
    //             },
    //             {
    //               x: 568,
    //               y: 812,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "WAS",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 680,
    //               y: 788,
    //             },
    //             {
    //               x: 736,
    //               y: 788,
    //             },
    //             {
    //               x: 736,
    //               y: 812,
    //             },
    //             {
    //               x: 680,
    //               y: 812,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "BEYOND",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 605,
    //               y: 814,
    //             },
    //             {
    //               x: 702,
    //               y: 813,
    //             },
    //             {
    //               x: 702,
    //               y: 835,
    //             },
    //             {
    //               x: 605,
    //               y: 836,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //       {
    //         locations: [],
    //         properties: [],
    //         mid: "",
    //         locale: "",
    //         description: "IMAGINATION",
    //         score: 0,
    //         confidence: 0,
    //         topicality: 0,
    //         boundingPoly: {
    //           vertices: [
    //             {
    //               x: 567,
    //               y: 840,
    //             },
    //             {
    //               x: 728,
    //               y: 839,
    //             },
    //             {
    //               x: 728,
    //               y: 862,
    //             },
    //             {
    //               x: 567,
    //               y: 863,
    //             },
    //           ],
    //           normalizedVertices: [],
    //         },
    //       },
    //     ],
    //     localizedObjectAnnotations: [],
    //     safeSearchAnnotation: null,
    //     imagePropertiesAnnotation: null,
    //     error: null,
    //     cropHintsAnnotation: null,
    //     fullTextAnnotation: {
    //       pages: [
    //         {
    //           blocks: [
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 120,
    //                                 y: 327,
    //                               },
    //                               {
    //                                 x: 130,
    //                                 y: 324,
    //                               },
    //                               {
    //                                 x: 134,
    //                                 y: 335,
    //                               },
    //                               {
    //                                 x: 124,
    //                                 y: 338,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "2",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: null,
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 120,
    //                             y: 327,
    //                           },
    //                           {
    //                             x: 130,
    //                             y: 324,
    //                           },
    //                           {
    //                             x: 134,
    //                             y: 335,
    //                           },
    //                           {
    //                             x: 124,
    //                             y: 338,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 120,
    //                         y: 327,
    //                       },
    //                       {
    //                         x: 130,
    //                         y: 324,
    //                       },
    //                       {
    //                         x: 134,
    //                         y: 335,
    //                       },
    //                       {
    //                         x: 124,
    //                         y: 338,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 120,
    //                     y: 327,
    //                   },
    //                   {
    //                     x: 130,
    //                     y: 324,
    //                   },
    //                   {
    //                     x: 134,
    //                     y: 335,
    //                   },
    //                   {
    //                     x: 124,
    //                     y: 338,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 140,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 156,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 156,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 140,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 154,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 169,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 169,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 154,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 170,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 187,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 187,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 170,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 186,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 203,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 203,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 186,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "U",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 204,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 222,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 222,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 204,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 223,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 238,
    //                                 y: 916,
    //                               },
    //                               {
    //                                 x: 238,
    //                                 y: 936,
    //                               },
    //                               {
    //                                 x: 223,
    //                                 y: 936,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 140,
    //                             y: 916,
    //                           },
    //                           {
    //                             x: 238,
    //                             y: 916,
    //                           },
    //                           {
    //                             x: 238,
    //                             y: 936,
    //                           },
    //                           {
    //                             x: 140,
    //                             y: 936,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 119,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 135,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 135,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 119,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 135,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 152,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 152,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 135,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 152,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 168,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 168,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 152,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 119,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 168,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 168,
    //                             y: 963,
    //                           },
    //                           {
    //                             x: 119,
    //                             y: 963,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 175,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 191,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 191,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 175,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 192,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 207,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 207,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 192,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 175,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 207,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 207,
    //                             y: 963,
    //                           },
    //                           {
    //                             x: 175,
    //                             y: 963,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 216,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 231,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 231,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 216,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 232,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 246,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 246,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 232,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 247,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 261,
    //                                 y: 941,
    //                               },
    //                               {
    //                                 x: 261,
    //                                 y: 963,
    //                               },
    //                               {
    //                                 x: 247,
    //                                 y: 963,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 216,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 261,
    //                             y: 941,
    //                           },
    //                           {
    //                             x: 261,
    //                             y: 963,
    //                           },
    //                           {
    //                             x: 216,
    //                             y: 963,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 119,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 137,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 137,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 119,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 135,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 154,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 154,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 135,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 152,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 173,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 173,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 152,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 173,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 188,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 188,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 173,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 119,
    //                             y: 967,
    //                           },
    //                           {
    //                             x: 188,
    //                             y: 967,
    //                           },
    //                           {
    //                             x: 188,
    //                             y: 988,
    //                           },
    //                           {
    //                             x: 119,
    //                             y: 988,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 193,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 206,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 206,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 193,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 206,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 221,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 221,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 206,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 219,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 235,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 235,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 219,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "V",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 235,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 248,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 248,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 235,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 248,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 261,
    //                                 y: 967,
    //                               },
    //                               {
    //                                 x: 261,
    //                                 y: 988,
    //                               },
    //                               {
    //                                 x: 248,
    //                                 y: 988,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 193,
    //                             y: 967,
    //                           },
    //                           {
    //                             x: 261,
    //                             y: 967,
    //                           },
    //                           {
    //                             x: 261,
    //                             y: 988,
    //                           },
    //                           {
    //                             x: 193,
    //                             y: 988,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 140,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 159,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 159,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 140,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 156,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 175,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 175,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 156,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 140,
    //                             y: 993,
    //                           },
    //                           {
    //                             x: 175,
    //                             y: 993,
    //                           },
    //                           {
    //                             x: 175,
    //                             y: 1014,
    //                           },
    //                           {
    //                             x: 140,
    //                             y: 1014,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 179,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 204,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 204,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 179,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 199,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 209,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 209,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 199,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 208,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 224,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 224,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 208,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 226,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 240,
    //                                 y: 993,
    //                               },
    //                               {
    //                                 x: 240,
    //                                 y: 1014,
    //                               },
    //                               {
    //                                 x: 226,
    //                                 y: 1014,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 179,
    //                             y: 993,
    //                           },
    //                           {
    //                             x: 240,
    //                             y: 993,
    //                           },
    //                           {
    //                             x: 240,
    //                             y: 1014,
    //                           },
    //                           {
    //                             x: 179,
    //                             y: 1014,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 119,
    //                                 y: 1019,
    //                               },
    //                               {
    //                                 x: 136,
    //                                 y: 1019,
    //                               },
    //                               {
    //                                 x: 136,
    //                                 y: 1042,
    //                               },
    //                               {
    //                                 x: 119,
    //                                 y: 1042,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 135,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 149,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 149,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 135,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "B",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 151,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 166,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 166,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 151,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "V",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 166,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 174,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 174,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 166,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 174,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 192,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 192,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 174,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 192,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 209,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 209,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 192,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "U",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 209,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 225,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 225,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 209,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 223,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 237,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 237,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 223,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 237,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 255,
    //                                 y: 1018,
    //                               },
    //                               {
    //                                 x: 255,
    //                                 y: 1041,
    //                               },
    //                               {
    //                                 x: 237,
    //                                 y: 1041,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "Y",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 119,
    //                             y: 1018,
    //                           },
    //                           {
    //                             x: 255,
    //                             y: 1017,
    //                           },
    //                           {
    //                             x: 255,
    //                             y: 1041,
    //                           },
    //                           {
    //                             x: 119,
    //                             y: 1042,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 119,
    //                         y: 916,
    //                       },
    //                       {
    //                         x: 261,
    //                         y: 916,
    //                       },
    //                       {
    //                         x: 261,
    //                         y: 1042,
    //                       },
    //                       {
    //                         x: 119,
    //                         y: 1042,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 119,
    //                     y: 916,
    //                   },
    //                   {
    //                     x: 261,
    //                     y: 916,
    //                   },
    //                   {
    //                     x: 261,
    //                     y: 1042,
    //                   },
    //                   {
    //                     x: 119,
    //                     y: 1042,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 144,
    //                                 y: 237,
    //                               },
    //                               {
    //                                 x: 153,
    //                                 y: 232,
    //                               },
    //                               {
    //                                 x: 158,
    //                                 y: 241,
    //                               },
    //                               {
    //                                 x: 149,
    //                                 y: 246,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "อ",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: null,
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 144,
    //                             y: 237,
    //                           },
    //                           {
    //                             x: 153,
    //                             y: 232,
    //                           },
    //                           {
    //                             x: 158,
    //                             y: 241,
    //                           },
    //                           {
    //                             x: 149,
    //                             y: 246,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 144,
    //                         y: 237,
    //                       },
    //                       {
    //                         x: 153,
    //                         y: 232,
    //                       },
    //                       {
    //                         x: 158,
    //                         y: 241,
    //                       },
    //                       {
    //                         x: 149,
    //                         y: 246,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 144,
    //                     y: 237,
    //                   },
    //                   {
    //                     x: 153,
    //                     y: 232,
    //                   },
    //                   {
    //                     x: 158,
    //                     y: 241,
    //                   },
    //                   {
    //                     x: 149,
    //                     y: 246,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 157,
    //                                 y: 261,
    //                               },
    //                               {
    //                                 x: 167,
    //                                 y: 258,
    //                               },
    //                               {
    //                                 x: 171,
    //                                 y: 269,
    //                               },
    //                               {
    //                                 x: 161,
    //                                 y: 272,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "5",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: null,
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 157,
    //                             y: 261,
    //                           },
    //                           {
    //                             x: 167,
    //                             y: 258,
    //                           },
    //                           {
    //                             x: 171,
    //                             y: 269,
    //                           },
    //                           {
    //                             x: 161,
    //                             y: 272,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 157,
    //                         y: 261,
    //                       },
    //                       {
    //                         x: 167,
    //                         y: 258,
    //                       },
    //                       {
    //                         x: 171,
    //                         y: 269,
    //                       },
    //                       {
    //                         x: 161,
    //                         y: 272,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 157,
    //                     y: 261,
    //                   },
    //                   {
    //                     x: 167,
    //                     y: 258,
    //                   },
    //                   {
    //                     x: 171,
    //                     y: 269,
    //                   },
    //                   {
    //                     x: 161,
    //                     y: 272,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 605,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 621,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 621,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 621,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 638,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 638,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 621,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 639,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 655,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 655,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 639,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 656,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 670,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 670,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 656,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 669,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 685,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 685,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 669,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 685,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 685,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 700,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 700,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 712,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 712,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "Y",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 605,
    //                             y: 45,
    //                           },
    //                           {
    //                             x: 729,
    //                             y: 45,
    //                           },
    //                           {
    //                             x: 729,
    //                             y: 67,
    //                           },
    //                           {
    //                             x: 605,
    //                             y: 67,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 725,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 736,
    //                                 y: 45,
    //                               },
    //                               {
    //                                 x: 736,
    //                                 y: 67,
    //                               },
    //                               {
    //                                 x: 725,
    //                                 y: 67,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: ",",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 725,
    //                             y: 45,
    //                           },
    //                           {
    //                             x: 736,
    //                             y: 45,
    //                           },
    //                           {
    //                             x: 736,
    //                             y: 67,
    //                           },
    //                           {
    //                             x: 725,
    //                             y: 67,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 598,
    //                                 y: 71,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 71,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 93,
    //                               },
    //                               {
    //                                 x: 598,
    //                                 y: 93,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 598,
    //                             y: 71,
    //                           },
    //                           {
    //                             x: 610,
    //                             y: 71,
    //                           },
    //                           {
    //                             x: 610,
    //                             y: 93,
    //                           },
    //                           {
    //                             x: 598,
    //                             y: 93,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 612,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 628,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 628,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 612,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 628,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 643,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 643,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 628,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 643,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 660,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 660,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 643,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 661,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 661,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "U",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 678,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 696,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 696,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 696,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 696,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 712,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 712,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 612,
    //                             y: 70,
    //                           },
    //                           {
    //                             x: 729,
    //                             y: 69,
    //                           },
    //                           {
    //                             x: 729,
    //                             y: 92,
    //                           },
    //                           {
    //                             x: 612,
    //                             y: 93,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 734,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 744,
    //                                 y: 70,
    //                               },
    //                               {
    //                                 x: 744,
    //                                 y: 92,
    //                               },
    //                               {
    //                                 x: 734,
    //                                 y: 92,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 734,
    //                             y: 70,
    //                           },
    //                           {
    //                             x: 744,
    //                             y: 70,
    //                           },
    //                           {
    //                             x: 744,
    //                             y: 92,
    //                           },
    //                           {
    //                             x: 734,
    //                             y: 92,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 595,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 611,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 611,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 595,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 610,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 627,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 627,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 625,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 641,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 641,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 625,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "D",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 595,
    //                             y: 97,
    //                           },
    //                           {
    //                             x: 641,
    //                             y: 97,
    //                           },
    //                           {
    //                             x: 641,
    //                             y: 119,
    //                           },
    //                           {
    //                             x: 595,
    //                             y: 119,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 649,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 666,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 666,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 649,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 667,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 684,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 684,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 667,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 685,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 685,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 700,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 716,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 716,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 700,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 716,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 716,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 730,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 746,
    //                                 y: 97,
    //                               },
    //                               {
    //                                 x: 746,
    //                                 y: 119,
    //                               },
    //                               {
    //                                 x: 730,
    //                                 y: 119,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 649,
    //                             y: 97,
    //                           },
    //                           {
    //                             x: 746,
    //                             y: 98,
    //                           },
    //                           {
    //                             x: 746,
    //                             y: 120,
    //                           },
    //                           {
    //                             x: 649,
    //                             y: 119,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 570,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 589,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 589,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 570,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 589,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 589,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "R",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 605,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 618,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 618,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 619,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 635,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 635,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 619,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 634,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 650,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 650,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 634,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 570,
    //                             y: 123,
    //                           },
    //                           {
    //                             x: 650,
    //                             y: 123,
    //                           },
    //                           {
    //                             x: 650,
    //                             y: 146,
    //                           },
    //                           {
    //                             x: 570,
    //                             y: 146,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 657,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 673,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 673,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 657,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 671,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 687,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 687,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 671,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "R",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 688,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 705,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 705,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 688,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 704,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 704,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 712,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 729,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 712,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 728,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 737,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 737,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 728,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 737,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 754,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 754,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 737,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 753,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 773,
    //                                 y: 123,
    //                               },
    //                               {
    //                                 x: 773,
    //                                 y: 146,
    //                               },
    //                               {
    //                                 x: 753,
    //                                 y: 146,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 657,
    //                             y: 123,
    //                           },
    //                           {
    //                             x: 773,
    //                             y: 123,
    //                           },
    //                           {
    //                             x: 773,
    //                             y: 146,
    //                           },
    //                           {
    //                             x: 657,
    //                             y: 146,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 570,
    //                                 y: 150,
    //                               },
    //                               {
    //                                 x: 583,
    //                                 y: 150,
    //                               },
    //                               {
    //                                 x: 583,
    //                                 y: 172,
    //                               },
    //                               {
    //                                 x: 570,
    //                                 y: 172,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "F",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 582,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 597,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 597,
    //                                 y: 171,
    //                               },
    //                               {
    //                                 x: 582,
    //                                 y: 171,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "R",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 597,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 613,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 613,
    //                                 y: 171,
    //                               },
    //                               {
    //                                 x: 597,
    //                                 y: 171,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 613,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 635,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 635,
    //                                 y: 171,
    //                               },
    //                               {
    //                                 x: 613,
    //                                 y: 171,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 570,
    //                             y: 149,
    //                           },
    //                           {
    //                             x: 635,
    //                             y: 148,
    //                           },
    //                           {
    //                             x: 635,
    //                             y: 171,
    //                           },
    //                           {
    //                             x: 570,
    //                             y: 172,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 643,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 667,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 667,
    //                                 y: 171,
    //                               },
    //                               {
    //                                 x: 643,
    //                                 y: 171,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 662,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 682,
    //                                 y: 149,
    //                               },
    //                               {
    //                                 x: 682,
    //                                 y: 171,
    //                               },
    //                               {
    //                                 x: 662,
    //                                 y: 171,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "Y",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 643,
    //                             y: 149,
    //                           },
    //                           {
    //                             x: 682,
    //                             y: 149,
    //                           },
    //                           {
    //                             x: 682,
    //                             y: 171,
    //                           },
    //                           {
    //                             x: 643,
    //                             y: 171,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 686,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 702,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 702,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 686,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 703,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 716,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 716,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 703,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 717,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 717,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "R",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 732,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 740,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 740,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 740,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 755,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 755,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 740,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 754,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 772,
    //                                 y: 148,
    //                               },
    //                               {
    //                                 x: 772,
    //                                 y: 170,
    //                               },
    //                               {
    //                                 x: 754,
    //                                 y: 170,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 686,
    //                             y: 148,
    //                           },
    //                           {
    //                             x: 772,
    //                             y: 147,
    //                           },
    //                           {
    //                             x: 772,
    //                             y: 170,
    //                           },
    //                           {
    //                             x: 686,
    //                             y: 171,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 570,
    //                         y: 45,
    //                       },
    //                       {
    //                         x: 773,
    //                         y: 45,
    //                       },
    //                       {
    //                         x: 773,
    //                         y: 172,
    //                       },
    //                       {
    //                         x: 570,
    //                         y: 172,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 566,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 583,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 583,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 566,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 583,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 597,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 597,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 583,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "F",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 566,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 597,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 597,
    //                             y: 197,
    //                           },
    //                           {
    //                             x: 566,
    //                             y: 197,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 604,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 619,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 619,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 604,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "B",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 619,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 636,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 636,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 619,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 635,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 651,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 651,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 635,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 649,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 665,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 665,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 649,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 666,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 666,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 678,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 691,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 691,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 691,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 707,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 707,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 691,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 604,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 707,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 707,
    //                             y: 197,
    //                           },
    //                           {
    //                             x: 604,
    //                             y: 197,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 714,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 735,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 735,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 714,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "W",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 736,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 744,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 744,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 736,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 743,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 759,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 759,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 743,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 759,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 774,
    //                                 y: 175,
    //                               },
    //                               {
    //                                 x: 774,
    //                                 y: 197,
    //                               },
    //                               {
    //                                 x: 759,
    //                                 y: 197,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 714,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 774,
    //                             y: 175,
    //                           },
    //                           {
    //                             x: 774,
    //                             y: 197,
    //                           },
    //                           {
    //                             x: 714,
    //                             y: 197,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 606,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 623,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 623,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 606,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 622,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 639,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 639,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 622,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 639,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 646,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 646,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 639,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 647,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 662,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 662,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 647,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 661,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 661,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 678,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 701,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 678,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 698,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 698,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: null,
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 606,
    //                             y: 202,
    //                           },
    //                           {
    //                             x: 715,
    //                             y: 202,
    //                           },
    //                           {
    //                             x: 715,
    //                             y: 224,
    //                           },
    //                           {
    //                             x: 606,
    //                             y: 224,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 711,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 726,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 726,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: ".",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 719,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 719,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: ".",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 725,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 737,
    //                                 y: 202,
    //                               },
    //                               {
    //                                 x: 737,
    //                                 y: 224,
    //                               },
    //                               {
    //                                 x: 725,
    //                                 y: 224,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: ".",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: null,
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 711,
    //                             y: 202,
    //                           },
    //                           {
    //                             x: 737,
    //                             y: 202,
    //                           },
    //                           {
    //                             x: 737,
    //                             y: 224,
    //                           },
    //                           {
    //                             x: 711,
    //                             y: 224,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 566,
    //                         y: 175,
    //                       },
    //                       {
    //                         x: 774,
    //                         y: 175,
    //                       },
    //                       {
    //                         x: 774,
    //                         y: 224,
    //                       },
    //                       {
    //                         x: 566,
    //                         y: 224,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 566,
    //                     y: 45,
    //                   },
    //                   {
    //                     x: 774,
    //                     y: 45,
    //                   },
    //                   {
    //                     x: 774,
    //                     y: 224,
    //                   },
    //                   {
    //                     x: 566,
    //                     y: 224,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //             {
    //               paragraphs: [
    //                 {
    //                   words: [
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 576,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 593,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 593,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 576,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "B",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 593,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 593,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "U",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 610,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 626,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 626,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 610,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 576,
    //                             y: 760,
    //                           },
    //                           {
    //                             x: 626,
    //                             y: 760,
    //                           },
    //                           {
    //                             x: 626,
    //                             y: 783,
    //                           },
    //                           {
    //                             x: 576,
    //                             y: 783,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 632,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 646,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 646,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 632,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "F",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 645,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 658,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 658,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 645,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "L",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 657,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 675,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 675,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 657,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 673,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 690,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 690,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 673,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 689,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 705,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 705,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 689,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 704,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 715,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 704,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "'",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 713,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 760,
    //                               },
    //                               {
    //                                 x: 732,
    //                                 y: 783,
    //                               },
    //                               {
    //                                 x: 713,
    //                                 y: 783,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 632,
    //                             y: 760,
    //                           },
    //                           {
    //                             x: 732,
    //                             y: 760,
    //                           },
    //                           {
    //                             x: 732,
    //                             y: 783,
    //                           },
    //                           {
    //                             x: 632,
    //                             y: 783,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 568,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 587,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 587,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 568,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 590,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 606,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 606,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 590,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "R",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 605,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 623,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 623,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 621,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 644,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 644,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 621,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "W",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 643,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 660,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 660,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 643,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 658,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 674,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 674,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 658,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "H",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 568,
    //                             y: 788,
    //                           },
    //                           {
    //                             x: 674,
    //                             y: 788,
    //                           },
    //                           {
    //                             x: 674,
    //                             y: 812,
    //                           },
    //                           {
    //                             x: 568,
    //                             y: 812,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 680,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 703,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 703,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 680,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "W",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 700,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 720,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 720,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 700,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 717,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 736,
    //                                 y: 788,
    //                               },
    //                               {
    //                                 x: 736,
    //                                 y: 812,
    //                               },
    //                               {
    //                                 x: 717,
    //                                 y: 812,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "S",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 680,
    //                             y: 788,
    //                           },
    //                           {
    //                             x: 736,
    //                             y: 788,
    //                           },
    //                           {
    //                             x: 736,
    //                             y: 812,
    //                           },
    //                           {
    //                             x: 680,
    //                             y: 812,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 605,
    //                                 y: 815,
    //                               },
    //                               {
    //                                 x: 620,
    //                                 y: 815,
    //                               },
    //                               {
    //                                 x: 620,
    //                                 y: 836,
    //                               },
    //                               {
    //                                 x: 605,
    //                                 y: 836,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "B",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 620,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 634,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 634,
    //                                 y: 835,
    //                               },
    //                               {
    //                                 x: 620,
    //                                 y: 835,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "E",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 633,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 650,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 650,
    //                                 y: 835,
    //                               },
    //                               {
    //                                 x: 633,
    //                                 y: 835,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "Y",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 649,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 667,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 667,
    //                                 y: 835,
    //                               },
    //                               {
    //                                 x: 649,
    //                                 y: 835,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 666,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 682,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 682,
    //                                 y: 835,
    //                               },
    //                               {
    //                                 x: 666,
    //                                 y: 835,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "EOL_SURE_SPACE",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 685,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 702,
    //                                 y: 814,
    //                               },
    //                               {
    //                                 x: 702,
    //                                 y: 835,
    //                               },
    //                               {
    //                                 x: 685,
    //                                 y: 835,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "D",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 605,
    //                             y: 814,
    //                           },
    //                           {
    //                             x: 702,
    //                             y: 813,
    //                           },
    //                           {
    //                             x: 702,
    //                             y: 835,
    //                           },
    //                           {
    //                             x: 605,
    //                             y: 836,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                     {
    //                       symbols: [
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 567,
    //                                 y: 841,
    //                               },
    //                               {
    //                                 x: 578,
    //                                 y: 841,
    //                               },
    //                               {
    //                                 x: 578,
    //                                 y: 863,
    //                               },
    //                               {
    //                                 x: 567,
    //                                 y: 863,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 576,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 598,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 598,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 576,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "M",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 596,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 614,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 614,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 596,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 613,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 631,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 631,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 613,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "G",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 631,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 638,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 638,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 631,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 639,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 655,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 655,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 639,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 657,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 674,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 674,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 657,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "A",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 672,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 687,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 687,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 672,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "T",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 687,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 695,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 695,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 687,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "I",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: null,
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 695,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 713,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 713,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 695,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "O",
    //                           confidence: 0,
    //                         },
    //                         {
    //                           property: {
    //                             detectedLanguages: [],
    //                             detectedBreak: {
    //                               type: "LINE_BREAK",
    //                               isPrefix: false,
    //                             },
    //                           },
    //                           boundingBox: {
    //                             vertices: [
    //                               {
    //                                 x: 711,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 728,
    //                                 y: 840,
    //                               },
    //                               {
    //                                 x: 728,
    //                                 y: 862,
    //                               },
    //                               {
    //                                 x: 711,
    //                                 y: 862,
    //                               },
    //                             ],
    //                             normalizedVertices: [],
    //                           },
    //                           text: "N",
    //                           confidence: 0,
    //                         },
    //                       ],
    //                       property: {
    //                         detectedLanguages: [
    //                           {
    //                             languageCode: "en",
    //                             confidence: 1,
    //                           },
    //                         ],
    //                         detectedBreak: null,
    //                       },
    //                       boundingBox: {
    //                         vertices: [
    //                           {
    //                             x: 567,
    //                             y: 840,
    //                           },
    //                           {
    //                             x: 728,
    //                             y: 839,
    //                           },
    //                           {
    //                             x: 728,
    //                             y: 862,
    //                           },
    //                           {
    //                             x: 567,
    //                             y: 863,
    //                           },
    //                         ],
    //                         normalizedVertices: [],
    //                       },
    //                       confidence: 0,
    //                     },
    //                   ],
    //                   property: null,
    //                   boundingBox: {
    //                     vertices: [
    //                       {
    //                         x: 567,
    //                         y: 760,
    //                       },
    //                       {
    //                         x: 736,
    //                         y: 760,
    //                       },
    //                       {
    //                         x: 736,
    //                         y: 863,
    //                       },
    //                       {
    //                         x: 567,
    //                         y: 863,
    //                       },
    //                     ],
    //                     normalizedVertices: [],
    //                   },
    //                   confidence: 0,
    //                 },
    //               ],
    //               property: null,
    //               boundingBox: {
    //                 vertices: [
    //                   {
    //                     x: 567,
    //                     y: 760,
    //                   },
    //                   {
    //                     x: 736,
    //                     y: 760,
    //                   },
    //                   {
    //                     x: 736,
    //                     y: 863,
    //                   },
    //                   {
    //                     x: 567,
    //                     y: 863,
    //                   },
    //                 ],
    //                 normalizedVertices: [],
    //               },
    //               blockType: "TEXT",
    //               confidence: 0,
    //             },
    //           ],
    //           property: {
    //             detectedLanguages: [
    //               {
    //                 languageCode: "en",
    //                 confidence: 0.9251755475997925,
    //               },
    //             ],
    //             detectedBreak: null,
    //           },
    //           width: 800,
    //           height: 1138,
    //           confidence: 0,
    //         },
    //       ],
    //       text: "2\nTHOUGH\nNOT ON THE\nSAME LEVEL\nAS MINE\nOBVIOUSLY\nอ\n5\nHONESTLY,\nI THOUGHT I\nHAD GOTTEN\nGREAT TRAINING\nFROM MY SERIES\nOF BATTLES WITH\nSAITAMA...\nBUT FLASH'S\nGROWTH WAS\nBEYOND\nIMAGINATION",
    //     },
    //     webDetection: null,
    //     productSearchResults: null,
    //     context: null,
    //   },
    // ];
    // Create masks based on text detection
    const bufferMasks = await Promise.all(
      pngBuffers.map(
        async (buffer, index) =>
          await createMaskImage(buffer, iAnnotateImageResponse[index], 1.1)
      )
    );

    // Convert masks to WebP format and upload to Cloudinary
    const uploadPromises1 = bufferMasks.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        sharp(buffer)
          .webp()
          .toBuffer()
          .then((webpBuffer) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_MASKED_FOLDER,
                  use_filename: true,
                  timestamp: Date.now(),
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
              .end(webpBuffer);
          })
          .catch(reject);
      });
    });
    const uploadedMasks = await Promise.all(uploadPromises1);

    const modelType = req.headers.get("model-type") || "lama";
    let deletedTextBuffers: Buffer[];
    if (modelType === "lama") {
      // Lama model: Handles local folders
      const folderName = Date.now();
      const indir = `${baseDir}/test/input/${folderName}`;
      const outdir = `${baseDir}/test/output/${folderName}`;

      if (!fs.existsSync(indir)) {
        fs.mkdirSync(indir);
      }
      if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
      }

      await Promise.all(
        pngBuffers.map(async (buffer, index) => {
          await sharp(buffer).toFile(`${indir}/image${index}.png`);
        })
      );
      await Promise.all(
        bufferMasks.map(async (buffer, index) => {
          await sharp(buffer).toFile(`${indir}/image${index}_mask.png`);
        })
      );

      await lamaLocal(scriptPath || "", modelPath || "", indir, outdir);

      deletedTextBuffers = await Promise.all(
        bufferMasks.map(async (buffer, index) => {
          return await sharp(`${outdir}/image${index}_mask.png`).toBuffer();
        })
      );

      // Clean up the local folders
      fs.rmSync(indir, { recursive: true, force: true });
      fs.rmSync(outdir, { recursive: true, force: true });
    } else if (modelType === "magicApiObjectRemover") {
      // Magic API: Handles without local folders
      const deletedTextURL = await Promise.all(
        urls.map(async (url, index) => {
          return await magicApiObjectRemover(
            url,
            uploadedMasks[index].secure_url
          );
        })
      );
      deletedTextBuffers = await Promise.all(
        deletedTextURL.map(async (url) => {
          return await fetch(url || "").then(async (res) =>
            Buffer.from(await res.arrayBuffer())
          );
        })
      );
    } else {
      throw new Error("Unsupported model type");
    }

    // Convert final images to WebP and upload to Cloudinary
    const uploadPromises2 = deletedTextBuffers.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        sharp(buffer)
          .webp()
          .toBuffer()
          .then((webpBuffer) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_DELETED_TEXT_FOLDER,
                  use_filename: true,
                  timestamp: Date.now(),
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
              .end(webpBuffer);
          })
          .catch(reject);
      });
    });
    const deletedBuffersUploaded: UploadApiResponse[] = await Promise.all(
      uploadPromises2
    );

    // Continue with translation and overlay as before
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
      deletedBuffersUploaded.map(async (uploadResult, index) => {
        return await overlayTranslatedText(
          await sharp(
            Buffer.from(
              await fetch(uploadResult.secure_url).then((res) =>
                res.arrayBuffer()
              )
            )
          )
            .png()
            .toBuffer(),
          translatedBlocksText[index].translations?.map((translation, i) => {
            return {
              text: translation.translatedText || "",
              boundingBox: blocksText[index][i].boundingBox,
            };
          }) || []
        );
      })
    );

    const uploadPromises3 = translatedBuffers.map((buffer) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        sharp(buffer)
          .webp()
          .toBuffer()
          .then((webpBuffer) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  resource_type: "image",
                  folder: process.env.CLOUDINARY_TRANSLATED_FOLDER,
                  use_filename: true,
                  timestamp: Date.now(),
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
              .end(webpBuffer);
          })
          .catch(reject);
      });
    });

    const translatedBuffersUploaded: UploadApiResponse[] = await Promise.all(
      uploadPromises3
    );

    return new NextResponse(JSON.stringify(translatedBuffersUploaded), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("", {
      status: 500,
    });
  }
}
