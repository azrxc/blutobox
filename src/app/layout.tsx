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
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: "Bluto Box",
  description: "Upload and share files.",
  openGraph: {
    title: "Bluto Box",
    description: "Upload and share files.",
    siteName: "Bluto Box",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Bluto Box",
    description: "Upload and share files.",
    images: ["/icon.png"],
  },
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
          <div className="mx-auto max-w-5xl px-6 py-10 text-xs text-muted">
            <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
              <div>
                <span className="font-medium text-foreground">Bluto Box</span>
                <p className="mt-1">© {new Date().getFullYear()} Bluto Box</p>
              </div>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-foreground">Tools</span>
                  <Link href="/upload" className="transition-colors hover:text-foreground">
                    Upload &amp; share
                  </Link>
                  <Link href="/qr" className="transition-colors hover:text-foreground">
                    QR code
                  </Link>
                  <Link href="/file-converter" className="transition-colors hover:text-foreground">
                    File converter
                  </Link>
                  <Link href="/text-diff" className="transition-colors hover:text-foreground">
                    Text diff
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-foreground">Company</span>
                  <Link href="/about" className="transition-colors hover:text-foreground">
                    About
                  </Link>
                  <Link href="/pricing" className="transition-colors hover:text-foreground">
                    Pricing
                  </Link>
                  <Link href="/changelog" className="transition-colors hover:text-foreground">
                    Changelog
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-foreground">Legal</span>
                  <Link href="/terms" className="transition-colors hover:text-foreground">
                    Terms
                  </Link>
                  <Link href="/privacy" className="transition-colors hover:text-foreground">
                    Privacy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
