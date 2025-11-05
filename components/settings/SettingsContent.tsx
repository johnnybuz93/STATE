import { SettingsProps } from "@/types/settings";
import { HemisphereVisibility } from "./sections/HemisphereVisibility";
import { AutoRotation } from "./sections/AutoRotation";
import { BackgroundColor } from "./sections/BackgroundColor";
import { InteractiveEffect } from "./sections/InteractiveEffect";
import { PerformanceStats } from "./sections/PerformanceStats";

export function SettingsContent({
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
}: SettingsProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sexy Globy ;)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление отображением глобуса
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Сбросить все настройки к дефолтным значениям"
        >
          Сбросить
        </button>
      </div>

      {/* Секции настроек */}
      <HemisphereVisibility
        showBackHemisphere={showBackHemisphere}
        setShowBackHemisphere={setShowBackHemisphere}
      />

      <AutoRotation
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
      />

      <BackgroundColor
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />

      <InteractiveEffect
        interactiveEffect={interactiveEffect}
        setInteractiveEffect={setInteractiveEffect}
        effectStrength={effectStrength}
        setEffectStrength={setEffectStrength}
        returnSpeed={returnSpeed}
        setReturnSpeed={setReturnSpeed}
      />

      <PerformanceStats showStats={showStats} setShowStats={setShowStats} />
    </div>
  );
}

