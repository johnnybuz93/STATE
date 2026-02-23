"use client";

import { useRef, useMemo, useEffect, useState, ReactElement } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import * as THREE from "three";
import { EarthLayers } from "./EarthLayers";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

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
  showPointsLayer?: boolean;
  showCloudsLayer?: boolean;
  showEarthLayer?: boolean;
  showInnerLayer?: boolean;
  interactiveEffect?: boolean;
  effectStrength?: number;
  returnSpeed?: number;
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
  pointsColor?: string;
  landPointsOpacity?: number;
  landPointsSize?: number;
  oceanPointsOpacity?: number;
  oceanPointsSize?: number;
  bloomEnabled?: boolean;
  bloomIntensity?: number;
  bloomRadius?: number;
  chromaticAberrationEnabled?: boolean;
  chromaticAberrationOffset?: number;
  depthOfFieldEnabled?: boolean;
  depthOfFieldFocusDistance?: number;
  depthOfFieldFocalLength?: number;
  filmGrainEnabled?: boolean;
  filmGrainIntensity?: number;
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

function convertToSpherePosition(lon: number, lat: number, radius: number = 2): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

async function loadGlobePoints(): Promise<GlobePoint[]> {
  try {
    const response = await fetch("/data/globe-points.json");
    const data: GlobeData = await response.json();
    const landPoints = data.points.filter((p) => p.type === "land").map((p) => ({
      position: convertToSpherePosition(p.lon, p.lat),
      color: data.meta.landDotsColor || "#ffffff",
      type: "land" as const,
    }));
    const oceanPoints = data.points.filter((p) => p.type === "ocean").map((p) => ({
      position: convertToSpherePosition(p.lon, p.lat),
      color: data.meta.oceanDotsColor || "#ffffff",
      type: "ocean" as const,
    }));
    console.log(`Loaded ${landPoints.length} land points, ${oceanPoints.length} ocean points`);
    return [...landPoints, ...oceanPoints];
  } catch (error) {
    console.error("Error loading globe points:", error);
    return [];
  }
}

function GlobePoints({ points, showBackHemisphere, backgroundColor = "#000000", globeRotation, cameraPosition, interactiveEffect = false, mouseVelocity, effectStrength = 4.4, returnSpeed = 0.92, pointsColor = "#ffffff", landPointsOpacity = 0.5, landPointsSize = 0.008, oceanPointsOpacity = 0.5, oceanPointsSize = 0.006 }: { points: GlobePoint[]; showBackHemisphere: boolean; backgroundColor?: string; globeRotation?: THREE.Euler; cameraPosition?: THREE.Vector3; interactiveEffect?: boolean; mouseVelocity?: THREE.Vector2; effectStrength?: number; returnSpeed?: number; pointsColor?: string; landPointsOpacity?: number; landPointsSize?: number; oceanPointsOpacity?: number; oceanPointsSize?: number; }) {
  const pointsRef = useRef<THREE.Group>(null);
  const [pointOffsets, setPointOffsets] = useState<Map<number, THREE.Vector3>>(() => new Map());

  useFrame(() => {
    if (!interactiveEffect || !mouseVelocity) return;
    const velocityMagnitude = mouseVelocity.length();
    if (velocityMagnitude > 0.01) {
      setPointOffsets((prev) => {
        const newOffsets = new Map(prev);
        points.forEach((_, index) => {
          const currentOffset = prev.get(index) || new THREE.Vector3(0, 0, 0);
          const randomFactor = (Math.random() - 0.5) * 2;
          const force = new THREE.Vector3(mouseVelocity.x * randomFactor * 0.3 * effectStrength, mouseVelocity.y * randomFactor * 0.3 * effectStrength, randomFactor * 0.1 * effectStrength);
          currentOffset.add(force);
          newOffsets.set(index, currentOffset);
        });
        return newOffsets;
      });
    }
    setPointOffsets((prev) => {
      const newOffsets = new Map(prev);
      let hasChanges = false;
      prev.forEach((offset, index) => {
        if (offset.length() > 0.001) { offset.multiplyScalar(returnSpeed); newOffsets.set(index, offset); hasChanges = true; }
        else if (offset.length() > 0) { newOffsets.set(index, new THREE.Vector3(0, 0, 0)); }
      });
      return hasChanges ? newOffsets : prev;
    });
  });

  const visiblePoints = useMemo(() => {
    if (showBackHemisphere) return points;
    if (!globeRotation || !cameraPosition) return points;
    return points.filter((point) => {
      const pointPos = new THREE.Vector3(...point.position);
      pointPos.applyEuler(globeRotation);
      return pointPos.clone().normalize().dot(cameraPosition.clone().normalize()) > 0;
    });
  }, [points, showBackHemisphere, globeRotation, cameraPosition]);

  const landGeometry = useMemo(() => new THREE.SphereGeometry(landPointsSize, 6, 6), [landPointsSize]);
  const oceanGeometry = useMemo(() => new THREE.SphereGeometry(oceanPointsSize, 6, 6), [oceanPointsSize]);
  const landMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: pointsColor, transparent: true, opacity: landPointsOpacity }), [pointsColor, landPointsOpacity]);
  const oceanMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: pointsColor, transparent: true, opacity: oceanPointsOpacity }), [pointsColor, oceanPointsOpacity]);

  return (
    <group ref={pointsRef}>
      {visiblePoints.map((point, index) => {
        const isOcean = point.type === "ocean";
        const offset = pointOffsets.get(index) || new THREE.Vector3(0, 0, 0);
        return <mesh key={index} position={[point.position[0] + offset.x, point.position[1] + offset.y, point.position[2] + offset.z]} geometry={isOcean ? oceanGeometry : landGeometry} material={isOcean ? oceanMaterial : landMaterial} />;
      })}
    </group>
  );
}

