import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertOctagon, 
  Ruler, 
  Eye, 
  Box,
  Radio,
  Scan
} from 'lucide-react';
import { ScanResult } from '../api/types';

interface PackageBoxProps {
  scan: ScanResult | null;
  showMeasurements: boolean;
  showBarcode: boolean;
  showOcrBoxes: boolean;
  isRotating: boolean;
}

// 1. Interactive Laser Scan Line & Glowing Field
function LaserScanBeam({ scanProgress }: { scanProgress: React.MutableRefObject<number> }) {
  const lineRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    // Oscillate between +2.3 and -2.3
    const time = state.clock.elapsedTime * 0.9;
    const y = Math.sin(time) * 2.3;
    scanProgress.current = y;

    if (lineRef.current) {
      lineRef.current.position.y = y;
    }
    if (lightRef.current) {
      lightRef.current.position.y = y;
    }
  });

  return (
    <>
      <group ref={lineRef} position={[0, 0, 0.65]}>
        {/* Horizontal Laser Line */}
        <mesh>
          <planeGeometry args={[3.4, 0.03]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.85} />
        </mesh>
        {/* Soft Glow Ribbon */}
        <mesh>
          <planeGeometry args={[3.4, 0.2]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.25} />
        </mesh>
      </group>
      <pointLight ref={lightRef} position={[0, 0, 1.2]} color="#6366f1" intensity={0.4} distance={4} />
    </>
  );
}

