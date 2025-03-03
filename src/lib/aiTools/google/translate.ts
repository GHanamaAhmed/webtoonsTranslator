import { google as googleTranslate } from "@google-cloud/translate/build/protos/protos";
import { gemini2Flash, gemini2FlashLite, v2Client, v3Client, vertex_ai } from "../apiClients";
import { Content, GenerateContentRequest } from "@google-cloud/vertexai";
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
    const [response] = await v3Client.getSupportedLanguages({
      parent: `projects/intense-climber-374014/locations/global`,
      displayLanguageCode: displayLanguageCode,
    });
    const languages = response.languages;
    return languages;
  } catch (error) {
    console.error("Error listing supported languages:", error);
  }
})();

export const gemini2FlashLiteTranslator = async (paragraphs: string[], targetLanguage: string) => {
  const req: string | GenerateContentRequest = {
    contents: [
      {
        role: "user",
        parts: [{
          text: `Translate the following webtoon texts into ${targetLanguage}. Return a single plain text output where each page's translation is separated by the exact delimiter #PAGE_BREAK#. Do not add any extra text or explanations:"${paragraphs.map(e => e + " #PAGE_BREAK# ")}"`
        }]
      }
    ],
  };

  const content = await gemini2FlashLite.generateContent(req);
  const candidates = content.response.candidates || []
  const translatedText = candidates[0].content.parts[0].text
  const translationsArray = translatedText?.split('#PAGE_BREAK#').map(text => text.trim());
  return translationsArray
}
export const gemini2FlashTranslator = async (paragraphs: string[], targetLanguage: string) => {
  const req: string | GenerateContentRequest = {
    contents: [
      {
        role: "user",
        parts: [{
          text: `Translate the following webtoon texts into ${targetLanguage}. Return a single plain text output where each page's translation is separated by the exact delimiter #PAGE_BREAK#. Do not add any extra text or explanations:"${paragraphs.map(e => e + " #PAGE_BREAK# ")}"`
        }]
      }
    ],
  };
  const content = await gemini2Flash.generateContent(req);
  const candidates = content.response.candidates || []
  const translatedText = candidates[0].content.parts[0].text
  const translationsArray = translatedText?.split('#PAGE_BREAK#').map(text => text.trim());
  return translationsArray
}