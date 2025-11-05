"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MobileSettingsSheet } from "@/components/MobileSettingsSheet";
import { DesktopSettingsSidebar } from "@/components/DesktopSettingsSidebar";
import {
  GlobeSettingsProvider,
  useGlobeSettings,
} from "@/contexts/GlobeSettingsContext";

// Динамический импорт для избежания SSR проблем с Three.js
const GlobeCanvas = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-muted-foreground text-xl">Загрузка глобуса...</div>
    </div>
  ),
});

function HomeContent() {
  const settings = useGlobeSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="h-screen w-screen overflow-hidden flex relative">
      {/* 3D Глобус - основная область */}
      <div className="flex-1 relative min-w-0">
        <div className="absolute inset-0 w-full h-full">
          <GlobeCanvas {...settings} />
        </div>

        {/* Кнопка меню для мобильных - снизу по центру */}
        <MobileSettingsSheet
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      {/* Правый сайдбар с настройками - только на десктопе */}
      <DesktopSettingsSidebar />
    </main>
  );
}

export default function Home() {
  return (
    <GlobeSettingsProvider>
      <HomeContent />
    </GlobeSettingsProvider>
  );
}
