import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Image from "next/image";
import React from "react";
import { UserMenu } from "../translator/userMenu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

export default async function Header() {
  const session = await getServerSession(options);
  return (
    <header className="z-10 w-full absolute flex justify-around items-center py-2 md:py-4 xl:py-6">
      <div className="relative w-32 h-10 md:w-40 md:h-12 xl:w-48 xl:h-14">
        <Image src={"/logo-no-background.svg"} alt="" fill />
      </div>
      <div className="hidden md:flex justify-between items-center gap-4 xl:gap-6 text-Text">
        <div>Home</div>
        <div>Translation</div>
        <div>Pricing</div>
        <div>Blog</div>
      </div>
      <div className="flex justify-between items-center gap-2 md:gap-4 xl:gap-6">
        {session ? (
          <UserMenu>
            <Avatar>
              <AvatarImage
                src={session?.user.image || ""}
                alt={session?.user.name}
              />
              <AvatarFallback className="bg-transparent font-medium">
                {session?.user.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </UserMenu>
        ) : (
          <Link
            href={"/api/auth/signin"}
            className="py-1 px-3 md:py-2 md:px-4 border-[0.5px] border-LightBackground text-Text"
          >
            Login
          </Link>
        )}
        <div className="relative w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10 md:hidden">
          <Image src={"/bx_bx-menu-alt-right.svg"} alt="" fill />
        </div>
      </div>
    </header>
  );
}
