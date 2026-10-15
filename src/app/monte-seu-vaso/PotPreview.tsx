"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  Html,
  Sparkles,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type PotFinish = "esmaltado" | "fosco" | "barro" | "cimento" | "plastico" | "madeira";

export type PotVisual = {
  style: string | null; // classico | bojo | geometrico | alto | tigela — null = nenhum vaso escolhido
  color: string;
  finish: PotFinish;
  sizeScale: number;
  drainage: string | null; // nome do material de drenagem
  soil: string | null; // nome do substrato
  cover: { name: string; kind: "pedrisco" | "casca" } | null;
  plants: { id: number; name: string; model: string; flowerColor?: string }[];
};

/* ---------------------------------- Utilidades --------------------------------- */

const REDUCED =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Pseudo-aleatório determinístico: a mesma planta sempre nasce igual */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type SpringState = { x: number; v: number };
/** Mola amortecida: dá o “salto” natural das transições */
function stepSpring(s: SpringState, target: number, dt: number, stiffness = 140, damping = 14) {
  if (REDUCED) {
    s.x = target;
    s.v = 0;
    return;
  }
  const d = Math.min(dt, 1 / 30);
  s.v += (target - s.x) * stiffness * d;
  s.v *= Math.exp(-damping * d);
  s.x += s.v * d;
}

const damp = (dt: number, speed: number) => (REDUCED ? 1 : 1 - Math.exp(-dt * speed));

function easeOutBounce(x: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

/* ------------------------------ Perfis de vaso -------------------------------- */

const SHAPES: Record<string, number[][]> = {
  classico: [
    [0.001, 0], [0.55, 0], [0.62, 0.05], [0.7, 0.35], [0.85, 0.9], [0.92, 1.05],
    [1.0, 1.08], [1.0, 1.2], [0.9, 1.2], [0.85, 1.06],
  ],
  bojo: [
    [0.001, 0], [0.5, 0], [0.82, 0.18], [1.0, 0.55], [1.02, 0.75], [0.88, 1.0],
    [0.8, 1.06], [0.88, 1.1], [0.88, 1.2], [0.78, 1.2], [0.74, 1.04],
  ],
  geometrico: [
    [0.001, 0], [0.6, 0], [0.78, 0.45], [0.95, 0.85], [0.98, 1.0],
    [1.05, 1.03], [1.05, 1.14], [0.95, 1.14], [0.9, 1.02],
  ],
  alto: [
    [0.001, 0], [0.5, 0], [0.58, 0.35], [0.64, 0.9], [0.68, 1.35], [0.73, 1.4],
    [0.73, 1.52], [0.63, 1.52], [0.61, 1.4],
  ],
  tigela: [
    [0.001, 0], [0.62, 0], [0.88, 0.12], [1.0, 0.35], [0.98, 0.48],
    [1.03, 0.5], [1.03, 0.6], [0.93, 0.6], [0.9, 0.48],
  ],
};

type Profile = {
  pts: THREE.Vector2[];
  topY: number;
  topR: number;
  /** raio interno útil em uma altura y (para encher terra, argila etc.) */
  innerR: (y: number) => number;
};

function potProfile(style: string): Profile {
  const raw = SHAPES[style] ?? SHAPES.classico;
  const pts = raw.map(([x, y]) => new THREE.Vector2(x, y));
  const topY = Math.max(...raw.map(([, y]) => y));
  const topR = raw[raw.length - 1][0];

  // parede externa = trecho inicial do perfil com y crescente
  const wall: number[][] = [];
  for (const p of raw) {
    const last = wall[wall.length - 1];
    if (last && p[1] <= last[1]) {
      if (wall.length === 1 && p[1] === last[1]) {
        wall[0] = p;
        continue;
      }
      break;
    }
    wall.push(p);
  }
  const outerAt = (y: number) => {
    if (y <= wall[0][1]) return wall[0][0];
    for (let i = 1; i < wall.length; i++) {
      const [x0, y0] = wall[i - 1];
      const [x1, y1] = wall[i];
      if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
    return wall[wall.length - 1][0];
  };
  return { pts, topY, topR, innerR: (y) => Math.min(outerAt(y) * 0.88, topR * 0.97) };
}

/** Sólido de revolução que acompanha a parede interna do vaso entre y0 e y1 */
function fillGeometry(prof: Profile, y0: number, y1: number) {
  const pts = [new THREE.Vector2(0.001, y0)];
  for (let k = 0; k <= 6; k++) {
    const y = y0 + ((y1 - y0) * k) / 6;
    pts.push(new THREE.Vector2(prof.innerR(y), y));
  }
  pts.push(new THREE.Vector2(0.001, y1));
  return new THREE.LatheGeometry(pts, 48);
}

/* -------------------------------- Geometrias base ------------------------------ */

/** Folha curva: formato em gota, nervura central dobrada e ponta caída */
function makeLeaf(width: number, curl: number, fold = 0.18) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width, 0.18, width * 0.92, 0.72, 0, 1);
  s.bezierCurveTo(-width * 0.92, 0.72, -width, 0.18, 0, 0);
  const g = new THREE.ShapeGeometry(s, 14);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    p.setZ(i, -curl * y * y + fold * Math.abs(x));
  }
  g.computeVertexNormals();
  return g;
}

