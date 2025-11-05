import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AutoRotationProps {
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
}

export function AutoRotation({
  autoRotate,
  setAutoRotate,
  rotationSpeed,
  setRotationSpeed,
}: AutoRotationProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Автоматическое вращение</Label>
      <RadioGroup
        value={autoRotate ? "enabled" : "disabled"}
        onValueChange={(value) => setAutoRotate(value === "enabled")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id="enabled" />
          <Label htmlFor="enabled" className="font-normal cursor-pointer">
            включено
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id="disabled" />
          <Label htmlFor="disabled" className="font-normal cursor-pointer">
            выключено
          </Label>
        </div>
      </RadioGroup>

      {/* Слайдер скорости вращения */}
      {autoRotate && (
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Скорость вращения
            </Label>
            <span className="text-sm font-medium">
              {(rotationSpeed * 500).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.01"
            step="0.0001"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>медленнее</span>
            <span>быстрее</span>
          </div>
        </div>
      )}
    </div>
  );
}

