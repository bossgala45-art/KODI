// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

/** Exécute public/sw.js dans un faux environnement de service worker. */
type Handler = (event: { request: FakeRequest; respondWith: (p: Promise<Response>) => void; waitUntil: (p: Promise<unknown>) => void }) => void;

interface FakeRequest {
  url: string;
  method: string;
  mode: string;
}

let handlers: Record<string, Handler>;
let store: Map<string, Map<string, Response>>;
let online: boolean;
let network: Map<string, Response>;

function load() {
  handlers = {};
  const cacheApi = {
    async open(name: string) {
      if (!store.has(name)) store.set(name, new Map());
      const cache = store.get(name)!;
      return {
        async put(request: FakeRequest | string, response: Response) {
          cache.set(typeof request === "string" ? request : new URL(request.url).pathname, response);
        },
        async addAll(urls: string[]) {
          for (const url of urls) cache.set(url, new Response(`précache ${url}`, { status: 200 }));
        },
      };
    },
    async match(request: FakeRequest | string) {
      const key = typeof request === "string" ? request : new URL(request.url).pathname;
      for (const cache of store.values()) {
        const hit = cache.get(key);
        if (hit) return hit.clone();
      }
      return undefined;
    },
    async keys() {
      return [...store.keys()];
    },
    async delete(name: string) {
      return store.delete(name);
    },
  };
  const self = {
    location: { origin: "https://kodi.example" },
    addEventListener: (type: string, handler: Handler) => (handlers[type] = handler),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const fetchFn = async (request: FakeRequest) => {
    if (!online) throw new TypeError("Failed to fetch");
    const response = network.get(new URL(request.url).pathname) ?? new Response("introuvable", { status: 404 });
    return Object.defineProperty(response.clone(), "type", { value: "basic" });
  };
  new Function("self", "caches", "fetch", readFileSync(join(process.cwd(), "public/sw.js"), "utf8"))(self, cacheApi, fetchFn);
}

async function request(path: string, mode = "navigate", method = "GET"): Promise<Response | null> {
  let responded: Promise<Response> | null = null;
  handlers.fetch!({
    request: { url: `https://kodi.example${path}`, method, mode },
    respondWith: (p) => (responded = p),
    waitUntil: () => {},
  });
  return responded ? await responded : null;
}

async function install() {
  let done: Promise<unknown> = Promise.resolve();
  handlers.install!({ request: null as never, respondWith: () => {}, waitUntil: (p) => (done = p) });
  await done;
}

beforeEach(() => {
  store = new Map();
  online = true;
  network = new Map([
    ["/apprendre", new Response("<h1>Apprendre</h1>", { status: 200 })],
    ["/_next/static/app.js", new Response("code", { status: 200 })],
    ["/abonnement", new Response("privé", { status: 200, headers: { "Cache-Control": "private, no-store" } })],
  ]);
  load();
});

describe("service worker", () => {
  it("hors ligne : rend la dernière version d’une page consultée", async () => {
    await install();
    expect(await (await request("/apprendre"))!.text()).toBe("<h1>Apprendre</h1>");
    online = false;
    expect(await (await request("/apprendre"))!.text()).toBe("<h1>Apprendre</h1>");
  });

  it("hors ligne : une page jamais consultée renvoie la page « Hors ligne »", async () => {
    await install();
    online = false;
    expect(await (await request("/mentions-legales"))!.text()).toBe("précache /hors-ligne");
  });

  it("sert les fichiers de l’application depuis le cache, même hors ligne", async () => {
    await request("/_next/static/app.js", "no-cors");
    online = false;
    expect(await (await request("/_next/static/app.js", "no-cors"))!.text()).toBe("code");
  });

  it("ne met jamais en cache l’API, l’authentification, les écritures ni les réponses no-store", async () => {
    expect(await request("/api/professeur", "cors")).toBeNull();
    expect(await request("/auth/confirm")).toBeNull();
    expect(await request("/apprendre", "navigate", "POST")).toBeNull();
    await request("/abonnement");
    online = false;
    await install();
    expect(await (await request("/abonnement"))!.text()).toBe("précache /hors-ligne");
  });

  it("supprime les caches d’une ancienne version à l’activation", async () => {
    store.set("kodi-v0-pages", new Map());
    let done: Promise<unknown> = Promise.resolve();
    handlers.activate!({ request: null as never, respondWith: () => {}, waitUntil: (p) => (done = p) });
    await done;
    expect(store.has("kodi-v0-pages")).toBe(false);
  });
});
