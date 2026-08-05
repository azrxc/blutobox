"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="shrink-0 dark:invert"
            priority
          />
          Bluto Box
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/upload" className="transition-colors hover:text-foreground">
            Upload
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link
              href="/account"
              aria-label="Account"
              title="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-85"
            >
              {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
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

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground sm:hidden"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 2l14 14M16 2L2 16" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 5h14M2 9h14M2 13h14" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border/80 bg-background px-6 py-3 text-sm sm:hidden">
          <Link href="/upload" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
            Upload
          </Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
            Pricing
          </Link>
          <Link href="/qr" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
            QR code
          </Link>
          <Link href="/file-converter" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
            File converter
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
              Admin
            </Link>
          )}
          {!session?.user && (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-muted hover:bg-surface hover:text-foreground">
              Log in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
