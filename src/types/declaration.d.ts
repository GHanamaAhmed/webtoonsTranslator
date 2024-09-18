import { NextRequest as OriginalNextRequest } from "next/server";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
// next-request-augmentation.d.ts

declare module "next/server" {
  interface NextRequest {
    [key: string]: any; // Allow other custom fields
  }
}
