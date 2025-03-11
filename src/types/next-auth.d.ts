import { DefaultSession, JWT } from "next-auth";
export declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
    } & DefaultSession["user"];
  }
}
