/**
 * The first screen's 3D data field, in three.js. Loaded only in the browser, after the page is up
 * (components/sections/DataField.tsx imports it dynamically), so three never weighs on the first
 * load. The layout and timing come from src/lib/field.ts.
 *
 * A field of matte bars on a dark floor, seen from above at an angle; an amber scan plane sweeps
 * from the back row to the front with an amber light riding on it, and the rows it has passed
 * show their marks: seven bars glow amber, one glows red. The camera eases toward the pointer and
 * tilts back as the page scrolls.
 */
import {
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { COLS, MARKS, REST, ROWS, barHeight, passed, scanAt } from "@/lib/field";

export type FieldHandle = {
  start(): void;
  stop(): void;
  renderOnce(): void;
  /** Pointer position across the window, each from −1 to 1. */
  setPointer(x: number, y: number): void;
  /** How far the first screen has scrolled away, 0 to 1. */
  setScroll(p: number): void;
  resize(w: number, h: number, dpr: number): void;
  frames(): number;
  dispose(): void;
};

export type FieldOptions = {
  /** Reduced motion: no loop; the scan rests at the golden section and every mark shows. */
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
export function createField(canvas: HTMLCanvasElement, { still, onLost, onFrame }: FieldOptions): FieldHandle {
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

  // The marks: a slightly larger glowing bar over each marked cell, shown once the scan has passed it.
  const markGeometry = new BoxGeometry(0.68, 1, 0.68);
  markGeometry.translate(0, 0.5, 0);
  const tickMaterial = new MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.55, roughness: 0.5 });
  const defectMaterial = new MeshStandardMaterial({ color: DEFECT, emissive: DEFECT, emissiveIntensity: 0.65, roughness: 0.5 });
  const marks = MARKS.map((m) => {
    const mesh = new Mesh(markGeometry, m.kind === "defect" ? defectMaterial : tickMaterial);
    const { x, z } = at(m.row, m.col);
    mesh.position.set(x, 0, z);
    mesh.scale.set(1, barHeight(m.row, m.col) + 0.04, 1);
    scene.add(mesh);
    return { mesh, row: m.row };
  });

  // The scan: a thin amber plane across the field, bright edges top and bottom, and a light riding with it.
  const width = COLS + 1.6;
  const planeGeometry = new PlaneGeometry(width, 2.4);
  planeGeometry.translate(0, 1.2, 0);
  const planeMaterial = new MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.14, side: DoubleSide, depthWrite: false });
  const edgeGeometry = new BoxGeometry(width, 0.035, 0.035);
  const edgeMaterial = new MeshBasicMaterial({ color: AMBER });
  const scan = new Object3D();
  scan.add(new Mesh(planeGeometry, planeMaterial));
  const low = new Mesh(edgeGeometry, edgeMaterial);
  low.position.y = 0.02;
  const high = new Mesh(edgeGeometry, edgeMaterial);
  high.position.y = 2.4;
  scan.add(low, high);
  const glow = new PointLight(AMBER, 14, 7, 2);
  glow.position.y = 1.4;
  scan.add(glow);
  scene.add(scan);

  // Camera state: eased toward the pointer, tilted by scrolling.
  let yaw = 0;
  let pitch = 0;
  let aimYaw = 0;
  let aimPitch = 0;
  let scroll = 0;
  let distance = 30;
  const t0 = performance.now();

  const place = () => {
    const p = BASE_PITCH + pitch + scroll * SCROLL_PITCH;
    const y = BASE_YAW + yaw;
    camera.position.set(target.x + distance * Math.cos(p) * Math.sin(y), target.y + distance * Math.sin(p), target.z + distance * Math.cos(p) * Math.cos(y));
    camera.lookAt(target);
  };

  const update = (scanPos: number) => {
    scan.position.z = -(ROWS / 2 + 0.5) + scanPos * (ROWS + 1);
    for (const m of marks) m.mesh.visible = passed(m.row, scanPos);
  };

  let count = 0;
  const draw = () => {
    yaw += (aimYaw - yaw) * EASE;
    pitch += (aimPitch - pitch) * EASE;
    place();
    update(still ? REST : scanAt((performance.now() - t0) / 1000));
    renderer.render(scene, camera);
    count++;
    onFrame?.(count);
  };

  let raf = 0;
  const loop = () => {
    draw();
    raf = requestAnimationFrame(loop);
  };

  const lost = () => onLost?.();
  canvas.addEventListener("webglcontextlost", lost);

  return {
    start() {
      if (still || raf) return;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    renderOnce() {
      draw();
    },
    setPointer(x, y) {
      if (still) return;
      aimYaw = Math.max(-1, Math.min(1, x)) * YAW_RANGE;
      aimPitch = -Math.max(-1, Math.min(1, y)) * PITCH_RANGE;
    },
    setScroll(p) {
      scroll = Math.max(0, Math.min(1, p));
    },
    resize(w, h, dpr) {
      if (w <= 0 || h <= 0) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Fit the field's footprint, as the camera sees it at rest, inside both fields of view.
      const across = (COLS + 2) * Math.cos(BASE_YAW) + (ROWS + 2) * Math.abs(Math.sin(BASE_YAW));
      const deep = ((ROWS + 2) * Math.cos(BASE_YAW) + (COLS + 2) * Math.abs(Math.sin(BASE_YAW))) * Math.sin(BASE_PITCH) + 2.4 * Math.cos(BASE_PITCH);
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
      for (const g of [floorGeometry, barGeometry, markGeometry, planeGeometry, edgeGeometry]) g.dispose();
      for (const m of [floorMaterial, barMaterial, tickMaterial, defectMaterial, planeMaterial, edgeMaterial]) m.dispose();
      bars.dispose();
      renderer.dispose();
    },
  };
}
