"use client";
import { useClickOutsideForImages } from "@/hooks/useClickOutside";
import * as React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import { usePathname, useRouter } from "next/navigation";

export function ImagesCarousel({
  images,
  isOpen,
  direction = "vertical",
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
  direction?: "horizontal" | "vertical";
  index?: number;
}) {
  const imageRefs = React.useRef<(HTMLImageElement | null)[]>([]);
  const [open, setOpen] = React.useState(false);
  // Next.js App Router hooks
  const router = useRouter();
  const pathname = usePathname();
  const [translated, setTranslated] = React.useState(false);
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

  useClickOutsideForImages(imageRefObjects, open, () => {
    setOpen(false);
  });

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
      className={`absolute h-screen w-full flex items-center justify-center z-50 bg-black bg-opacity-80 ${
        open ? "" : "hidden"
      }`}
    >
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
                src={translated ? image.tsrc : image.src}
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
      ) : (
        <div className="w-full flex flex-col items-center overflow-auto h-full py-20">
          {images.map((image, index) => (
            <img
              id={"image" + index}
              key={index}
              src={translated ? image.tsrc : image.src}
              alt={`Translated Image ${index}`}
              className="object-contain"
              style={{
                maxWidth: "100%",
              }}
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
