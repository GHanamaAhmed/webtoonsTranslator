import { google } from "@google-cloud/translate/build/protos/protos";
import { translationClient } from "../utilsServer";

export async function translateText(
  contents: string[],
  targetLanguageCode: string
) {
  // Construct request
  const request: google.cloud.translation.v3.ITranslateTextRequest = {
    parent: `projects/intense-climber-374014/locations/global`,
    contents,
    mimeType: "text/plain", // mime types: text/plain, text/html
    targetLanguageCode,
  };
  // Run request
  const [response] = await translationClient.translateText(request);
  return response;
}
