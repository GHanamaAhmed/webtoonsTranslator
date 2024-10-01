import React from "react";
import Demo from "./_components/demo";
import { listGoogleSupportedLanguages } from "@/lib/aiTools/google/translate";
export default function Page() {
  const supportedLanguages = listGoogleSupportedLanguages;
  return <Demo supportedLanguages={supportedLanguages} />;
}
