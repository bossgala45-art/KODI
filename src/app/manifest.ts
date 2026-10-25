import type { MetadataRoute } from "next";

/** Manifeste de la PWA (installation sur l'écran d'accueil). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "KODI — Code de la route",
    short_name: "KODI",
    description: "Préparation à l’épreuve théorique du permis de conduire.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f7fb",
    theme_color: "#101b30",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
