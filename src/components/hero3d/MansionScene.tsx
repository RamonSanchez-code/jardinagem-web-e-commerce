"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* ------------------------------- PRNG determinístico ------------------------- */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = {
  wall: "#efe3cd",
  wallLight: "#f4ecdc",
  roof: "#a85f43",
  roofDark: "#8f4e37",
  glass: "#33514d",
  door: "#5d3f2c",
  stone: "#d8cfbe",
  stoneAlt: "#cbc0ac",
  lawn: "#6f9e57",
  soil: "#4a382b",
  trunk: "#8a6b4f",
  terracotta: "#b8754f",
  potCream: "#e8dfcc",
  potGreen: "#477a4b",
  water: "#7fb4c7",
  lamp: "#ffd9a0",
  hedge: "#3d7040",
  treeDark: "#2c5231",
  treeMid: "#3f7a44",
  leaf: "#3d8a4a",
  leaf2: "#4c9153",
  leafPalm: "#3f8a49",
};

const FLOWER_COLORS = ["#d98a9e", "#e8e2d4", "#b8754f", "#e5b95c", "#c97b63", "#d26a5f"];

/* ----------------------------------- Palmeira -------------------------------- */
function Palm({ x, z, h, seed }: { x: number; z: number; h: number; seed: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed]);
  const segs = useMemo(() => {
    const arr: { x: number; y: number; r: number }[] = [];
    const n = 5;
    let dx = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      arr.push({ x: dx, y: 0.8 + t * h + h / n / 2, r: 0.28 - t * 0.12 });
      dx += (rand() - 0.3) * 0.28;
    }
    return { arr, topX: dx, h };
  }, [h, rand]);
  const fronds = useMemo(() => {
    const n = 9;
    return Array.from({ length: n }, (_, i) => ({
      rotY: (i / n) * Math.PI * 2 + rand() * 0.4,
      tilt: 0.55 + rand() * 0.45,
      len: 2.4 + rand() * 1.1,
    }));
  }, [rand]);
  return (
    <group position={[x, 0, z]}>
      {segs.arr.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0]} castShadow>
          <cylinderGeometry args={[s.r, s.r + 0.04, h / 5 + 0.15, 7]} />
          <meshStandardMaterial color={C.trunk} roughness={0.95} flatShading />
        </mesh>
      ))}
      <group position={[segs.topX, h + 1, 0]}>
        {fronds.map((f, i) => (
          <group key={i} rotation={[0, f.rotY, 0]}>
            <mesh
              position={[f.len / 2.6, -f.len / 5.2, 0]}
              rotation={[0, 0, -f.tilt]}
              castShadow
            >
              <coneGeometry args={[0.5, f.len, 4]} />
              <meshStandardMaterial color={i % 2 ? C.leafPalm : C.leaf} roughness={0.85} flatShading />
            </mesh>
          </group>
        ))}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.2) * 0.25, -0.25, Math.sin(i * 2.2) * 0.25]}>
            <sphereGeometry args={[0.17, 6, 5]} />
            <meshStandardMaterial color="#6b4a33" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------- Árvore copa --------------------------------- */
function ShadeTree({ x, z, scale = 1, seed }: { x: number; z: number; scale?: number; seed: number }) {
  const rand = mulberry32(seed);
  const blobs = [
    [0, 4.6, 0, 2.6],
    [1.6, 3.9, 0.6, 1.9],
    [-1.5, 4, -0.5, 1.8],
    [0.3, 3.6, 1.4, 1.5],
  ];
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 4.4, 7]} />
        <meshStandardMaterial color={C.trunk} roughness={0.95} flatShading />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]} castShadow>
          <icosahedronGeometry args={[b[3], 1]} />
          <meshStandardMaterial
            color={i % 2 ? C.treeMid : C.treeDark}
            roughness={0.9}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ Árvore de fundo ------------------------------- */
function BackTrees() {
  const items = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 16 }, (_, i) => {
      const a = Math.PI * 0.75 + (i / 16) * Math.PI * 1.5;
      const r = 46 + rand() * 18;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r - 6,
        s: 0.9 + rand() * 0.9,
      };
    });
  }, []);
  return (
    <group>
      {items.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.3, 0.42, 2.8, 6]} />
            <meshStandardMaterial color={C.trunk} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, 4.6, 0]}>
            <coneGeometry args={[2.3, 4.6, 7]} />
            <meshStandardMaterial color={C.treeDark} roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 6.8, 0]}>
            <coneGeometry args={[1.7, 3.6, 7]} />
            <meshStandardMaterial color={C.treeMid} roughness={0.95} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* --------------------------------- Arbustos ---------------------------------- */
