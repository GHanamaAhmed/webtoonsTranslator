import { google as googleTranslate } from "@google-cloud/translate/build/protos/protos";
import { google as googleVison } from "@google-cloud/vision/build/protos/protos";

import { translationClient } from "../utilsServer";
import Bottleneck from "bottleneck";
import { cache } from "react";

export async function translateText(
  contents: string[],
  targetLanguageCode: string
) {
  // Construct request
  const request: googleTranslate.cloud.translation.v3.ITranslateTextRequest = {
    parent: `projects/intense-climber-374014/locations/global`,
    contents,
    mimeType: "text/plain", // mime types: text/plain, text/html
    targetLanguageCode,
  };
  // Run request
  const [response] = await translationClient.translateText(request);
  return response;
}

export const listSupportedLanguages = cache(
  async (displayLanguageCode: string = "en") => {
    try {
      const [response] = await translationClient.getSupportedLanguages({
        parent: `projects/intense-climber-374014/locations/global`,
        displayLanguageCode: displayLanguageCode,
      });
      const languages = response.languages;
      return languages;
    } catch (error) {
      console.error("Error listing supported languages:", error);
    }
  }
);
