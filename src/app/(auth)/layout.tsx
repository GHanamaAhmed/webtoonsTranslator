import React from "react";
import { AuthThemeProvider } from "./_components/authThemeProvider";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </AuthThemeProvider>
  );
}
