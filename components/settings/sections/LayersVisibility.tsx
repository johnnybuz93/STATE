import { Label } from "@/components/ui/label";

interface LayersVisibilityProps {
  showPointsLayer: boolean;
  setShowPointsLayer: (value: boolean) => void;
  showCloudsLayer: boolean;
  setShowCloudsLayer: (value: boolean) => void;
  showEarthLayer: boolean;
  setShowEarthLayer: (value: boolean) => void;
  showInnerLayer: boolean;
  setShowInnerLayer: (value: boolean) => void;
}

export function LayersVisibility({
  showPointsLayer,
  setShowPointsLayer,
  showCloudsLayer,
  setShowCloudsLayer,
  showEarthLayer,
  setShowEarthLayer,
  showInnerLayer,
  setShowInnerLayer,
}: LayersVisibilityProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Показать объекты</Label>

      <div className="space-y-3 pl-2">
        {/* Внешний слой точек */}
        <div className="flex items-center justify-between">
          <label htmlFor="points-layer" className="text-sm cursor-pointer">
            Внешний слой точек
          </label>
          <input
            type="checkbox"
            id="points-layer"
            checked={showPointsLayer}
            onChange={(e) => setShowPointsLayer(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
          />
        </div>

        {/* Течение атмосферы */}
        <div className="flex items-center justify-between">
          <label htmlFor="clouds-layer" className="text-sm cursor-pointer">
            Течение атмосферы
          </label>
          <input
            type="checkbox"
            id="clouds-layer"
            checked={showCloudsLayer}
            onChange={(e) => setShowCloudsLayer(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
          />
        </div>

        {/* Сфера земли */}
        <div className="flex items-center justify-between">
          <label htmlFor="earth-layer" className="text-sm cursor-pointer">
            Сфера земли
          </label>
          <input
            type="checkbox"
            id="earth-layer"
            checked={showEarthLayer}
            onChange={(e) => setShowEarthLayer(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
          />
        </div>

        {/* Полость земли */}
        <div className="flex items-center justify-between">
          <label htmlFor="inner-layer" className="text-sm cursor-pointer">
            Полость земли
          </label>
          <input
            type="checkbox"
            id="inner-layer"
            checked={showInnerLayer}
            onChange={(e) => setShowInnerLayer(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
          />
        </div>
      </div>
    </div>
  );
}

