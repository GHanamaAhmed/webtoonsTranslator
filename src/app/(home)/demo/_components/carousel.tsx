"use client";
import { useClickOutsideForImages } from "@/hooks/useClickOutside";
import * as React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
// Import required modules
import { FreeMode } from "swiper/modules";

export function ImagesCarousel({
  images,
  isOpen,
}: {
  images: {
    src: string | undefined;
    isPending: boolean;
    isError: boolean;
  }[];
  isOpen: number;
}) {
  const imageRefs = React.useRef<(HTMLImageElement | null)[]>([]);
  const [open, setOpen] = React.useState(false);

  // Create an array of refs for each image
  const imageRefObjects = React.useMemo(
    () =>
      images.map(
        (_, index) =>
          ({
            current: imageRefs.current[index],
          } as React.RefObject<HTMLElement>)
      ),
    [images]
  );
  console.log(imageRefObjects);
  
  useClickOutsideForImages(imageRefObjects, () => setOpen(false));

  React.useEffect(() => {
    if (isOpen) setOpen(true);
  }, [isOpen]);

  React.useEffect(() => {
    let scrollPosition = 0;

    if (open) {
      scrollPosition = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      window.scrollTo(0, scrollPosition);
    }

    return () => {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      window.scrollTo(0, scrollPosition);
    };
  }, [open]);

  return (
    <div
      className={`absolute h-screen w-full flex items-center justify-center z-50 bg-black bg-opacity-30 ${
        open ? "" : "hidden"
      }`}
    >
      <Swiper
        centeredSlides={true}
        direction="horizontal"
        freeMode={true}
        modules={[FreeMode]}
        className="mySwiper w-full h-full"
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
              src={image.src}
              alt={`Translated Image ${index}`}
              className="object-contain"
              style={{
                maxWidth: "100%",
                maxHeight: "100vh",
              }}
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
