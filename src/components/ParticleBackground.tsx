import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

// ---- Blueprint values -------------------------------------------------------
const PARTICLE_COUNT = 15_000;
const PARTICLE_SIZE = 0.5;
// Owner's request: a dimmer resting field with a stronger cursor response. Resting particles are
// secondary at ~35% strength (dimmer than the blueprint's secondary × 0.2), while the hover colour is
// primary pushed past 1.0 so disturbed particles flare and catch the bloom pass.
const PARTICLE_OPACITY = 0.35;
const PARTICLE_BASE = new THREE.Color(0x4e1d09).multiplyScalar(0.34); // dimmed secondary
const ACCENT = new THREE.Color(0x983a28).multiplyScalar(2.6); // bright primary glow

const LINE_COUNT = 530;
// Dimmed further (owner's request): a deep warm brown at low opacity, a faint haze on the base colour.
const LINE_COLOR = 0xa8603f;
const LINE_OPACITY = 0.06;
// The blueprint's `linewidth: 0.005` is the legacy viewport-fraction unit.
// Current LineMaterial measures in pixels, so ~1px is the visual equivalent.
const LINE_WIDTH_PX = 1;

const BLOOM = { threshold: 1.0, strength: 0.8, radius: 0.1 };

// Stronger, fuller cursor field (owner's request): wider reach, harder push, a swirl around the
// cursor, a full colour flare, and a smoothed pointer so the field trails the mouse fluidly.
const REPEL_RADIUS = 32;
const REPEL_FORCE = 0.06;
const SWIRL_FORCE = 0.035;
const MAX_COLOR_MIX = 1;
const POINTER_EASE = 0.18;
const SPRING = 0.02;
const DAMPING = 0.88;

