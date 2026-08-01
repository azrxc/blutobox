"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Bluto Box
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/upload" className="transition-colors hover:text-foreground">
            Upload
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link
              href="/account"
              className="rounded-full px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
