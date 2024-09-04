import ImageReveal from "@/components/home/imageReveal";
import Image from "next/image";
import React from "react";

export default function Effortless() {
  return (
    <section id="effortless" className="flex justify-center items-center bg-DarkBackground2">
      <div className=" w-full md:w-10/12 flex flex-col items-center gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <p className="text-center text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
          Effortless Translation of Vertical Text and Images
        </p>
        <p className="text-center md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
          With Webtoon Translator, you can seamlessly translate vertical and
          horizontal comic scans, no matter the original language. From raw
          manga to scanned webtoons, our AI-powered tool supports a wide range
          of languages, making translation simple and efficient for all your
          comic needs.
        </p>
        <div className="grid grid-cols-3 w-full rounded-3xl overflow-hidden">
          <div className="relative bg-[#414141] bg-opacity-40">
            <Image
              src="/images/wallpaperflare.com_wallpaper (1).jpg"
              fill
              alt=""
              className="rounded-md opacity-20 object-cover"
            />
            <div className="absolute bottom-0">
              <div className="text-white p-4">
                <p className="opacity-65 text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-medium">
                  One
                </p>
                <p className="text-title md:text-title-md lg:text-title-lg xl:text-title-lg 2xl:text-title-2xl font-medium">
                  Piece
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-2  md:h-auto grid grid-rows-2 gap-4 md:gap-6 xl:gap-8 p-4 text-Text">
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-8">
              <div className="flex justify-between items-center">
                <p className="md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                  <span className="font-medium">Author:</span> Eiichiro Oda
                </p>
                <div className="flex justify-between items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-LightBackground opacity-50"></div>
                  <div className="h-2 w-2 rounded-full bg-LightBackground opacity-50"></div>
                  <div className="h-2 w-2 rounded-full bg-LightBackground opacity-50"></div>
                </div>
              </div>
              <p className="hidden md:block text-wrap text-clip overflow- text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                One Piece follows the adventures of young pirate Monkey D.
                Luffy, who sets out on a journey to find the legendary treasure
                One Piece and become the Pirate King. Alongside his diverse
                crew, Luffy faces countless challenges, battles various enemies,
                and explores unknown islands and secrets, steadily moving closer
                to his dream.
              </p>
              <p className="md:hidden text-wrap text-clip overflow- text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                One Piece follows the adventures of young pirate Monkey D.
                Luffy, who sets out on a journey ...
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 xl:gap-6 2xl:gap-8">
              <div className="">
                <Image
                  src="/images/2.png"
                  width={126}
                  height={168}
                  alt=""
                  className="rounded-md"
                />
              </div>
              <div className="">
                <Image
                  src="/images/2.png"
                  width={126}
                  height={168}
                  alt=""
                  className="rounded-md"
                />
              </div>
              <div className="">
                <Image
                  src="/images/2.png"
                  width={126}
                  height={168}
                  alt=""
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className=" p-2 w-full border-Primary border-2 rounded-3xl">
          <div className="rounded-3xl overflow-hidden">
            <ImageReveal
              imageLeftOrTop="/images/1-jp.png"
              imageRightOrBottom="/images/1-en.png"
              axis="horizontal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
