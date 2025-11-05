import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface InteractiveEffectProps {
  interactiveEffect: boolean;
  setInteractiveEffect: (value: boolean) => void;
  effectStrength: number;
  setEffectStrength: (value: number) => void;
  returnSpeed: number;
  setReturnSpeed: (value: number) => void;
}

export function InteractiveEffect({
  interactiveEffect,
  setInteractiveEffect,
  effectStrength,
  setEffectStrength,
  returnSpeed,
  setReturnSpeed,
}: InteractiveEffectProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Интерактивный разлеташки</Label>
      <RadioGroup
        value={interactiveEffect ? "enabled" : "disabled"}
        onValueChange={(value) => setInteractiveEffect(value === "enabled")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id="effect-enabled" />
          <Label
            htmlFor="effect-enabled"
            className="font-normal cursor-pointer"
          >
            включено
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id="effect-disabled" />
          <Label
            htmlFor="effect-disabled"
            className="font-normal cursor-pointer"
          >
            выключено
          </Label>
        </div>
      </RadioGroup>

      {/* Слайдеры эффекта */}
      {interactiveEffect && (
        <div className="pt-2 space-y-4">
          {/* Сила разлета */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Сила эффекта
              </Label>
              <span className="text-sm font-medium">
                {effectStrength.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.1"
              value={effectStrength}
              onChange={(e) => setEffectStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>слабее</span>
              <span>сильнее</span>
            </div>
          </div>

          {/* Скорость возврата */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Скорость возврата
              </Label>
              <span className="text-sm font-medium">
                {((1 - returnSpeed) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="0.99"
              step="0.01"
              value={returnSpeed}
              onChange={(e) => setReturnSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>быстрее</span>
              <span>медленнее</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

