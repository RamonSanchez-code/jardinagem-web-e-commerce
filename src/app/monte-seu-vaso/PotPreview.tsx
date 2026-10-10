"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";

export type PotVisual = {
  style: string;          // classico | bojo | geometrico | alto | tigela
  color: string;
  sizeScale: number;
  materials: string[];    // materialKind selecionados
  plant: { model: string; flowerColor?: string } | null;
};

/* ------------------------------ Perfis de vaso -------------------------------- */
function potProfile(style: string): { pts: THREE.Vector2[]; topY: number; topR: number; h: number } {
  const shapes: Record<string, number[][]> = {
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
  const raw = shapes[style] ?? shapes.classico;
  const pts = raw.map(([x, y]) => new THREE.Vector2(x, y));
  const maxY = Math.max(...raw.map(([, y]) => y));
  const innerTop = raw[raw.length - 1];
  return { pts, topY: maxY, topR: innerTop[0], h: maxY };
}

function PotMesh({ visual }: { visual: PotVisual }) {
  const { pts, topY, topR } = useMemo(() => potProfile(visual.style), [visual.style]);
  const geometry = useMemo(
    () => new THREE.LatheGeometry(pts, visual.style === "geometrico" ? 8 : 28),
    [pts, visual.style]
  );
  const saucer = useMemo(() => {
    const p = [
      [0.001, 0], [0.7, 0], [0.95, 0.08], [1.0, 0.02], [1.0, 0.0], [0.7, -0.02],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(p, 28);
  }, []);

  const soilColor = visual.materials.includes("substrato") ? "#3a2a1e" : "#54402f";

  return (
    <group scale={visual.sizeScale}>
      {/* Pires */}
      <mesh geometry={saucer} position={[0, 0.03, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={visual.color} roughness={0.75} flatShading={visual.style === "geometrico"} />
      </mesh>
      {/* Vaso */}
      <mesh geometry={geometry} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={visual.color}
          roughness={visual.style === "geometrico" ? 0.55 : 0.78}
          flatShading={visual.style === "geometrico"}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Substrato */}
      <mesh position={[0, topY + 0.05 - 0.07, 0]}>
        <cylinderGeometry args={[topR * 0.96, topR * 0.96, 0.08, 24]} />
        <meshStandardMaterial color={soilColor} roughness={1} />
      </mesh>
      {/* Cobertura / drenagem vista */}
      {(visual.materials.includes("cobertura") || visual.materials.includes("drenagem")) && (
        <group position={[0, topY - 0.02, 0]}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.35;
            const r = topR * (0.25 + (i % 5) * 0.14);
            return (
              <mesh key={i} position={[Math.cos(a) * r * 0.85, 0.05, Math.sin(a) * r * 0.85]} castShadow>
                <dodecahedronGeometry args={[0.07 + (i % 3) * 0.018, 0]} />
                <meshStandardMaterial color={i % 2 ? "#e8e2d4" : "#c9bda6"} roughness={0.9} flatShading />
              </mesh>
            );
          })}
        </group>
      )}
      {/* Planta */}
      {visual.plant && (
        <group position={[0, topY + 0.02, 0]}>
          <PlantModel model={visual.plant.model} flowerColor={visual.plant.flowerColor} />
        </group>
      )}
    </group>
  );
}

