"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaRobot, FaRocket } from "react-icons/fa";
import { MdTouchApp } from "react-icons/md";
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

  const handleMouseEnter = () => {
    setCursorVisible(false); // Hide cursor when inside the container
  };

  const handleMouseLeave = () => {
    setCursorVisible(true); // Show cursor when outside the container
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
            Elevate Your Manga Experience with Our Advanced AI-Powered Webtoon
            Translator{" "}
          </p>
          <p className="md:w-10/12 text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            Webtoon Translator provides swift and precise translations for
            webtoons and manga, utilizing our sophisticated AI-driven tool.
            Whether you're translating intricate series or individual chapters,
            our technology adeptly captures every nuance, ensuring accuracy even
            in complex images. Start translating seamlessly today and discover
            the excellence of our advanced translation capabilities.
          </p>
        </div>
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden w-full mx-auto max-w-[269px] xl:max-w-[400px] 2xl:max-w-[500px]"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
          <div className="relative inset-0 flex">
            <Image
              className=""
              src={"/images/x_ja.png"}
              alt="Japanese"
              objectFit="cover"
              width={2000}
              height={2000}
              style={{
                width: "100%",
                height: "auto",
                clipPath: `inset(0 0 0 ${lineX}px)`,
              }}
            />
            <Image
              className="absolute"
              src={"/images/x_er.png"}
              alt="English"
              width={2000}
              height={2000}
              objectFit="cover"
              style={{
                width: "100%",
                height: "auto",
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
    </section>
  );
}
