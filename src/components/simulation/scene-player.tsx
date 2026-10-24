"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { PracticeSession } from "@/components/practice-session";
import { Scene2D } from "@/components/simulation/scene-2d";
import type { CameraMode, PerfReport } from "@/components/simulation/scene-3d";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Card, LoadingBlock } from "@/components/ui/display";
import { SegmentedControl } from "@/components/ui/form";
import { questionById, toPracticeQuestion } from "@/content/catalog";
import { cn } from "@/lib/cn";
import { SceneAudio, isAudioSupported } from "@/lib/simulation/audio";
import { PERFORMANCE_BUDGET, budgetViolations } from "@/lib/simulation/performance";
import type { SceneDefinition } from "@/lib/simulation/scene";
import { activeCue, advance, play, seek, type PlaybackState } from "@/lib/simulation/timeline";
import { useHydrated } from "@/lib/use-store";

// Le moteur 3D (Three.js) n'est chargé que sur cette page, et seulement côté navigateur.
const Scene3D = dynamic(() => import("@/components/simulation/scene-3d"), {
  ssr: false,
  loading: () => <LoadingBlock label="Chargement de la vue 3D…" lines={1} />,
});

let webglCache: boolean | null = null;
/** WebGL disponible ? (vérifié une seule fois). */
export function detectWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/** Pour les tests : oublie la détection précédente. */
export function resetWebGLDetection(): void {
  webglCache = null;
}

const CAMERA_OPTIONS: ReadonlyArray<{ value: CameraMode; label: string }> = [
  { value: "conducteur", label: "Conducteur" },
  { value: "aerienne", label: "Aérienne" },
  { value: "libre", label: "Libre" },
  { value: "explicative", label: "Explication" },
];

type Fallback = null | "webgl" | "context-lost" | "choice" | "slow";

const FALLBACK_MESSAGES: Record<Exclude<Fallback, null>, string> = {
  webgl: "Votre navigateur ne permet pas l’affichage 3D (WebGL indisponible) : la version 2D est affichée.",
  "context-lost": "L’affichage 3D a été interrompu par le navigateur : la version 2D a pris le relais.",
  choice: "Version 2D affichée à votre demande.",
  slow: "La 3D était trop lente sur cet appareil : la version 2D est affichée.",
};

const formatTime = (t: number) => `${t.toFixed(1).replace(".", ",")} s`;

