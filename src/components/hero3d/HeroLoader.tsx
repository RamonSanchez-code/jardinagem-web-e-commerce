"use client";

import dynamic from "next/dynamic";
import { StaticHero } from "./StaticHero";

const MansionExperience = dynamic(() => import("./MansionExperience"), {
  ssr: false,
  loading: () => <StaticHero loading />,
});

export function HeroLoader() {
  return <MansionExperience />;
}
