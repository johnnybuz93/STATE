import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PerformanceStatsProps {
  showStats: boolean;
  setShowStats: (value: boolean) => void;
}

export function PerformanceStats({
  showStats,
  setShowStats,
}: PerformanceStatsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Статистика производительности</Label>
      <RadioGroup
        value={showStats ? "enabled" : "disabled"}
        onValueChange={(value) => setShowStats(value === "enabled")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="enabled" id="stats-enabled" />
          <Label
            htmlFor="stats-enabled"
            className="font-normal cursor-pointer"
          >
            показывать FPS
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disabled" id="stats-disabled" />
          <Label
            htmlFor="stats-disabled"
            className="font-normal cursor-pointer"
          >
            скрыть
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

