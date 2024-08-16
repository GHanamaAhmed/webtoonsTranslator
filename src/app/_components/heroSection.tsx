"use client";
import React from "react";
import { Adamina } from "next/font/google";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { Button } from "@/components/shadcn/ui/button";
import { LuChevronsUpDown } from "react-icons/lu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/ui/command";
import { FaCheck } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { MdTranslate } from "react-icons/md";
import axios from "axios";
import { UploadApiResponse } from "cloudinary";
import { CldImage } from "next-cloudinary";
const adamina = Adamina({
  subsets: ["latin"],
  weight: ["400"],
});
const Languages = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
];
export default function HeroSection() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const handlImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // const newImages = Array.from(files).map((file) => ({
      //   file,
      //   preview: URL.createObjectURL(file),
      // }));

      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]); // Note: Changed "images[]" to "images"
      }

      try {
        const res = await axios.post("/api/project/images", formData);
        const data: UploadApiResponse[] = res.data;
        setImages((prevImages) => [
          ...prevImages,
          ...data.map((e) => e.public_id),
        ]);
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    }
  };
  const delteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const index = images.findIndex(
      (image) =>
        image === e.currentTarget.previousElementSibling?.getAttribute("src")
    );
    if (index > -1) {
      try {
        const newImages = images.slice();
        setImages(newImages.slice(index, 1));
        await axios.delete("/api/project/images", {
          data: [images[index]],
        });
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handleTranslation = async () => {
    await axios.post("/api/project/translation", images, {
      headers: {
        "Content-Type": "application/json",
        "model-type": "magicApiObjectRemover",
      },
    });
  };
  return (
    <section className="flex flex-col gap-2 md:gap-4 xl:gap-6 items-center py-6 md:py-8 xl:py-10">
      <div className="flex flex-col items-center gap-2 md:gap-4 xl:gap-6 md:w-10/12 px-2 md:px-4 xl:px-6">
        <div
          className={
            "flex flex-col gap-1 md:gap-2 xl:gap-3 " + adamina.className
          }
        >
          {" "}
          <p className="text-3xl md:text-5xl xl:text-7xl">
            The Smarter way to{" "}
          </p>
          <p className="text-3xl md:text-5xl xl:text-7xl">
            Invest your <span className="text-color1">Money</span>
          </p>
        </div>
        <p className="text-color2 text-center w-10/12">
          Access 40,000+ instruments – across asset classes – to trade, hedge
          and invest from a single account.
        </p>
      </div>
      <div className="flex flex-col gap-2 md:gap-4 xl:gap-6 w-10/12">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              Select languages...
              <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search languages..." />
              <CommandList>
                <CommandEmpty>No languages found.</CommandEmpty>
                <CommandGroup>
                  {Languages.map((languages) => (
                    <CommandItem
                      key={languages.value}
                      value={languages.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <FaCheck
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === languages.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {languages.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex items-center justify-center w-full">
          {images.length ? (
            <div className="flex flex-nowrap gap-2 py-2 w-full h-40 md:h-60 xl:h-72 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 md:gap-3 xl:gap-4"
                >
                  <div className="relative w-24 md:w-32 xl:w-40 flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <CldImage
                      src={image}
                      alt={"image" + index}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={delteImage}
                      className="absolute top-0 right-0 p-1 m-1 bg-white dark:bg-gray-700 rounded-full"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-around items-center">
                    <button
                      onClick={handleTranslation}
                      className="bg-color1 text-white rounded-lg p-1"
                    >
                      <MdTranslate />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
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
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                multiple
                onChange={handlImage}
                id="dropzone-file"
                type="file"
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </section>
  );
}
