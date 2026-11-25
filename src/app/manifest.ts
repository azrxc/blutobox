import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "Bluto Box", short_name: "Bluto Box",
    description: "Study, create, edit and share. Your everyday digital workspace.",
    lang: "en", start_url: "/", scope: "/", display: "standalone",
    background_color: "#fafaf8", theme_color: "#fafaf8",
    icons: [
      {src:"/pwa-icon-192.png", sizes:"192x192", type:"image/png", purpose:"any"},
      {src:"/pwa-icon-512.png", sizes:"512x512", type:"image/png", purpose:"any"},
      {src:"/pwa-icon-512.png", sizes:"512x512", type:"image/png", purpose:"maskable"}
    ],
    shortcuts: [
      {name:"Study & AI",url:"/study"},
      {name:"Create",url:"/create"},
      {name:"Upload files",url:"/upload"}
    ]
  };
}
