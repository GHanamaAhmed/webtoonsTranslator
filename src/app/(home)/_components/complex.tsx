"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { RiExpandLeftRightLine } from "react-icons/ri";

export default function Complex() {
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
      <div className="w-full md:w-10/12 grid grid-cols-1 md:grid-cols-2  gap-4 md:gap-6 xl:gap-8 py-10 md:py-14 lg:py-16 xl:py-20 2xl:py-24 px-5">
        <div className="text-center md:text-start text-Text flex flex-col gap-3 md:gap-5 xl:gap-7">
          <p className="text-header  md:text-header-md lg:text-header-lg xl:text-header-lg 2xl:text-header-2xl font-extrabold">
            Unlock Seamless Translations for Webtoons, Manga, Manhwa, and More
            with Our AI-Powered Translator
          </p>
          <p className="md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            Our MangaVision AI delivers fast, precise translations for all types
            of comics, including webtoons, manga, manhwa, and more. Using
            cutting-edge AI technology, it effortlessly handles complex images
            and text, ensuring every nuance is captured. Whether you&apos;re
            translating entire series or individual chapters, experience the
            ultimate in accuracy and convenience today.
          </p>
        </div>
        <div className="w-full flex justify-center">
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
            <div className="relative inset-0 md:h-full flex aspect-[3/4]">
              <Image
                className=""
                src={"/images/tr1_ko.webp"}
                sizes="(min-width: 1120px) calc(34.57vw - 25px), (min-width: 1040px) calc(-3.33vw + 392px), (min-width: 940px) calc(33.75vw - 17px), (min-width: 780px) calc(-21.43vw + 509px), calc(83.26vw - 33px)"
                alt="Japanese"
                objectFit="cover"
                fill
                style={{
                  clipPath: `inset(0 0 0 ${lineX}px)`,
                }}
              />
              <Image
                className="absolute"
                src={"/images/tr1_en.webp"}
                sizes="(min-width: 1120px) calc(34.57vw - 25px), (min-width: 1040px) calc(-3.33vw + 392px), (min-width: 940px) calc(33.75vw - 17px), (min-width: 780px) calc(-21.43vw + 509px), calc(83.26vw - 33px)"
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
      </div>
    </section>
  );
}
