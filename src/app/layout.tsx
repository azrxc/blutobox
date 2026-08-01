import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "./header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bluto Box",
  description: "Upload and share files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          {children}
        </Providers>
        <footer className="border-t border-border/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 text-xs text-muted">
            <span>© {new Date().getFullYear()} Bluto Box</span>
            <div className="flex gap-6">
              <Link href="/changelog" className="transition-colors hover:text-foreground">
                Changelog
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
