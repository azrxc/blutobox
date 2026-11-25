"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { studyLanguages, type StudyLanguage } from "@/lib/study-languages";

const modes = [
  ["paraphrase","Paraphrase","Express the same meaning in fresh words."],
  ["natural","Humanize / natural","Improve flow and keep your own voice."],
  ["grammar","Grammar","Fix spelling, punctuation and grammar."],
  ["academic","Academic tone","Use clear formal language."],
  ["simplify","Simplify","Explain difficult wording more clearly."],
  ["summarize","Summarize","Extract the main ideas from your notes."],
  ["flashcards","Flashcards","Create question-and-answer revision cards from your notes."],
  ["quiz","Practice quiz","Create practice questions and an answer key from your notes."],
] as const;
const MAX = 4000;
function words(s:string) { return s.trim() ? s.trim().split(/\s+/).length : 0; }
export function StudyStudio() {
  const { data: session, status } = useSession();
  const [mode,setMode] = useState<(typeof modes)[number][0]>("paraphrase");
  const [language,setLanguage] = useState<StudyLanguage>("original");
  const [input,setInput] = useState("");
  const [output,setOutput] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [copied,setCopied] = useState(false);
  async function generate() {
    if (busy || !input.trim() || !session?.user) return;
    setBusy(true); setError(""); setCopied(false);
    try {
      const response = await fetch("/api/study/rewrite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,language,text:input})});
      const data = await response.json();
      if (!response.ok || typeof data.output !== "string") setError(typeof data.error === "string" ? data.error : "Unable to generate a result.");
      else setOutput(data.output);
    } catch { setError("Could not connect. Your draft is still here."); }
    finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setCopied(true); }
    catch { setError("Clipboard unavailable. Select and copy the result manually."); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([output],{type:"text/plain;charset=utf-8"}));
    const a = document.createElement("a"); a.href=url; a.download="blutobox-study.txt"; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div><h2 className="text-xl font-semibold">AI writing &amp; revision studio</h2><p className="mt-1 text-sm text-muted">For assignments, reports and revision. Write in your own language or choose from 17 output languages.</p></div>
      <div role="group" aria-label="AI mode" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {modes.map(([id,label])=><button key={id} type="button" disabled={busy} aria-pressed={mode===id} onClick={()=>setMode(id)} className={"min-h-11 rounded-lg border px-2 py-2 text-sm "+(mode===id?"border-accent bg-accent text-accent-foreground":"border-border hover:bg-accent/5")}>{label}</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">{modes.find(m=>m[0]===mode)?.[2]}</p>
        <label className="flex items-center gap-2 text-sm">Language <select value={language} disabled={busy} onChange={e=>setLanguage(e.target.value as StudyLanguage)} className="min-h-10 rounded-lg border border-border bg-background px-2">{studyLanguages.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="source-text" className="text-sm font-medium">Your text</label>
          <textarea id="source-text" dir="auto" value={input} maxLength={MAX} disabled={busy} onChange={e=>setInput(e.target.value)} placeholder="Paste your draft or lecture notes…" className="min-h-56 w-full resize-y rounded-xl border border-border bg-background p-3 text-base leading-relaxed"/>
          <div className="flex justify-between text-xs text-muted"><span>{words(input)} words · {input.length}/{MAX} characters</span><button type="button" disabled={busy} onClick={()=>{setInput("");setOutput("");setError("");setCopied(false);}} className="underline">Clear</button></div>
        </div>
        <div className="space-y-2">
          <label htmlFor="study-output" className="text-sm font-medium">Result (editable)</label>
          <textarea id="study-output" dir="auto" value={output} disabled={busy} onChange={e=>{setOutput(e.target.value);setCopied(false);}} placeholder={busy?"Working on your text…":"Your result will appear here."} className="min-h-56 w-full resize-y rounded-xl border border-border bg-background p-3 text-base leading-relaxed"/>
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted"><span>{words(output)} words</span><div className="flex gap-3"><button type="button" disabled={!output||busy} onClick={copy} className="underline">{copied?"Copied":"Copy"}</button><button type="button" disabled={!output||busy} onClick={download} className="underline">Download</button></div></div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">AI requests send your text to an external AI provider. Avoid confidential or personal information. This tool does not save your draft. Natural writing improves readability; it does not guarantee AI detector results.</p>
      <div className="flex flex-wrap items-center gap-3">
        {status==="loading"?<span className="text-sm text-muted">Checking account…</span>:session?.user?<button type="button" onClick={generate} disabled={busy||!input.trim()} className="min-h-11 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-50">{busy?"Working…":"Generate"}</button>:<Link href="/login" className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">Log in to use AI</Link>}
        <span className="text-xs text-muted">Preview limits: 5 free / 30 Pro requests per day, subject to shared capacity.</span>
      </div>
      {error&&<p role="alert" className="rounded-lg border border-border p-3 text-sm">{error}</p>}
    </div>
  );
}
