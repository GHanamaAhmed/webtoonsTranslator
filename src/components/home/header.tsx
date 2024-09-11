"use client";
import Image from "next/image";
import React from "react";
import { UserMenu } from "../translator/userMenu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { AuthThemeProvider } from "@/app/(auth)/_components/authThemeProvider";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Translation",
    href: "/translator",
    description: "Access our powerful translator tool for webtoons and manga.",
  },
  {
    title: "Pricing",
    href: "/#pricing",
    description:
      "Learn more about our flexible pricing plans for translation services.",
  },
  {
    title: "FAQ",
    href: "/#FAQ",
    description:
      "Frequently asked questions about our translator and services.",
  },
  {
    title: "Terms And Conditions",
    href: "/terms-and-conditions",
    description: "Review the terms and conditions for using our services.",
  },
  {
    title: "Privacy Policy",
    href: "/privacy-policy",
    description: "Read our privacy policy to learn how we handle your data.",
  },
];

export default function Header() {
  const { data: session } = useSession();
  return (
    <AuthThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationMenu className="w-full absolute flex justify-around items-center py-2 md:py-4 xl:py-6 z-40">
        <Link
          href={"/"}
          className="relative w-32 h-10 md:w-40 md:h-12 xl:w-48 xl:h-14"
        >
          <Image src={"/logo-no-background.svg"} alt="" fill />
        </Link>
        <div className="hidden md:flex justify-between items-center gap-4 xl:gap-6 text-Text">
          <Link href={"/translator"}>Translation</Link>
          <Link href={"/#pricing"}>Pricing</Link>
          <Link href={"/#FAQ"}>FAQ</Link>
          {/* <Link href={"/terms-and-conditions"}>Terms And Conditions</Link> */}
          <Link href={"/privacy-policy"}>Privacy Policy</Link>
        </div>
        <div className="flex justify-between items-center gap-2 md:gap-4 xl:gap-6">
          {session?.user ? (
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
              href={"/auth/signin"}
              className="py-1 px-3 md:py-2 md:px-4 border-[0.5px] border-LightBackground text-Text"
            >
              Login
            </Link>
          )}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent relative w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10 md:hidden">
              {" "}
              <Image src={"/bx_bx-menu-alt-right.svg"} alt="" fill />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:hidden">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </div>
      </NavigationMenu>
    </AuthThemeProvider>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          href={href as string}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
