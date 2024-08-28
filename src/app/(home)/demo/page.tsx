"use client";
import React, { useState } from "react";
import { CldImage } from "next-cloudinary";
import { MdDelete } from "react-icons/md";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import ChunkedUpload from "@/hooks/chunkedUpload";
import { GoArrowSwitch } from "react-icons/go";
import sharp from "sharp";
import { convertFilesToPng, convertFilesToWebp } from "@/lib/utils";

export default function Page() {
  const [images, setImages] = useState<
    {
      src: string | undefined;
      isPending: boolean;
      isError: boolean;
    }[]
  >([]);
  const [startIndex, setStartIndex] = useState(0);

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const oldFiles = e.currentTarget.files;
    const files = await convertFilesToWebp(oldFiles!);
    if (files) {
      files.forEach((file, index) => {
        setImages((prevImages) => [
          ...prevImages,
          { src: undefined, isPending: true, isError: false },
        ]);
        // Use the ChunkedUpload component
        // Note: You might need to update this part to actually render and use ChunkedUpload component correctly in your setup
        ChunkedUpload({
          file,
          onUploadSuccess: (data: UploadApiResponse) => {
            setImages((prevImages) => {
              const newImages = [...prevImages];
              newImages[index + startIndex].src = data.secure_url;
              newImages[index + startIndex].isPending = false;
              return newImages;
            });
          },
          onUploadError: (error) => {
            setImages((prevImages) => {
              const newImages = [...prevImages];
              newImages[index + startIndex].isError = true;
              newImages[index + startIndex].isPending = false;
              return newImages;
            });
          },
        });
      });
      setStartIndex((prev) => prev + files.length);
    }
  };

  const handleRemoveImage = (src: string | undefined) => {
    setImages((prev) => prev.filter((image) => image.src !== src));
  };
  return (
    <div className="relative flex justify-center items-center">
      <div className="h-full absolute w-full opacity-10 bg-gradient-to-b to-Quaternary from-Primary"></div>
      <div className="background-image" />
      <div className="relative z-20 w-full md:w-10/12 flex flex-col items-center gap-7 md:gap-10 xl:gap-14 text-Text py-20 md:py-24 lg:py-32 xl:py-36 2xl:py-40 px-5">
        <div className="text-center">
          <p className="text-title md:text-title-md lg:text-title-lg xl:text-title-lg 2xl:text-title-2xl font-extrabold">
            Webtoon Translator
          </p>
          <p className="text-center text-paragraph md:text-paragraph-md lg:text-paragraph-lg xl:text-paragraph-lg 2xl:text-paragraph-2xl">
            Translate your favorite webtoons and comic scans into various
            languages with ease using Webtoon Translator. Our tool preserves the
            original format, delivering a smooth and accurate translation that
            stays true to the original artwork.
          </p>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center justify-center w-full min-h-64 border-2 border-Primary border-dashed rounded-lg cursor-pointer hover:bg-Primary hover:bg-opacity-45">
            {!images.length ? (
              <label
                htmlFor="dropzone-file"
                className="flex flex-col cursor-pointer h-full w-full items-center justify-center pt-5 pb-6"
              >
                <svg
                  className="w-8 h-8 mb-4 text-Text"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-Text">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-Text">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </label>
            ) : (
              <div className="w-full p-2 gap-2 md:gap-4 xl:gap-6 h-full grid grid-cols-2 md:grid-cols-5 xl:grid-cols-7">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="min-h-[236px] rounded-lg overflow-hidden grid grid-rows-6"
                  >
                    <div
                      className={`relative row-span-5 ${
                        image.isPending ? "row-span-6" : "row-span-5"
                      }`}
                    >
                      {image.isPending ? (
                        <div className="flex justify-center items-center h-full">
                          <svg
                            className="animate-spin bg-white h-5 w-5"
                            viewBox="0 0 24 24"
                          ></svg>
                        </div>
                      ) : image.isError ? (
                        <div className="flex justify-center items-center h-full bg-red-500 bg-opacity-10 text-center text-red-500">
                          <p>Error loading image</p>
                        </div>
                      ) : (
                        <CldImage
                          className="object-cover"
                          src={image.src!}
                          fill
                          alt={"image-" + index}
                        />
                      )}
                    </div>
                    {!image.isPending && (
                      <div className="bg-LightBackground bg-opacity-25 flex justify-between items-center">
                        <MdDelete
                          onClick={() => handleRemoveImage(image.src)}
                          className="w-5 h-5 hover:fill-red-500"
                        />
                        <SvgIcon className="w-8 h-8 stroke fill-white" />
                        <GoArrowSwitch className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
                <label
                  htmlFor="dropzone-file"
                  className="relative cursor-pointer flex justify-center items-center border-2 border-dashed rounded-lg border-gray-600"
                >
                  <svg
                    className="w-8 h-8 mb-4 stroke"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                </label>
              </div>
            )}
            <input
              onChange={handleAddImage}
              multiple
              id="dropzone-file"
              type="file"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const SvgIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={128}
    height={128}
    viewBox="0 0 128 128"
    className={className}
  >
    <g transform="matrix(0.8046875,0,0,0.8046875,12.221578124999994,28.16921818328852)">
      <svg
        viewBox="0 0 96 67"
        data-background-color="#00dc64"
        preserveAspectRatio="xMidYMid meet"
        height={89}
        width={128}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g
          id="tight-bounds"
          transform="matrix(1,0,0,1,0.25950000000000273,0.020757593554890263)"
        >
          <svg
            viewBox="0 0 95.481 66.9584848128902"
            height="66.9584848128902"
            width="95.481"
          >
            <g>
              <svg
                viewBox="0 0 95.481 66.9584848128902"
                height="66.9584848128902"
                width="95.481"
              >
                <g>
                  <svg
                    viewBox="0 0 95.481 66.9584848128902"
                    height="66.9584848128902"
                    width="95.481"
                  >
                    <g id="textblocktransform">
                      <svg
                        viewBox="0 0 95.481 66.9584848128902"
                        height="66.9584848128902"
                        width="95.481"
                        id="textblock"
                      >
                        <g>
                          <svg
                            viewBox="0 0 95.481 66.9584848128902"
                            height="66.9584848128902"
                            width="95.481"
                          >
                            <g>
                              <svg
                                viewBox="0 0 95.481 66.9584848128902"
                                height="66.9584848128902"
                                width="95.481"
                              >
                                <g>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    xmlSpace="preserve"
                                    version="1.1"
                                    style={{
                                      shapeRendering: "geometricPrecision",
                                      textRendering: "geometricPrecision",
                                    }}
                                    viewBox="31.72 148.7 783.23 549.26"
                                    x={0}
                                    y={0}
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    height="66.9584848128902"
                                    width="95.481"
                                    className="icon-icon-0"
                                    data-fill-palette-color="accent"
                                    id="icon-0"
                                  >
                                    <g
                                      fill="#ffffff"
                                      data-fill-palette-color="accent"
                                    >
                                      <path
                                        className=""
                                        d="M31.72 148.7H459.47V270.21H814.95V697.96H387.2V576.45H31.72zM338.48 366.44L410.9 324.63V345.53C457.88 346.82 515.65 360.69 521.69 451.11 496.44 398.75 453.68 384.45 410.9 387.34V408.25zM580.6 378.69H616.6L702.43 589.49H661.31L638.08 528.63H560.48L538.71 589.49H499.73zM571.98 497.04H625.98C616.57 472.41 606.84 447.82 598.47 422.82 591.41 448.03 581.38 472.57 571.98 497.04M301.31 303.56C299.29 343.21 284.73 381.87 256.57 410.36 275.15 429.97 295.52 438.63 321.62 443.19L315.9 475.98C281.52 469.9 254.33 457.33 230.5 431.12 212.75 442.05 195.76 447.28 175.3 450.87L169.58 418.1C184.96 415.41 197.31 412.03 211.03 404.02 195.87 377.03 190.31 349.55 189.57 318.81 200.62 318.52 211.68 318.27 222.73 318 223.28 341.18 226.74 361.6 237.19 382.45 256.39 360.69 266.28 332.29 268.09 303.56H166V269.97H225.29V249.17H265.9V269.97H325.19V303.56z"
                                        fill="#ffffff"
                                        data-fill-palette-color="accent"
                                      />
                                    </g>
                                  </svg>
                                </g>
                              </svg>
                            </g>
                          </svg>
                        </g>
                      </svg>
                    </g>
                  </svg>
                </g>
              </svg>
            </g>
            <defs />
          </svg>
          <rect
            width="95.481"
            height="66.9584848128902"
            fill="none"
            stroke="none"
            visibility="hidden"
          />
        </g>
      </svg>
    </g>
  </svg>
);
