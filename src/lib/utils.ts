import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { NextRequest, NextResponse } from "next/server";

type Middleware = (request: NextRequest) => Promise<NextResponse | undefined>;

import jsPDF from "jspdf";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const adjectives = [
  "Happy",
  "Creative",
  "Energetic",
  "Lively",
  "Dynamic",
  "Radiant",
  "Joyful",
  "Vibrant",
  "Cheerful",
  "Sunny",
  "Sparkling",
  "Bright",
  "Shining",
];

const animals = [
  "Dolphin",
  "Tiger",
  "Elephant",
  "Penguin",
  "Kangaroo",
  "Panther",
  "Lion",
  "Cheetah",
  "Giraffe",
  "Hippopotamus",
  "Monkey",
  "Panda",
  "Crocodile",
];

export function generateRandomName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

export const getShapeInfo = (shapeType: string) => {
  switch (shapeType) {
    case "rect":
      return {
        icon: "/assets/rectangle.svg",
        name: "Rectangle",
      };

    case "circle":
      return {
        icon: "/assets/circle.svg",
        name: "Circle",
      };

    case "triangle":
      return {
        icon: "/assets/triangle.svg",
        name: "Triangle",
      };

    case "line":
      return {
        icon: "/assets/line.svg",
        name: "Line",
      };

    case "i-text":
      return {
        icon: "/assets/text.svg",
        name: "Text",
      };

    case "image":
      return {
        icon: "/assets/image.svg",
        name: "Image",
      };

    case "freeform":
      return {
        icon: "/assets/freeform.svg",
        name: "Free Drawing",
      };

    default:
      return {
        icon: "/assets/rectangle.svg",
        name: shapeType,
      };
  }
};

export const exportToPdf = () => {
  const canvas = document.querySelector("canvas");

  if (!canvas) return;

  // use jspdf
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  // get the canvas data url
  const data = canvas.toDataURL();

  // add the image to the pdf
  doc.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);

  // download the pdf
  doc.save("canvas.pdf");
};

export async function convertFilesToPng(oldFiles: FileList) {
  const files = await Promise.all(
    Array.from(oldFiles).map(async (file) => {
      const img = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: "image/png" });
            resolve(newFile);
          } else {
            reject(new Error("Failed to convert canvas to Blob"));
          }
        }, "image/png");
      });
    })
  );
  return files;
}
export async function convertFilesToWebp(oldFiles: FileList): Promise<File[]> {
  const files: File[] = await Promise.all(
    Array.from(oldFiles).map(async (file) => {
      const img = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".webp"),
              { type: "image/webp" }
            );
            resolve(newFile);
          } else {
            reject(new Error("Failed to convert canvas to Blob"));
          }
        }, "image/webp"); // Convert to WebP
      });
    })
  );
  return files;
}

// Function to chunk an array into smaller arrays of a specified size
export function chunkArray<T>(array: T[], size: number = 16) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function withMiddleware(
  request: NextRequest,
  middlewares: Middleware[],
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  for (const middleware of middlewares) {
    const response = await middleware(request);
    if (response) {
      return response;
    }
  }
  return handler(request);
}
