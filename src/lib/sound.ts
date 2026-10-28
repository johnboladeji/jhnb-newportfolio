import { useSyncExternalStore } from "react";

/**
 * The site's sound, synthesized in code with the Web Audio API (no audio files, no dependencies): a small Yoruba-
 * flavoured ensemble.
 *
 *   - dùndún (talking drum): a membrane tone whose pitch glides, the way the drummer squeezes the drum's cords;
 *   - ṣẹ̀kẹ̀rẹ̀ (shekere): a beaded-gourd shaker, short bursts of filtered noise;
 *   - agidigbo (Yoruba thumb piano): a plucked tine with a bright, quickly fading overtone.
 *
 * Sound is off until the visitor turns it on (browsers only allow audio after a click or tap anyway), and the choice
 * is remembered (`jhnb-sound` in localStorage). Every function here is a no-op while sound is off.
 */

const KEY = "jhnb-sound";

// ---- On/off state, shared with React ---------------------------------------------------------------------------
let enabled = (() => {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
})();
const listeners = new Set<() => void>();

export function soundEnabled() {
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
  if (on) unlock();
  else if (ctx) master?.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  listeners.forEach((l) => l());
}

/** React hook: [isOn, setOn] */
export function useSound(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled,
    () => false,
  );
  return [on, setSound];
}

// ---- Audio graph ------------------------------------------------------------------------------------------------
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
const VOLUME = 0.55;

/** Create or resume the audio context. Call from a click or tap. */
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(comp).connect(ctx.destination);
      // One second of white noise, reused by the shaker and the drum's slap
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
    master?.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.05);
  } catch {
    ctx = null;
  }
}

/** Silence everything already scheduled (e.g. when the intro is skipped), then restore the volume `seconds` later. */
export function hush(seconds: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setTargetAtTime(0, t, 0.03);
  master.gain.setTargetAtTime(enabled ? VOLUME : 0, t + seconds, 0.05);
}

const ready = () => enabled && ctx && master && ctx.state !== "closed";
const now = () => (ctx ? ctx.currentTime : 0);

// ---- Instruments ------------------------------------------------------------------------------------------------

/** Talking drum: `from` → `to` Hz glide (the "talk"), with a skin slap on the attack. */
export function drum(from = 180, to = from * 0.8, at = 0, vel = 1, length = 0.42) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const body = c.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(from, t);
  body.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + length * 0.7);
  const tone = c.createGain();
  tone.gain.setValueAtTime(0.0001, t);
  tone.gain.exponentialRampToValueAtTime(0.9 * vel, t + 0.006);
  tone.gain.exponentialRampToValueAtTime(0.0001, t + length);
  body.connect(tone).connect(master!);
  body.start(t);
  body.stop(t + length + 0.05);

  // A second, softer partial gives the membrane its hollow colour
  const over = c.createOscillator();
  over.type = "triangle";
  over.frequency.setValueAtTime(from * 1.5, t);
  over.frequency.exponentialRampToValueAtTime(Math.max(40, to * 1.5), t + length * 0.6);
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.18 * vel, t + 0.005);
  og.gain.exponentialRampToValueAtTime(0.0001, t + length * 0.5);
  over.connect(og).connect(master!);
  over.start(t);
  over.stop(t + length);

  // Slap of the curved stick on the skin
  const slap = c.createBufferSource();
  slap.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.35 * vel, t);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  slap.connect(bp).connect(sg).connect(master!);
  slap.start(t);
  slap.stop(t + 0.05);
}

/** Shekere: a short, bright shake. */
export function shaker(at = 0, vel = 0.5, length = 0.07) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5200;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32 * vel, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(hp).connect(g).connect(master!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + length + 0.02);
}

