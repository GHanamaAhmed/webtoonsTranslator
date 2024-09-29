"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaRobot, FaRocket } from "react-icons/fa";
import { MdTouchApp } from "react-icons/md";
import { RiExpandLeftRightLine } from "react-icons/ri";

export default function PowerdByAI() {
  const [lineX, setLineX] = useState<number>(0); // Initially 0, will be set to the middle of the container
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setLineX(x);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      setLineX(x);
    }
  };

  const handleMouseEnter = () => {
    setCursorVisible(false); // Hide cursor when inside the container
  };

  const handleMouseLeave = () => {
    setCursorVisible(true); // Show cursor when outside the container
  };

  // For touch events on mobile
  const handleTouchStart = () => {
    setCursorVisible(false); // Hide cursor when touch starts
  };

  const handleTouchEnd = () => {
    setCursorVisible(true); // Show cursor when touch ends
  };

  useEffect(() => {
    if (containerRef.current) {
      // Set initial lineX to center the line in the middle of the container
      const containerWidth = containerRef.current.offsetWidth;
      setLineX(containerWidth / 2);
    }
  }, []);
  return (
    <section id="powerdbyai" className="flex justify-center items-center">
      <div className="w-full md:w-10/12 flex flex-col items-center gap-4 md:gap-6 xl:gap-8 text-Text py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <p className="text-center text-header md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
          Powered by AI, Seamless and Efficient
        </p>
        <p className="text-center md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
          MangaVision AI offers fast and accurate translations for manga and
          webtoons with our AI-driven tool. Whether youre translating entire
          series or individual chapters, it captures every nuance with
          precision. Start translating effortlessly today and experience our
          superior technology.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-5 md:gap-7 xl:gap-9">
          <div className="flex justify-center h-full">
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden w-10/12"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove} // Handle mobile touch movement
              onMouseEnter={handleMouseEnter}
              onTouchStart={handleTouchStart} // Handle touch start
              onMouseLeave={handleMouseLeave}
              onTouchEnd={handleTouchEnd} // Handle touch end
              style={{
                cursor: cursorVisible ? "auto" : "none", // Hide cursor if cursorVisible is false
                position: "relative",
              }}
            >
              <div
                className="bg-LightBackground p-2 absolute top-1/2 z-20 rounded-full"
                style={{ left: `calc(${lineX}px - 14px)` }}
              >
                <RiExpandLeftRightLine color="black" className="w-5 h-5" />
              </div>
              <div
                className="absolute h-full w-1.5 bg-LightBackground shadow-md z-10"
                style={{ left: `${lineX}px` }}
              />
              <div className="relative inset-0 md:h-full md:w-full flex aspect-[3/4]">
                <Image
                  className=""
                  src={"/images/tr3_en.webp"}
                  sizes="(min-width: 780px) calc(34.55vw - 26px), calc(83.26vw - 33px)"
                  alt="Japanese"
                  objectFit="cover"
                  fill
                  style={{
                    clipPath: `inset(0 0 0 ${lineX}px)`,
                  }}
                />
                <Image
                  className="absolute"
                  src={"/images/tr3_pr.webp"}
                  sizes="(min-width: 780px) calc(34.55vw - 26px), calc(83.26vw - 33px)"
                  alt="English"
                  fill
                  objectFit="cover"
                  style={{
                    clipPath: `inset(0 ${
                      containerRef.current
                        ? containerRef.current.offsetWidth - lineX
                        : 0
                    }px 0 0)`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-7 md:gap-10 xl:gap-12">
            <div className="w-8/12 flex flex-col gap-1 md:gap-2 xl:gap-3">
              <div className="flex gap-1 md:gap-2 xl:gap-3">
                <FaRobot className="fill-Tertiary w-8 h-8" />
                <p className="font-medium text-Text text-subheader xl:text-subheader-lg 2xl:text-subheader-2xl">
                  Precision Tailored for Webtoons and Manga{" "}
                </p>
              </div>
              <p className="text-Text text-paragraph  xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                Our AI understands the unique language and cultural references
                found in webtoons and manga, delivering translations that stay
                true to the original content.
              </p>
            </div>
            <div className="w-8/12 flex flex-col gap-1 md:gap-2 xl:gap-3">
              <div className="flex gap-1 md:gap-2 xl:gap-3">
                <FaRocket className="fill-Tertiary w-8 h-8" />
                <p className="font-medium text-Text text-subheader xl:text-subheader-lg 2xl:text-subheader-2xl">
                  Speed and Efficiency:{" "}
                </p>
              </div>
              <p className="text-Text text-paragraph  xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                Translate entire chapters or series swiftly without compromising
                accuracy, saving you time and effort.
              </p>
            </div>
            <div className="w-8/12 flex flex-col gap-1 md:gap-2 xl:gap-3">
              <div className="flex gap-1 md:gap-2 xl:gap-3">
                <MdTouchApp className="fill-Tertiary w-8 h-8" />
                <p className="font-medium text-Text text-subheader xl:text-subheader-lg 2xl:text-subheader-2xl">
                  User-Friendly Interface{" "}
                </p>
              </div>
              <p className="text-Text text-paragraph  xl:text-paragraph-lg 2xl:text-paragraph-2xl">
                Our intuitive platform makes it easy for translators of all
                levels to produce high-quality translations with minimal effort,
                and allows them to edit translations as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
