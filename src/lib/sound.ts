import { useSyncExternalStore } from "react";

/**
 * The site's sound, synthesized in code with the Web Audio API (no audio files, no dependencies). Three Yoruba
 * instruments, the core of jùjú, fújì, and àpàlà:
 *
 *   - agogo: the iron double bell. It plays the West African standard bell pattern (the 12/8 timeline every other
 *     part locks to), which is the sound most listeners recognise as West African within a bar. Synthesized with FM
 *     (an inharmonic modulator gives the clangy, iron ring), a low bell and a high bell a fifth apart.
 *   - gángan / dùndún: the talking drum. Its pitch follows Yoruba speech tones, because that is what the drum does:
 *     the welcome phrase is the drum saying "Ẹ káàbọ̀" (mid, high, low, low). A skin tone that bends as the cords
 *     are squeezed, a resonant noise layer for the skin, and the slap of the curved stick.
 *   - ṣẹ̀kẹ̀rẹ̀: the beaded gourd, a swish of band-passed noise.
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
const VOLUME = 0.6;

/** Create or resume the audio context. Call from a click or tap. */
export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 3;
      // A short, warm room so the instruments sit together instead of sounding like dry beeps
      const room = ctx.createConvolver();
      room.buffer = roomImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.18;
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(comp);
      master.connect(room).connect(wet).connect(comp);
      comp.connect(ctx.destination);
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

/** A 0.6-second decaying noise tail: a small wooden room. */
function roomImpulse(c: AudioContext) {
  const len = Math.floor(c.sampleRate * 0.6);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
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

/** Agogo: one stroke of the iron double bell. `high` picks the smaller bell. */
export function bell(high = false, at = 0, vel = 0.7) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const f = high ? 932 : 622; // roughly B♭5 and E♭5, a fifth apart like a real agogo pair
  // FM: an inharmonic modulator gives the iron its clang; the clang settles as the index falls
  const car = c.createOscillator();
  car.type = "sine";
  car.frequency.value = f;
  const mod = c.createOscillator();
  mod.type = "sine";
  mod.frequency.value = f * 1.47;
  const idx = c.createGain();
  idx.gain.setValueAtTime(f * 2.4, t);
  idx.gain.exponentialRampToValueAtTime(f * 0.15, t + 0.25);
  mod.connect(idx).connect(car.frequency);
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.32 * vel, t + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + (high ? 0.45 : 0.6));
  car.connect(amp).connect(master!);
  car.start(t);
  mod.start(t);
  car.stop(t + 0.7);
  mod.stop(t + 0.7);
  // The stick's tick on the iron
  const tick = c.createBufferSource();
  tick.buffer = noise;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6000;
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.18 * vel, t);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
  tick.connect(hp).connect(tg).connect(master!);
  tick.start(t, Math.random() * 0.5);
  tick.stop(t + 0.02);
}

/**
 * Talking drum: a stroke that starts at `from` Hz and bends to `to` Hz, like the drummer squeezing the cords.
 * Low ≈ 120, mid ≈ 165, high ≈ 225 Hz map to Yoruba's three speech tones.
 */
export function drum(from = 165, to = from, at = 0, vel = 1, length = 0.45) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const bendEnd = t + Math.min(0.32, length * 0.7);

  // The skin's tone: a quick overshoot on the strike, then the bend
  const body = c.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(from * 1.18, t);
  body.frequency.exponentialRampToValueAtTime(from, t + 0.025);
  body.frequency.exponentialRampToValueAtTime(Math.max(40, to), bendEnd);
  const bg = c.createGain();
  bg.gain.setValueAtTime(0.0001, t);
  bg.gain.exponentialRampToValueAtTime(0.85 * vel, t + 0.005);
  bg.gain.setTargetAtTime(0.0001, t + 0.05, length / 4);
  body.connect(bg).connect(master!);
  body.start(t);
  body.stop(t + length + 0.3);

  // The skin itself: noise through a resonant band that bends with the tone, which makes it sound like hide, not a beep
  const skin = c.createBufferSource();
  skin.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 9;
  bp.frequency.setValueAtTime(from * 2.1, t);
  bp.frequency.exponentialRampToValueAtTime(Math.max(80, to * 2.1), bendEnd);
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.exponentialRampToValueAtTime(0.9 * vel, t + 0.004);
  sg.gain.setTargetAtTime(0.0001, t + 0.03, length / 6);
  skin.connect(bp).connect(sg).connect(master!);
  skin.start(t, Math.random() * 0.4);
  skin.stop(t + length);

  // The curved stick's slap
  const slap = c.createBufferSource();
  slap.buffer = noise;
  const sp = c.createBiquadFilter();
  sp.type = "bandpass";
  sp.frequency.value = 1400;
  sp.Q.value = 1.2;
  const slg = c.createGain();
  slg.gain.setValueAtTime(0.45 * vel, t);
  slg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  slap.connect(sp).connect(slg).connect(master!);
  slap.start(t, Math.random() * 0.4);
  slap.stop(t + 0.04);
}

