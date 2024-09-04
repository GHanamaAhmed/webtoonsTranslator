"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function AuthButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  return (
    <>
      {status == "authenticated" ? (
        children
      ) : (
        <Link href={"/auth/signin"}>{children}</Link>
      )}
    </>
  );
}
