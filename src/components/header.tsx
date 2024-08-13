
import Image from "next/image";
import React from "react";
import { FiUser } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./shadcn/ui/dropdown-menu";
import { Button } from "./shadcn/ui/button";

export default function Header() {
  return (
    <header className="flex justify-around items-center py-2 md:py-4 xl:py-6">
      <Image src="/images/logo.webp" alt="logo" width={128} height={38} />
      <div className="flex items-center gap-2 md:gap-4 xl:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              EN
              <IoMdArrowDropdown className="mx-2 md:mx-3 xl:mx-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>EN</DropdownMenuItem>
              <DropdownMenuItem>AR</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div>
          <FiUser />
        </div>
      </div>
    </header>
  );
}
