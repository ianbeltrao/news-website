"use client";

import Link from "next/link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import Logo from "@/components/ui/Logo";

const navigationLinks = [
  { label: "Search", href: "/" },
  { label: "Saved Articles", href: "/saved" }
];

export default function NavbarTop({ user }) {
  return (
    <header className="sticky top-0 flex h-16 items-center z-50 gap-2 border-b bg-background px-4 md:px-6">
      <DesktopNavigation links={navigationLinks} />
      <MobileNavigation links={navigationLinks} />
      <div className="md:hidden ml-auto">
        <Link href="/account">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full p-0 border"
          >
            <User className="size-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

function DesktopNavigation({ links }) {
  return (
    <nav className="hidden md:flex items-center w-full max-w-screen-2xl mx-auto">
      <div className="w-[120px]">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 flex justify-center gap-6">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="w-[120px] flex justify-end">
        <Link href="/account">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full p-0 border"
          >
            <User className="size-5" />
          </Button>
        </Link>
      </div>
    </nav>
  );
}

function MobileNavigation({ links }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-6 text-lg font-medium">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Link href="/]" className="w-[120px]">
              <Logo />
            </Link>
          </div>
          {links.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