// Controls component that binds to canvas domElement only - fixes click interception
function Controls({ controlsRef, ...props }: any) {
  const { gl } = useThree();
  return <OrbitControls ref={controlsRef} domElement={gl.domElement} {...props} />;
}

function Globe3D({ showBackHemisphere, autoRotate = true, backgroundColor = "#000000", showStats = false, showPointsLayer = true, showCloudsLayer = true, showEarthLayer = true, showInnerLayer = true, interactiveEffect = false, effectStrength = 4.4, returnSpeed = 0.92, rotationSpeed = 0.002, cloudsOpacity = 0.25, cloudsSpeed = 3, earthOpacity = 1, earthTransparency = 0.1, earthMaskIntensity = 1, earthTextureIntensity = 1, nightLightsColor = "#ffaa44", nightLightsIntensity = 1, nightLightsBrightness = 3, pointsColor = "#ffffff", landPointsOpacity = 0.5, landPointsSize = 0.008, oceanPointsOpacity = 0.5, oceanPointsSize = 0.006, bloomEnabled = true, bloomIntensity = 1.5, bloomRadius = 0.8, chromaticAberrationEnabled = false, chromaticAberrationOffset = 0.002, depthOfFieldEnabled = false, depthOfFieldFocusDistance = 0, depthOfFieldFocalLength = 0.02, filmGrainEnabled = false, filmGrainIntensity = 0.3 }: GlobeProps) {
  const globeRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const rotationRef = useRef<THREE.Group>(null);
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState<THREE.Euler | null>(null);
  const [cameraPos, setCameraPos] = useState<THREE.Vector3 | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const lastMousePos = useRef(new THREE.Vector2(0, 0));
  const [mouseVelocity, setMouseVelocity] = useState(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);

  useEffect(() => { loadGlobePoints().then((lp) => { setPoints(lp); setLoading(false); }); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (!interactiveEffect) return () => window.removeEventListener('resize', checkMobile);
    const onDown = () => { isDragging.current = true; };
    const onUp = () => { isDragging.current = false; };
    const onMove = (e: MouseEvent) => { if (!isDragging.current) return; mousePos.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); };
    const onTStart = () => { isDragging.current = true; };
    const onTEnd = () => { isDragging.current = false; };
    const onTMove = (e: TouchEvent) => { if (!isDragging.current || !e.touches.length) return; const t = e.touches[0]; mousePos.current.set((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1); };
    window.addEventListener("mousedown", onDown); window.addEventListener("mouseup", onUp); window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onTStart); window.addEventListener("touchend", onTEnd); window.addEventListener("touchmove", onTMove);
    return () => { window.removeEventListener('resize', checkMobile); window.removeEventListener("mousedown", onDown); window.removeEventListener("mouseup", onUp); window.removeEventListener("mousemove", onMove); window.removeEventListener("touchstart", onTStart); window.removeEventListener("touchend", onTEnd); window.removeEventListener("touchmove", onTMove); };
  }, [interactiveEffect]);

  const [baseRotation, setBaseRotation] = useState<number>(0);

  useFrame(({ camera }) => {
    if (rotationRef.current) {
      if (autoRotate) rotationRef.current.rotation.y += rotationSpeed;
      setBaseRotation(rotationRef.current.rotation.y);
      if (globeRef.current) globeRef.current.rotation.y = rotationRef.current.rotation.y;
      setRotation(rotationRef.current.rotation.clone());
      setCameraPos(camera.position.clone());
    }
    if (controlsRef.current) {
      const td = isMobile ? 10 : 7; const cd = camera.position.length();
      if (Math.abs(cd - td) > 0.1) { camera.position.copy(camera.position.clone().normalize().multiplyScalar(cd + (td - cd) * 0.1)); controlsRef.current.update(); }
      if (controlsRef.current.target) { const t = controlsRef.current.target; if (t.x || t.y || t.z) { t.set(0,0,0); controlsRef.current.update(); } }
    }
    if (interactiveEffect && isDragging.current) { setMouseVelocity(new THREE.Vector2(mousePos.current.x - lastMousePos.current.x, mousePos.current.y - lastMousePos.current.y)); lastMousePos.current.copy(mousePos.current); }
    else if (interactiveEffect) { setMouseVelocity(new THREE.Vector2(0, 0)); }
  });

  if (loading || points.length === 0) return null;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#4488ff" />
      <group ref={rotationRef} visible={false} />
      <EarthLayers autoRotate={autoRotate} rotationSpeed={rotationSpeed} cloudsOpacity={cloudsOpacity} cloudsSpeed={cloudsSpeed} earthOpacity={earthOpacity} earthTransparency={earthTransparency} earthMaskIntensity={earthMaskIntensity} earthTextureIntensity={earthTextureIntensity} nightLightsColor={nightLightsColor} nightLightsIntensity={nightLightsIntensity} nightLightsBrightness={nightLightsBrightness} showCloudsLayer={showCloudsLayer} showEarthLayer={showEarthLayer} showInnerLayer={showInnerLayer} baseRotation={baseRotation} />
      {showPointsLayer && (<group ref={globeRef}><GlobePoints points={points} showBackHemisphere={showBackHemisphere} backgroundColor={backgroundColor} globeRotation={rotation || undefined} cameraPosition={cameraPos || undefined} interactiveEffect={interactiveEffect} mouseVelocity={mouseVelocity} effectStrength={effectStrength} returnSpeed={returnSpeed} pointsColor={pointsColor} landPointsOpacity={landPointsOpacity} landPointsSize={landPointsSize} oceanPointsOpacity={oceanPointsOpacity} oceanPointsSize={oceanPointsSize} /></group>)}
      <Controls controlsRef={controlsRef} enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} autoRotate={false} target={[0,0,0]} enableDamping={true} dampingFactor={0.05} />
      {showStats && <Stats />}
      {(() => {
        const effects = [
          bloomEnabled && <Bloom key="bloom" intensity={bloomIntensity} luminanceThreshold={0.2} luminanceSmoothing={0.9} radius={bloomRadius} mipmapBlur />,
          chromaticAberrationEnabled && <ChromaticAberration key="chromatic" offset={new THREE.Vector2(chromaticAberrationOffset, chromaticAberrationOffset)} blendFunction={BlendFunction.NORMAL} />,
          depthOfFieldEnabled && <DepthOfField key="dof" focusDistance={depthOfFieldFocusDistance} focalLength={depthOfFieldFocalLength} bokehScale={2} height={480} />,
          filmGrainEnabled && <Noise key="noise" opacity={filmGrainIntensity} blendFunction={BlendFunction.OVERLAY} />,
        ].filter((e): e is ReactElement => Boolean(e));
        return effects.length > 0 ? <EffectComposer multisampling={0}>{effects}</EffectComposer> : null;
      })()}
    </>
  );
}

