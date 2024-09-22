import React from "react";
import Demo from "./_components/demo";
import { listGoogleSupportedLanguages } from "@/lib/aiTools/google/translate";

export default async function Page() {
  const supportedLanguages = await listGoogleSupportedLanguages();
  return <Demo supportedLanguages={supportedLanguages} />;
}
