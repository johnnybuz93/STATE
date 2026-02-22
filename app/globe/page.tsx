"use client";

import dynamic from "next/dynamic";
import { GlobeSettingsProvider, useGlobeSettings } from "@/contexts/GlobeSettingsContext";

const GlobeCanvas = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black" />
  ),
});

function GlobeOnly() {
  const settings = useGlobeSettings();
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#04060c" }}>
      <GlobeCanvas {...settings} />
    </div>
  );
}

export default function GlobePage() {
  return (
    <GlobeSettingsProvider>
      <GlobeOnly />
    </GlobeSettingsProvider>
  );
}