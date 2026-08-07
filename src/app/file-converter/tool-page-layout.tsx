import type { ReactNode } from "react";
import Link from "next/link";
import { ToolStructuredData } from "../structured-data";

export function ToolPageLayout({
  title,
  intro,
  children,
  structuredDataPath,
  structuredDataDescription,
}: {
  title: string;
  intro: string;
  children: ReactNode;
  structuredDataPath?: string;
  structuredDataDescription?: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-md space-y-6">
        {structuredDataPath && structuredDataDescription && (
          <ToolStructuredData name={title} description={structuredDataDescription} path={structuredDataPath} />
        )}
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{intro}</p>
        </div>
        {children}
        <p className="text-center text-xs text-muted">
          Free, and nothing is ever uploaded, it all happens in your browser.{" "}
          <Link href="/file-converter" className="underline underline-offset-2">
            See all file-converter tools
          </Link>
        </p>
      </div>
    </main>
  );
}