function Bushes() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const rand = mulberry32(7);
    const arr: { p: [number, number, number]; s: number; c: THREE.Color }[] = [];
    const greens = ["#3d7a44", "#4c8a4a", "#2f6338", "#6f9a68", "#578f4e"];
    // ao redor da casa
    for (let i = 0; i < 26; i++) {
      const side = rand() > 0.5 ? 1 : -1;
      arr.push({
        p: [side * (10.5 + rand() * 4), 0.35, -2 + rand() * 14],
        s: 0.55 + rand() * 0.7,
        c: new THREE.Color(greens[Math.floor(rand() * greens.length)]),
      });
    }
    // espalhados pelo jardim
    for (let i = 0; i < 40; i++) {
      const x = (rand() - 0.5) * 64;
      const z = 6 + rand() * 34;
      if (Math.abs(x) < 6.5 && z > 5) continue; // mantém o caminho livre
      arr.push({
        p: [x, 0.32, z],
        s: 0.5 + rand() * 0.9,
        c: new THREE.Color(greens[Math.floor(rand() * greens.length)]),
      });
    }
    return arr;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    items.forEach((b, i) => {
      dummy.position.set(...b.p);
      dummy.scale.set(b.s, b.s * 0.72, b.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, b.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={0.9} flatShading />
    </instancedMesh>
  );
}

/* ----------------------------------- Flores ---------------------------------- */
function Flowers() {
  const heads = useRef<THREE.InstancedMesh>(null);
  const stems = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const rand = mulberry32(99);
    const arr: { p: [number, number, number]; c: THREE.Color }[] = [];
    const bed = (cx: number, cz: number, w: number, d: number, n: number) => {
      for (let i = 0; i < n; i++) {
        arr.push({
          p: [cx + (rand() - 0.5) * w, 0.42, cz + (rand() - 0.5) * d],
          c: new THREE.Color(FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)]),
        });
      }
    };
    bed(3.6, 21, 2.6, 28, 90);   // canteiros do caminho
    bed(-3.6, 21, 2.6, 28, 90);
    bed(10.5, 8, 6, 4, 40);      // frente direita
    bed(-11, 8, 7, 4, 44);       // frente esquerda
    bed(0, 40.5, 26, 2.6, 60);   // fundo frontal
    return arr;
  }, []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const h = heads.current;
    const s = stems.current;
    if (!h || !s) return;
    items.forEach((f, i) => {
      dummy.position.set(...f.p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      h.setMatrixAt(i, dummy.matrix);
      h.setColorAt(i, f.c);
      dummy.position.set(f.p[0], 0.21, f.p[2]);
      dummy.updateMatrix();
      s.setMatrixAt(i, dummy.matrix);
    });
    h.instanceMatrix.needsUpdate = true;
    s.instanceMatrix.needsUpdate = true;
    if (h.instanceColor) h.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <group>
      <instancedMesh ref={heads} args={[undefined, undefined, items.length]} castShadow>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial roughness={0.7} flatShading />
      </instancedMesh>
      <instancedMesh ref={stems} args={[undefined, undefined, items.length]}>
        <cylinderGeometry args={[0.025, 0.025, 0.42, 4]} />
        <meshStandardMaterial color="#3d6b35" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------- Vaso decorativo ------------------------------ */
function GardenPot({
  x, z, scale = 1, color = C.terracotta, plant = "bush",
}: { x: number; z: number; scale?: number; color?: string; plant?: "bush" | "agave" | "flowers" }) {
  const profile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const shape = [
      [0.0, 0], [0.55, 0], [0.62, 0.06], [0.72, 0.3], [0.86, 0.62], [0.95, 0.88],
      [1.0, 1.0], [1.06, 1.02], [1.06, 1.14], [0.96, 1.14], [0.9, 1.02],
    ];
    shape.forEach(([px, py]) => pts.push(new THREE.Vector2(px, py)));
    return new THREE.LatheGeometry(pts, 20);
  }, []);
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh geometry={profile} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.1, 16]} />
        <meshStandardMaterial color={C.soil} roughness={1} />
      </mesh>
      {plant === "bush" && (
        <mesh position={[0, 1.75, 0]} castShadow>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshStandardMaterial color={C.leaf2} roughness={0.9} flatShading />
        </mesh>
      )}
      {plant === "agave" && (
        <group position={[0, 1.05, 0]}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} rotation={[0.5, (i / 9) * Math.PI * 2, 0]} position={[0, 0.35, 0]} castShadow>
              <coneGeometry args={[0.14, 1.15, 4]} />
              <meshStandardMaterial color={i % 2 ? "#5e9a68" : C.leaf} roughness={0.85} flatShading />
            </mesh>
          ))}
        </group>
      )}
      {plant === "flowers" && (
        <group position={[0, 1.05, 0]}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.4, 0.5 + (i % 3) * 0.14, Math.sin(a) * 0.4]} castShadow>
                <icosahedronGeometry args={[0.18, 0]} />
                <meshStandardMaterial color={FLOWER_COLORS[i % FLOWER_COLORS.length]} roughness={0.7} flatShading />
              </mesh>
            );
          })}
          <mesh position={[0, 0.28, 0]}>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color={C.leaf} roughness={0.9} flatShading />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ----------------------------------- Mansão ---------------------------------- */