const LEAF_BROAD = makeLeaf(0.42, 0.3);
const LEAF_HEART = makeLeaf(0.55, 0.15, 0.1);
const LEAF_NARROW = makeLeaf(0.13, 0.22, 0.05);
const LEAF_ORCHID = makeLeaf(0.3, 0.12, 0.12);
const PETAL = makeLeaf(0.55, -0.35, 0.05);
const PETAL_OPEN = makeLeaf(0.6, 0.05, 0.04);

const SUCC_LEAF = (() => {
  const g = new THREE.SphereGeometry(0.5, 14, 10);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const taper = y > 0.6 ? 1 - ((y - 0.6) / 0.4) * 0.75 : 1;
    p.setX(i, p.getX(i) * 0.42 * taper);
    p.setZ(i, p.getZ(i) * 0.2 * taper);
  }
  g.computeVertexNormals();
  return g;
})();

function ribbedCapsule(r: number, len: number, ribs: number) {
  const g = new THREE.CapsuleGeometry(r, len, 10, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const k = 1 + 0.08 * Math.cos(Math.atan2(z, x) * ribs);
    p.setX(i, x * k);
    p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
}
const CACTUS_MAIN = ribbedCapsule(0.24, 0.9, 10);
const CACTUS_ARM = ribbedCapsule(0.13, 0.32, 8);

/** Espinhos: pontos claros sobre as costelas do cacto */
function spinePoints(g: THREE.BufferGeometry, ribs: number) {
  const p = g.attributes.position;
  const out: number[] = [];
  for (let i = 0; i < p.count; i += 5) {
    const x = p.getX(i);
    const z = p.getZ(i);
    if (Math.cos(Math.atan2(z, x) * ribs) > 0.92) out.push(x * 1.04, p.getY(i), z * 1.04);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  return pg;
}
const CACTUS_SPINES = spinePoints(CACTUS_MAIN, 10);

const PEBBLE = new THREE.DodecahedronGeometry(1, 0);
const BARK = new THREE.BoxGeometry(1.6, 0.45, 1);
const CLAY_BALL = new THREE.SphereGeometry(1, 10, 8);

/* ---------------------------------- Vaso --------------------------------------- */

const FINISH: Record<PotFinish, { roughness: number; clearcoat: number; clearcoatRoughness: number }> = {
  esmaltado: { roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 },
  fosco: { roughness: 0.82, clearcoat: 0, clearcoatRoughness: 0 },
  barro: { roughness: 0.95, clearcoat: 0, clearcoatRoughness: 0 },
  cimento: { roughness: 0.88, clearcoat: 0, clearcoatRoughness: 0 },
  plastico: { roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3 },
  madeira: { roughness: 0.68, clearcoat: 0.15, clearcoatRoughness: 0.5 },
};

const SAUCER_H = 0.045;

function useFadeMaterial(
  ref: React.RefObject<THREE.MeshPhysicalMaterial | null>,
  color: string,
  opacity: number
) {
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    m.color.lerp(target, damp(dt, 7));
    m.opacity += (opacity - m.opacity) * damp(dt, 6);
    const transparent = m.opacity < 0.985;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.depthWrite = !transparent;
      m.needsUpdate = true;
    }
  });
}

