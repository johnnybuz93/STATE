import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobeSettings } from "@/contexts/GlobeSettingsContext";
import {
  HemisphereVisibility,
  AutoRotation,
  InteractiveEffect,
  PerformanceStats,
  LayersVisibility,
  MaterialSettings,
  VFXSettings,
} from "./sections";

export function SettingsContent() {
  const settings = useGlobeSettings();
  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">FUI Globe</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление отображением глобуса
          </p>
        </div>
        <button
          onClick={settings.resetToDefaults}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Сбросить все настройки к дефолтным значениям"
        >
          Сбросить
        </button>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="vfx">VFX</TabsTrigger>
        </TabsList>

        {/* Вкладка: Общие настройки */}
        <TabsContent value="general" className="space-y-6 mt-4">
          <LayersVisibility {...settings} />
          <HemisphereVisibility {...settings} />
          <AutoRotation {...settings} />
          <InteractiveEffect {...settings} />
          <PerformanceStats {...settings} />
        </TabsContent>

        {/* Вкладка: Настройки материалов */}
        <TabsContent value="materials" className="space-y-6 mt-4">
          <MaterialSettings {...settings} />
        </TabsContent>

        {/* Вкладка: VFX эффекты */}
        <TabsContent value="vfx" className="space-y-6 mt-4">
          <VFXSettings {...settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