function WindowUnit({ x, y, z, w = 1.6, h = 2.2, flower = false }: {
  x: number; y: number; z: number; w?: number; h?: number; flower?: boolean;
}) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[w + 0.36, h + 0.36, 0.14]} />
        <meshStandardMaterial color={C.wallLight} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[w, h, 0.14]} />
        <meshStandardMaterial color={C.glass} roughness={0.25} metalness={0.25} emissive="#1d3532" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, (-h - 0.36) / 2 - 0.08, 0.14]}>
        <boxGeometry args={[w + 0.5, 0.14, 0.34]} />
        <meshStandardMaterial color={C.wallLight} roughness={0.85} />
      </mesh>
      {flower && (
        <group position={[0, (-h - 0.36) / 2 - 0.3, 0.3]}>
          <mesh>
            <boxGeometry args={[w, 0.34, 0.4]} />
            <meshStandardMaterial color={C.terracotta} roughness={0.9} />
          </mesh>
          {[-0.45, -0.15, 0.15, 0.45].map((dx, i) => (
            <mesh key={i} position={[dx * w * 0.9, 0.26, 0]}>
              <icosahedronGeometry args={[0.13, 0]} />
              <meshStandardMaterial color={FLOWER_COLORS[i % 4]} roughness={0.8} flatShading />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Mansion() {
  // Frontão triangular do pórtico
  const pediment = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-4.2, 0);
    s.lineTo(4.2, 0);
    s.lineTo(0, 1.8);
    s.lineTo(-4.2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 2.2, bevelEnabled: false });
    g.translate(0, 0, -1.1);
    return g;
  }, []);

  return (
    <group>
      {/* Terraço */}
      <mesh position={[0, 0.4, 2]} receiveShadow castShadow>
        <boxGeometry args={[34, 0.8, 20]} />
        <meshStandardMaterial color={C.stone} roughness={0.95} />
      </mesh>

      {/* Bloco principal (2 pavimentos) */}
      <mesh position={[0, 4.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 8.2, 9]} />
        <meshStandardMaterial color={C.wall} roughness={0.92} />
      </mesh>
      {/* Friso */}
      <mesh position={[0, 8.9, 0]} castShadow>
        <boxGeometry args={[16.5, 0.28, 9.3]} />
        <meshStandardMaterial color={C.wallLight} roughness={0.9} />
      </mesh>
      {/* Telhado principal */}
      <mesh position={[0, 10.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.56]} castShadow>
        <coneGeometry args={[11.6, 3.8, 4]} />
        <meshStandardMaterial color={C.roof} roughness={0.85} flatShading />
      </mesh>
      {/* Chaminé */}
      <mesh position={[5, 11.4, -1]} castShadow>
        <boxGeometry args={[1.1, 2.6, 1.1]} />
        <meshStandardMaterial color={C.wall} roughness={0.9} />
      </mesh>
      <mesh position={[5, 12.75, -1]}>
        <boxGeometry args={[1.35, 0.22, 1.35]} />
        <meshStandardMaterial color={C.roofDark} roughness={0.9} />
      </mesh>

      {/* Alas laterais */}
      {[-12.6, 12.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[9.2, 5, 8]} />
            <meshStandardMaterial color={C.wallLight} roughness={0.92} />
          </mesh>
          <mesh position={[x, 6.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.87]} castShadow>
            <coneGeometry args={[7.4, 2.4, 4]} />
            <meshStandardMaterial color={C.roof} roughness={0.85} flatShading />
          </mesh>
          <WindowUnit x={x - 2.3} y={3.4} z={4.02} w={1.5} h={2} flower />
          <WindowUnit x={x + 2.3} y={3.4} z={4.02} w={1.5} h={2} flower />
        </group>
      ))}

      {/* Pórtico */}
      <mesh position={[0, 6.15, 5.9]} castShadow>
        <boxGeometry args={[8.4, 0.5, 2.9]} />
        <meshStandardMaterial color={C.wallLight} roughness={0.9} />
      </mesh>
      <mesh geometry={pediment} position={[0, 6.4, 5.9]} castShadow>
        <meshStandardMaterial color={C.wallLight} roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.15, 7.06]} rotation={[0, 0, 0]}>
        <boxGeometry args={[8.6, 0.28, 0.24]} />
        <meshStandardMaterial color={C.roof} roughness={0.85} />
      </mesh>
      {[-3.3, -1.1, 1.1, 3.3].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.5, 6.9]} castShadow>
            <cylinderGeometry args={[0.3, 0.34, 5.4, 10]} />
            <meshStandardMaterial color={C.wallLight} roughness={0.85} />
          </mesh>
          <mesh position={[x, 0.95, 6.9]}>
            <boxGeometry args={[0.85, 0.3, 0.85]} />
            <meshStandardMaterial color={C.wallLight} roughness={0.85} />
          </mesh>
          <mesh position={[x, 6.05, 6.9]}>
            <boxGeometry args={[0.8, 0.24, 0.8]} />
            <meshStandardMaterial color={C.wallLight} roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Escadaria */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.7 - i * 0.26, 7.8 + i * 0.75]} receiveShadow castShadow>
          <boxGeometry args={[9 - i * 0.001, 0.26, 1.6]} />
          <meshStandardMaterial color={i % 2 ? C.stoneAlt : C.stone} roughness={0.95} />
        </mesh>
      ))}

      {/* Porta */}
      <mesh position={[0, 2.9, 4.56]}>
        <boxGeometry args={[2.5, 4.2, 0.22]} />
        <meshStandardMaterial color={C.door} roughness={0.75} />
      </mesh>
      <mesh position={[0, 5.25, 4.58]}>
        <boxGeometry args={[2.5, 0.5, 0.16]} />
        <meshStandardMaterial color={C.glass} roughness={0.25} metalness={0.25} emissive="#1d3532" emissiveIntensity={0.5} />
      </mesh>

      {/* Janelas térreas */}
      <WindowUnit x={-5.6} y={3.1} z={4.52} flower />
      <WindowUnit x={5.6} y={3.1} z={4.52} flower />
      {/* Janelas superiores */}
      {[-5.6, -2.8, 0, 2.8, 5.6].map((x) => (
        <WindowUnit key={x} x={x} y={6.9} z={4.52} w={1.5} h={2} />
      ))}

      {/* Varanda */}
      <mesh position={[0, 5.55, 5.1]} castShadow>
        <boxGeometry args={[5, 0.24, 1.5]} />
        <meshStandardMaterial color={C.stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 6.6, 5.82]}>
        <boxGeometry args={[5, 0.1, 0.1]} />
        <meshStandardMaterial color={C.wallLight} roughness={0.85} />
      </mesh>
      {[-2.2, -1.45, -0.7, 0, 0.7, 1.45, 2.2].map((x) => (
        <mesh key={x} position={[x, 6.05, 5.82]}>
          <boxGeometry args={[0.09, 1.05, 0.09]} />
          <meshStandardMaterial color={C.wallLight} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Caminho ---------------------------------- */
function Pathway() {
  const slabs = useMemo(() => {
    const rand = mulberry32(5);
    return Array.from({ length: 12 }, (_, i) => ({
      x: Math.sin(i * 0.55) * 0.5,
      z: 9.4 + i * 2.62,
      rot: (rand() - 0.5) * 0.14,
      alt: i % 2 === 0,
    }));
  }, []);
  return (
    <group>
      {slabs.map((s, i) => (
        <mesh key={i} position={[s.x, 0.1, s.z]} rotation={[0, s.rot, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.7, 0.2, 1.75]} />
          <meshStandardMaterial color={s.alt ? C.stone : C.stoneAlt} roughness={0.95} />
        </mesh>
      ))}
      {/* Solo dos canteiros laterais ao caminho */}
      {[3.6, -3.6].map((x) => (
        <mesh key={x} position={[x, 0.16, 21]} receiveShadow>
          <boxGeometry args={[3.2, 0.32, 30]} />
          <meshStandardMaterial color={C.soil} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------- Pergolado ---------------------------------- */
function Pergola({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[[-2.4, -1.8], [2.4, -1.8], [-2.4, 1.8], [2.4, 1.8]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 1.6, dz]} castShadow>
          <boxGeometry args={[0.28, 3.2, 0.28]} />
          <meshStandardMaterial color="#7a5c40" roughness={0.9} />
        </mesh>
      ))}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((dx) => (
        <mesh key={dx} position={[dx, 3.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.18, 4.6]} />
          <meshStandardMaterial color="#7a5c40" roughness={0.9} />
        </mesh>
      ))}
      {/* Trepadeira */}
      {[-2, -0.6, 0.8, 1.9].map((dx, i) => (
        <mesh key={i} position={[dx, 3.5, (i % 2 ? 0.9 : -0.7)]} rotation={[0, i * 0.7, 0]}>
          <boxGeometry args={[1.3, 0.16, 1]} />
          <meshStandardMaterial color={i % 2 ? C.leaf : C.leaf2} roughness={0.9} flatShading />
        </mesh>
      ))}
      {[-1.4, 0.4, 1.6].map((dx, i) => (
        <mesh key={`h${i}`} position={[dx, 2.7, (i % 2 ? -1.4 : 1.2)]}>
          <boxGeometry args={[0.4, 1.1, 0.4]} />
          <meshStandardMaterial color={C.leaf2} roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* Banco */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 0.16, 0.9]} />
        <meshStandardMaterial color="#8a6b4f" roughness={0.9} />
      </mesh>
      {[-1.2, 1.2].map((dx) => (
        <mesh key={dx} position={[dx, 0.25, 0]}>
          <boxGeometry args={[0.18, 0.5, 0.8]} />
          <meshStandardMaterial color="#6b4a33" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Fonte ------------------------------------- */
function Fountain({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 2.3, 0.7, 18]} />
        <meshStandardMaterial color={C.stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 0.1, 18]} />
        <meshStandardMaterial color={C.water} roughness={0.15} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 1.4, 10]} />
        <meshStandardMaterial color={C.stoneAlt} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.7, 0.22, 14]} />
        <meshStandardMaterial color={C.stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.26, 10, 8]} />
        <meshStandardMaterial color={C.water} roughness={0.15} />
      </mesh>
    </group>
  );
}

/* --------------------------------- Luminárias --------------------------------- */
function Lamps() {
  const positions: [number, number][] = [
    [2.6, 10.6], [-2.6, 15.8], [2.6, 21], [-2.6, 26.2], [2.6, 31.4], [-2.6, 36.6],
  ];
  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.9, 6]} />
            <meshStandardMaterial color="#3a3a35" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.16, 8, 6]} />
            <meshStandardMaterial color={C.lamp} emissive={C.lamp} emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------- Nuvens ------------------------------------ */
