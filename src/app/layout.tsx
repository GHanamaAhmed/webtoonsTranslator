import type { Metadata } from "next";
import "./globals.css";
import { AlertDialogProvider } from "@/components/alertDialog";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/queryProvider";
import icon from "@/app/logo.svg";
import { SessionProvider } from "@/components/sessionPrvider";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import NProgressBar from "@/components/Nbar";

export const metadata: Metadata = {
  title: "Manhwa Vision Ai",
  description:
    "Translate your favorite manga, manhwa, and comics effortlessly with MangaVision AI. Our tool provides fast, accurate translations while preserving the original artwork and format, delivering an authentic reading experience in any language.",
  icons: icon,
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
       <NProgressBar/>
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
