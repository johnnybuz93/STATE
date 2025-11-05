import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface VFXSettingsProps {
  // Bloom
  bloomEnabled: boolean;
  setBloomEnabled: (value: boolean) => void;
  bloomIntensity: number;
  setBloomIntensity: (value: number) => void;
  bloomRadius: number;
  setBloomRadius: (value: number) => void;
  // Chromatic Aberration
  chromaticAberrationEnabled: boolean;
  setChromaticAberrationEnabled: (value: boolean) => void;
  chromaticAberrationOffset: number;
  setChromaticAberrationOffset: (value: number) => void;
  // Depth of Field
  depthOfFieldEnabled: boolean;
  setDepthOfFieldEnabled: (value: boolean) => void;
  depthOfFieldFocusDistance: number;
  setDepthOfFieldFocusDistance: (value: number) => void;
  depthOfFieldFocalLength: number;
  setDepthOfFieldFocalLength: (value: number) => void;
  // Film Grain
  filmGrainEnabled: boolean;
  setFilmGrainEnabled: (value: boolean) => void;
  filmGrainIntensity: number;
  setFilmGrainIntensity: (value: number) => void;
}

export function VFXSettings({
  bloomEnabled,
  setBloomEnabled,
  bloomIntensity,
  setBloomIntensity,
  bloomRadius,
  setBloomRadius,
  chromaticAberrationEnabled,
  setChromaticAberrationEnabled,
  chromaticAberrationOffset,
  setChromaticAberrationOffset,
  depthOfFieldEnabled,
  setDepthOfFieldEnabled,
  depthOfFieldFocusDistance,
  setDepthOfFieldFocusDistance,
  depthOfFieldFocalLength,
  setDepthOfFieldFocalLength,
  filmGrainEnabled,
  setFilmGrainEnabled,
  filmGrainIntensity,
  setFilmGrainIntensity,
}: VFXSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Bloom Effect */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Bloom (Свечение) ✨</Label>
          <RadioGroup
            value={bloomEnabled ? "enabled" : "disabled"}
            onValueChange={(value) => setBloomEnabled(value === "enabled")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="bloom-enabled" />
              <Label htmlFor="bloom-enabled" className="font-normal text-xs cursor-pointer">
                вкл
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="bloom-disabled" />
              <Label htmlFor="bloom-disabled" className="font-normal text-xs cursor-pointer">
                выкл
              </Label>
            </div>
          </RadioGroup>
        </div>

        {bloomEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Интенсивность</span>
                <span className="text-xs font-mono">{bloomIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={bloomIntensity}
                onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Радиус</span>
                <span className="text-xs font-mono">{bloomRadius.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bloomRadius}
                onChange={(e) => setBloomRadius(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chromatic Aberration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Chromatic Aberration 🌈</Label>
          <RadioGroup
            value={chromaticAberrationEnabled ? "enabled" : "disabled"}
            onValueChange={(value) => setChromaticAberrationEnabled(value === "enabled")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="chromatic-enabled" />
              <Label htmlFor="chromatic-enabled" className="font-normal text-xs cursor-pointer">
                вкл
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="chromatic-disabled" />
              <Label htmlFor="chromatic-disabled" className="font-normal text-xs cursor-pointer">
                выкл
              </Label>
            </div>
          </RadioGroup>
        </div>

        {chromaticAberrationEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Смещение</span>
                <span className="text-xs font-mono">{chromaticAberrationOffset.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.01"
                step="0.0001"
                value={chromaticAberrationOffset}
                onChange={(e) => setChromaticAberrationOffset(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Depth of Field */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Depth of Field 📸</Label>
          <RadioGroup
            value={depthOfFieldEnabled ? "enabled" : "disabled"}
            onValueChange={(value) => setDepthOfFieldEnabled(value === "enabled")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="dof-enabled" />
              <Label htmlFor="dof-enabled" className="font-normal text-xs cursor-pointer">
                вкл
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="dof-disabled" />
              <Label htmlFor="dof-disabled" className="font-normal text-xs cursor-pointer">
                выкл
              </Label>
            </div>
          </RadioGroup>
        </div>

        {depthOfFieldEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Дистанция фокуса</span>
                <span className="text-xs font-mono">{depthOfFieldFocusDistance.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={depthOfFieldFocusDistance}
                onChange={(e) => setDepthOfFieldFocusDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Фокусное расстояние</span>
                <span className="text-xs font-mono">{depthOfFieldFocalLength.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={depthOfFieldFocalLength}
                onChange={(e) => setDepthOfFieldFocalLength(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Film Grain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Film Grain (Зерно) 📽️</Label>
          <RadioGroup
            value={filmGrainEnabled ? "enabled" : "disabled"}
            onValueChange={(value) => setFilmGrainEnabled(value === "enabled")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enabled" id="grain-enabled" />
              <Label htmlFor="grain-enabled" className="font-normal text-xs cursor-pointer">
                вкл
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="grain-disabled" />
              <Label htmlFor="grain-disabled" className="font-normal text-xs cursor-pointer">
                выкл
              </Label>
            </div>
          </RadioGroup>
        </div>

        {filmGrainEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Интенсивность</span>
                <span className="text-xs font-mono">{filmGrainIntensity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={filmGrainIntensity}
                onChange={(e) => setFilmGrainIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

