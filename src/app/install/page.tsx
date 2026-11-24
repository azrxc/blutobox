import type {Metadata} from "next";
import {InstallGuide} from "./install-guide";
export const metadata:Metadata={title:"Install Bluto Box",description:"Add Bluto Box to your home screen for quick access to your everyday tools."};
export default function InstallPage(){return <main className="mx-auto w-full max-w-xl flex-1 space-y-6 px-5 py-12"><h1 className="text-3xl font-semibold tracking-tight">Bluto Box, in your pocket.</h1><p className="text-sm text-muted">Install the web app for faster access to your workspace. No app store needed.</p><InstallGuide/><p className="text-xs text-muted">Internet access is needed for AI, accounts and file services. This is a web app, not a native App Store or Google Play release.</p></main>;}
