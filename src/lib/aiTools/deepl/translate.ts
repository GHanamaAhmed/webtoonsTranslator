import { cache } from "react";
import { translator } from "../apiClients";
import { TargetLanguageCode, TextResult } from "deepl-node";

export async function deeplTranslateText(
  contents: string[],
  targetLanguageCode: TargetLanguageCode
): Promise<TextResult[]> {
  const result = await translator.translateText(
    contents,
    null,
    targetLanguageCode
  );
  return result;
}

export const listDeeplSupportedLanguages = cache(async () => {
  try {
    const response = await translator.getTargetLanguages();
    return response;
  } catch (error) {
    console.error("Error listing supported languages:", error);
  }
});
