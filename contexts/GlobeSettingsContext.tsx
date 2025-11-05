"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GlobeSettingsContextType {
  // Основные настройки
  showBackHemisphere: boolean;
  setShowBackHemisphere: (value: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  
  // Видимость слоёв
  showPointsLayer: boolean;
  setShowPointsLayer: (value: boolean) => void;
  showCloudsLayer: boolean;
  setShowCloudsLayer: (value: boolean) => void;
  showEarthLayer: boolean;
  setShowEarthLayer: (value: boolean) => void;
  showInnerLayer: boolean;
  setShowInnerLayer: (value: boolean) => void;
  
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
  interactiveEffect: boolean;
  setInteractiveEffect: (value: boolean) => void;
  effectStrength: number;
  setEffectStrength: (value: number) => void;
  returnSpeed: number;
  setReturnSpeed: (value: number) => void;
  showStats: boolean;
  setShowStats: (value: boolean) => void;
  
  // Настройки материалов
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
  
  // VFX эффекты
  bloomEnabled: boolean;
  setBloomEnabled: (value: boolean) => void;
  bloomIntensity: number;
  setBloomIntensity: (value: number) => void;
  bloomRadius: number;
  setBloomRadius: (value: number) => void;
  chromaticAberrationEnabled: boolean;
  setChromaticAberrationEnabled: (value: boolean) => void;
  chromaticAberrationOffset: number;
  setChromaticAberrationOffset: (value: number) => void;
  depthOfFieldEnabled: boolean;
  setDepthOfFieldEnabled: (value: boolean) => void;
  depthOfFieldFocusDistance: number;
  setDepthOfFieldFocusDistance: (value: number) => void;
  depthOfFieldFocalLength: number;
  setDepthOfFieldFocalLength: (value: number) => void;
  filmGrainEnabled: boolean;
  setFilmGrainEnabled: (value: boolean) => void;
  filmGrainIntensity: number;
  setFilmGrainIntensity: (value: number) => void;
  
  resetToDefaults: () => void;
}

const GlobeSettingsContext = createContext<GlobeSettingsContextType | undefined>(undefined);

export function GlobeSettingsProvider({ children }: { children: ReactNode }) {
  // Основные настройки
  const [showBackHemisphere, setShowBackHemisphere] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  
  // Видимость слоёв
  const [showPointsLayer, setShowPointsLayer] = useState<boolean>(true);
  const [showCloudsLayer, setShowCloudsLayer] = useState<boolean>(true);
  const [showEarthLayer, setShowEarthLayer] = useState<boolean>(true);
  const [showInnerLayer, setShowInnerLayer] = useState<boolean>(true);
  
  const [showStats, setShowStats] = useState<boolean>(true);
  const [interactiveEffect, setInteractiveEffect] = useState<boolean>(true);
  const [effectStrength, setEffectStrength] = useState<number>(4.4);
  const [returnSpeed, setReturnSpeed] = useState<number>(0.92);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.002);

  // Настройки материалов
  const [cloudsOpacity, setCloudsOpacity] = useState<number>(0.25);
  const [cloudsSpeed, setCloudsSpeed] = useState<number>(3);
  const [earthOpacity, setEarthOpacity] = useState<number>(1);
  const [earthTransparency, setEarthTransparency] = useState<number>(0.1);
  const [earthMaskIntensity, setEarthMaskIntensity] = useState<number>(1);
  const [earthTextureIntensity, setEarthTextureIntensity] = useState<number>(1);
  const [nightLightsColor, setNightLightsColor] = useState<string>("#ffaa44");
  const [nightLightsIntensity, setNightLightsIntensity] = useState<number>(1);
  const [nightLightsBrightness, setNightLightsBrightness] = useState<number>(3);
  const [pointsColor, setPointsColor] = useState<string>("#ffffff");
  const [landPointsOpacity, setLandPointsOpacity] = useState<number>(0.5);
  const [landPointsSize, setLandPointsSize] = useState<number>(0.008);
  const [oceanPointsOpacity, setOceanPointsOpacity] = useState<number>(0.5);
  const [oceanPointsSize, setOceanPointsSize] = useState<number>(0.006);

  // VFX эффекты
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const [bloomIntensity, setBloomIntensity] = useState<number>(1.5);
  const [bloomRadius, setBloomRadius] = useState<number>(0.8);
  const [chromaticAberrationEnabled, setChromaticAberrationEnabled] = useState<boolean>(false);
  const [chromaticAberrationOffset, setChromaticAberrationOffset] = useState<number>(0.002);
  const [depthOfFieldEnabled, setDepthOfFieldEnabled] = useState<boolean>(false);
  const [depthOfFieldFocusDistance, setDepthOfFieldFocusDistance] = useState<number>(0);
  const [depthOfFieldFocalLength, setDepthOfFieldFocalLength] = useState<number>(0.02);
  const [filmGrainEnabled, setFilmGrainEnabled] = useState<boolean>(false);
  const [filmGrainIntensity, setFilmGrainIntensity] = useState<number>(0.3);

  const resetToDefaults = () => {
    setShowBackHemisphere(true);
    setAutoRotate(true);
    setBackgroundColor("#000000");
    setShowPointsLayer(true);
    setShowCloudsLayer(true);
    setShowEarthLayer(true);
    setShowInnerLayer(true);
    setShowStats(true);
    setInteractiveEffect(true);
    setEffectStrength(4.4);
    setReturnSpeed(0.92);
    setRotationSpeed(0.002);
    setCloudsOpacity(0.25);
    setCloudsSpeed(3);
    setEarthOpacity(1);
    setEarthTransparency(0.1);
    setEarthMaskIntensity(1);
    setEarthTextureIntensity(1);
    setNightLightsColor("#ffaa44");
    setNightLightsIntensity(1);
    setNightLightsBrightness(3);
    setPointsColor("#ffffff");
    setLandPointsOpacity(0.5);
    setLandPointsSize(0.008);
    setOceanPointsOpacity(0.5);
    setOceanPointsSize(0.006);
    setBloomEnabled(true);
    setBloomIntensity(1.5);
    setBloomRadius(0.8);
    setChromaticAberrationEnabled(false);
    setChromaticAberrationOffset(0.002);
    setDepthOfFieldEnabled(false);
    setDepthOfFieldFocusDistance(0);
    setDepthOfFieldFocalLength(0.02);
    setFilmGrainEnabled(false);
    setFilmGrainIntensity(0.3);
  };

  return (
    <GlobeSettingsContext.Provider
      value={{
        showBackHemisphere,
        setShowBackHemisphere,
        autoRotate,
        setAutoRotate,
        backgroundColor,
        setBackgroundColor,
        showPointsLayer,
        setShowPointsLayer,
        showCloudsLayer,
        setShowCloudsLayer,
        showEarthLayer,
        setShowEarthLayer,
        showInnerLayer,
        setShowInnerLayer,
        rotationSpeed,
        setRotationSpeed,
        interactiveEffect,
        setInteractiveEffect,
        effectStrength,
        setEffectStrength,
        returnSpeed,
        setReturnSpeed,
        showStats,
        setShowStats,
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
        resetToDefaults,
      }}
    >
      {children}
    </GlobeSettingsContext.Provider>
  );
}

export function useGlobeSettings() {
  const context = useContext(GlobeSettingsContext);
  if (context === undefined) {
    throw new Error("useGlobeSettings must be used within a GlobeSettingsProvider");
  }
  return context;
}