// ---- Field bounds -----------------------------------------------------------
const FIELD = { x: 110, y: 70, z: 30 };
const LINE_Z_BACK = -220;
const CAMERA_Z = 60;

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x150600);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = CAMERA_Z;

    // ---- Particles ----------------------------------------------------------
    const origin = new Float32Array(PARTICLE_COUNT * 3);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocity = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      origin[i3] = (Math.random() - 0.5) * 2 * FIELD.x;
      origin[i3 + 1] = (Math.random() - 0.5) * 2 * FIELD.y;
      origin[i3 + 2] = (Math.random() - 0.5) * 2 * FIELD.z;
      positions[i3] = origin[i3];
      positions[i3 + 1] = origin[i3 + 1];
      positions[i3 + 2] = origin[i3 + 2];
      colors[i3] = PARTICLE_BASE.r;
      colors[i3 + 1] = PARTICLE_BASE.g;
      colors[i3 + 2] = PARTICLE_BASE.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    const positionAttr = new THREE.BufferAttribute(positions, 3);
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    positionAttr.setUsage(THREE.DynamicDrawUsage);
    colorAttr.setUsage(THREE.DynamicDrawUsage);
    particleGeometry.setAttribute("position", positionAttr);
    particleGeometry.setAttribute("color", colorAttr);

    const particleMaterial = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: PARTICLE_OPACITY,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(points);

    // ---- Energy lines (one LineSegments2 holding all 530 segments) ----------
    const lineSpeed = new Float32Array(LINE_COUNT);
    const lineLength = new Float32Array(LINE_COUNT);
    const segs = new Float32Array(LINE_COUNT * 6);

    for (let i = 0; i < LINE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 2 * FIELD.x;
      const y = (Math.random() - 0.5) * 2 * FIELD.y;
      const z = LINE_Z_BACK + Math.random() * (CAMERA_Z - LINE_Z_BACK);
      const len = 6 + Math.random() * 18;
      lineLength[i] = len;
      lineSpeed[i] = 0.25 + Math.random() * 0.9;
      const o = i * 6;
      segs[o] = x; segs[o + 1] = y; segs[o + 2] = z;
      segs[o + 3] = x; segs[o + 4] = y; segs[o + 5] = z + len;
    }

    const lineGeometry = new LineSegmentsGeometry();
    lineGeometry.setPositions(segs);

    const lineMaterial = new LineMaterial({
      color: LINE_COLOR,
      linewidth: LINE_WIDTH_PX,
      transparent: true,
      opacity: LINE_OPACITY,
      dashed: true,
      dashSize: 2,
      gapSize: 1.2,
      depthWrite: false,
    });
    lineMaterial.resolution.set(width, height);

    const lines = new LineSegments2(lineGeometry, lineMaterial);
    lines.computeLineDistances(); // segment lengths never change, so once is enough
    lines.frustumCulled = false;
    scene.add(lines);

    // Edit the interleaved buffer in place each frame instead of reallocating
    const lineBuffer = (lineGeometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data;
    const lineArray = lineBuffer.array as Float32Array;

    // ---- Post-processing ----------------------------------------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      BLOOM.strength,
      BLOOM.radius,
      BLOOM.threshold,
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // ---- Pointer → 3D intersection on the z = 0 plane -----------------------
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointerTarget = new THREE.Vector3(); // where the mouse is
    const pointer = new THREE.Vector3(); // eased position the field reacts to
    let pointerActive = false;
    let pointerSeeded = false;

    const onPointerMove = (e: PointerEvent) => {
      ndc.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      pointerActive = raycaster.ray.intersectPlane(plane, pointerTarget) !== null;
      if (pointerActive && !pointerSeeded) {
        pointer.copy(pointerTarget);
        pointerSeeded = true;
      }
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      bloomPass.resolution.set(width, height);
      lineMaterial.resolution.set(width, height);
      if (reducedMotion) composer.render();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    // ---- Animation loop -----------------------------------------------------
    let raf = 0;
    const r2 = REPEL_RADIUS * REPEL_RADIUS;
    const target = new THREE.Color();

    const tick = () => {
      pointer.lerp(pointerTarget, POINTER_EASE);

      // Particles: repulsion + swirl, spring back to origin, colour flare toward the accent
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let px = positions[i3];
        let py = positions[i3 + 1];
        let pz = positions[i3 + 2];
        let mix = 0;

        if (pointerActive) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const dz = pz - pointer.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < r2 && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const falloff = 1 - d / REPEL_RADIUS;
            const f = (falloff * REPEL_FORCE * REPEL_RADIUS) / d;
            velocity[i3] += dx * f;
            velocity[i3 + 1] += dy * f;
            velocity[i3 + 2] += dz * f;
            // Tangential push in the screen plane: particles orbit the cursor as well as scatter
            const s = (falloff * SWIRL_FORCE * REPEL_RADIUS) / d;
            velocity[i3] += -dy * s;
            velocity[i3 + 1] += dx * s;
            mix = falloff * MAX_COLOR_MIX;
          }
        }

        velocity[i3] = (velocity[i3] + (origin[i3] - px) * SPRING) * DAMPING;
        velocity[i3 + 1] = (velocity[i3 + 1] + (origin[i3 + 1] - py) * SPRING) * DAMPING;
        velocity[i3 + 2] = (velocity[i3 + 2] + (origin[i3 + 2] - pz) * SPRING) * DAMPING;
        px += velocity[i3];
        py += velocity[i3 + 1];
        pz += velocity[i3 + 2];
        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;

        // Flare in fast, fade out slowly so the cursor leaves a glowing wake
        target.copy(PARTICLE_BASE).lerp(ACCENT, mix);
        const k = mix > 0 ? 0.25 : 0.04;
        colors[i3] += (target.r - colors[i3]) * k;
        colors[i3 + 1] += (target.g - colors[i3 + 1]) * k;
        colors[i3 + 2] += (target.b - colors[i3 + 2]) * k;
      }
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Lines: travel forward in Z, recycle to the back once past the camera
      for (let i = 0; i < LINE_COUNT; i++) {
        const o = i * 6;
        const s = lineSpeed[i];
        lineArray[o + 2] += s;
        lineArray[o + 5] += s;
        if (lineArray[o + 2] > CAMERA_Z) {
          const x = (Math.random() - 0.5) * 2 * FIELD.x;
          const y = (Math.random() - 0.5) * 2 * FIELD.y;
          lineArray[o] = x;
          lineArray[o + 1] = y;
          lineArray[o + 2] = LINE_Z_BACK;
          lineArray[o + 3] = x;
          lineArray[o + 4] = y;
          lineArray[o + 5] = LINE_Z_BACK + lineLength[i];
        }
      }
      lineBuffer.needsUpdate = true;

      composer.render();
      raf = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      composer.render(); // single static frame
    } else {
      raf = requestAnimationFrame(tick);
    }

    // ---- Cleanup: dispose everything so nothing leaks on unmount -----------
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);

      scene.remove(points, lines);
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      bloomPass.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
