/**
 * Sons immersifs, désactivables, entièrement synthétisés par le navigateur
 * (Web Audio) : aucun fichier sonore externe, donc aucun droit à céder.
 * Provisoires : ils évoquent un moteur et une rue, sans réalisme.
 *
 * Le bruit de fond est généré par un générateur pseudo-aléatoire à graine
 * fixe : il est identique à chaque lecture.
 */
import { learnerOf, type SceneDefinition } from "@/lib/simulation/scene";
import { sampleTrajectory } from "@/lib/simulation/timeline";

export function engineParams(speed: number): { frequency: number; gain: number } {
  const s = Math.max(0, speed);
  return { frequency: 45 + Math.min(s, 20) * 5, gain: 0.015 + (Math.min(s, 15) / 15) * 0.04 };
}

/** Volume d'un véhicule voisin selon sa distance à l'apprenant (m). */
export function passByGain(distance: number): number {
  return 0.06 / (1 + (Math.max(0, distance) / 8) ** 2);
}

/** Générateur congruentiel : même suite à chaque appel. */
export function noiseSamples(count: number, seed = 1): Float32Array<ArrayBuffer> {
  const out = new Float32Array(new ArrayBuffer(count * 4));
  let state = seed >>> 0;
  for (let i = 0; i < count; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    out[i] = (state / 0xffffffff) * 2 - 1;
  }
  return out;
}

export function sceneSoundLevels(scene: SceneDefinition, t: number) {
  const learner = learnerOf(scene);
  const me = sampleTrajectory(learner.trajectory, t);
  const others = scene.actors
    .filter((a) => a !== learner)
    .map((a) => {
      const s = sampleTrajectory(a.trajectory, t);
      return passByGain(Math.hypot(s.x - me.x, s.z - me.z)) * (s.speed > 0.1 ? 1 : 0.4);
    });
  return { engine: engineParams(me.speed), traffic: Math.min(0.1, others.reduce((s, g) => s + g, 0)) };
}

type AudioContextConstructor = new () => AudioContext;

function audioContextClass(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitAudioContext?: AudioContextConstructor };
  return (window.AudioContext as AudioContextConstructor | undefined) ?? w.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  return audioContextClass() !== null;
}

/** Moteur sonore d'une scène. `start` doit être appelé après un geste (règle de Safari). */
export class SceneAudio {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private trafficGain: GainNode | null = null;
  private master: GainNode | null = null;

  constructor(private readonly scene: SceneDefinition) {}

  start(): boolean {
    const Ctor = audioContextClass();
    if (!Ctor) return false;
    if (!this.ctx) {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      // Bruit de rue : bruit filtré, en boucle.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      buffer.copyToChannel(noiseSamples(buffer.length), 0);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 500;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.025;
      noise.connect(noiseFilter).connect(noiseGain).connect(master);
      noise.start();

      // Moteur de la voiture de l'apprenant.
      const engineOsc = ctx.createOscillator();
      engineOsc.type = "sawtooth";
      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.value = 320;
      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      engineOsc.connect(engineFilter).connect(engineGain).connect(master);
      engineOsc.start();

      // Autres véhicules : un grondement dont le volume suit leur distance.
      const trafficOsc = ctx.createOscillator();
      trafficOsc.type = "triangle";
      trafficOsc.frequency.value = 70;
      const trafficGain = ctx.createGain();
      trafficGain.gain.value = 0;
      trafficOsc.connect(trafficGain).connect(master);
      trafficOsc.start();

      Object.assign(this, { ctx, master, engineOsc, engineGain, trafficGain });
    }
    void this.ctx?.resume();
    return true;
  }

  update(t: number): void {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.trafficGain) return;
    const levels = sceneSoundLevels(this.scene, t);
    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(levels.engine.frequency, now, 0.1);
    this.engineGain.gain.setTargetAtTime(levels.engine.gain, now, 0.1);
    this.trafficGain.gain.setTargetAtTime(levels.traffic, now, 0.1);
  }

  pause(): void {
    void this.ctx?.suspend();
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
  }
}
