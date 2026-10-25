"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Erreur dans la mise en page racine : document autonome (sans le thème
 * choisi dans l'application, qui n'a pas pu se charger ; le thème du système
 * s'applique).
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-full bg-bg font-sans text-fg">
        <title>Erreur · KODI</title>
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-bold">KODI n’a pas pu s’afficher</h1>
          <p className="mt-2 text-sm">
            Une erreur inattendue s’est produite. Vos données enregistrées sur cet appareil ne sont pas affectées.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="min-h-12 rounded-2xl bg-brand-strong px-5 font-semibold text-on-brand"
            >
              Réessayer
            </button>
            {/* Lien classique : recharge complète si l'application elle-même est en panne. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="font-semibold text-brand-text underline underline-offset-2">
              Retour à l’accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
