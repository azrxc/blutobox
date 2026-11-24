"use client";
import { useState, useSyncExternalStore } from "react";
type Task = {id:string; title:string; subject:string; due:string; done:boolean};
const KEY="blutobox-study-tasks-v1", EVENT="blutobox-study-tasks-change";
function subscribe(fn:()=>void) { window.addEventListener("storage",fn);window.addEventListener(EVENT,fn);return()=>{window.removeEventListener("storage",fn);window.removeEventListener(EVENT,fn);};}
function snapshot(){try{return localStorage.getItem(KEY)??"[]";}catch{return "[]";}}
function serverSnapshot(){return "[]";}
function parse(raw:string):Task[]{try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?v.filter((x):x is Task=>!!x&&typeof x.id==="string"&&typeof x.title==="string"&&typeof x.subject==="string"&&typeof x.due==="string"&&typeof x.done==="boolean").slice(0,100):[];}catch{return [];}}
export function Planner(){
  const tasks=parse(useSyncExternalStore(subscribe,snapshot,serverSnapshot));
  const [title,setTitle]=useState(""), [subject,setSubject]=useState(""), [due,setDue]=useState(""), [error,setError]=useState("");
  function save(next:Task[]){try{localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event(EVENT));setError("");return true;}catch{setError("Your browser could not save the assignments.");return false;}}
  function add(){const current=parse(snapshot());if(!title.trim())return;if(current.length>=100){setError("Remove completed assignments before adding more.");return;}if(save([...current,{id:crypto.randomUUID(),title:title.trim(),subject:subject.trim(),due,done:false}])){setTitle("");setSubject("");setDue("");}}
  function exportTasks(){const url=URL.createObjectURL(new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="blutobox-assignments.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const ordered=[...tasks].sort((a,b)=>Number(a.done)-Number(b.done)||(a.due||"9999").localeCompare(b.due||"9999"));
  return <div className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-xl font-semibold">Assignment planner</h2><p className="mt-1 text-sm text-muted">Keep track of your deadlines.</p></div><span className="rounded-full border px-3 py-1 text-xs">{tasks.filter(t=>!t.done).length} pending</span></div>
    <form onSubmit={e=>{e.preventDefault();add();}} className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-sm">Assignment<input required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Group report" className="block min-h-11 w-full rounded-lg border bg-background px-3 text-base"/></label>
      <label className="space-y-1 text-sm">Subject<input maxLength={80} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject name" className="block min-h-11 w-full rounded-lg border bg-background px-3 text-base"/></label>
      <label className="space-y-1 text-sm">Due date<input type="date" value={due} onChange={e=>setDue(e.target.value)} className="block min-h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-base"/></label>
      <button type="submit" className="min-h-11 self-end rounded-lg bg-accent px-4 text-sm text-accent-foreground">Add assignment</button>
    </form>
    {error&&<p role="alert" className="text-sm">{error}</p>}
    {ordered.length===0?<p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted">No assignments yet.</p>:<ul className="divide-y rounded-xl border">{ordered.map(t=><li key={t.id} className="flex items-center gap-3 p-3"><input type="checkbox" checked={t.done} aria-label={"Complete "+t.title} onChange={e=>save(parse(snapshot()).map(x=>x.id===t.id?{...x,done:e.target.checked}:x))} className="h-5 w-5 shrink-0 accent-[var(--accent)]"/><div className="min-w-0 flex-1 break-words"><p className={"text-sm font-medium "+(t.done?"line-through text-muted":"")}>{t.title}</p><p className="text-xs text-muted">{t.subject?t.subject+" · ":""}{t.due||"No due date"}</p></div><button type="button" aria-label={"Remove "+t.title} onClick={()=>save(parse(snapshot()).filter(x=>x.id!==t.id))} className="min-h-10 px-2 text-xs text-muted underline">Remove</button></li>)}</ul>}
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted"><p>Saved on this browser only. Clearing browser data removes tasks.</p><button type="button" disabled={!tasks.length} onClick={exportTasks} className="underline disabled:opacity-50">Export tasks</button></div>
  </div>;
}