/* -------------------------------- Folha genérica ------------------------------- */
function Leaf({ position, rotation, scale = 1, color = "#3d8a4a" }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={[1, 0.32, 0.55].map((v) => v * scale) as [number, number, number]} castShadow>
      <sphereGeometry args={[0.5, 8, 6]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function PlantModel({ model, flowerColor = "#e3a7b8" }: { model: string; flowerColor?: string }) {
  const leaves = useMemo(() => {
    let s = 42;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return rnd;
  }, []);
  const rnd = leaves;

  if (model === "cacto") {
    return (
      <group>
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.28, 1.3, 6, 12]} />
          <meshStandardMaterial color="#5e9a68" roughness={0.85} />
        </mesh>
        {[-1, 1].map((d) => (
          <group key={d} position={[d * 0.28, 0.8, 0]} rotation={[0, 0, d * -0.9]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <capsuleGeometry args={[0.16, 0.55, 6, 10]} />
              <meshStandardMaterial color="#67a873" roughness={0.85} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color={flowerColor} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (model === "suculenta") {
    const rings = [
      { n: 6, r: 0.34, y: 0.18, s: 0.7, tilt: 0.9 },
      { n: 8, r: 0.5, y: 0.14, s: 0.8, tilt: 0.6 },
      { n: 10, r: 0.64, y: 0.1, s: 0.85, tilt: 0.35 },
    ];
    return (
      <group>
        {rings.map((ring, ri) =>
          Array.from({ length: ring.n }, (_, i) => {
            const a = (i / ring.n) * Math.PI * 2 + ri * 0.4;
            return (
              <group key={`${ri}-${i}`} position={[Math.cos(a) * ring.r, ring.y, Math.sin(a) * ring.r]} rotation={[ring.tilt, -a + Math.PI / 2, 0]}>
                <mesh scale={[0.55, 0.28, 1]} castShadow>
                  <sphereGeometry args={[ring.s * 0.35, 8, 6]} />
                  <meshStandardMaterial color={ri === 0 ? "#79b58f" : "#5e9a68"} roughness={0.75} />
                </mesh>
              </group>
            );
          })
        )}
      </group>
    );
  }

  if (model === "palmeira") {
    return (
      <group>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 1.6, 7]} />
          <meshStandardMaterial color="#8a6b4f" roughness={0.95} />
        </mesh>
        <group position={[0, 1.65, 0]}>
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
              <mesh position={[0.55, -0.2, 0]} rotation={[0, 0, -0.75]} castShadow>
                <coneGeometry args={[0.28, 1.5, 4]} />
                <meshStandardMaterial color={i % 2 ? "#3f8a49" : "#357a42"} roughness={0.85} flatShading />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  }

  if (model === "pendente") {
    return (
      <group>
        <mesh position={[0, 0.25, 0]}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#3d8a4a" roughness={0.9} flatShading />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const len = 0.8 + rnd() * 0.7;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh position={[0.62, -(len / 2) + 0.25, 0]} rotation={[0, 0, 0.25]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, len, 4]} />
                <meshStandardMaterial color="#357446" roughness={0.9} />
              </mesh>
              {Array.from({ length: Math.round(len * 5) }, (_, j) => (
                <Leaf
                  key={j}
                  position={[0.62 + (j % 2 ? 0.09 : -0.02), 0.25 - (j + 0.6) * (len / 6), 0]}
                  rotation={[0.3, j * 1.2, 0.3]}
                  scale={0.32}
                  color={j % 2 ? "#4c9153" : "#3d8a4a"}
                />
              ))}
            </group>
          );
        })}
      </group>
    );
  }

  if (model === "orquidea" || model === "flores") {
    const stems = model === "orquidea" ? 2 : 6;
    return (
      <group>
        {/* folhas de base */}
        {[0, 1, 2, 3].map((i) => (
          <Leaf key={i} position={[0, 0.14, 0]} rotation={[0.35, (i / 4) * Math.PI * 2, 0]} scale={i % 2 ? 0.9 : 0.7} color="#357a42" />
        ))}
        {Array.from({ length: stems }, (_, i) => {
          const a = (i / stems) * Math.PI * 2 + 0.5;
          const tilt = model === "orquidea" ? 0.5 : 0.25;
          const h = model === "orquidea" ? 1.5 : 1.2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <group rotation={[0, 0, tilt]}>
                <mesh position={[0, h / 2, 0]} castShadow>
                  <cylinderGeometry args={[0.025, 0.03, h, 5]} />
                  <meshStandardMaterial color="#3d6b35" roughness={0.9} />
                </mesh>
                {/* flores ao longo da haste */}
                {Array.from({ length: 4 }, (_, j) => (
                  <group key={j} position={[0.02, 0.5 + j * (h / 4.5), 0]}>
                    {[0, 1, 2, 3, 4].map((k) => (
                      <mesh
                        key={k}
                        position={[Math.cos((k / 5) * Math.PI * 2) * 0.11, Math.sin((k / 5) * Math.PI * 2) * 0.11, 0]}
                        scale={[1, 0.75, 0.4]}
                        castShadow
                      >
                        <sphereGeometry args={[0.09, 7, 5]} />
                        <meshStandardMaterial color={flowerColor} roughness={0.65} />
                      </mesh>
                    ))}
                    <mesh>
                      <sphereGeometry args={[0.05, 6, 5]} />
                      <meshStandardMaterial color="#eac45a" roughness={0.6} />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          );
        })}
      </group>
    );
  }

  // folhagem (padrão)
  return (
    <group>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const h = 0.9 + rnd() * 0.9;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group rotation={[0, 0, 0.28 + rnd() * 0.25]}>
              <mesh position={[0, h / 2, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.045, h, 5]} />
                <meshStandardMaterial color="#3d6b35" roughness={0.9} />
              </mesh>
              <Leaf position={[0, h + 0.1, 0]} rotation={[0.2, 0, -0.5]} scale={1 + rnd() * 0.5} />
              <Leaf position={[0.03, h * 0.66, 0]} rotation={[0.4, 1.2, -0.7]} scale={0.7} color="#4c9153" />
              <Leaf position={[0.02, h * 0.4, 0]} rotation={[0.4, -1.1, -0.7]} scale={0.55} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* --------------------------------- Componente ---------------------------------- */
export default function PotPreview({ visual }: { visual: PotVisual }) {
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [3.1, 2.6, 4.4], fov: 38 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f3ede1"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fdf6e8", "#9aa884", 0.7]} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        color="#ffedd0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} color="#dfe9d5" />

      {/* Pódio */}
      <mesh position={[0, -0.07, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.05, 0.14, 40]} />
        <meshStandardMaterial color="#e6dcc8" roughness={0.9} />
      </mesh>

      <PotMesh visual={visual} />

      <ContactShadows position={[0, -0.14, 0]} opacity={0.4} scale={8} blur={2.2} far={3} />
      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1, 0]}
        autoRotate
        autoRotateSpeed={0.7}
      />
    </Canvas>
  );
}
