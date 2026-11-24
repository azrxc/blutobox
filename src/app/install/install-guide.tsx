"use client";
import {useEffect,useState} from "react";
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};
export function InstallGuide(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[installed,setInstalled]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{
  const capture=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent);};
  const complete=()=>{setInstalled(true);setPrompt(null);};
  const media=window.matchMedia("(display-mode: standalone)");
  const sync=()=>setInstalled(media.matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
  window.addEventListener("beforeinstallprompt",capture);window.addEventListener("appinstalled",complete);media.addEventListener?.("change",sync);
  const id=window.setTimeout(sync,0);
  return()=>{window.clearTimeout(id);window.removeEventListener("beforeinstallprompt",capture);window.removeEventListener("appinstalled",complete);media.removeEventListener?.("change",sync);};
 },[]);
 async function install(){if(!prompt)return;try{await prompt.prompt();const result=await prompt.userChoice;setMessage(result.outcome==="accepted"?"Installation requested. Check your home screen.":"You can install later using the browser menu.");}catch{setMessage("Use your browser menu to install.");}finally{setPrompt(null);}}
 return <div className="space-y-4">{installed?<p className="rounded-xl border bg-surface p-4">You are using the installed app.</p>:prompt?<button type="button" onClick={install} className="min-h-12 w-full rounded-xl bg-accent px-5 text-accent-foreground">Install Bluto Box</button>:null}{message&&<p role="status" className="text-sm">{message}</p>}<section className="rounded-2xl border bg-surface p-5"><h2 className="font-semibold">Android / Chrome</h2><p className="mt-2 text-sm text-muted">Open this site in Chrome. Tap the three-dot menu, then Install app or Add to Home screen.</p></section><section className="rounded-2xl border bg-surface p-5"><h2 className="font-semibold">iPhone / iPad</h2><p className="mt-2 text-sm text-muted">Open this site in Safari. Tap Share, then Add to Home Screen. Confirm Add.</p></section><section className="rounded-2xl border bg-surface p-5"><h2 className="font-semibold">Desktop</h2><p className="mt-2 text-sm text-muted">In a supported browser, use the install icon in the address bar or the browser menu.</p></section></div>;
}
