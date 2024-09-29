import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <section className="flex justify-center items-center bg-DarkBackground">
      <div className="w-full md:w-10/12 flex flex-col md:flex-row md:justify-between  gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
          <Link
            href={"/"}
            className="relative w-32 h-10 md:w-40 md:h-12 xl:w-48 xl:h-14"
          >
            <Image src={"/logo-no-background.svg"} alt="" fill />
          </Link>
          <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            © 2021 MangaVision AI. All rights reserved.
          </p>
        </div>
        <div className=" flex flex-col gap-4 md:gap-6 xl:gap-8">
          <p className="font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            Navigation
          </p>
          <div className=" flex flex-col gap-2 md:gap-3 xl:gap-4">
            <Link
              href={"/"}
              className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              Home
            </Link>
            <Link
              href={"/#pricing"}
              className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              Pricing
            </Link>
            <Link
              href={"/#FAQ"}
              className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              FAQ
            </Link>
          </div>
        </div>
        <div className=" flex flex-col gap-4 md:gap-6 xl:gap-8">
          <p className="font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            Term
          </p>
          <div className=" flex flex-col gap-2 md:gap-3 xl:gap-4">
            <Link
              href={"/privacy-policy"}
              className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              Policies
            </Link>
            <Link
              href={"/terms-and-conditions"}
              className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl"
            >
              Terms and condtions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
