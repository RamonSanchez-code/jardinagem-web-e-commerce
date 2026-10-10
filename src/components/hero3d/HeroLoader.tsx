"use client";

import dynamic from "next/dynamic";
import { StaticHero } from "./StaticHero";

const ApartmentExperience = dynamic(() => import("./ApartmentExperience"), {
  ssr: false,
  loading: () => <StaticHero loading />,
});

export function HeroLoader() {
  return <ApartmentExperience />;
}