function Clouds() {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const rand = mulberry32(3);
    return Array.from({ length: 5 }, (_, i) => ({
      x: -60 + i * 26 + rand() * 8,
      y: 30 + rand() * 9,
      z: -34 - rand() * 26,
      s: 2 + rand() * 2,
      spd: 0.35 + rand() * 0.4,
    }));
  }, []);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      c.position.x += items[i].spd * delta;
      if (c.position.x > 80) c.position.x = -80;
    });
  });
  return (
    <group ref={group}>
      {items.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[[0, 0, 0, 1.5], [1.6, -0.2, 0.3, 1.1], [-1.5, -0.25, -0.2, 1], [0.5, 0.6, -0.4, 0.9]].map((b, j) => (
            <mesh key={j} position={[b[0], b[1], b[2]]}>
              <icosahedronGeometry args={[b[3], 1]} />
              <meshStandardMaterial color="#fbf8f0" roughness={1} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* --------------------------------- Camera rig --------------------------------- */
const CAM_KEYS = [
  { t: 0, pos: [34, 15, 44], look: [0, 6, 0] },
  { t: 0.3, pos: [12, 6, 24], look: [0, 6.5, 4] },
  { t: 0.55, pos: [-20, 7.5, 20], look: [-4, 5, 4] },
  { t: 0.8, pos: [-5, 2.5, 12.6], look: [-8.6, 1.4, 8.4] },
  { t: 1, pos: [0, 5, 17], look: [0, 5.5, 5] },
];

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const target = useRef(new THREE.Vector3(0, 6, 0));
  const pos = useRef(new THREE.Vector3(34, 15, 44));
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ camera, pointer: p, clock }) => {
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, p.x, 2, 0.016);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, p.y, 2, 0.016);

    const t = THREE.MathUtils.clamp(progress.current, 0, 1);
    let i = 0;
    while (i < CAM_KEYS.length - 2 && t > CAM_KEYS[i + 1].t) i++;
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];
    const local = smoothstep(THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1));

    const breathe = Math.sin(clock.elapsedTime * 0.25) * 0.18;
    pos.current.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], local) + pointer.current.x * 1.1,
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], local) + pointer.current.y * 0.6 + breathe,
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], local)
    );
    target.current.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], local),
      THREE.MathUtils.lerp(a.look[1], b.look[1], local),
      THREE.MathUtils.lerp(a.look[2], b.look[2], local)
    );
    camera.position.lerp(pos.current, 0.08);
    camera.lookAt(target.current);
  });
  return null;
}

