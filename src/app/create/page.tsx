import type { Metadata } from "next";
import Link from "next/link";
import { PhotoEditor } from "./photo-editor";
import { CreatorTools } from "./creator-tools";
export const metadata: Metadata = {title:"Free creator tools | Bluto Box",description:"Edit photos, remove solid backgrounds, make social images, create QR codes and format captions in your browser."};
const links=[["/qr","QR code generator","Make a QR for a link, event or presentation."],["/file-converter/compress-image","Compress images","Make photos smaller before posting."],["/file-converter","Convert files","Change image and document formats."],["/file-converter/video-to-gif","Video to GIF","Make a looping clip."],["/upload","Share your creations","Send a file with a link."],["/study#studio","AI writing","Polish your captions, bios and ideas."]];
export default function CreatePage(){return <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
<header className="space-y-3"><p className="text-xs font-semibold uppercase tracking-widest text-muted">Bluto Box / Create</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Make it yours.</h1><p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">Quick creative tools for social posts, presentations, product photos and everyday life.</p><nav aria-label="Creator sections" className="flex flex-wrap gap-2 text-sm">{[["#photo","Photo editor"],["#social","Social tools"],["#more","More tools"]].map(([href,label])=><a key={href} href={href} className="rounded-full border bg-surface px-4 py-2 hover:bg-accent/5">{label}</a>)}</nav></header>
<section id="photo" className="scroll-mt-24"><PhotoEditor/></section>
<section id="social" className="scroll-mt-24"><CreatorTools/></section>
<section id="more" className="scroll-mt-24 space-y-4"><h2 className="text-xl font-semibold">More creator essentials</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(([href,title,desc])=><Link key={href} href={href} className="rounded-2xl border bg-surface p-4 hover:bg-accent/5"><h3 className="font-medium">{title} ↗</h3><p className="mt-1 text-sm text-muted">{desc}</p></Link>)}</div></section>
</main>;}