/** Ṣẹ̀kẹ̀rẹ̀: a swish of the beaded gourd (`long` for the full shake). */
export function shaker(at = 0, vel = 0.5, long = false) {
  if (!ready()) return;
  const c = ctx!;
  const t = now() + at;
  const len = long ? 0.22 : 0.09;
  const src = c.createBufferSource();
  src.buffer = noise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(long ? 3200 : 4600, t);
  bp.frequency.linearRampToValueAtTime(5600, t + len);
  bp.Q.value = 1.1;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28 * vel, t + (long ? 0.06 : 0.012));
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(bp).connect(g).connect(master!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + len + 0.02);
}

// ---- Phrases ----------------------------------------------------------------------------------------------------

/** One pulse of the 12/8 bell at 120 BPM (a dotted quarter = 0.5 s, so an eighth = 1/6 s). */
const E = 1 / 6;
// The West African standard bell pattern over 12 eighths: x . x . x x . x . x . x
const BELL = [0, 2, 4, 5, 7, 9, 11];
const LOW = 120;
const MID = 165;
const HIGH = 225;

/**
 * The welcome, about 2 seconds: one bar of agogo timeline over a shekere swish, while the talking drum says
 * "Ẹ káàbọ̀" (mid, high, low-falling, low), then a low "gbìn" to land on.
 */
export function playWelcome() {
  if (!ready()) return;
  BELL.forEach((s, i) => bell(i === 0 || i === 3, s * E, i === 0 ? 0.85 : 0.6));
  [0, 3, 6, 9].forEach((s) => shaker(s * E, 0.55, s % 6 === 0));
  // Ẹ – ká – à – bọ̀
  drum(MID, MID, 0, 0.8, 0.35);
  drum(HIGH, HIGH * 1.03, 2 * E, 0.9, 0.35);
  drum(HIGH * 0.95, LOW * 1.05, 4 * E, 0.85, 0.5);
  drum(LOW, LOW * 0.9, 7 * E, 0.95, 0.6);
  // Land: the bell's downbeat again with a deep stroke and a long shake
  bell(true, 12 * E, 0.8);
  drum(LOW * 0.92, LOW * 0.75, 12 * E, 1, 0.8);
  shaker(12 * E, 0.6, true);
}

/** A tap on the landing page: the drum, pitched by height (high near the top), with the bell on every other tap. */
let taps = 0;
export function tapDrum(yFraction: number) {
  const f = HIGH - yFraction * (HIGH - LOW) * 1.1;
  drum(f * 1.05, f * 0.92, 0, 0.9, 0.42);
  if (taps++ % 2 === 0) bell(yFraction < 0.5, 0.01, 0.45);
  shaker(0.02, 0.35);
}

/** Opening the menu: a talking-drum pickup that rises, the bell, and a shake. */
export function openFlourish() {
  drum(LOW, MID, 0, 0.75, 0.3);
  drum(MID, HIGH, E, 0.7, 0.32);
  bell(false, 2 * E, 0.6);
  bell(true, 3 * E, 0.5);
  shaker(0, 0.4, true);
}

/** Hovering or focusing menu item `i`: an agogo stroke, low and high bells alternating down the list. */
export function menuNote(i: number) {
  bell(i % 2 === 1, 0, 0.42);
}

/** Moving between panels: the drum "answers" with a falling two-tone phrase. */
export function pageTurn() {
  drum(HIGH, HIGH, 0, 0.55, 0.25);
  drum(MID, LOW, E, 0.6, 0.35);
}

/** Turning sound on: the two bells, low then high. */
export function chime() {
  bell(false, 0, 0.6);
  bell(true, E, 0.6);
}