/* ----------------------------------- Cena ------------------------------------- */
export function MansionWorld({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#eef0e3"]} />
      <fog attach="fog" args={["#eef0e3", 70, 150]} />

      <hemisphereLight args={["#dcecf5", "#8aa86a", 0.6]} />
      <directionalLight
        position={[30, 36, 26]}
        intensity={1.9}
        color="#ffe7c4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-camera-near={5}
        shadow-camera-far={130}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-24, 12, -14]} intensity={0.3} color="#cfe4d0" />

      {/* Gramado */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[110, 48]} />
        <meshStandardMaterial color={C.lawn} roughness={1} />
      </mesh>

      <Mansion />
      <Pathway />
      <Flowers />
      <Bushes />
      <BackTrees />
      <Lamps />

      {/* Palmeiras */}
      <Palm x={-9.5} z={10} h={9} seed={11} />
      <Palm x={9.5} z={11} h={10} seed={12} />
      <Palm x={-17} z={16} h={11} seed={13} />
      <Palm x={18} z={17} h={9.5} seed={14} />
      <Palm x={-24} z={26} h={8} seed={15} />
      <Palm x={25} z={24} h={10.5} seed={16} />
      <Palm x={-13} z={30} h={7.5} seed={17} />
      <Palm x={14} z={33} h={8.5} seed={18} />
      <Palm x={-28} z={10} h={9} seed={19} />
      <Palm x={29} z={8} h={9.5} seed={20} />

      {/* Árvores de copa */}
      <ShadeTree x={-21} z={-2} scale={1.25} seed={21} />
      <ShadeTree x={22} z={-4} scale={1.1} seed={22} />
      <ShadeTree x={-30} z={22} scale={1} seed={23} />
      <ShadeTree x={31} z={30} scale={1.15} seed={24} />

      {/* Vasos: destaque da cena 4 (lateral esquerda) */}
      <GardenPot x={-8.6} z={8.4} scale={1.25} color={C.terracotta} plant="agave" />
      <GardenPot x={-10.6} z={9.6} scale={1} color={C.potCream} plant="flowers" />
      <GardenPot x={-9.6} z={7} scale={0.8} color={C.potGreen} plant="bush" />
      {/* Vasos na entrada */}
      <GardenPot x={6.2} z={7.6} scale={1.1} color={C.terracotta} plant="flowers" />
      <GardenPot x={-6.2} z={7.6} scale={1.1} color={C.terracotta} plant="flowers" />
      <GardenPot x={8.8} z={12} scale={0.9} color={C.potCream} plant="agave" />

      {/* Cercas vivas frontais */}
      {[-17, 17].map((x) => (
        <mesh key={x} position={[x, 0.7, 39]} castShadow receiveShadow>
          <boxGeometry args={[18, 1.4, 1.4]} />
          <meshStandardMaterial color={C.hedge} roughness={0.95} flatShading />
        </mesh>
      ))}

      <Pergola x={-12.5} z={13.5} />
      <Fountain x={11} z={14} />
      <Clouds />

      <CameraRig progress={progress} />
    </>
  );
}
