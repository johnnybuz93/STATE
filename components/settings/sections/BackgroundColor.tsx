import { Label } from "@/components/ui/label";

interface BackgroundColorProps {
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
}

const COLOR_PRESETS = [
  "#000000",
  "#ffffff",
  "#1a1a1a",
  "#2d3748",
  "#1e3a5f",
];

export function BackgroundColor({
  backgroundColor,
  setBackgroundColor,
}: BackgroundColorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Цвет фона сцены</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-16 h-10 rounded border border-input cursor-pointer bg-background"
        />
        <div className="flex-1">
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="#000000"
            className="w-full px-3 py-2 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            onClick={() => setBackgroundColor(color)}
            className="w-8 h-8 rounded border-2 border-border hover:border-ring transition-colors"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

