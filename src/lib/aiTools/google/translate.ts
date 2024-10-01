import { google as googleTranslate } from "@google-cloud/translate/build/protos/protos";
import { v2Client, v3Client } from "../apiClients";
import { cache } from "react";
import { translationClient } from "@/lib/utilsServer";
export async function googleTranslateTextAdvanced(
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
  const [response] = await v3Client.translateText(request);
  return response;
}
export async function googleTranslateTextBasic(
  contents: string[],
  targetLanguageCode: string
) {
  const [translation] = await v2Client.translate(contents, targetLanguageCode);
  return translation;
}

export const listGoogleSupportedLanguages = await (async (
  displayLanguageCode: string = "en"
) => {
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
})();
