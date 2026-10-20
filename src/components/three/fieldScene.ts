/**
 * The first screen's 3D data field, in three.js. Loaded only in the browser, after the page is up
 * (components/sections/DataField.tsx imports it dynamically), so three never weighs on the first
 * load. The layout and timing come from src/lib/field.ts.
 *
 * A field of matte bars on a dark floor, seen from above at an angle, with its marks: seven bars
 * glow amber, one glows red. Nothing loops. The camera eases toward the pointer and tilts back as
 * the page scrolls, and a frame is drawn only while something is moving, so a field left alone
 * costs nothing.
 */
import {
  BoxGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { COLS, MARKS, ROWS, barHeight } from "@/lib/field";

export type FieldHandle = {
  /** Follow the pointer and the scroll, drawing while the camera moves. */
  start(): void;
  /** Draw nothing more until started again. */
  stop(): void;
  renderOnce(): void;
  /** Switch to (or out of) the still frame: the camera rests and nothing follows the pointer or the scroll. */
  setStill(on: boolean): void;
  /** Pointer position across the window, each from −1 to 1. */
  setPointer(x: number, y: number): void;
  /** How far the first screen has scrolled away, 0 to 1. */
  setScroll(p: number): void;
  resize(w: number, h: number, dpr: number): void;
  frames(): number;
  dispose(): void;
};

export type FieldOptions = {
  /** Reduced motion, or motion paused: one frame, the camera at rest. */
  still: boolean;
  /** The GPU dropped the context: the caller shows the drawing again. */
  onLost?: () => void;
  /** Called after each frame drawn, with the running count. */
  onFrame?: (count: number) => void;
};

const AMBER = new Color("#ffb000");
const DEFECT = new Color("#ff5a4e");
const DEG = Math.PI / 180;
/** The camera's resting angles, and how far the pointer and scrolling move it. */
const BASE_YAW = -18 * DEG;
const BASE_PITCH = 35 * DEG;
const YAW_RANGE = 6 * DEG;
const PITCH_RANGE = 4 * DEG;
const SCROLL_PITCH = 12 * DEG;
const EASE = 0.08;

/** Throws when WebGL isn't available (three's renderer can't get a context). */
export function createField(canvas: HTMLCanvasElement, options: FieldOptions): FieldHandle {
  const { onLost, onFrame } = options;
  let still = options.still;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "default" });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 200);
  const target = new Vector3(0, 0.5, 0);

  scene.add(new HemisphereLight(0xffffff, 0x0a0a0b, 1.6));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-6, 10, 4);
  scene.add(key);

  // The floor, a little larger than the field.
  const floorGeometry = new PlaneGeometry(COLS + 2, ROWS + 2);
  const floorMaterial = new MeshStandardMaterial({ color: 0x0b0b0c, roughness: 1 });
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // The bars: one instance per cell, base on the floor, rows running from the back (row 0) to the front.
  const at = (r: number, c: number) => ({ x: c - (COLS - 1) / 2, z: r - (ROWS - 1) / 2 });
  const barGeometry = new BoxGeometry(0.62, 1, 0.62);
  barGeometry.translate(0, 0.5, 0);
  const barMaterial = new MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.7, metalness: 0 });
  const bars = new InstancedMesh(barGeometry, barMaterial, ROWS * COLS);
  const dummy = new Object3D();
  let i = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const { x, z } = at(r, c);
      dummy.position.set(x, 0, z);
      dummy.scale.set(1, barHeight(r, c), 1);
      dummy.updateMatrix();
      bars.setMatrixAt(i++, dummy.matrix);
    }
  scene.add(bars);

  // The marks: a slightly larger glowing bar over each marked cell.
  const markGeometry = new BoxGeometry(0.68, 1, 0.68);
  markGeometry.translate(0, 0.5, 0);
  const tickMaterial = new MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.55, roughness: 0.5 });
  const defectMaterial = new MeshStandardMaterial({ color: DEFECT, emissive: DEFECT, emissiveIntensity: 0.65, roughness: 0.5 });
  for (const m of MARKS) {
    const mesh = new Mesh(markGeometry, m.kind === "defect" ? defectMaterial : tickMaterial);
    const { x, z } = at(m.row, m.col);
    mesh.position.set(x, 0, z);
    mesh.scale.set(1, barHeight(m.row, m.col) + 0.04, 1);
    scene.add(mesh);
  }

  // Camera state: eased toward the pointer, tilted by scrolling.
  let yaw = 0;
  let pitch = 0;
  let aimYaw = 0;
  let aimPitch = 0;
  let scroll = 0;
  let distance = 30;

  const place = () => {
    const p = BASE_PITCH + pitch + scroll * SCROLL_PITCH;
    const y = BASE_YAW + yaw;
    camera.position.set(target.x + distance * Math.cos(p) * Math.sin(y), target.y + distance * Math.sin(p), target.z + distance * Math.cos(p) * Math.cos(y));
    camera.lookAt(target);
  };

  let count = 0;
  /** Draws one frame, easing the camera a step; true while it still has somewhere to go. */
  const draw = () => {
    yaw += (aimYaw - yaw) * EASE;
    pitch += (aimPitch - pitch) * EASE;
    place();
    renderer.render(scene, camera);
    count++;
    onFrame?.(count);
    return Math.abs(aimYaw - yaw) > 1e-4 || Math.abs(aimPitch - pitch) > 1e-4;
  };

  // Frames are drawn only while the camera is moving.
  let active = false;
  let raf = 0;
  const tick = () => {
    raf = 0;
    if (draw()) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (active && !still && !raf) raf = requestAnimationFrame(tick);
  };

  const lost = () => onLost?.();
  canvas.addEventListener("webglcontextlost", lost);

  return {
    start() {
      active = true;
      kick();
    },
    stop() {
      active = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    renderOnce() {
      draw();
    },
    setStill(on) {
      still = on;
      if (on) {
        cancelAnimationFrame(raf);
        raf = 0;
        yaw = aimYaw = 0;
        pitch = aimPitch = 0;
        scroll = 0;
        draw();
      }
    },
    setPointer(x, y) {
      if (still) return;
      aimYaw = Math.max(-1, Math.min(1, x)) * YAW_RANGE;
      aimPitch = -Math.max(-1, Math.min(1, y)) * PITCH_RANGE;
      kick();
    },
    setScroll(p) {
      if (still) return;
      const next = Math.max(0, Math.min(1, p));
      if (next === scroll) return;
      scroll = next;
      if (active && !raf) draw();
    },
    resize(w, h, dpr) {
      if (w <= 0 || h <= 0) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Fit the field's footprint, as the camera sees it at rest, inside both fields of view.
      const across = (COLS + 2) * Math.cos(BASE_YAW) + (ROWS + 2) * Math.abs(Math.sin(BASE_YAW));
      const deep = ((ROWS + 2) * Math.cos(BASE_YAW) + (COLS + 2) * Math.abs(Math.sin(BASE_YAW))) * Math.sin(BASE_PITCH) + 1.5 * Math.cos(BASE_PITCH);
      const vfov = camera.fov * DEG;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      distance = Math.max(across / 2 / Math.tan(hfov / 2), deep / 2 / Math.tan(vfov / 2)) * 1.16;
      camera.updateProjectionMatrix();
      if (!raf) draw();
    },
    frames: () => count,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("webglcontextlost", lost);
      for (const g of [floorGeometry, barGeometry, markGeometry]) g.dispose();
      for (const m of [floorMaterial, barMaterial, tickMaterial, defectMaterial]) m.dispose();
      bars.dispose();
      renderer.dispose();
    },
  };
}
