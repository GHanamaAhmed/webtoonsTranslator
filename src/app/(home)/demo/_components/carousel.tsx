"use client";
import * as React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoMdSettings } from "react-icons/io";

export function ImagesCarousel({
  images,
  isOpen,
  index = 0,
}: {
  images: {
    src: string;
    tsrc: string;
    translated: boolean;
    isPending: boolean;
    isError: string;
  }[];
  isOpen: number;
  index?: number;
}) {
  const [open, setOpen] = React.useState(false);
  // Next.js App Router hooks
  const router = useRouter();
  const pathname = usePathname();
  const [translated, setTranslated] = React.useState(false);
  const [direction, setDirection] = React.useState<"horizontal" | "vertical">(
    "vertical"
  );
  React.useEffect(() => {
    if (isOpen) {
      const isTranslatedOpen = images[index].translated;
      if (isTranslatedOpen) {
        setTranslated(true);
      } else {
        setTranslated(false);
      }
      setOpen(true);
    }
  }, [isOpen]);

  React.useEffect(() => {
    let scrollPosition = 0;

    const disableScroll = () => {
      scrollPosition = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";
    };

    const enableScroll = () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPosition);
    };

    if (open) {
      disableScroll();
    } else {
      enableScroll();
    }

    // Clean up by enabling scroll when the component is unmounted or when 'open' state changes
    return () => {
      enableScroll();
    };
  }, [open]);
  React.useEffect(() => {
    if (direction === "vertical") {
      // Update the URL without a full page reload
      router.push(`${pathname}#image${index}`);
    }
  }, [index]);
  return (
    <div
      onClick={() => {
        setOpen(false);
      }}
      className={`absolute h-screen w-full flex items-center justify-center z-50 bg-black bg-opacity-80 ${
        open ? "" : "hidden"
      }`}
    >
      <span className="absolute top-5 right-5  z-50">
        {" "}
        <DropdownMenu>
          <DropdownMenuTrigger>
            {" "}
            <IoMdSettings className="size-6 xl:size-8" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Direction</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDirection("horizontal");
              }}
            >
              Horizontal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDirection("vertical");
              }}
            >
              Vertical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>

      {direction === "horizontal" ? (
        <Swiper
          centeredSlides={true}
          className="mySwiper w-full h-full"
          initialSlide={index} // Start at the specified index
        >
          {images.map((image, index) => (
            <SwiperSlide
              className="flex justify-center items-center"
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <img
                id={index + ""}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                src={translated ? image.tsrc : image.src}
                alt={`Translated Image ${index}`}
                className="object-contain"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100vh",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full flex flex-col items-center overflow-auto h-full py-20">
          {images.map((image, index) => (
            <img
              id={"image" + index}
              key={index}
              onClick={(e) => {
                e.stopPropagation();
              }}
              src={translated ? image.tsrc : image.src}
              alt={`Translated Image ${index}`}
              className="object-contain"
              style={{
                maxWidth: "100%",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
