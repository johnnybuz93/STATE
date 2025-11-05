"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MobileSettingsSheet } from "@/components/MobileSettingsSheet";
import { DesktopSettingsSidebar } from "@/components/DesktopSettingsSidebar";
import { SettingsProps } from "@/types/settings";

// Динамический импорт для избежания SSR проблем с Three.js
const GlobeCanvas = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-muted-foreground text-xl">Загрузка глобуса...</div>
    </div>
  ),
});

export default function Home() {
  const [showBackHemisphere, setShowBackHemisphere] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [showStats, setShowStats] = useState<boolean>(true);
  const [interactiveEffect, setInteractiveEffect] = useState<boolean>(true);
  const [effectStrength, setEffectStrength] = useState<number>(1);
  const [returnSpeed, setReturnSpeed] = useState<number>(0.92);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.002);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Функция сброса к дефолтным значениям
  const resetToDefaults = () => {
    setShowBackHemisphere(false);
    setAutoRotate(true);
    setBackgroundColor("#000000");
    setShowStats(true);
    setInteractiveEffect(true);
    setEffectStrength(1);
    setReturnSpeed(0.92);
    setRotationSpeed(0.002);
  };

  const settingsProps: SettingsProps = {
    showBackHemisphere,
    setShowBackHemisphere,
    autoRotate,
    setAutoRotate,
    rotationSpeed,
    setRotationSpeed,
    backgroundColor,
    setBackgroundColor,
    interactiveEffect,
    setInteractiveEffect,
    effectStrength,
    setEffectStrength,
    returnSpeed,
    setReturnSpeed,
    showStats,
    setShowStats,
    resetToDefaults,
  };

  return (
    <main className="h-screen overflow-hidden flex relative">
      {/* 3D Глобус - основная область */}
      <div className="flex-1 relative">
        <GlobeCanvas
          showBackHemisphere={showBackHemisphere}
          autoRotate={autoRotate}
          backgroundColor={backgroundColor}
          showStats={showStats}
          interactiveEffect={interactiveEffect}
          effectStrength={effectStrength}
          returnSpeed={returnSpeed}
          rotationSpeed={rotationSpeed}
        />

        {/* Кнопка меню для мобильных - снизу по центру */}
        <MobileSettingsSheet
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          settingsProps={settingsProps}
        />
      </div>

      {/* Правый сайдбар с настройками - только на десктопе */}
      <DesktopSettingsSidebar settingsProps={settingsProps} />
    </main>
  );
}
