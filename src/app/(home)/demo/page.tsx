"use client";
import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import { CldImage } from "next-cloudinary";
import { GoArrowSwitch } from "react-icons/go";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { UploadApiResponse } from "cloudinary";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export default function Page() {
  const [uploadingImages, setUploadingImages] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const uploadImagesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const { data }: { data: UploadApiResponse[] } = await axios.post(
        "/api/project/images",
        formData
      );
      return data;
    },
    onMutate: (files) => {
      setUploadingImages((prev) => prev + files.length);
    },
    onSuccess: (data) => {
      setImages((prevImages) => [
        ...prevImages,
        ...data.map((image) => image.secure_url),
      ]);
    },
    onError: (error) => {
      console.error(error);
    },
    onSettled: (_, __, files) => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      setUploadingImages((prev) => prev - files.length);
    },
  });

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.currentTarget.files;
    if (files) {
      uploadImagesMutation.mutate(files);
    }
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
            {!images.length && !uploadImagesMutation.isPending ? (
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
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="min-h-[236px] rounded-lg overflow-hidden grid grid-rows-6"
                  >
                    <div className="relative row-span-5">
                      <CldImage
                        className="object-cover"
                        src={src}
                        fill
                        alt={"image-" + index}
                      />
                    </div>
                    <div className="bg-LightBackground bg-opacity-25 flex justify-between items-center">
                      <MdDelete className="w-5 h-5 hover:fill-red-500" />
                      <SvgIcon className="w-8 h-8 stroke" />
                      <GoArrowSwitch className="w-5 h-5" />
                    </div>
                  </div>
                ))}
                {uploadImagesMutation.isPending &&
                  Array.from({ length: uploadingImages }).map((_, index) => (
                    <div
                      key={index}
                      className="min-h-[236px] relative cursor-pointer flex justify-center items-center border-2 border-dashed rounded-lg border-gray-600"
                    >
                      <svg
                        className="animate-spin bg-white h-5 w-5 mr-3 ..."
                        viewBox="0 0 24 24"
                      ></svg>
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
    {/* SVG content here */}
  </svg>
);
