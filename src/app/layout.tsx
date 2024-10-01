import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AlertDialogProvider } from "@/components/alertDialog";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/queryProvider";
import { SessionProvider } from "@/components/sessionPrvider";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import NProgressBar from "@/components/Nbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://manhwavision.com"),
  title: "MangaVision AI – Fast & Accurate Manga, Manhwa, Comics Translation",
  description:
    "Easily translate your favorite manga, manhwa, and comics with MangaVision AI. Our tool provides precise, fast, and accurate translations while preserving the original artwork and layout for an authentic reading experience in any language.",
  applicationName: "Webtoon Translator",
  generator: "Next.js",
  keywords: [
    "webtoon translator",
    "manga translator",
    "translate webtoons",
    "comics translation",
    "webtoon translation",
    "manga translation",
    "read manga online",
    "read webtoons",
  ],
  referrer: "origin",
  robots: "index, follow",
  icons: [
    { rel: "icon", url: "/icon.ico" },
    { rel: "apple-touch-icon", url: "/icon.png" },
  ],
  openGraph: {
    type: "website",
    url: "https://manhwavision.com",
    title: "MangaVision AI – Fast & Accurate Manga, Manhwa, Comics Translation",
    description:
      "Easily translate your favorite manga, manhwa, and comics with MangaVision AI. Our tool provides precise, fast, and accurate translations while preserving the original artwork and layout for an authentic reading experience in any language.",

    siteName: "Webtoon Translator",
    images: [
      { url: "https://manhwavision.com/logo-no-background.svg" },
      { url: "https://manhwavision.com/logo-background.webp" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Webtoon Translator",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await getServerSession(options);
  return (
    <html lang="en" className="dark">
      <body>
        <NProgressBar />
        <SessionProvider session={session}>
          <QueryProvider>
            <AlertDialogProvider>
              {modal}
              {children}
            </AlertDialogProvider>
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
