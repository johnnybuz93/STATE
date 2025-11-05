import { Label } from "@/components/ui/label";

interface MaterialSettingsProps {
  cloudsOpacity: number;
  setCloudsOpacity: (value: number) => void;
  cloudsSpeed: number;
  setCloudsSpeed: (value: number) => void;
  earthOpacity: number;
  setEarthOpacity: (value: number) => void;
  earthTransparency: number;
  setEarthTransparency: (value: number) => void;
  earthMaskIntensity: number;
  setEarthMaskIntensity: (value: number) => void;
  earthTextureIntensity: number;
  setEarthTextureIntensity: (value: number) => void;
  nightLightsColor: string;
  setNightLightsColor: (value: string) => void;
  nightLightsIntensity: number;
  setNightLightsIntensity: (value: number) => void;
  nightLightsBrightness: number;
  setNightLightsBrightness: (value: number) => void;
  pointsColor: string;
  setPointsColor: (value: string) => void;
  landPointsOpacity: number;
  setLandPointsOpacity: (value: number) => void;
  landPointsSize: number;
  setLandPointsSize: (value: number) => void;
  oceanPointsOpacity: number;
  setOceanPointsOpacity: (value: number) => void;
  oceanPointsSize: number;
  setOceanPointsSize: (value: number) => void;
}

export function MaterialSettings({
  cloudsOpacity,
  setCloudsOpacity,
  cloudsSpeed,
  setCloudsSpeed,
  earthOpacity,
  setEarthOpacity,
  earthTransparency,
  setEarthTransparency,
  earthMaskIntensity,
  setEarthMaskIntensity,
  earthTextureIntensity,
  setEarthTextureIntensity,
  nightLightsColor,
  setNightLightsColor,
  nightLightsIntensity,
  setNightLightsIntensity,
  nightLightsBrightness,
  setNightLightsBrightness,
  pointsColor,
  setPointsColor,
  landPointsOpacity,
  setLandPointsOpacity,
  landPointsSize,
  setLandPointsSize,
  oceanPointsOpacity,
  setOceanPointsOpacity,
  oceanPointsSize,
  setOceanPointsSize,
}: MaterialSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Настройки облаков */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Облака</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прозрачность</span>
            <span className="text-xs font-mono">{cloudsOpacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={cloudsOpacity}
            onChange={(e) => setCloudsOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Скорость вращения</span>
            <span className="text-xs font-mono">
              {cloudsSpeed > 0 ? '+' : ''}{cloudsSpeed.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="0.1"
            value={cloudsSpeed}
            onChange={(e) => setCloudsSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>←</span>
            <span>0</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Настройки текстуры Земли */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Поверхность Земли</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прозрачность</span>
            <span className="text-xs font-mono">{earthOpacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={earthOpacity}
            onChange={(e) => setEarthOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Непрозрачность (сквозная видимость)</span>
            <span className="text-xs font-mono">{earthTransparency.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={earthTransparency}
            onChange={(e) => setEarthTransparency(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Сила маски прозрачности</span>
            <span className="text-xs font-mono">{earthMaskIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={earthMaskIntensity}
            onChange={(e) => setEarthMaskIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Яркость текстур</span>
            <span className="text-xs font-mono">{earthTextureIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={earthTextureIntensity}
            onChange={(e) => setEarthTextureIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Настройки ночных огней */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ночные огни</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Цвет</span>
            <input
              type="text"
              value={nightLightsColor}
              onChange={(e) => setNightLightsColor(e.target.value)}
              className="w-20 px-2 py-1 text-xs font-mono bg-background border border-border rounded"
              placeholder="#ffaa44"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="color"
              value={nightLightsColor}
              onChange={(e) => setNightLightsColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer border border-border"
            />
            <div className="flex gap-1">
              {["#ffaa44", "#ff8844", "#ffcc66", "#ffffff"].map((color) => (
                <button
                  key={color}
                  onClick={() => setNightLightsColor(color)}
                  className="w-10 h-10 rounded border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: nightLightsColor === color ? "#fff" : "#333",
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Интенсивность (emissive)</span>
            <span className="text-xs font-mono">{nightLightsIntensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={nightLightsIntensity}
            onChange={(e) => setNightLightsIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Яркость</span>
            <span className="text-xs font-mono">{nightLightsBrightness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={nightLightsBrightness}
            onChange={(e) => setNightLightsBrightness(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Настройки точек (внешний слой) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Точки (внешний слой)</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Цвет</span>
            <input
              type="text"
              value={pointsColor}
              onChange={(e) => setPointsColor(e.target.value)}
              className="w-20 px-2 py-1 text-xs font-mono bg-background border border-border rounded"
              placeholder="#ffffff"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="color"
              value={pointsColor}
              onChange={(e) => setPointsColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer border border-border"
            />
            <div className="flex gap-1">
              {["#ffffff", "#cccccc", "#999999", "#666666"].map((color) => (
                <button
                  key={color}
                  onClick={() => setPointsColor(color)}
                  className="w-10 h-10 rounded border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: pointsColor === color ? "#fff" : "#333",
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прозрачность материков</span>
            <span className="text-xs font-mono">{landPointsOpacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={landPointsOpacity}
            onChange={(e) => setLandPointsOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Размер точек материков</span>
            <span className="text-xs font-mono">{landPointsSize.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.03"
            step="0.001"
            value={landPointsSize}
            onChange={(e) => setLandPointsSize(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Прозрачность океана</span>
            <span className="text-xs font-mono">{oceanPointsOpacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={oceanPointsOpacity}
            onChange={(e) => setOceanPointsOpacity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Размер точек океана</span>
            <span className="text-xs font-mono">{oceanPointsSize.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.03"
            step="0.001"
            value={oceanPointsSize}
            onChange={(e) => setOceanPointsSize(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
    </div>
  );
}