// 2. Subtle Background Floor Grid & Floating Inspection Particles
function InspectionEnvironment() {
  const pointsCount = 45;
  const particles = useMemo(() => {
    const pos = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group>
      {/* Floor Grid with subtle blue-violet glow */}
      <gridHelper args={[24, 24, '#4f46e5', '#1e293b']} position={[0, -2.5, 0]} />

      {/* Subtle Glowing Center Base Disk */}
      <mesh position={[0, -2.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.8, 48]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Inspection Technical Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={pointsCount}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#818cf8" transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
}

// 3. Subtle Parallax Mouse Follower
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.8, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// 4. Main 3D Packaged Commodity Model
function Package3DModel({
  scan,
  showMeasurements,
  showBarcode,
  showOcrBoxes,
  isRotating
}: PackageBoxProps) {
  const meshRef = useRef<THREE.Group>(null);
  const scanProgress = useRef<number>(0);

  const hasActiveScan = Boolean(scan);
  const status = scan?.status || 'ready';
  const isCompliant = status === 'compliant';
  const isViolation = status === 'violation';

  const statusColor = !hasActiveScan
    ? '#6366f1' // indigo for ready/standby
    : isCompliant
    ? '#10b981' // emerald
    : isViolation
    ? '#ef4444' // rose
    : '#f59e0b'; // amber

  // Measured values strictly from backend
  const measuredHeight = scan?.measured_numeral_height_mm;
  const isNumeralCompliant = measuredHeight != null
    ? !scan?.violations?.some(v => v.rule_id.includes('numeral') || v.rule_id.includes('height') || v.rule_id.includes('rule_6'))
    : true;

  useFrame((state) => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.22;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.25) * 0.04 + 0.03;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main Package Commodity Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.2, 1.2]} />
        <meshStandardMaterial
          color="#0b1120"
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>

      {/* Package Outer Technical Edges / Frame Lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3.2, 4.2, 1.2)]} />
        <lineBasicMaterial color="#334155" linewidth={1} />
      </lineSegments>

      {/* 8 Technical Corner Inspection Crosshairs */}
      {[
        [-1.6, 2.1, 0.61], [1.6, 2.1, 0.61],
        [-1.6, -2.1, 0.61], [1.6, -2.1, 0.61],
        [-1.6, 2.1, -0.61], [1.6, 2.1, -0.61],
        [-1.6, -2.1, -0.61], [1.6, -2.1, -0.61]
      ].map((pos, idx) => (
        <group key={idx} position={pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={hasActiveScan ? statusColor : '#818cf8'} />
          </mesh>
        </group>
      ))}

      {/* Vertical Laser Scan Beam */}
      <LaserScanBeam scanProgress={scanProgress} />

      {/* Brand / Header Declaration Zone */}
      <group position={[0, 1.35, 0.61]}>
        <mesh>
          <planeGeometry args={[2.8, 0.75]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        {showOcrBoxes && (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[2.8, 0.75]} />
            <meshBasicMaterial color={hasActiveScan ? '#10b981' : '#6366f1'} transparent opacity={0.12} />
          </mesh>
        )}
        <Text
          position={[0, 0.1, 0.02]}
          fontSize={0.18}
          color={hasActiveScan ? '#fbbf24' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {hasActiveScan
            ? (scan?.extracted_declarations?.manufacturer_name || 'MANUFACTURER DECLARATION')
            : 'PRINCIPAL DISPLAY PANEL'}
        </Text>
        <Text
          position={[0, -0.16, 0.02]}
          fontSize={0.1}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {hasActiveScan
            ? (scan?.extracted_declarations?.generic_name || 'Packaged Commodity')
            : 'Optical Calibration Stream Standby'}
        </Text>
      </group>

      {/* Net Quantity OCR Declaration Zone */}
      <group position={[0, 0.2, 0.61]}>
        {/* OCR Target Area Box */}
        {showOcrBoxes && (
          <group>
            <mesh>
              <planeGeometry args={[2.6, 0.7]} />
              <meshBasicMaterial
                color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#6366f1'}
                transparent
                opacity={0.18}
              />
            </mesh>
            {/* Corner Bracket Markers */}
            <mesh position={[-1.25, 0.3, 0.01]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#818cf8'} />
            </mesh>
            <mesh position={[-1.25, -0.3, 0.01]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#818cf8'} />
            </mesh>
            <mesh position={[1.25, 0.3, 0.01]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#818cf8'} />
            </mesh>
            <mesh position={[1.25, -0.3, 0.01]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#818cf8'} />
            </mesh>
          </group>
        )}

        {/* Net Quantity Text */}
        <Text
          position={[-0.45, 0.05, 0.02]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {hasActiveScan ? 'Net Quantity:' : '[NET QUANTITY]'}
        </Text>
        <Text
          position={[0.5, 0.05, 0.02]}
          fontSize={0.24}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {hasActiveScan && scan?.extracted_declarations?.net_quantity_value != null
            ? `${scan.extracted_declarations.net_quantity_value}${scan.extracted_declarations.net_quantity_unit || 'g'}`
            : (hasActiveScan ? 'Declared Qty' : 'Target Region')}
        </Text>

        {/* 3D Measurement Caliper Line */}
        {showMeasurements && (
          <group position={[1.0, 0, 0.03]}>
            {/* Vertical Ruler Line */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[0.02, 0.5]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#6366f1'} />
            </mesh>
            {/* Top Tick */}
            <mesh position={[-0.05, 0.25, 0]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#6366f1'} />
            </mesh>
            {/* Bottom Tick */}
            <mesh position={[-0.05, -0.25, 0]}>
              <planeGeometry args={[0.1, 0.02]} />
              <meshBasicMaterial color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#6366f1'} />
            </mesh>
            {/* Measured Dimension Label */}
            <Text
              position={[0.35, 0, 0]}
              fontSize={0.11}
              color={hasActiveScan ? (isNumeralCompliant ? '#10b981' : '#ef4444') : '#818cf8'}
              anchorX="left"
              anchorY="middle"
            >
              {hasActiveScan && measuredHeight != null
                ? `${measuredHeight.toFixed(2)}mm`
                : 'Optical Caliper Guide'}
            </Text>
          </group>
        )}
      </group>

      {/* MRP & Compliance Declaration Zone */}
      <group position={[0, -0.55, 0.61]}>
        <Text
          position={[-0.35, 0, 0.02]}
          fontSize={0.13}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {hasActiveScan && scan?.extracted_declarations?.mrp != null
            ? `MRP ₹${scan.extracted_declarations.mrp}`
            : (hasActiveScan ? 'MRP Declared' : '[M.R.P. DECLARATION]')}
        </Text>
        <Text
          position={[0.55, 0, 0.02]}
          fontSize={0.09}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {hasActiveScan
            ? (scan?.extracted_declarations?.is_mrp_inclusive_of_taxes ? '(Incl. all taxes)' : '(Taxes unstated)')
            : 'Verification Node Ready'}
        </Text>
      </group>

      {/* Barcode Region */}
      {showBarcode && (
        <group position={[0, -1.35, 0.61]}>
          {/* Barcode Background Plate */}
          <mesh>
            <planeGeometry args={[2.4, 0.65]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Barcode Lines */}
          <group position={[-0.9, 0.05, 0.01]}>
            {Array.from({ length: 26 }).map((_, i) => (
              <mesh key={i} position={[i * 0.07, 0, 0]}>
                <planeGeometry args={[i % 3 === 0 ? 0.04 : 0.02, 0.38]} />
                <meshBasicMaterial color="#94a3b8" />
              </mesh>
            ))}
          </group>

          {/* Barcode Bounding Box Indicator */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[2.4, 0.65]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.15} />
          </mesh>

          {/* Barcode Number & Reference Text */}
          <Text
            position={[0, -0.24, 0.03]}
            fontSize={0.08}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {hasActiveScan && scan?.barcode
              ? `${scan.barcode} (GS1 Calibrated)`
              : 'GS1 Calibration Baseline: 37.29mm'}
          </Text>
        </group>
      )}

      {/* Top Width Optical Reference Caliper (When Ruler is Active) */}
      {showMeasurements && (
        <group position={[0, 2.25, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3.2, 0.015]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0.15, 0]} fontSize={0.095} color="#818cf8" anchorX="center" anchorY="middle">
            {hasActiveScan ? 'Width: 3.20 (Optical Ref)' : 'Optical Guide: Standby'}
          </Text>
        </group>
      )}

      {/* Bottom Status Glow Halo */}
      <mesh position={[0, -2.15, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.04, 32]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

interface PackageInspector3DProps {
  scan?: ScanResult | null;
  interactive?: boolean;
  className?: string;
}

export const PackageInspector3D: React.FC<PackageInspector3DProps> = ({
  scan = null,
  interactive = true,
  className = ''
}) => {
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showBarcode] = useState(true);
  const [showOcrBoxes, setShowOcrBoxes] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check WebGL support on mount
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const hasActiveScan = Boolean(scan);
  const status = scan?.status || 'ready';
  const isCompliant = status === 'compliant';
  const isViolation = status === 'violation';

  return (
    <div className={`relative rounded-3xl bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col ${className}`}>

      {/* 3D Viewport Controls & HUD Header */}
      <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white shadow-lg">
          <Box className="w-3.5 h-3.5 text-indigo-400" />
          <span>3D Package Model</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        {/* Layer Toggles */}
        {interactive && (
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-full border border-white/10 text-[11px] shadow-lg">
            <button
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                showMeasurements
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Ruler & Millimeter Calipers"
            >
              <Ruler className="w-3 h-3" />
              <span>Ruler</span>
            </button>

            <button
              onClick={() => setShowOcrBoxes(!showOcrBoxes)}
              className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                showOcrBoxes
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle OCR Detection Bounding Boxes"
            >
              <Eye className="w-3 h-3" />
              <span>OCR</span>
            </button>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded-full transition ${
                isRotating
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Continuous Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* 3D Canvas Viewport with Parallax & Environmental Studio */}
      <div className="relative w-full h-[370px] sm:h-[430px] flex items-center justify-center">
        {hasWebGL ? (
          <Canvas
            shadows
            camera={{ position: [0, 0, 7.2], fov: 45 }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            {/* Studio Lighting */}
            <ambientLight intensity={0.65} />
            <directionalLight
              position={[5, 6, 5]}
              intensity={1.1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-5, 4, -4]} intensity={0.35} />
            <pointLight position={[0, -2, 2.5]} intensity={0.6} color="#6366f1" />

            {/* Subtle Interactive Camera Mouse Parallax */}
            <CameraRig />

            {/* Industrial Inspection Environment (Floor Grid, Particles) */}
            <InspectionEnvironment />

            {/* Floating Package Entity */}
            <Float
              speed={1.4}
              rotationIntensity={0.15}
              floatIntensity={0.25}
              floatingRange={[-0.08, 0.08]}
            >
              <Package3DModel
                scan={scan}
                showMeasurements={showMeasurements}
                showBarcode={showBarcode}
                showOcrBoxes={showOcrBoxes}
                isRotating={isRotating}
              />
            </Float>

            {/* Orbit Controls (constrained to prevent disorienting flip) */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3.2}
              maxPolarAngle={Math.PI / 1.75}
              minAzimuthAngle={-Math.PI / 2.8}
              maxAzimuthAngle={Math.PI / 2.8}
            />
          </Canvas>
        ) : (
          /* 2.5D Fallback for environments without WebGL */
          <div className="relative w-64 h-84 bg-slate-900 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl flex flex-col justify-between transform perspective-container rotate-3d">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400">
                {scan?.extracted_declarations?.manufacturer_name || (hasActiveScan ? 'BRITANNIA' : 'PACKAGE COMMODITY')}
              </span>
              <p className="text-[10px] text-slate-400">
                {scan?.extracted_declarations?.generic_name || (hasActiveScan ? 'Butter Cookies' : 'Inspection Ready')}
              </p>
            </div>

            <div className="my-auto p-3 bg-slate-950 rounded-xl border border-dashed border-indigo-500/50 text-center">
              <span className="text-[10px] text-slate-400 block">Net Quantity</span>
              <span className="text-xl font-mono font-bold text-white">
                {scan?.extracted_declarations?.net_quantity_value || 100}g
              </span>
              <span className="text-[10px] text-indigo-400 font-mono block mt-1">
                {scan?.measured_numeral_height_mm ? `Measured: ${scan.measured_numeral_height_mm.toFixed(2)}mm` : 'Caliper Ready'}
              </span>
            </div>

            <div className="p-2 bg-white rounded text-center">
              <div className="font-mono text-[9px] text-slate-950 tracking-widest font-bold">
                ||| | |||| | |||
              </div>
              <span className="text-[8px] font-mono text-slate-600">
                {scan?.barcode || '8901030000001'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {hasActiveScan ? (
              isCompliant ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isViolation ? (
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )
            ) : (
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
            )}
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] font-mono">
              {hasActiveScan ? status.replace('_', ' ') : 'READY FOR INSPECTION'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
            {hasActiveScan && scan?.overall_confidence != null ? (
              <span>Confidence: <strong className="text-white">{Math.round(scan.overall_confidence * 100)}%</strong></span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <Scan className="w-3 h-3 text-indigo-400" />
                <span>Optical Stream Standby</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Click & drag to rotate • Move mouse for parallax
        </div>
      </div>
    </div>
  );
};
