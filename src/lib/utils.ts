import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { NextRequest, NextResponse } from "next/server";

type Middleware = (request: NextRequest) => Promise<NextResponse | undefined>;

import jsPDF from "jspdf";
import { defaultFonts } from "@/constants";
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

// Utility function to handle request body parsing
async function parseRequestBody(req: NextRequest): Promise<any> {
  try {
    return await req.json();
  } catch (err) {
    // Return undefined if parsing fails (e.g., no body in the request)
    return undefined;
  }
}

// `withMiddleware` function
export async function withMiddleware(
  req: NextRequest,
  middlewares: Array<
    (
      req: NextRequest,
      next: () => Promise<NextResponse | undefined>
    ) => Promise<NextResponse | undefined>
  >,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse | undefined> {
  let i = 0;

  // Parse the request body before proceeding
  const parsedBody = await parseRequestBody(req);

  // Create a modified request object with parsed body
  const modifiedReq = new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? null : parsedBody,
  }) as NextRequest;

  (modifiedReq as any).json = async () => parsedBody;

  const next = async (): Promise<NextResponse | undefined> => {
    if (i < middlewares.length) {
      return middlewares[i++](modifiedReq, next);
    }
    return handler(modifiedReq);
  };

  return next();
}

export function getErrorMessage(error: any) {
  if (error.response) {
    const statusCode = error.response.status;
    switch (statusCode) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 500:
        return "Internal Server Error";
      case 502:
        return "Bad Gateway";
      case 503:
        return "Service Unavailable";
      case 504:
        return "Gateway Timeout";
      default:
        return `HTTP Error: ${statusCode}`;
    }
  } else if (error.request) {
    return "Network Error";
  } else if (error.name === "TypeError") {
    return "Type Error";
  } else if (error.name === "SyntaxError") {
    return "Syntax Error";
  } else if (error.name === "ReferenceError") {
    return "Reference Error";
  } else {
    return "Unknown Error";
  }
}

export const getDefaultFontFamilyFromCode = (code: string) => {
  const font = defaultFonts.find((e) => e.lngCode == code);
  if (!font) {
    return defaultFonts.find((e) => e.lngCode == "")?.fontName;
  }
  return font.fontName;
};
