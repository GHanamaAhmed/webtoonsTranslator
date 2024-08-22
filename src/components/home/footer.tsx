import Image from "next/image";
import React from "react";

export default function Footer() {
  return (
    <section className="flex justify-center items-center bg-[#1E1E1E]">
      <div className="w-full md:w-10/12 flex flex-col md:flex-row md:justify-between  gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <div className="flex flex-col gap-2 md:gap-3 xl:gap-4">
          <div className="relative w-32 h-10 md:w-40 md:h-12 xl:w-48 xl:h-14">
            <Image src={"/logo-no-background.svg"} alt="" fill />
          </div>
          <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            © 2021 Webtoon Translator. All rights reserved.
          </p>
        </div>
        <div className=" flex flex-col gap-4 md:gap-6 xl:gap-8">
          <p className="font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            Navigation
          </p>
          <div className=" flex flex-col gap-2 md:gap-3 xl:gap-4">
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Home
            </p>
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Pricing
            </p>
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              FAQ
            </p>
          </div>
        </div>
        <div className=" flex flex-col gap-4 md:gap-6 xl:gap-8">
          <p className="font-medium text-subheader md:text-subheader-md lg:text-subheader-lg xl:text-subheader-lg 2xl:text-subheader-2xl">
            Term
          </p>
          <div className=" flex flex-col gap-2 md:gap-3 xl:gap-4">
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Policies
            </p>
            <p className="text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
              Terms and condtions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
