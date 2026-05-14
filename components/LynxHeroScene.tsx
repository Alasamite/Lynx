"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Points, PointMaterial } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Group, Mesh, Points as PointsType } from "three"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    }
  }, [])
  return reduced
}

function GraniteShard({ position, scale, rotation, color = "#5a5850" }: { position: [number, number, number]; scale: number; rotation: [number, number, number]; color?: string }) {
  const ref = useRef<Mesh>(null)
  const reduced = useReducedMotion()
  const offset = useMemo(() => Math.random() * 10, [])
  useFrame((state) => {
    if (!ref.current || reduced) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = rotation[1] + Math.sin(t * 0.15 + offset) * 0.08
    ref.current.rotation.x = rotation[0] + Math.cos(t * 0.12 + offset) * 0.04
    ref.current.position.y = position[1] + Math.sin(t * 0.18 + offset) * 0.06
  })
  return (
    <Float speed={0.4} rotationIntensity={0.12} floatIntensity={0.25} floatingRange={[-0.08, 0.08]}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.02} flatShading />
      </mesh>
    </Float>
  )
}

function MineralDust() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const count = 180
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i += 3) {
      const n = i / 3
      const theta = n * 0.5
      const r = 2.5 + Math.sin(n * 0.8) * 2
      values[i] = Math.sin(theta) * r + (Math.random() - 0.5) * 2
      values[i + 1] = (Math.random() - 0.5) * 3
      values[i + 2] = Math.cos(theta) * r * 0.6 + (Math.random() - 0.5)
    }
    return values
  }, [])
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.012
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.02
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#d4c9a8" size={0.022} sizeAttenuation depthWrite={false} opacity={0.55} />
    </Points>
  )
}

function ChalkParticles() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const count = 80
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 8
      values[i + 1] = (Math.random() - 0.5) * 4
      values[i + 2] = (Math.random() - 0.5) * 3 - 1
    }
    return values
  }, [])
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = -state.clock.elapsedTime * 0.008
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#f2efe7" size={0.012} sizeAttenuation depthWrite={false} opacity={0.28} />
    </Points>
  )
}

function LynxGeometry() {
  const ref = useRef<Group>(null)
  const reduced = useReducedMotion()
  useFrame((state) => {
    if (!ref.current || reduced) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = -0.28 + Math.sin(t * 0.1) * 0.06
    ref.current.position.y = 0.08 + Math.sin(t * 0.15) * 0.04
  })
  return (
    <group ref={ref} position={[2.4, 0.1, -0.5]} rotation={[0.04, -0.28, -0.06]} scale={0.58}>
      {/* Main angular form - lynx ear inspired */}
      <mesh position={[0, 0.3, 0]} rotation={[0.1, 0.12, 0.35]} scale={[1.2, 0.5, 0.14]}>
        <tetrahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#7a7a74" roughness={0.9} metalness={0.04} flatShading transparent opacity={0.78} />
      </mesh>
      {/* Left accent */}
      <mesh position={[-0.65, 0.55, 0.04]} rotation={[0.08, -0.12, -0.42]} scale={[0.42, 0.72, 0.1]}>
        <tetrahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#615f58" roughness={0.92} metalness={0.03} flatShading transparent opacity={0.68} />
      </mesh>
      {/* Right accent */}
      <mesh position={[0.62, 0.52, 0.03]} rotation={[0.06, 0.18, 0.38]} scale={[0.4, 0.68, 0.1]}>
        <tetrahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#615f58" roughness={0.92} metalness={0.03} flatShading transparent opacity={0.68} />
      </mesh>
      {/* Base form */}
      <mesh position={[0.05, -0.22, 0.04]} rotation={[0.12, 0.04, -0.06]} scale={[0.8, 0.28, 0.1]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#4a4944" roughness={0.94} metalness={0.02} flatShading transparent opacity={0.62} />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.45} />
      {/* Main key light - warm chalk white */}
      <directionalLight position={[4, 5, 4]} intensity={1.0} color="#f2efe7" />
      {/* Accent light - mineral gold */}
      <pointLight position={[-3, 2, 3]} intensity={2.2} color="#a89a7a" distance={12} decay={2} />
      {/* Subtle rim light - forest green */}
      <pointLight position={[3, -1, 2]} intensity={0.8} color="#1a4435" distance={8} decay={2} />
      
      {/* Lynx-inspired angular forms */}
      <LynxGeometry />
      
      {/* Granite shards - scattered */}
      <GraniteShard position={[3.2, 1.1, -1.2]} scale={0.42} rotation={[0.35, 0.3, -0.25]} color="#5a5850" />
      <GraniteShard position={[3.4, -0.9, -1.4]} scale={0.52} rotation={[-0.15, -0.4, 0.22]} color="#4a4944" />
      <GraniteShard position={[-2.6, -1.0, -1.5]} scale={0.38} rotation={[0.18, 0.65, 0.1]} color="#6a6860" />
      <GraniteShard position={[-3.2, 0.6, -1.8]} scale={0.28} rotation={[0.4, -0.3, 0.15]} color="#5a5850" />
      <GraniteShard position={[0.5, -1.4, -1.6]} scale={0.32} rotation={[-0.2, 0.5, -0.12]} color="#4a4944" />
      
      {/* Particles */}
      <MineralDust />
      <ChalkParticles />
    </>
  )
}

export default function LynxHeroScene() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  
  return (
    <div className="hero-three-scene" aria-hidden="true">
      <Canvas 
        camera={{ position: [0, 0, 5.8], fov: 40 }} 
        dpr={[1, 1.5]} 
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
