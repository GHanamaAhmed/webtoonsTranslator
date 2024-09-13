import path from "path";
import credentials from "@/intense-climber-374014-04ed221a9eb2.json";
import { VertexAI } from "@google-cloud/vertexai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { TranslationServiceClient } from "@google-cloud/translate";
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
export const translationClient = new TranslationServiceClient({
  keyFilename: path.join(
    process.cwd(),
    "src",
    "intense-climber-374014-04ed221a9eb2.json"
  ),
});

export const translator = new deepl.Translator(
  `${process.env.DEEPL_SECRET_KEY}`
);
