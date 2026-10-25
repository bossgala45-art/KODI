/**
 * En-têtes de sécurité HTTP, appliqués à toutes les réponses (next.config.ts).
 *
 * CSP sans nonce (guide Next.js « Content Security Policy », section
 * « Without Nonces ») : les pages restent statiques ou partiellement
 * prérendues ; 'unsafe-inline' reste nécessaire pour les scripts injectés
 * par Next.js et le script de thème. Connexions limitées au site et au projet
 * Supabase configuré (HTTPS et temps réel).
 */
export function contentSecurityPolicy(supabaseUrl: string | undefined, isDev: boolean): string {
  let supabase: string[] = [];
  try {
    if (supabaseUrl) {
      const url = new URL(supabaseUrl);
      supabase = [url.origin, `wss://${url.host}`];
    }
  } catch {
    supabase = [];
  }
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "media-src 'self' blob:",
    `connect-src ${["'self'", ...supabase].join(" ")}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function securityHeaders(supabaseUrl: string | undefined, isDev: boolean): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(supabaseUrl, isDev) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    // Ignoré par les navigateurs en HTTP (développement, tests locaux).
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}
