"use client";
import { FileDropZone } from "../file-drop-zone";
import { useRef,useState,useEffect } from "react";
type Size={w:number;h:number};
const MAX=2048;
const presets=[["original","Original"],["1","Square 1:1"],["0.8","Portrait 4:5"],["0.5625","Story 9:16"],["1.7777778","Landscape 16:9"]];
const defaults={ratio:"original",width:0,brightness:100,contrast:100,saturation:100,remove:false,color:"#ffffff",tolerance:45,watermark:""};
export function PhotoEditor(){
 const canvas=useRef<HTMLCanvasElement>(null),image=useRef<HTMLImageElement|null>(null),loadId=useRef(0);
 const [size,setSize]=useState<Size|null>(null),[settings,setSettings]=useState(defaults),[error,setError]=useState(""),[loading,setLoading]=useState(false),[format,setFormat]=useState("png");
 function change<K extends keyof typeof defaults>(key:K,value:(typeof defaults)[K]){setSettings(s=>({...s,[key]:value}));}
 async function load(file:File|undefined){
  if(!file)return;const id=++loadId.current;setError("");setLoading(true);image.current=null;setSize(null);setSettings(defaults);
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>15*1024*1024){setLoading(false);setError("Choose a JPG, PNG or WebP image under 15 MB.");return;}
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();if(id!==loadId.current)return;
   if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>30_000_000)throw Error("Image too large");
   image.current=img;setSize({w:img.naturalWidth,h:img.naturalHeight});
  }catch{if(id===loadId.current)setError("Could not open this image. Try a smaller JPG or PNG.");}
  finally{URL.revokeObjectURL(url);if(id===loadId.current)setLoading(false);}
 }
 useEffect(()=>{
  const c=canvas.current,img=image.current;if(!c||!img||!size)return;
  let sw=size.w,sh=size.h;
  if(settings.ratio!=="original"){const ratio=Number(settings.ratio);if(sw/sh>ratio)sw=sh*ratio;else sh=sw/ratio;}
  const scale=Math.min(1,MAX/Math.max(sw,sh),settings.width>0?settings.width/sw:1);
  c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));
  const ctx=c.getContext("2d",{willReadFrequently:true});if(!ctx)return;
  ctx.drawImage(img,(size.w-sw)/2,(size.h-sh)/2,sw,sh,0,0,c.width,c.height);
  // Pixel processing rather than canvas filters for wider mobile compatibility.
  const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
  const target=[1,3,5].map(i=>parseInt(settings.color.slice(i,i+2),16));
  const b=settings.brightness/100,k=settings.contrast/100,s=settings.saturation/100;
  for(let i=0;i<d.length;i+=4){
   const r=d[i],g=d[i+1],bl=d[i+2];
   if(settings.remove&&Math.hypot(r-target[0],g-target[1],bl-target[2])<=settings.tolerance){d[i+3]=0;continue;}
   const l=.2126*r+.7152*g+.0722*bl;
   d[i]=((l+(r-l)*s)*b-128)*k+128;d[i+1]=((l+(g-l)*s)*b-128)*k+128;d[i+2]=((l+(bl-l)*s)*b-128)*k+128;
  }
  ctx.putImageData(pixels,0,0);
  if(settings.watermark.trim()){const fs=Math.max(12,Math.round(c.width*.035));ctx.font=fs+"px sans-serif";ctx.textAlign="right";ctx.textBaseline="bottom";ctx.shadowColor="#000";ctx.shadowBlur=4;ctx.fillStyle="#fff";ctx.fillText(settings.watermark,c.width-fs*.5,c.height-fs*.5,c.width-fs);}
 },[size,settings]);
 function download(){const c=canvas.current;if(!c||!size)return;let out=c;if(format==="jpeg"){out=document.createElement("canvas");out.width=c.width;out.height=c.height;const ctx=out.getContext("2d");if(!ctx)return;ctx.fillStyle="#fff";ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(c,0,0);}
 out.toBlob(blob=>{if(!blob){setError("Could not export image.");return;}const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="blutobox-photo."+(format==="jpeg"?"jpg":"png");a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},"image/"+format,.92);}
 const control="block min-h-11 w-full rounded-lg border bg-background px-3 text-base";
 return <div className="space-y-5 rounded-2xl border bg-surface p-4 sm:p-6">
 <div><h2 className="text-xl font-semibold">Photo editor</h2><p className="mt-1 text-sm text-muted">Crop, resize, adjust colors, remove a solid background and add a watermark. Your image stays in your browser.</p></div>
 <FileDropZone accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" title="Drop a photo here" hint="PNG, JPG or WebP · or browse" onFiles={picked=>{void load(picked[0]);}} />
 {loading&&<p role="status" className="text-sm">Opening photo…</p>}{error&&<p role="alert" className="text-sm">{error}</p>}
 {size&&<div className="grid gap-5 md:grid-cols-2">
 <div className="min-w-0 space-y-2"><div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border p-2" style={{backgroundImage:"conic-gradient(#ddd 25%,#fff 0 50%,#ddd 0 75%,#fff 0)",backgroundSize:"20px 20px"}}><canvas ref={canvas} aria-label="Edited image preview" className="block max-h-[480px] max-w-full object-contain"/></div><p className="text-xs text-muted">Original: {size.w} × {size.h}. Export capped at 2048 px for mobile performance.</p></div>
 <div className="space-y-4">
 <label className="block space-y-1 text-sm">Crop preset<select value={settings.ratio} onChange={e=>change("ratio",e.target.value)} className={control}>{presets.map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></label>
 <label className="block space-y-1 text-sm">Maximum width<select value={settings.width} onChange={e=>change("width",Number(e.target.value))} className={control}>{[0,512,720,1080,1600,2048].map(v=><option key={v} value={v}>{v?v+" px":"Auto"}</option>)}</select></label>
 {(["brightness","contrast","saturation"] as const).map(key=><label key={key} className="block text-sm capitalize">{key} · {settings[key]}%<input type="range" min="50" max="150" value={settings[key]} onChange={e=>change(key,Number(e.target.value))} className="block w-full accent-[var(--accent)]"/></label>)}
 <div className="space-y-2 rounded-lg border p-3"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={settings.remove} onChange={e=>change("remove",e.target.checked)}/> Remove solid background</label><p className="text-xs text-muted">Color-key removal works on plain backgrounds, not complex portraits. Matching colors anywhere in the image may become transparent.</p>{settings.remove&&<><label className="flex items-center gap-2 text-sm">Background color <input type="color" value={settings.color} onChange={e=>change("color",e.target.value)}/></label><label className="block text-sm">Tolerance · {settings.tolerance}<input type="range" min="0" max="180" value={settings.tolerance} onChange={e=>change("tolerance",Number(e.target.value))} className="block w-full accent-[var(--accent)]"/></label></>}</div>
 <label className="block space-y-1 text-sm">Watermark<input maxLength={60} value={settings.watermark} onChange={e=>change("watermark",e.target.value)} placeholder="Optional text" className={control}/></label>
 <div className="flex flex-wrap gap-2"><select aria-label="Download format" value={format} onChange={e=>setFormat(e.target.value)} className="rounded-lg border bg-background px-3"><option value="png">PNG (transparent)</option><option value="jpeg">JPG (white background)</option></select><button type="button" onClick={download} className="min-h-11 rounded-lg bg-accent px-4 text-sm text-accent-foreground">Download</button><button type="button" onClick={()=>setSettings(defaults)} className="min-h-11 rounded-lg border px-3 text-sm">Reset</button></div>
 </div></div>}
 </div>;
}
