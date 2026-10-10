"use client";

import dynamic from "next/dynamic";
import { StaticHero } from "./StaticHero";

const BalconyExperience = dynamic(() => import("./BalconyExperience"), {
  ssr: false,
  loading: () => <StaticHero loading />,
});

export function HeroLoader() {
  return <BalconyExperience />;
}
