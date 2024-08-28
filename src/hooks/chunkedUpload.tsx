"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOADPRESET!;

interface ChunkedUploadProps {
  file: File;
  onUploadSuccess: (data: any) => void;
  onUploadError: (error: Error) => void;
}

const ChunkedUpload: React.FC<ChunkedUploadProps> = ({
  file,
  onUploadSuccess,
  onUploadError,
}) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks

  if (!file) {
    console.error("No file selected.");
    return;
  }

  const uniqueUploadId = `uqid-${Date.now()}`;
  const totalChunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;

  const uploadChunk = async (start: number, end: number) => {
    const formData = new FormData();
    formData.append("file", file.slice(start, end));
    formData.append("upload_preset", process.env.CLOUDINARY_UPLOADPRESET!);
    formData.append("folder", process.env.CLOUDINARY_FOLDER!);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        formData,
        {
          headers: {
            "X-Unique-Upload-Id": uniqueUploadId,
            "Content-Range": contentRange,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        currentChunk++;
        if (currentChunk < totalChunks) {
          const nextStart = currentChunk * chunkSize;
          const nextEnd = Math.min(nextStart + chunkSize, file.size);
          uploadChunk(nextStart, nextEnd);
        } else {
          onUploadSuccess(response.data);
        }
      } else {
        throw new Error("Chunk upload failed.");
      }
    } catch (error: any) {
      console.error("Error uploading chunk:", error);
      onUploadError(error);
    }
  };

  const start = 0;
  const end = Math.min(chunkSize, file.size);
  uploadChunk(start, end);

  return null;
};

export default ChunkedUpload;
