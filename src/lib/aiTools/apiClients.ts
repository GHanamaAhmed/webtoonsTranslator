import path from "path";
import credentials from "@/intense-climber-374014-04ed221a9eb2.json";
import { VertexAI } from "@google-cloud/vertexai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { v3, v2 } from "@google-cloud/translate";
import { HarmBlockThreshold, HarmCategory } from "@google-cloud/vertexai";
import * as deepl from "deepl-node";

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
export const v3Client = new v3.TranslationServiceClient({
  keyFilename: path.join(
    process.cwd(),
    "src",
    "intense-climber-374014-04ed221a9eb2.json"
  ),
});
export const v2Client = new v2.Translate({
  keyFilename: path.join(
    process.cwd(),
    "src",
    "intense-climber-374014-04ed221a9eb2.json"
  ),
});

export const translator = new deepl.Translator(
  `${process.env.DEEPL_SECRET_KEY}`
);


import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const gemini2FlashLite = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }
  ],
});

export const gemini2Flash = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    }
  ],
});