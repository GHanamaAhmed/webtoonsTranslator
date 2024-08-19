"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { RiExpandLeftRightLine } from "react-icons/ri";

interface ImageRevealProps {
  axis?: "horizontal" | "vertical";
  imageLeftOrTop: string;
  imageRightOrBottom: string;
}

const ImageReveal: React.FC<ImageRevealProps> = ({
  axis = "horizontal",
  imageLeftOrTop,
  imageRightOrBottom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineX, setLineX] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const pos =
        axis === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top;
      setLineX(pos);
    }
  };

  const handleMouseEnter = () => setCursorVisible(false);
  const handleMouseLeave = () => setCursorVisible(true);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full mx-auto"
      style={{
        cursor: cursorVisible ? "auto" : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="bg-lightBackground p-2 absolute top-1/2 z-20 rounded-full"
        style={{
          left: axis === "horizontal" ? `calc(${lineX}px - 14px)` : "50%",
          top: axis === "vertical" ? `calc(${lineX}px - 14px)` : "50%",
          transform:
            axis === "vertical" ? "translateX(-50%)" : "translateY(-50%)",
        }}
      >
        <RiExpandLeftRightLine color="black" className="w-5 h-5" />
      </div>
      <div
        className="absolute h-full w-1.5 bg-lightBackground shadow-md z-10"
        style={{
          left: axis === "horizontal" ? `${lineX}px` : "0",
          top: axis === "vertical" ? `${lineX}px` : "0",
          width: axis === "horizontal" ? "1.5px" : "100%",
          height: axis === "vertical" ? "1.5px" : "100%",
        }}
      />
      <div className="relative inset-0 flex">
        <Image
          src={imageLeftOrTop}
          alt={axis === "horizontal" ? "Left Image" : "Top Image"}
          width={2000}
          height={2000}
          objectFit="cover"
          style={{
            width: "100%",
            height: "auto",
            clipPath:
              axis === "horizontal"
                ? `inset(0 0 0 ${lineX}px)`
                : `inset(0 ${lineX}px 0 0)`,
          }}
        />
        <Image
          className="absolute"
          src={imageRightOrBottom}
          alt={axis === "horizontal" ? "Right Image" : "Bottom Image"}
          objectFit="cover"
          width={2000}
          height={2000}
          style={{
            width: "100%",
            height: "auto",
            clipPath:
              axis === "horizontal"
                ? `inset(0 ${
                    containerRef.current
                      ? containerRef.current.offsetWidth - lineX
                      : 0
                  }px 0 0)`
                : `inset(${lineX}px 0 0 0)`,
          }}
        />
      </div>
    </div>
  );
};

export default ImageReveal;