function Pot({ visual, prof, layered }: { visual: PotVisual; prof: Profile; layered: boolean }) {
  const style = visual.style ?? "classico";
  const ghost = !visual.style;
  const geometry = useMemo(
    () => new THREE.LatheGeometry(prof.pts, style === "geometrico" ? 8 : 80),
    [prof, style]
  );
  const saucer = useMemo(() => {
    const r = prof.pts[1].x + 0.28;
    const p = [
      [0.001, 0], [r * 0.75, 0], [r * 0.96, 0.012], [r, SAUCER_H], [r * 0.93, SAUCER_H], [r * 0.8, 0.018], [0.001, 0.018],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(p, style === "geometrico" ? 8 : 64);
  }, [prof, style]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => saucer.dispose(), [saucer]);

  const potMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const saucerMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const opacity = ghost ? 0.3 : layered ? 0.18 : 1;
  const color = ghost ? "#cfc2ac" : visual.color;
  useFadeMaterial(potMat, color, opacity);
  useFadeMaterial(saucerMat, color, opacity);

  const f = FINISH[visual.finish] ?? FINISH.fosco;
  const flat = style === "geometrico";
  return (
    <group>
      <mesh geometry={saucer} receiveShadow castShadow>
        <meshPhysicalMaterial ref={saucerMat} {...f} flatShading={flat} />
      </mesh>
      <mesh geometry={geometry} position={[0, SAUCER_H, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial ref={potMat} {...f} flatShading={flat} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------- Camadas internas ------------------------------ */

type Piece = { p: [number, number, number]; s: number; r: [number, number, number]; c: string };

function scatter(
  n: number,
  y0: number,
  y1: number,
  prof: Profile,
  salt: number,
  size: [number, number],
  colors: string[]
): Piece[] {
  return Array.from({ length: n }, (_, i) => {
    const y = y0 + rand(i, salt) * (y1 - y0);
    const s = size[0] + rand(i, salt + 1) * (size[1] - size[0]);
    const rr = Math.sqrt(rand(i, salt + 2)) * Math.max(0.02, prof.innerR(y) - s * 1.2);
    const a = rand(i, salt + 3) * Math.PI * 2;
    return {
      p: [Math.cos(a) * rr, y, Math.sin(a) * rr],
      s,
      r: [rand(i, salt + 4) * 3, rand(i, salt + 5) * 3, rand(i, salt + 6) * 3],
      c: colors[i % colors.length],
    };
  });
}

/** Peças que “caem” dentro do vaso com quique ao serem adicionadas */
function DropLayer({
  pieces,
  present,
  geometry,
  roughness = 0.9,
  flat = false,
}: {
  pieces: Piece[];
  present: boolean;
  geometry: THREE.BufferGeometry;
  roughness?: number;
  flat?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const t = useRef(REDUCED || present ? 99 : 0);
  const shown = useRef(present ? 1 : 0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const col = new THREE.Color();
    pieces.forEach((pc, i) => m.setColorAt(i, col.set(pc.c)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [pieces]);

  // Recomeça a queda sempre que o material entra (ou o vaso muda de formato)
  useEffect(() => {
    if (present) t.current = REDUCED ? 99 : 0;
  }, [present, pieces]);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    t.current += dt;
    shown.current += ((present ? 1 : 0) - shown.current) * damp(dt, 9);
    m.visible = shown.current > 0.01;
    if (!m.visible) return;
    pieces.forEach((pc, i) => {
      const local = Math.min(1, Math.max(0, (t.current - i * 0.012) / 0.75));
      const fall = (1 - easeOutBounce(local)) * 1.8;
      dummy.position.set(pc.p[0], pc.p[1] + fall, pc.p[2]);
      dummy.rotation.set(pc.r[0], pc.r[1], pc.r[2]);
      dummy.scale.setScalar(local > 0 ? pc.s * shown.current : 0.0001);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh key={pieces.length} ref={ref} args={[geometry, undefined, pieces.length]} castShadow receiveShadow>
      <meshStandardMaterial roughness={roughness} flatShading={flat} />
    </instancedMesh>
  );
}

/** Terra que “enche” o vaso: o nível sobe suavemente até o topo */
function Soil({ prof, base, top, present }: { prof: Profile; base: number; top: number; present: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const level = useRef(present ? top : base);
  const built = useRef({ level: -1, base: -1 });

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const target = present ? top : base;
    level.current += (target - level.current) * damp(dt, 2.4);
    m.visible = level.current - base > 0.012;
    if (!m.visible) return;
    const b = built.current;
    if (Math.abs(level.current - b.level) > 0.002 || b.base !== base) {
      const old = m.geometry;
      m.geometry = fillGeometry(prof, base, level.current);
      old.dispose();
      built.current = { level: level.current, base };
    }
  });

  return (
    <mesh ref={mesh} receiveShadow>
      <bufferGeometry />
      <meshStandardMaterial color="#3a2a1f" roughness={1} />
    </mesh>
  );
}

/** Grupo que desliza para cima/baixo na vista em camadas */
function Lift({ offset, children }: { offset: number; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const s = useRef<SpringState>({ x: offset, v: 0 });
  useFrame((_, dt) => {
    stepSpring(s.current, offset, dt, 60, 10);
    if (g.current) g.current.position.y = s.current.x;
  });
  return <group ref={g}>{children}</group>;
}

function Tag({ position, text, dot }: { position: [number, number, number]; text: string; dot: string }) {
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className="animate-pop-in flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-forest shadow-md ring-1 ring-black/5">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        {text}
      </div>
    </Html>
  );
}

/* --------------------------------- Plantas ------------------------------------ */

const GREENS = ["#2f6b3a", "#3b7a44", "#4a8a50", "#2a5f35"];

function Mat({ color, rough = 0.55 }: { color: string; rough?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} side={THREE.DoubleSide} />;
}

/** Haste inclinada; os filhos ficam presos na ponta */
function Branch({
  az, tilt, len, r = 0.022, color = "#4a6b34", stem = true, children,
}: {
  az: number; tilt: number; len: number; r?: number; color?: string; stem?: boolean; children?: React.ReactNode;
}) {
  return (
    <group rotation={[0, az, 0]}>
      <group rotation={[0, 0, -tilt]}>
        {stem && (
          <mesh position={[0, len / 2, 0]} castShadow>
            <cylinderGeometry args={[r * 0.65, r, len, 6]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )}
        <group position={[0, len, 0]}>{children}</group>
      </group>
    </group>
  );
}

/** Lâmina de folha a partir do ponto atual, inclinada para fora */
function Blade({
  geo = LEAF_BROAD, tilt = 0, roll = 0, scale = 1, color,
}: {
  geo?: THREE.BufferGeometry; tilt?: number; roll?: number; scale?: number | [number, number, number]; color: string;
}) {
  return (
    <group rotation={[0, 0, -tilt]}>
      <mesh geometry={geo} rotation={[0, -Math.PI / 2 + roll, 0]} scale={scale} castShadow receiveShadow>
        <Mat color={color} />
      </mesh>
    </group>
  );
}

function Folhagem() {
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => (
        <Branch
          key={i}
          az={(i / 9) * Math.PI * 2 + rand(i, 1) * 0.5}
          tilt={0.18 + rand(i, 2) * 0.55}
          len={0.45 + rand(i, 3) * 0.65}
        >
          <Blade tilt={0.45 + rand(i, 4) * 0.5} scale={0.48 + rand(i, 5) * 0.3} color={GREENS[i % 4]} />
        </Branch>
      ))}
    </group>
  );
}

function Frond({ len, salt }: { len: number; salt: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        Array.from({ length: 6 }, (_, k) => {
          const s = k / 5;
          return new THREE.Vector3(len * 0.6 * s * s, len * s, 0);
        })
      ),
    [len]
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 16, 0.011, 5), [curve]);
  useEffect(() => () => tube.dispose(), [tube]);
  const n = 9;
  return (
    <group>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color="#4f7a3a" roughness={0.8} />
      </mesh>
      {Array.from({ length: n }, (_, j) => {
        const s = 0.18 + (j / (n - 1)) * 0.8;
        const p = curve.getPoint(s);
        const tg = curve.getTangent(s);
        const ang = Math.atan2(tg.x, tg.y);
        const sc = (1 - s * 0.45) * 0.5;
        const color = GREENS[(j + salt) % 4];
        return (
          <group key={j} position={p} rotation={[0, 0, -ang]}>
            {[1, -1].map((side) => (
              <mesh
                key={side}
                geometry={LEAF_NARROW}
                rotation={[side * (Math.PI / 2 - 0.55), 0, 0]}
                scale={[sc, sc, sc]}
                castShadow
              >
                <Mat color={color} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Palmeira() {
  return (
    <group>
      {Array.from({ length: 3 }, (_, i) => {
        const len = 0.7 + rand(i, 7) * 0.35;
        return (
          <Branch key={i} az={(i / 3) * Math.PI * 2} tilt={0.06 + rand(i, 8) * 0.1} len={len} r={0.035} color="#76663f">
            {Array.from({ length: 4 }, (_, k) => (
              <group key={k} rotation={[0, (k / 4) * Math.PI * 2 + i, -0.45 - rand(k, i) * 0.25]}>
                <Frond len={0.75 + rand(k, i + 3) * 0.3} salt={k + i} />
              </group>
            ))}
          </Branch>
        );
      })}
    </group>
  );
}

function Vine({ az, len, rim, salt }: { az: number; len: number; rim: number; salt: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(rim * 0.6, 0.2, 0),
        new THREE.Vector3(rim * 1.03, 0.13, 0),
        new THREE.Vector3(rim * 1.14, -0.25, 0.03),
        new THREE.Vector3(rim * 1.12, -len, 0.08),
      ]),
    [len, rim]
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.009, 4), [curve]);
  useEffect(() => () => tube.dispose(), [tube]);
  const n = Math.round(len * 9);
  return (
    <group rotation={[0, az, 0]}>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color="#3f6b35" roughness={0.85} />
      </mesh>
      {Array.from({ length: n }, (_, j) => {
        const s = 0.25 + (j / n) * 0.75;
        const p = curve.getPoint(s);
        const side = j % 2 ? 1 : -1;
        const sc = 0.15 + rand(j, salt) * 0.06;
        return (
          <group key={j} position={p} rotation={[side * 0.7, 0, Math.PI * 0.82]}>
            <mesh geometry={LEAF_HEART} rotation={[0, -Math.PI / 2, 0]} scale={sc} castShadow>
              <Mat color={GREENS[(j + salt) % 4]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Pendente({ rim }: { rim: number }) {
  return (
    <group>
      {Array.from({ length: 16 }, (_, i) => (
        <Branch key={i} az={(i / 16) * Math.PI * 2 + rand(i, 9)} tilt={0.2 + rand(i, 10) * 0.9} len={0.08 + rand(i, 11) * 0.22}>
          <Blade geo={LEAF_HEART} tilt={0.5} scale={0.2 + rand(i, 12) * 0.1} color={GREENS[i % 4]} />
        </Branch>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Vine key={i} az={(i / 9) * Math.PI * 2 + 0.2} len={0.55 + rand(i, 13) * 0.55} rim={rim} salt={i} />
      ))}
    </group>
  );
}

function Bloom({ color, size = 1, open = false }: { color: string; size?: number; open?: boolean }) {
  const center = useMemo(() => "#" + new THREE.Color(color).multiplyScalar(0.72).getHexString(), [color]);
  const layers = open
    ? [{ n: 6, tilt: 1.25, s: 1 }]
    : [
        { n: 4, tilt: 0.2, s: 0.5 },
        { n: 5, tilt: 0.55, s: 0.72 },
        { n: 7, tilt: 0.95, s: 0.9 },
      ];
  return (
    <group scale={size}>
      {layers.map((l, li) =>
        Array.from({ length: l.n }, (_, k) => (
          <group key={`${li}-${k}`} rotation={[0, (k / l.n) * Math.PI * 2 + li * 0.6, 0]}>
            <group rotation={[0, 0, -l.tilt]}>
              <mesh geometry={open ? PETAL_OPEN : PETAL} rotation={[0, -Math.PI / 2, 0]} scale={0.16 * l.s} castShadow>
                <Mat color={color} rough={0.5} />
              </mesh>
            </group>
          </group>
        ))
      )}
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[open ? 0.035 : 0.045, 10, 8]} />
        <meshStandardMaterial color={open ? "#eac45a" : center} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Flores({ color }: { color: string }) {
  return (
    <group>
      {Array.from({ length: 4 }, (_, i) => (
        <Branch key={`l${i}`} az={(i / 4) * Math.PI * 2 + 0.4} tilt={0.9} len={0.05} stem={false}>
          <Blade geo={LEAF_BROAD} tilt={0.3} scale={0.42} color={GREENS[i % 4]} />
        </Branch>
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const len = 0.75 + rand(i, 14) * 0.45;
        return (
          <group key={i}>
            <Branch az={(i / 7) * Math.PI * 2 + rand(i, 15)} tilt={i === 0 ? 0 : 0.12 + rand(i, 16) * 0.28} len={len}>
              <Bloom color={color} size={0.9 + rand(i, 17) * 0.35} open={i % 3 === 2} />
            </Branch>
            <Branch az={(i / 7) * Math.PI * 2 + rand(i, 15)} tilt={i === 0 ? 0 : 0.12 + rand(i, 16) * 0.28} len={len * 0.5} stem={false}>
              <Blade geo={LEAF_NARROW} tilt={0.8} scale={0.32} color={GREENS[(i + 1) % 4]} />
            </Branch>
          </group>
        );
      })}
    </group>
  );
}

function OrchidFlower({ color, size }: { color: string; size: number }) {
  const lip = useMemo(() => "#" + new THREE.Color(color).multiplyScalar(0.65).getHexString(), [color]);
  return (
    <group rotation={[0, Math.PI / 2, 0]} scale={size}>
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={k} geometry={PETAL_OPEN} rotation={[0, 0, (k / 5) * Math.PI * 2]} scale={[0.17, 0.17, 0.17]} castShadow>
          <Mat color={color} rough={0.45} />
        </mesh>
      ))}
      <mesh position={[0, -0.02, 0.03]} scale={[1, 0.8, 0.7]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={lip} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Spike({ az, color, salt }: { az: number; color: string; salt: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.04, 0.6, 0),
        new THREE.Vector3(0.14, 1.12, 0),
        new THREE.Vector3(0.38, 1.42, 0),
        new THREE.Vector3(0.66, 1.43, 0),
        new THREE.Vector3(0.84, 1.28, 0),
      ]),
    []
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.012, 5), [curve]);
  useEffect(() => () => tube.dispose(), [tube]);
  return (
    <group rotation={[0, az, 0]}>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color="#557243" roughness={0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, j) => {
        const s = 0.6 + j * 0.075;
        const p = curve.getPoint(s);
        return (
          <group key={j} position={[p.x, p.y - 0.05, p.z]}>
            {j < 5 ? (
              <OrchidFlower color={color} size={1 - j * 0.09 + rand(j, salt) * 0.05} />
            ) : (
              <mesh>
                <sphereGeometry args={[0.04, 8, 6]} />
                <meshStandardMaterial color={color} roughness={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Orquidea({ color }: { color: string }) {
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => (
        <Branch key={i} az={(i / 5) * Math.PI * 2} tilt={1.1 + rand(i, 18) * 0.25} len={0.04} stem={false}>
          <Blade geo={LEAF_ORCHID} scale={0.55 + rand(i, 19) * 0.15} color={i % 2 ? "#2e5f36" : "#386d3f"} />
        </Branch>
      ))}
      <Spike az={0.3} color={color} salt={1} />
      <Spike az={Math.PI + 0.9} color={color} salt={2} />
    </group>
  );
}

function Cacto({ color }: { color: string }) {
  return (
    <group>
      <group position={[0, 0.69, 0]}>
        <mesh geometry={CACTUS_MAIN} castShadow receiveShadow>
          <meshStandardMaterial color="#4f8f5c" roughness={0.7} />
        </mesh>
        <points geometry={CACTUS_SPINES}>
          <pointsMaterial color="#f4efe1" size={0.025} />
        </points>
      </group>
      {[-1, 1].map((d) => (
        <group key={d} position={[d * 0.3, 0.62 + (d > 0 ? 0.12 : 0), 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[d * -0.02, 0, 0]} scale={[0.8, 0.45, 0.8]} castShadow>
            <capsuleGeometry args={[0.12, 0.12, 6, 16]} />
            <meshStandardMaterial color="#56975f" roughness={0.7} />
          </mesh>
          <mesh geometry={CACTUS_ARM} position={[d * 0.1, 0.27, 0]} castShadow>
            <meshStandardMaterial color="#56975f" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <group position={[0, 1.38, 0]}>
        <Bloom color={color} size={0.6} open />
      </group>
    </group>
  );
}

function Suculenta() {
  const rings = [
    { n: 5, len: 0.26, tilt: 0.3 },
    { n: 8, len: 0.36, tilt: 0.7 },
    { n: 11, len: 0.43, tilt: 1.08 },
    { n: 13, len: 0.46, tilt: 1.36 },
  ];
  const colors = ["#a9caa9", "#93b99a", "#7ea88a", "#6c977a"];
  return (
    <group>
      {rings.map((r, ri) =>
        Array.from({ length: r.n }, (_, i) => (
          <group key={`${ri}-${i}`} rotation={[0, (i / r.n) * Math.PI * 2 + ri * 0.45, 0]}>
            <group rotation={[0, 0, -r.tilt]}>
              <mesh geometry={SUCC_LEAF} rotation={[0, -Math.PI / 2, 0]} scale={r.len} castShadow receiveShadow>
                <meshStandardMaterial color={colors[ri]} roughness={0.4} />
              </mesh>
            </group>
          </group>
        ))
      )}
    </group>
  );
}

function PlantModel({ model, flowerColor = "#e3a7b8", rim }: { model: string; flowerColor?: string; rim: number }) {
  switch (model) {
    case "cacto":
      return <Cacto color={flowerColor} />;
    case "suculenta":
      return <Suculenta />;
    case "palmeira":
      return <Palmeira />;
    case "pendente":
      return <Pendente rim={rim} />;
    case "orquidea":
      return <Orquidea color={flowerColor} />;
    case "flores":
      return <Flores color={flowerColor} />;
    default:
      return <Folhagem />;
  }
}

/** A planta “brota” com uma mola e balança devagar, como ao vento */
function GrowIn({ children, position, scale, phase }: {
  children: React.ReactNode; position: [number, number, number]; scale: number; phase: number;
}) {
  const g = useRef<THREE.Group>(null);
  const s = useRef<SpringState>({ x: 0, v: 0 });
  useFrame((state, dt) => {
    stepSpring(s.current, scale, dt, 80, 8);
    const gr = g.current;
    if (!gr) return;
    gr.scale.setScalar(Math.max(0.0001, s.current.x));
    if (!REDUCED) {
      const t = state.clock.elapsedTime;
      gr.rotation.z = Math.sin(t * 0.9 + phase) * 0.025;
      gr.rotation.x = Math.sin(t * 0.7 + phase * 1.3) * 0.02;
    }
  });
  return <group ref={g} position={position}>{children}</group>;
}

/* ------------------------------- Composição ------------------------------------ */

function Composition({ visual, layered }: { visual: PotVisual; layered: boolean }) {
  const style = visual.style ?? "classico";
  const prof = useMemo(() => potProfile(style), [style]);
  const has = !!visual.style;

  const floor = SAUCER_H + 0.05;
  const top = SAUCER_H + prof.topY;
  const drainTop = floor + prof.topY * 0.24;
  const soilTop = top - 0.09;
  const soilBase = visual.drainage ? drainTop : floor;

  const clay = useMemo(
    () => scatter(70, floor + 0.04, drainTop - 0.03, prof, 3, [0.04, 0.058], ["#b4643c", "#c0703f", "#a85a35"]),
    [prof, floor, drainTop]
  );
  const coverKind = visual.cover?.kind ?? "pedrisco";
  const cover = useMemo(
    () =>
      coverKind === "casca"
        ? scatter(55, soilTop + 0.01, soilTop + 0.035, prof, 7, [0.055, 0.08], ["#7a4e2d", "#94623b", "#6a4226"])
        : scatter(85, soilTop + 0.015, soilTop + 0.04, prof, 5, [0.03, 0.048], ["#efeae0", "#ddd5c5", "#f7f3ea"]),
    [prof, soilTop, coverKind]
  );

  // Pop ao trocar o formato do vaso
  const group = useRef<THREE.Group>(null);
  const scale = useRef<SpringState>({ x: 0, v: 0 });
  useEffect(() => {
    scale.current.x = Math.min(scale.current.x, 0.72);
    scale.current.v = 0;
  }, [style]);
  useFrame((_, dt) => {
    stepSpring(scale.current, visual.sizeScale, dt, 150, 9);
    group.current?.scale.setScalar(Math.max(0.001, scale.current.x));
  });

  const L = layered && has;
  const rim = prof.topR;
  const plants = visual.plants.slice(0, 2);
  const tagX = (y: number) => prof.innerR(y) + 0.45;

  return (
    <group ref={group}>
      <Pot visual={visual} prof={prof} layered={L} />
      {!has && (
        <Html position={[0, prof.topY + 0.55, 0]} center style={{ pointerEvents: "none" }}>
          <p className="animate-pop-in whitespace-nowrap rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream shadow-lg">
            Escolha um vaso para começar
          </p>
        </Html>
      )}

      {has && (
        <>
          <DropLayer pieces={clay} present={!!visual.drainage} geometry={CLAY_BALL} roughness={0.85} />
          {L && visual.drainage && <Tag position={[tagX(drainTop), (floor + drainTop) / 2, 0]} text={`Drenagem · ${visual.drainage}`} dot="#b4643c" />}

          <Lift offset={L ? 0.45 : 0}>
            <Soil prof={prof} base={soilBase} top={soilTop} present={!!visual.soil} />
            {L && visual.soil && <Tag position={[tagX(soilTop), (soilBase + soilTop) / 2, 0]} text={`Substrato · ${visual.soil}`} dot="#3a2a1f" />}
          </Lift>

          <Lift offset={L ? 0.85 : 0}>
            <DropLayer
              pieces={cover}
              present={!!visual.cover}
              geometry={coverKind === "casca" ? BARK : PEBBLE}
              roughness={coverKind === "casca" ? 0.95 : 0.7}
              flat
            />
            {L && visual.cover && <Tag position={[tagX(soilTop), soilTop + 0.03, 0]} text={`Cobertura · ${visual.cover.name}`} dot={coverKind === "casca" ? "#7a4e2d" : "#ddd5c5"} />}
          </Lift>

          <Lift offset={L ? 1.25 : 0}>
            {plants.map((p, i) => (
              <GrowIn
                key={p.id}
                position={plants.length === 2 ? [(i ? 1 : -1) * rim * 0.42, soilTop, (i ? -1 : 1) * rim * 0.12] : [0, soilTop, 0]}
                scale={plants.length === 2 ? 0.78 : 1}
                phase={i * 2.1}
              >
                <PlantModel model={p.model} flowerColor={p.flowerColor} rim={plants.length === 2 ? rim * 0.6 : rim} />
              </GrowIn>
            ))}
            {L && plants.length > 0 && (
              <Tag position={[tagX(soilTop) + 0.35, soilTop + 0.75, 0]} text={plants.map((p) => p.name).join(" + ")} dot="#3b7a44" />
            )}
          </Lift>

          {L && <Tag position={[prof.innerR(prof.topY * 0.5) / 0.88 + 0.45, prof.topY * 0.42, 0]} text="Vaso" dot={visual.color} />}
        </>
      )}
    </group>
  );
}

/* ---------------------------- Câmera e celebração ------------------------------ */

const VIEWS: Record<string, { pos: [number, number, number]; y: number }> = {
  "1": { pos: [3.0, 1.9, 4.0], y: 0.7 },
  "2": { pos: [2.2, 3.3, 3.0], y: 0.85 },
  "3": { pos: [3.3, 2.4, 4.6], y: 1.15 },
  "4": { pos: [3.7, 2.2, 5.1], y: 1.1 },
  layered: { pos: [4.6, 2.6, 6.2], y: 1.75 },
};

const boundControls = new WeakSet<object>();

/** Leva a câmera ao enquadramento de cada etapa; solta assim que o usuário arrasta */
function CameraRig({ view, scale, nonce }: { view: string; scale: number; nonce: number }) {
  const anim = useRef({ t: 0, active: true });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    anim.current = { t: 0, active: true };
  }, [view, nonce, scale]);

  useFrame((state, dt) => {
    const a = anim.current;
    const controls = state.controls as OrbitControlsImpl | null;
    if (!a.active || !controls) return;
    a.t += dt;
    const v = VIEWS[view] ?? VIEWS["1"];
    const k = Math.max(0.85, scale);
    pos.set(v.pos[0] * k, v.pos[1] * k, v.pos[2] * k);
    tgt.set(0, v.y * k, 0);
    const f = damp(dt, 3);
    state.camera.position.lerp(pos, f);
    controls.target.lerp(tgt, f);
    controls.update();
    if (a.t > 2.2) a.active = false;
  });

  // Solta a câmera no primeiro toque do usuário (controles ficam disponíveis após o 1º quadro)
  useFrame((state) => {
    const controls = state.controls as OrbitControlsImpl | null;
    if (controls && !boundControls.has(controls)) {
      boundControls.add(controls);
      controls.addEventListener("start", () => {
        anim.current.active = false;
      });
    }
  });
  return null;
}

function Celebrate({ nonce }: { nonce: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(99);
  useEffect(() => {
    if (nonce > 0 && !REDUCED) t.current = 0;
  }, [nonce]);
  useFrame((_, dt) => {
    t.current += dt;
    const g = ref.current;
    if (!g) return;
    g.visible = t.current < 2.4;
    g.scale.setScalar(0.8 + t.current * 0.35);
  });
  return (
    <group ref={ref} visible={false} position={[0, 1.2, 0]}>
      <Sparkles count={70} scale={[2.6, 2.4, 2.6]} size={6} speed={0.7} color="#eac45a" />
      <Sparkles count={40} scale={[2.2, 2.2, 2.2]} size={4} speed={0.5} color="#ffffff" />
    </group>
  );
}

/* --------------------------------- Componente ---------------------------------- */

export default function PotPreview({
  visual,
  step,
  layered,
  autoRotate,
  celebrate,
  recenter,
  canvasRef,
}: {
  visual: PotVisual;
  step: number;
  layered: boolean;
  autoRotate: boolean;
  celebrate: number;
  recenter: number;
  canvasRef?: React.Ref<HTMLCanvasElement>;
}) {
  const view = layered && visual.style ? "layered" : String(step);
  return (
    <Canvas
      ref={canvasRef}
      shadows
      dpr={[1, 2]}
      camera={{ position: [3.0, 1.9, 4.0], fov: 36 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#fff8ec", "#a7b28f", 0.55]} />
      <directionalLight
        position={[4, 7, 3]}
        intensity={2.1}
        color="#ffefd6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#dfe9d5" />

      {/* Estúdio gerado localmente (sem baixar HDR): reflexos suaves no esmalte */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 5, -3]} scale={[10, 4, 1]} color="#fff6e8" />
        <Lightformer intensity={1.2} position={[-5, 1.5, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#fff1dc" />
        <Lightformer intensity={0.8} position={[5, 2, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#e9f2e1" />
        <Lightformer form="ring" intensity={1.5} position={[2, 4, 4]} scale={2} color="#ffffff" />
      </Environment>

      {/* Pódio */}
      <group position={[0, -0.09, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.55, 1.63, 0.18, 96]} />
          <meshStandardMaterial color="#e8decb" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.0905, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[1.4, 1.55, 96]} />
          <meshStandardMaterial color="#dbcdb5" roughness={0.9} />
        </mesh>
      </group>

      <Composition visual={visual} layered={layered} />
      <Celebrate nonce={celebrate} />

      <ContactShadows position={[0, 0.002, 0]} opacity={0.35} scale={3.4} blur={2.4} far={2.5} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={1.8}
        maxDistance={11}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.7, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
      />
      <CameraRig view={view} scale={visual.sizeScale} nonce={recenter} />
    </Canvas>
  );
}
