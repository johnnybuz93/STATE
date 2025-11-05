'use client'

import { useRef, useMemo, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface EarthLayersProps {
  autoRotate?: boolean;
  rotationSpeed?: number;
  cloudsOpacity?: number;
  cloudsSpeed?: number;
  earthOpacity?: number;
  earthTransparency?: number;
  earthMaskIntensity?: number;
  earthTextureIntensity?: number;
  nightLightsColor?: string;
  nightLightsIntensity?: number;
  nightLightsBrightness?: number;
  showCloudsLayer?: boolean;
  showEarthLayer?: boolean;
  showInnerLayer?: boolean;
}

// Слой облаков - вращается быстрее
function CloudLayer({ 
  autoRotate = true, 
  rotationSpeed = 0.002,
  cloudsOpacity = 0.25,
  cloudsSpeed = 3,
}: EarthLayersProps) {
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Загружаем текстуру облаков
  const cloudsTexture = useLoader(THREE.TextureLoader, "/models/earth/clouds-earth.jpg");
  
  // Материал облаков с прозрачностью на основе текстуры
  const cloudsMaterial = useMemo(() => {
    // Используем alphaMap для прозрачности на основе яркости
    return new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      alphaMap: cloudsTexture, // Темные области = прозрачные, светлые = непрозрачные
      transparent: true,
      opacity: cloudsOpacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
  }, [cloudsTexture, cloudsOpacity]);

  useFrame(() => {
    if (cloudsRef.current && autoRotate) {
      // Облака вращаются быстрее земли (используем cloudsSpeed как множитель)
      cloudsRef.current.rotation.y += rotationSpeed * cloudsSpeed;
    }
  });

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[1.95, 48, 48]} />
      <primitive object={cloudsMaterial} attach="material" />
    </mesh>
  );
}

// Внутренняя черная сфера для контроля сквозной видимости
function InnerBlackSphere({ 
  earthTransparency = 0.1,
}: { earthTransparency?: number }) {
  // Прозрачность инвертирована: 1 = полностью непрозрачная (не видим сквозь), 0 = полностью прозрачная (видим сквозь)
  const opacity = 1 - earthTransparency;
  
  const blackMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: opacity,
      side: THREE.BackSide, // Видна только изнутри
      depthWrite: false,
    });
  }, [opacity]);

  return (
    <mesh>
      <sphereGeometry args={[1.85, 32, 32]} />
      <primitive object={blackMaterial} attach="material" />
    </mesh>
  );
}

// Основная земля с текстурами
function EarthSphere({ 
  autoRotate = true, 
  rotationSpeed = 0.002,
  earthOpacity = 1,
  earthMaskIntensity = 1,
  earthTextureIntensity = 1,
  nightLightsColor = "#ffaa44",
  nightLightsIntensity = 1,
  nightLightsBrightness = 3,
}: EarthLayersProps) {
  const earthRef = useRef<THREE.Group>(null);
  
  // Загружаем текстуры
  const earthTexture = useLoader(THREE.TextureLoader, "/models/earth/earth-albedo.jpg");
  const nightTexture = useLoader(THREE.TextureLoader, "/models/earth/earth-night_lights_modified.jpg");
  const rawMaskTexture = useLoader(THREE.TextureLoader, "/models/earth/earth-land-ocean-mask.jpg");
  
  // Обрабатываем маску с учётом интенсивности
  const processedMask = useMemo(() => {
    if (!rawMaskTexture.image) return rawMaskTexture;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return rawMaskTexture;
    
    canvas.width = rawMaskTexture.image.width;
    canvas.height = rawMaskTexture.image.height;
    
    ctx.drawImage(rawMaskTexture.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Применяем интенсивность маски
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const adjusted = Math.pow(gray / 255, 1 / earthMaskIntensity) * 255;
      data[i] = data[i + 1] = data[i + 2] = adjusted;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [rawMaskTexture, earthMaskIntensity]);
  
  // Материал земли
  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      alphaMap: processedMask, // Используем обработанную маску
      transparent: true,
      opacity: earthOpacity,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(nightLightsColor), // Используем выбранный цвет
      emissiveIntensity: nightLightsIntensity * nightLightsBrightness, // Умножаем интенсивность на яркость
      shininess: 5,
    });
    
    // Регулируем яркость основной текстуры через color
    const intensity = THREE.MathUtils.clamp(earthTextureIntensity, 0, 2);
    material.color.setRGB(intensity, intensity, intensity);
    
    return material;
  }, [earthTexture, nightTexture, processedMask, earthOpacity, earthTextureIntensity, nightLightsColor, nightLightsIntensity, nightLightsBrightness]);

  useFrame(() => {
    if (earthRef.current && autoRotate) {
      earthRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[1.9, 48, 48]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// Основной компонент с четырьмя слоями
export function EarthLayers({ 
  autoRotate = true, 
  rotationSpeed = 0.002,
  cloudsOpacity = 0.25,
  cloudsSpeed = 3,
  earthOpacity = 1,
  earthTransparency = 0.1,
  earthMaskIntensity = 1,
  earthTextureIntensity = 1,
  nightLightsColor = "#ffaa44",
  nightLightsIntensity = 1,
  nightLightsBrightness = 3,
  showCloudsLayer = true,
  showEarthLayer = true,
  showInnerLayer = true,
}: EarthLayersProps) {
  return (
    <Suspense fallback={null}>
      <group>
        {/* Самый внутренний слой - черная сфера для контроля сквозной видимости */}
        {showInnerLayer && <InnerBlackSphere earthTransparency={earthTransparency} />}
        
        {/* Слой земли с текстурами */}
        {showEarthLayer && (
          <EarthSphere 
            autoRotate={autoRotate} 
            rotationSpeed={rotationSpeed}
            earthOpacity={earthOpacity}
            earthMaskIntensity={earthMaskIntensity}
            earthTextureIntensity={earthTextureIntensity}
            nightLightsColor={nightLightsColor}
            nightLightsIntensity={nightLightsIntensity}
            nightLightsBrightness={nightLightsBrightness}
          />
        )}
        
        {/* Слой облаков (полупрозрачные, вращаются быстрее) */}
        {showCloudsLayer && (
          <CloudLayer 
            autoRotate={autoRotate} 
            rotationSpeed={rotationSpeed}
            cloudsOpacity={cloudsOpacity}
            cloudsSpeed={cloudsSpeed}
          />
        )}
      </group>
    </Suspense>
  );
}

