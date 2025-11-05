"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";

interface GlobePoint {
  position: [number, number, number];
  color: string;
  type: "land" | "ocean";
  originalPosition?: [number, number, number];
  velocity?: THREE.Vector3;
  offset?: THREE.Vector3;
}

interface GlobeProps {
  showBackHemisphere: boolean;
  autoRotate?: boolean;
  backgroundColor?: string;
  showStats?: boolean;
  interactiveEffect?: boolean;
  effectStrength?: number;
  returnSpeed?: number;
  rotationSpeed?: number;
}

interface RawPoint {
  lon: number;
  lat: number;
  type: string;
}

interface GlobeData {
  meta: {
    landDotsColor: string;
    oceanDotsColor?: string;
  };
  points: RawPoint[];
}

// Конвертируем координаты lon/lat в 3D позиции на сфере
function convertToSpherePosition(
  lon: number,
  lat: number,
  radius: number = 2
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

// Загружаем и обрабатываем данные из JSON
async function loadGlobePoints(): Promise<GlobePoint[]> {
  try {
    const response = await fetch("/data/globe-points.json");
    const data: GlobeData = await response.json();

    const landPoints = data.points
      .filter((point) => point.type === "land")
      .map((point) => ({
        position: convertToSpherePosition(point.lon, point.lat),
        color: data.meta.landDotsColor || "#ffffff",
        type: "land" as const,
      }));

    // Океан - все точки для максимальной плотности
    const oceanPoints = data.points
      .filter((point) => point.type === "ocean")
      .map((point) => ({
        position: convertToSpherePosition(point.lon, point.lat),
        color: data.meta.oceanDotsColor || "#ffffff",
        type: "ocean" as const,
      }));

    console.log(
      `Loaded ${landPoints.length} land points, ${oceanPoints.length} ocean points`
    );

    return [...landPoints, ...oceanPoints];
  } catch (error) {
    console.error("Error loading globe points:", error);
    return [];
  }
}

function GlobePoints({
  points,
  showBackHemisphere,
  backgroundColor = "#000000",
  globeRotation,
  cameraPosition,
  interactiveEffect = false,
  mouseVelocity,
  effectStrength = 1,
  returnSpeed = 0.92,
}: {
  points: GlobePoint[];
  showBackHemisphere: boolean;
  backgroundColor?: string;
  globeRotation?: THREE.Euler;
  cameraPosition?: THREE.Vector3;
  interactiveEffect?: boolean;
  mouseVelocity?: THREE.Vector2;
  effectStrength?: number;
  returnSpeed?: number;
}) {
  const pointsRef = useRef<THREE.Group>(null);
  // Определяем яркость цвета для выбора контрастного цвета точек
  const getContrastColor = (hexColor: string) => {
    // Конвертируем hex в RGB
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Вычисляем яркость (luminance)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Если фон светлый, возвращаем тёмные точки, иначе светлые
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const pointColor = getContrastColor(backgroundColor);

  // Инициализируем offset для каждой точки
  const [pointOffsets, setPointOffsets] = useState<Map<number, THREE.Vector3>>(
    () => new Map()
  );

  // Анимация разлетания и возврата точек
  useFrame(() => {
    if (!interactiveEffect || !mouseVelocity) return;

    const velocityMagnitude = mouseVelocity.length();

    if (velocityMagnitude > 0.01) {
      // Применяем смещение к точкам
      setPointOffsets((prev) => {
        const newOffsets = new Map(prev);

        points.forEach((_, index) => {
          const currentOffset = prev.get(index) || new THREE.Vector3(0, 0, 0);

          // Случайное смещение на основе velocity мыши
          const randomFactor = (Math.random() - 0.5) * 2;
          const force = new THREE.Vector3(
            mouseVelocity.x * randomFactor * 0.3 * effectStrength,
            mouseVelocity.y * randomFactor * 0.3 * effectStrength,
            randomFactor * 0.1 * effectStrength
          );

          currentOffset.add(force);
          newOffsets.set(index, currentOffset);
        });

        return newOffsets;
      });
    }

    // Возврат точек к исходным позициям
    setPointOffsets((prev) => {
      const newOffsets = new Map(prev);
      let hasChanges = false;

      prev.forEach((offset, index) => {
        if (offset.length() > 0.001) {
          // Плавный возврат с damping (чем ближе к 1, тем медленнее)
          offset.multiplyScalar(returnSpeed);
          newOffsets.set(index, offset);
          hasChanges = true;
        } else if (offset.length() > 0) {
          newOffsets.set(index, new THREE.Vector3(0, 0, 0));
        }
      });

      return hasChanges ? newOffsets : prev;
    });
  });

  // Фильтруем точки с учётом позиции камеры и вращения глобуса
  const visiblePoints = useMemo(() => {
    if (showBackHemisphere) return points;

    if (!globeRotation || !cameraPosition) return points;

    // Фильтруем точки, учитывая вращение глобуса и позицию камеры
    return points.filter((point) => {
      const pointPos = new THREE.Vector3(...point.position);

      // Применяем вращение глобуса к позиции точки
      pointPos.applyEuler(globeRotation);

      // Вектор от центра сферы к точке (после вращения)
      const pointVector = pointPos.clone().normalize();

      // Вектор от центра сферы к камере
      const cameraVector = cameraPosition.clone().normalize();

      // Скалярное произведение - если > 0, точка на видимой стороне
      const dotProduct = pointVector.dot(cameraVector);

      return dotProduct > 0;
    });
  }, [points, showBackHemisphere, globeRotation, cameraPosition]);

  // Оптимизация: переиспользуем геометрию и материалы
  const landGeometry = useMemo(() => new THREE.SphereGeometry(0.01, 6, 6), []);
  const oceanGeometry = useMemo(
    () => new THREE.SphereGeometry(0.009, 6, 6),
    []
  );
  const landMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: pointColor,
        transparent: true,
        opacity: 0.9,
      }),
    [pointColor]
  );
  const oceanMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: pointColor,
        transparent: true,
        opacity: 0.5,
      }),
    [pointColor]
  );

  return (
    <group ref={pointsRef}>
      {visiblePoints.map((point, index) => {
        const isOcean = point.type === "ocean";
        const geometry = isOcean ? oceanGeometry : landGeometry;
        const material = isOcean ? oceanMaterial : landMaterial;

        // Применяем offset для интерактивного эффекта
        const offset = pointOffsets.get(index) || new THREE.Vector3(0, 0, 0);
        const finalPosition: [number, number, number] = [
          point.position[0] + offset.x,
          point.position[1] + offset.y,
          point.position[2] + offset.z,
        ];

        return (
          <mesh
            key={index}
            position={finalPosition}
            geometry={geometry}
            material={material}
          />
        );
      })}
    </group>
  );
}

