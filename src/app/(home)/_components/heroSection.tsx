"use client";
import React from "react";
import { Adamina } from "next/font/google";
import Link from "next/link";
const adamina = Adamina({
  subsets: ["latin"],
  weight: ["400"],
});
const Languages = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
];
export default function HeroSection() {
  return (
    <main
      id="herosection"
      className="relative flex justify-center items-center bg-gradient-to-b from-Secondary to-Primary"
    >
      <div className="background-image" />
      <div className="relative z-20 w-full md:w-10/12 flex flex-col items-center gap-7 md:gap-10 xl:gap-14 text-Text py-20 md:py-24 lg:py-32 xl:py-36 2xl:py-40 px-5">
        <div className="text-center">
          <p className="text-title md:text-title-md lg:text-title-lg xl:text-title-lg 2xl:text-title-2xl font-extrabold">
            Manhwa Vision AI
          </p>
          <p className="text-title md:text-title-md lg:text-title-lg xl:text-title-lg 2xl:text-title-2xl font-extrabold">
            Quick and Accurate Comic Translations
          </p>
        </div>
        <p className="text-center text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
          Translate your favorite manga and comic into various languages with
          ease using Manhwa Vision AI. Our tool preserves the original format,
          delivering a smooth and accurate translation that stays true to the
          original artwork.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
          <Link
            href={"/translator"}
            className="bg-Primary hover:bg-opacity-80 py-3 px-5 text-Text shadow-sm"
          >
            Try For Free
          </Link>
          <Link
            href={"/#powerdbyai"}
            className="border border-LightBackground py-3 px-5 text-Text hover:text-Primary hover:bg-white"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
}