/** Agidigbo (thumb piano): a plucked tine. */
export function pluck(freq: number, at = 0, vel = 0.6, length = 1.4) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const tine = c.createOscillator();
  tine.type = "sine";
  tine.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.42 * vel, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  tine.connect(g).connect(master!);
  tine.start(t);
  tine.stop(t + length + 0.05);
  // The metallic "ping": an inharmonic overtone that dies fast
  const ping = c.createOscillator();
  ping.type = "sine";
  ping.frequency.value = freq * 5.4;
  const pg = c.createGain();
  pg.gain.setValueAtTime(0.0001, t);
  pg.gain.exponentialRampToValueAtTime(0.12 * vel, t + 0.002);
  pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  ping.connect(pg).connect(master!);
  ping.start(t);
  ping.stop(t + 0.15);
}

// A major pentatonic on D (D E F# A B), the warm, open scale of a lot of West African highlife and juju melody
const BASE = 293.66;
const STEPS = [0, 2, 4, 7, 9];
/** The n-th note of the scale (0 = low D; it climbs through the octaves). */
export const note = (n: number) => BASE * Math.pow(2, (STEPS[((n % 5) + 5) % 5] + 12 * Math.floor(n / 5)) / 12);

// ---- Phrases ----------------------------------------------------------------------------------------------------

export const BEAT = 0.5357; // seconds per beat at 112 BPM

/**
 * The intro: two bars of talking drum "speech" over shekere, an agidigbo melody on top, and a closing flourish.
 * Timed to the intro animation (8 beats, then the reveal).
 */
export function playIntro() {
  if (!ready()) return;
  const b = BEAT;
  // Drum call: low "gbìn", high "gbín", then a quick talking roll that slides up, answered by a falling phrase
  const call: [number, number, number, number][] = [
    // [beat, from Hz, to Hz, velocity]
    [0, 150, 120, 1],
    [1, 220, 200, 0.9],
    [1.5, 200, 240, 0.7],
    [2, 150, 125, 1],
    [3, 240, 300, 0.85],
    [3.5, 300, 230, 0.75],
    [4, 160, 125, 1],
    [5, 230, 210, 0.9],
    [5.5, 210, 260, 0.7],
    [5.75, 260, 300, 0.6],
    [6, 170, 120, 1],
    [6.5, 300, 200, 0.8],
    [7, 140, 90, 1],
  ];
  call.forEach(([beat, f, to, v]) => drum(f, to, beat * b, v));
  // Shekere on every off-beat, accented on the "and" of 2 and 4
  for (let i = 0; i < 16; i++) if (i % 2) shaker((i / 2) * b, i % 4 === 3 ? 0.75 : 0.45);
  // Agidigbo melody, answering the drum
  const tune: [number, number][] = [
    [0.5, 5], [1, 7], [1.5, 9], [2.5, 8], [3, 7], [3.5, 5],
    [4.5, 7], [5, 9], [5.5, 10], [6, 9], [6.5, 7], [7, 5],
  ];
  tune.forEach(([beat, n]) => pluck(note(n), beat * b, 0.55));
  // The reveal: a rolling flourish and a bright chord
  [0, 0.08, 0.16, 0.24].forEach((d, i) => drum(200 + i * 30, 160 + i * 20, 8 * b + d, 0.7));
  [5, 7, 9, 10, 12].forEach((n, i) => pluck(note(n), 8.4 * b + i * 0.06, 0.5, 2.4));
}

/** A tap on the landing page: a drum note pitched by height, with a shake. */
export function tapDrum(yFraction: number) {
  const f = 260 - yFraction * 150;
  drum(f, f * 0.82, 0, 0.8, 0.36);
  shaker(0.02, 0.35);
}

/** Opening the menu: a quick drum pickup and a rising agidigbo run. */
export function openFlourish() {
  drum(170, 140, 0, 0.7, 0.3);
  drum(230, 260, 0.11, 0.55, 0.25);
  [5, 7, 9].forEach((n, i) => pluck(note(n), 0.08 + i * 0.07, 0.4, 1));
}

/** Hovering or focusing menu item `i`: one agidigbo note, climbing down the list. */
export function menuNote(i: number) {
  pluck(note(5 + i), 0, 0.35, 0.9);
}

/** Moving between panels: a soft two-note answer. */
export function pageTurn() {
  pluck(note(7), 0, 0.3, 0.8);
  pluck(note(9), 0.09, 0.3, 1);
}
