/**
 * Petit magasin de données persistées dans localStorage, compatible avec
 * useSyncExternalStore : `get` renvoie la même référence tant que la valeur
 * stockée ne change pas, et les onglets ouverts restent synchronisés.
 */
export interface LocalStore<T> {
  readonly key: string;
  readonly fallback: T;
  get(): T;
  set(next: T | ((previous: T) => T)): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

interface LocalStoreOptions<T> {
  key: string;
  fallback: T;
  /** Valide une donnée lue (potentiellement corrompue) ; null si invalide. */
  parse: (raw: string) => T | null;
  serialize: (value: T) => string;
}

export function isStorageAvailable(): boolean {
  try {
    const probe = "__kodi_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function createLocalStore<T>({
  key,
  fallback,
  parse,
  serialize,
}: LocalStoreOptions<T>): LocalStore<T> {
  const listeners = new Set<() => void>();
  // Valeur conservée en mémoire si le stockage est indisponible.
  let memory: T = fallback;
  let cachedRaw: string | null = null;
  let cachedValue: T = fallback;

  const notify = () => listeners.forEach((listener) => listener());

  function read(): T {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return memory;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw === null ? fallback : (parse(raw) ?? fallback);
    return cachedValue;
  }

  function write(value: T | null): void {
    memory = value ?? fallback;
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(value));
      }
    } catch {
      // Stockage plein ou interdit : la valeur reste en mémoire.
    }
    notify();
  }

  return {
    key,
    fallback,
    get: read,
    set(next) {
      const value =
        typeof next === "function"
          ? (next as (previous: T) => T)(read())
          : next;
      write(value);
    },
    reset() {
      write(null);
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
