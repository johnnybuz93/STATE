export interface SettingsProps {
  showBackHemisphere: boolean;
  setShowBackHemisphere: (value: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  interactiveEffect: boolean;
  setInteractiveEffect: (value: boolean) => void;
  effectStrength: number;
  setEffectStrength: (value: number) => void;
  returnSpeed: number;
  setReturnSpeed: (value: number) => void;
  showStats: boolean;
  setShowStats: (value: boolean) => void;
  resetToDefaults: () => void;
}

