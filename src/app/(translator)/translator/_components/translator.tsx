"use client";
import React, { useState, useEffect, useCallback } from "react";
import { fabric } from "fabric";
import { UserMenu } from "@/components/translator/userMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdOutlineAdd } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IoSettings } from "react-icons/io5";

// Utility function to read file as Data URL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

export default function Page() {
  const [images, setImages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleAddPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files?.length) {
      return;
    }

    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        return await readFileAsDataURL(file);
      })
    );

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleEditImage = () => {
    setIsEditing(true);
  };

  const handleCanvasLoad = (canvas: fabric.Canvas, src: string) => {
    fabric.Image.fromURL(src, (img) => {
      // Set canvas dimensions to image dimensions
      const aspectRatio = img.width! / img.height!;
      const canvasWidth = img.width!;
      const canvasHeight = img.height!;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });

      // Set image properties to make it non-editable
      img.set({
        selectable: false, // Makes the image non-selectable
        evented: false, // Disables event handling for the image
        left: 0,
        top: 0,
      });

      // Clear the canvas
      canvas.clear();

      // Add image to canvas
      canvas.add(img);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvasWidth / img.width!,
        scaleY: canvasHeight / img.height!,
      });

      // Render the canvas
      canvas.renderAll();
    });
  };

  useEffect(() => {
    if (isEditing) {
      images.forEach((src, index) => {
        const canvasId = `canvas-${index}`;
        const canvasElement = document.getElementById(
          canvasId
        ) as HTMLCanvasElement;
        const fabricCanvas = new fabric.Canvas(canvasElement);

        handleCanvasLoad(fabricCanvas, src);

        return () => {
          fabricCanvas.dispose(); // Clean up canvas
        };
      });
    }
  }, [isEditing, images]);

  return (
    <main className="flex flex-col bg-LightBackground dark:bg-DarkBackground h-screen">
      <header className="p-2 dark:bg-DarkBackground2 flex justify-between px-4 md:px-6 xl:px-8 gap-2 md:gap-4 xl:gap-6">
        <div>
          <UserMenu>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </UserMenu>
        </div>
        <div className="flex items-center gap-2 md:gap-4 xl:gap-6">
          <Select defaultValue="1">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"1"}>Page 1</SelectItem>
                <SelectItem value="2">Page 2</SelectItem>
                <SelectItem value="3">Page 3</SelectItem>
                <SelectItem value="4">Page 4</SelectItem>
                <SelectItem value="5">Page 5</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <label htmlFor="images">
            <MdOutlineAdd className="size-4" />
          </label>
          <input
            multiple
            onChange={handleAddPages}
            type="file"
            name="images"
            id="images"
            className="hidden"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-4 xl:gap-6">
          <Button variant="ghost" size="icon" className="hover:bg-inherit">
            <Image
              src="/webtoons-translator-favicon-color.svg"
              alt=""
              className="w-10 h-10"
              width={50}
              height={50}
            />
          </Button>
          <Select defaultValue="English">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"English"}>English</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
                <SelectItem value="Russin">Russin</SelectItem>
                <SelectItem value="Bolgar">Bolgar</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select defaultValue="25">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"25"}>25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="75">75</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="hover:bg-inherit">
            <IoSettings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-12 flex-1">
        <div className="col-span-12 flex flex-col items-center gap-4 p-4">
          {!isEditing &&
            images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Uploaded Image ${index}`}
                onClick={handleEditImage}
              />
            ))}

          {isEditing &&
            images.map((src, index) => (
              <canvas
                key={index}
                id={`canvas-${index}`}
                className="image-canvas max-w-full"
              ></canvas>
            ))}
        </div>
      </div>
    </main>
  );
}
