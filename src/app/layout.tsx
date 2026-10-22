import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppearanceWatcher } from "@/components/preferences";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "KODI — Préparation au code de la route",
    template: "%s · KODI",
  },
  description:
    "KODI, application de préparation au code de la route. En cours de développement.",
  applicationName: "KODI",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#101b30" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full font-sans">
        <a
          href="#contenu"
          className="sr-only z-50 rounded-xl bg-brand-strong px-4 py-2 font-semibold text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>
        <AppearanceWatcher />
        {children}
      </body>
    </html>
  );
}