export default function GlobeCanvas({
  showBackHemisphere = true, autoRotate = true, backgroundColor = "#000000", showStats = false, showPointsLayer = true, showCloudsLayer = true, showEarthLayer = true, showInnerLayer = true, interactiveEffect = false, effectStrength = 4.4, returnSpeed = 0.92, rotationSpeed = 0.002, cloudsOpacity = 0.25, cloudsSpeed = 3, earthOpacity = 1, earthTransparency = 0.1, earthMaskIntensity = 1, earthTextureIntensity = 1, nightLightsColor = "#ffaa44", nightLightsIntensity = 1, nightLightsBrightness = 3, pointsColor = "#ffffff", landPointsOpacity = 0.5, landPointsSize = 0.008, oceanPointsOpacity = 0.5, oceanPointsSize = 0.006, bloomEnabled = true, bloomIntensity = 1.5, bloomRadius = 0.8, chromaticAberrationEnabled = false, chromaticAberrationOffset = 0.002, depthOfFieldEnabled = false, depthOfFieldFocusDistance = 0, depthOfFieldFocalLength = 0.02, filmGrainEnabled = false, filmGrainIntensity = 0.3,
}: {
  showBackHemisphere?: boolean; autoRotate?: boolean; backgroundColor?: string; showStats?: boolean; showPointsLayer?: boolean; showCloudsLayer?: boolean; showEarthLayer?: boolean; showInnerLayer?: boolean; interactiveEffect?: boolean; effectStrength?: number; returnSpeed?: number; rotationSpeed?: number; cloudsOpacity?: number; cloudsSpeed?: number; earthOpacity?: number; earthTransparency?: number; earthMaskIntensity?: number; earthTextureIntensity?: number; nightLightsColor?: string; nightLightsIntensity?: number; nightLightsBrightness?: number; pointsColor?: string; landPointsOpacity?: number; landPointsSize?: number; oceanPointsOpacity?: number; oceanPointsSize?: number; bloomEnabled?: boolean; bloomIntensity?: number; bloomRadius?: number; chromaticAberrationEnabled?: boolean; chromaticAberrationOffset?: number; depthOfFieldEnabled?: boolean; depthOfFieldFocusDistance?: number; depthOfFieldFocalLength?: number; filmGrainEnabled?: boolean; filmGrainIntensity?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: backgroundColor }}>
        <div className="text-muted-foreground text-xl">Загрузка глобуса...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ background: backgroundColor, position: 'relative', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 }, offsetSize: true }}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance", stencil: false, depth: true }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop="always"
        style={{ width: "100%", height: "100%", display: "block", background: backgroundColor, pointerEvents: 'auto' }}
      >
        <color attach="background" args={[backgroundColor]} />
        <Globe3D showBackHemisphere={showBackHemisphere} autoRotate={autoRotate} backgroundColor={backgroundColor} showStats={showStats} showPointsLayer={showPointsLayer} showCloudsLayer={showCloudsLayer} showEarthLayer={showEarthLayer} showInnerLayer={showInnerLayer} interactiveEffect={interactiveEffect} effectStrength={effectStrength} returnSpeed={returnSpeed} rotationSpeed={rotationSpeed} cloudsOpacity={cloudsOpacity} cloudsSpeed={cloudsSpeed} earthOpacity={earthOpacity} earthTransparency={earthTransparency} earthMaskIntensity={earthMaskIntensity} earthTextureIntensity={earthTextureIntensity} nightLightsColor={nightLightsColor} nightLightsIntensity={nightLightsIntensity} nightLightsBrightness={nightLightsBrightness} pointsColor={pointsColor} landPointsOpacity={landPointsOpacity} landPointsSize={landPointsSize} oceanPointsOpacity={oceanPointsOpacity} oceanPointsSize={oceanPointsSize} bloomEnabled={bloomEnabled} bloomIntensity={bloomIntensity} bloomRadius={bloomRadius} chromaticAberrationEnabled={chromaticAberrationEnabled} chromaticAberrationOffset={chromaticAberrationOffset} depthOfFieldEnabled={depthOfFieldEnabled} depthOfFieldFocusDistance={depthOfFieldFocusDistance} depthOfFieldFocalLength={depthOfFieldFocalLength} filmGrainEnabled={filmGrainEnabled} filmGrainIntensity={filmGrainIntensity} />
      </Canvas>
    </div>
  );
}
