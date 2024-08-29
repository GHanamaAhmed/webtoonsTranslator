import React from "react";

import Demo from "./_components/demo";
import { listSupportedLanguages } from "@/lib/aiTools/translate";

export default async function Page() {
  // const supportedLanguages = await listSupportedLanguages();
  const supportedLanguages = [{
    
  }]

  return <Demo supportedLanguages={supportedLanguages} />;
}
