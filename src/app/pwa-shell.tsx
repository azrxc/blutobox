"use client";
import {useEffect} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
const tabs=[["/","Home","M3 10 12 3l9 7v10H4V10 M9 20v-7h6v7"],["/study","Study","m2 8 10-5 10 5-10 5-10-5 M5 10v7l7 4 7-4v-7"],["/create","Create","M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4 2 2 0 0 1 0-4h3a4 4 0 0 0 4-4c0-3-4-6-9-6Z M7 9h.01 M11 6h.01 M6 14h.01"],["/upload","Files","M3 6h7l2 2h9v12H3z"],["/account","Me","M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2"]];
export function PwaShell(){
  const pathname=usePathname();
  useEffect(()=>{
    if(process.env.NODE_ENV==="production"&&"serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});
    }
  },[]);
  return <nav className="pwa-bottom-nav" aria-label="App navigation">{tabs.map(([href,label,path])=>{
    const active=href==="/"?pathname==="/":pathname===href||pathname.startsWith(href+"/");
    return <Link key={href} href={href} aria-current={active?"page":undefined} className={active?"pwa-tab pwa-active":"pwa-tab"}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg><span>{label}</span></Link>;
  })}</nav>;
}
