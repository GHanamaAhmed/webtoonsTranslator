import type { Metadata } from "next";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import QueryProvider from "@/components/home/queryClientProvider";
import { Suspense } from "react";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-DarkBackground relative dark">
      <QueryProvider>
         
        <Header />
        {children}
        <Footer />
      </QueryProvider>
    </div>
  );
}