export function ScenePlayer({ scene }: { scene: SceneDefinition }) {
  const hydrated = useHydrated();
  const [fallback, setFallback] = useState<Fallback>(null);
  const [mode, setMode] = useState<CameraMode>("conducteur");
  const [selected, setSelected] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState(true);
  const [sound, setSound] = useState(false);
  const [showPerf, setShowPerf] = useState(false);
  const [perf, setPerf] = useState<PerfReport | null>(null);
  const [slowSuggested, setSlowSuggested] = useState(false);
  const [state, setState] = useState<PlaybackState>({ t: 0, playing: false, duration: scene.duration });
  const clock = useRef<PlaybackState>(state);
  const timeRef = useRef(0);
  const audio = useRef<SceneAudio | null>(null);
  const [questionRound, setQuestionRound] = useState(0);

  const webgl = hydrated && detectWebGL();
  const effectiveFallback: Fallback = !hydrated ? null : !webgl ? "webgl" : fallback;
  const view: "3d" | "2d" = effectiveFallback ? "2d" : "3d";

  const commit = useCallback((next: PlaybackState) => {
    clock.current = next;
    timeRef.current = next.t;
    setState(next);
  }, []);

  // Boucle de lecture : avance l'horloge à chaque image tant que la scène joue.
  useEffect(() => {
    if (!state.playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = advance(clock.current, (now - last) / 1000);
      last = now;
      commit(next);
      if (sound) audio.current?.update(next.t);
      if (next.playing) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.playing, sound, commit]);

  useEffect(() => () => audio.current?.dispose(), []);

  function togglePlay() {
    const next = state.playing ? { ...clock.current, playing: false } : play(clock.current);
    commit(next);
    if (!next.playing) audio.current?.pause();
    else if (sound) audio.current?.start();
  }

  function toggleSound() {
    if (sound) {
      audio.current?.pause();
      setSound(false);
      return;
    }
    audio.current ??= new SceneAudio(scene);
    // Safari n'autorise le son qu'après un geste : ce clic en est un.
    if (audio.current.start()) {
      audio.current.update(clock.current.t);
      if (!clock.current.playing) audio.current.pause();
      setSound(true);
    }
  }

  const replayExplanation = () => {
    setMode("explicative");
    commit(play(seek(clock.current, 0)));
    if (sound) audio.current?.start();
  };

  const onPerf = useCallback((report: PerfReport) => setPerf(report), []);
  const onSlow = useCallback(() => setSlowSuggested(true), []);
  // La fermeture volontaire de la 3D libère aussi le contexte WebGL : on garde alors la raison choisie.
  const onContextLost = useCallback(() => setFallback((current) => current ?? "context-lost"), []);

  const cue = activeCue(scene.cues, state.t);
  const selectedItem = [...scene.actors, ...scene.props].find((item) => item.id === selected) ?? null;
  const question = useMemo(() => {
    const q = questionById(scene.questionId);
    return q ? [toPracticeQuestion(q)] : [];
  }, [scene.questionId]);
  const violations = perf ? budgetViolations(perf) : [];

  return (
    <div className="space-y-6">
      <Alert tone="info" role="note" title="Éléments provisoires">
        <ul className="list-disc space-y-1 pl-5">
          {scene.provisional.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Alert>

      <section aria-labelledby="scene-titre">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="scene-titre" className="text-lg font-bold">
            {view === "3d" ? "Vue 3D" : "Vue 2D"}
          </h2>
          <Badge tone="neutral" className="border border-dashed border-line-strong">
            Formes provisoires
          </Badge>
        </div>

        {effectiveFallback && (
          <Alert tone="info" role="status" className="mb-3">
            {FALLBACK_MESSAGES[effectiveFallback]}
          </Alert>
        )}

        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-surface-2 touch-none sm:aspect-video"
          data-view={view}
        >
          {!hydrated ? (
            <LoadingBlock label="Préparation de la scène…" lines={1} />
          ) : view === "3d" ? (
            <Scene3D
              scene={scene}
              timeRef={timeRef}
              playing={state.playing}
              renderKey={state.playing ? "lecture" : String(state.t)}
              mode={mode}
              selected={selected}
              onSelect={setSelected}
              onPerf={onPerf}
              onSlow={onSlow}
              onContextLost={onContextLost}
            />
          ) : (
            <Scene2D scene={scene} t={state.t} selected={selected} onSelect={setSelected} />
          )}
          {subtitles && cue && (
            <p
              className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl bg-night/85 px-3 py-1.5 text-center text-xs font-medium text-on-brand sm:inset-x-3 sm:bottom-3 sm:text-sm"
              data-testid="sous-titre"
            >
              {cue.text}
            </p>
          )}
        </div>

        {/* Sous-titres aussi annoncés aux lecteurs d'écran, sans doublon visuel. */}
        <p className="sr-only" aria-live="polite">
          {subtitles && cue ? cue.text : ""}
        </p>

        {slowSuggested && view === "3d" && (
          <Alert tone="info" role="status" className="mt-3" title="La 3D semble lente sur cet appareil">
            <Button variant="secondary" className="mt-2" onClick={() => setFallback("slow")}>
              Passer à la version 2D
            </Button>
          </Alert>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={togglePlay}>
            <Icon name={state.playing ? "close" : "play"} size={18} />
            {state.playing ? "Pause" : state.t >= scene.duration ? "Rejouer" : state.t > 0 ? "Reprendre" : "Lancer la scène"}
          </Button>
          <Button variant="secondary" onClick={() => commit({ ...seek(clock.current, 0), playing: false })}>
            <Icon name="refresh" size={18} />
            Début
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <input
              aria-label="Position dans la scène"
              type="range"
              min={0}
              max={scene.duration}
              step={0.1}
              value={state.t}
              onChange={(event) => commit({ ...seek(clock.current, Number(event.target.value)), playing: false })}
              className="min-w-0 flex-1 accent-brand"
              aria-valuetext={formatTime(state.t)}
            />
            <span className="w-14 shrink-0 text-right tabular-nums text-muted" aria-hidden="true">
              {formatTime(state.t)}
            </span>
          </div>
        </div>

        {view === "3d" && (
          <div className="mt-4">
            <SegmentedControl legend="Caméra" name="camera" options={CAMERA_OPTIONS} value={mode} onChange={setMode} size="sm" layout="grid" />
            <p className="mt-2 text-xs text-muted">
              {mode === "libre"
                ? "Faites glisser un doigt pour tourner autour du carrefour, pincez pour zoomer, deux doigts pour vous déplacer."
                : mode === "explicative"
                  ? "La caméra suit l’explication, synchronisée avec les sous-titres."
                  : mode === "conducteur"
                    ? "Vous êtes au volant de la voiture bleue."
                    : "Vue de dessus du carrefour."}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setSubtitles((v) => !v)} aria-pressed={subtitles}>
            Sous-titres : {subtitles ? "activés" : "désactivés"}
          </Button>
          {isAudioSupported() || !hydrated ? (
            <Button variant="ghost" onClick={toggleSound} aria-pressed={sound}>
              Sons : {sound ? "activés" : "désactivés"}
            </Button>
          ) : null}
          {view === "3d" ? (
            <Button variant="ghost" onClick={() => setFallback("choice")}>
              Version 2D
            </Button>
          ) : (
            webgl && (
              <Button variant="ghost" onClick={() => setFallback(null)}>
                Revenir à la 3D
              </Button>
            )
          )}
        </div>
      </section>

      <section aria-labelledby="elements">
        <h2 id="elements" className="mb-2 text-lg font-bold">
          Éléments de la scène
        </h2>
        <p className="mb-3 text-sm text-muted">Touchez un véhicule ou un panneau dans la vue, ou choisissez-le ici.</p>
        <div className="flex flex-wrap gap-2">
          {[...scene.actors, ...scene.props].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(selected === item.id ? null : item.id)}
              aria-pressed={selected === item.id}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-colors",
                selected === item.id ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <span
                aria-hidden="true"
                className="size-3 rounded-full border border-line-strong"
                style={{ backgroundColor: "color" in item ? item.color : "#1f3f8f" }}
              />
              {item.label}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="mt-3">
          {selectedItem && (
            <Card className="animate-enter">
              <h3 className="font-bold">{selectedItem.label}</h3>
              <p className="mt-1 text-sm">{selectedItem.description}</p>
            </Card>
          )}
        </div>
      </section>

      <section aria-labelledby="question-scene">
        <h2 id="question-scene" className="mb-3 text-lg font-bold">
          Question
        </h2>
        {question.length > 0 ? (
          <PracticeSession
            key={questionRound}
            questions={question}
            context="practice"
            label="Question de la scène"
            actions={
              <>
                <Button onClick={replayExplanation}>
                  <Icon name="play" size={18} />
                  Revoir l’explication animée
                </Button>
                <Button variant="secondary" onClick={() => setQuestionRound((r) => r + 1)}>
                  Répondre à nouveau
                </Button>
              </>
            }
          />
        ) : (
          <p className="text-sm text-muted">Question introuvable.</p>
        )}
      </section>

      {view === "3d" && (
        <section aria-labelledby="perf">
          <Button variant="ghost" onClick={() => setShowPerf((v) => !v)} aria-expanded={showPerf}>
            {showPerf ? "Masquer" : "Afficher"} les mesures de performance
          </Button>
          {showPerf && (
            <Card className="mt-2 text-sm" data-testid="mesures">
              <h2 id="perf" className="font-bold">
                Mesures sur cet appareil
              </h2>
              {perf ? (
                <dl
                  className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1"
                  data-calls={perf.calls}
                  data-triangles={perf.triangles}
                  data-dpr={perf.dpr}
                  data-fps={perf.summary ? perf.summary.averageFps.toFixed(1) : ""}
                >
                  <dt className="text-muted">Images par seconde</dt>
                  <dd className="tabular-nums">{perf.summary ? perf.summary.averageFps.toFixed(0) : "—"}</dd>
                  <dt className="text-muted">Image la plus lente (95 %)</dt>
                  <dd className="tabular-nums">{perf.summary ? `${perf.summary.p95FrameMs.toFixed(0)} ms` : "—"}</dd>
                  <dt className="text-muted">Appels de dessin</dt>
                  <dd className="tabular-nums">
                    {perf.calls} / {PERFORMANCE_BUDGET.maxDrawCalls}
                  </dd>
                  <dt className="text-muted">Triangles</dt>
                  <dd className="tabular-nums">
                    {perf.triangles} / {PERFORMANCE_BUDGET.maxTriangles}
                  </dd>
                  <dt className="text-muted">Densité de pixels</dt>
                  <dd className="tabular-nums">{perf.dpr}</dd>
                </dl>
              ) : (
                <p className="mt-2 text-muted">Mesure en cours… (lancez la scène)</p>
              )}
              {violations.length > 0 && <p className="mt-2 text-danger-text">Budget dépassé : {violations.join(", ")}</p>}
              <p className="mt-2 text-xs text-muted">
                Valeurs mesurées en direct par votre navigateur ; elles varient selon l’appareil.
              </p>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