function Globe3D({
  showBackHemisphere,
  autoRotate = true,
  backgroundColor = "#000000",
  showStats = false,
  interactiveEffect = false,
  effectStrength = 1,
  returnSpeed = 0.92,
  rotationSpeed = 0.002,
}: GlobeProps) {
  const globeRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState<THREE.Euler | null>(null);
  const [cameraPos, setCameraPos] = useState<THREE.Vector3 | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Отслеживание движения мыши для интерактивного эффекта
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const lastMousePos = useRef(new THREE.Vector2(0, 0));
  const [mouseVelocity, setMouseVelocity] = useState(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);

  useEffect(() => {
    loadGlobePoints().then((loadedPoints) => {
      setPoints(loadedPoints);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Определяем мобильное устройство и обновляем при resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (!interactiveEffect) {
      return () => window.removeEventListener('resize', checkMobile);
    }

    // Отслеживание свайпа мышью
    const handleMouseDown = () => {
      isDragging.current = true;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      mousePos.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
    };

    // Отслеживание свайпа пальцем (touch)
    const handleTouchStart = () => {
      isDragging.current = true;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging.current || event.touches.length === 0) return;
      const touch = event.touches[0];
      mousePos.current.set(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [interactiveEffect]);

  useFrame(({ camera }) => {
    if (globeRef.current) {
      if (autoRotate) {
        globeRef.current.rotation.y += rotationSpeed;
      }
      // Обновляем rotation и позицию камеры для фильтрации точек
      setRotation(globeRef.current.rotation.clone());
      setCameraPos(camera.position.clone());
    }

    // Адаптивная позиция камеры при изменении размера окна
    if (controlsRef.current) {
      const targetDistance = isMobile ? 10 : 7;
      const currentDistance = camera.position.length();
      
      // Плавно изменяем дистанцию камеры, сохраняя направление
      if (Math.abs(currentDistance - targetDistance) > 0.1) {
        const direction = camera.position.clone().normalize();
        const newDistance = currentDistance + (targetDistance - currentDistance) * 0.1;
        camera.position.copy(direction.multiplyScalar(newDistance));
        
        // Обновляем OrbitControls
        controlsRef.current.update();
      }
      
      // Убедимся, что target OrbitControls всегда в центре
      if (controlsRef.current.target) {
        const target = controlsRef.current.target;
        if (target.x !== 0 || target.y !== 0 || target.z !== 0) {
          target.set(0, 0, 0);
          controlsRef.current.update();
        }
      }
    }

    // Вычисляем velocity мыши для интерактивного эффекта
    if (interactiveEffect && isDragging.current) {
      const velocity = new THREE.Vector2(
        mousePos.current.x - lastMousePos.current.x,
        mousePos.current.y - lastMousePos.current.y
      );
      setMouseVelocity(velocity);
      lastMousePos.current.copy(mousePos.current);
    } else if (interactiveEffect && !isDragging.current) {
      // Сброс velocity когда отпустили
      setMouseVelocity(new THREE.Vector2(0, 0));
    }
  });

  if (loading || points.length === 0) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Группа для вращения только точек */}
      <group ref={globeRef}>
        <GlobePoints
          points={points}
          showBackHemisphere={showBackHemisphere}
          backgroundColor={backgroundColor}
          globeRotation={rotation || undefined}
          cameraPosition={cameraPos || undefined}
          interactiveEffect={interactiveEffect}
          mouseVelocity={mouseVelocity}
          effectStrength={effectStrength}
          returnSpeed={returnSpeed}
        />
      </group>

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={15}
        autoRotate={false}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Статистика FPS */}
      {showStats && <Stats />}
    </>
  );
}

export default function GlobeCanvas({
  showBackHemisphere = true,
  autoRotate = true,
  backgroundColor = "#000000",
  showStats = false,
  interactiveEffect = false,
  effectStrength = 1,
  returnSpeed = 0.92,
  rotationSpeed = 0.002,
}: {
  showBackHemisphere?: boolean;
  autoRotate?: boolean;
  backgroundColor?: string;
  showStats?: boolean;
  interactiveEffect?: boolean;
  effectStrength?: number;
  returnSpeed?: number;
  rotationSpeed?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bgColor = backgroundColor;

  if (!mounted) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: bgColor }}
      >
        <div className="text-muted-foreground text-xl">Загрузка глобуса...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ background: bgColor, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        resize={{ 
          scroll: false, 
          debounce: { scroll: 50, resize: 50 },
          offsetSize: true
        }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance", // Аппаратное ускорение
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]} // Ограничиваем pixel ratio для производительности
        performance={{ min: 0.5 }} // Автоматическая деградация качества при низком FPS
        frameloop="always"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: bgColor,
        }}
      >
        <color attach="background" args={[bgColor]} />
        <Globe3D
          showBackHemisphere={showBackHemisphere}
          autoRotate={autoRotate}
          backgroundColor={backgroundColor}
          showStats={showStats}
          interactiveEffect={interactiveEffect}
          effectStrength={effectStrength}
          returnSpeed={returnSpeed}
          rotationSpeed={rotationSpeed}
        />
      </Canvas>
    </div>
  );
}
