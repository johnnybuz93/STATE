import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HemisphereVisibilityProps {
  showBackHemisphere: boolean;
  setShowBackHemisphere: (value: boolean) => void;
}

export function HemisphereVisibility({
  showBackHemisphere,
  setShowBackHemisphere,
}: HemisphereVisibilityProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Видимость задней полусферы</Label>
      <RadioGroup
        value={showBackHemisphere ? "visible" : "hidden"}
        onValueChange={(value) => setShowBackHemisphere(value === "visible")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="visible" id="visible" />
          <Label htmlFor="visible" className="font-normal cursor-pointer">
            видна
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hidden" id="hidden" />
          <Label htmlFor="hidden" className="font-normal cursor-pointer">
            не видна
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

