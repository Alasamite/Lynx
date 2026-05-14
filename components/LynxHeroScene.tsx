"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Points, PointMaterial } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
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

// Stylized Lynx Head - Angular geometric interpretation
function LynxHead() {
  const groupRef = useRef<Group>(null)
  const reduced = useReducedMotion()
  
  useFrame((state) => {
    if (!groupRef.current || reduced) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = 0.15 + Math.sin(t * 0.12) * 0.08
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.03
    groupRef.current.position.y = Math.sin(t * 0.15) * 0.08
  })

  const mainMaterial = <meshStandardMaterial color="#8a8a82" roughness={0.85} metalness={0.08} flatShading />
  const darkMaterial = <meshStandardMaterial color="#4a4944" roughness={0.9} metalness={0.05} flatShading />
  const accentMaterial = <meshStandardMaterial color="#12362A" roughness={0.8} metalness={0.1} flatShading />
  const lightMaterial = <meshStandardMaterial color="#a89a7a" roughness={0.88} metalness={0.06} flatShading />

  return (
    <group ref={groupRef} position={[2.8, 0.2, 0]} scale={1.15}>
      {/* Main face - angular plane */}
      <mesh position={[0, 0, 0.1]} rotation={[0.08, 0, 0]}>
        <octahedronGeometry args={[1.1, 0]} />
        {mainMaterial}
      </mesh>
      
      {/* Left ear - tall angular */}
      <mesh position={[-0.72, 1.1, 0]} rotation={[0.1, 0.15, -0.25]} scale={[0.35, 0.8, 0.18]}>
        <tetrahedronGeometry args={[1, 0]} />
        {mainMaterial}
      </mesh>
      {/* Left ear tuft */}
      <mesh position={[-0.75, 1.45, 0.02]} rotation={[0.05, 0.1, -0.3]} scale={[0.12, 0.35, 0.08]}>
        <tetrahedronGeometry args={[1, 0]} />
        {darkMaterial}
      </mesh>
      
      {/* Right ear - tall angular */}
      <mesh position={[0.72, 1.1, 0]} rotation={[0.1, -0.15, 0.25]} scale={[0.35, 0.8, 0.18]}>
        <tetrahedronGeometry args={[1, 0]} />
        {mainMaterial}
      </mesh>
      {/* Right ear tuft */}
      <mesh position={[0.75, 1.45, 0.02]} rotation={[0.05, -0.1, 0.3]} scale={[0.12, 0.35, 0.08]}>
        <tetrahedronGeometry args={[1, 0]} />
        {darkMaterial}
      </mesh>
      
      {/* Snout - elongated octahedron */}
      <mesh position={[0, -0.25, 0.65]} rotation={[0.35, 0, 0]} scale={[0.5, 0.4, 0.6]}>
        <octahedronGeometry args={[0.8, 0]} />
        {lightMaterial}
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, -0.15, 1.0]} rotation={[0.5, 0, 0]} scale={[0.18, 0.12, 0.12]}>
        <tetrahedronGeometry args={[0.5, 0]} />
        {darkMaterial}
      </mesh>
      
      {/* Left eye socket */}
      <mesh position={[-0.38, 0.18, 0.55]} rotation={[0.15, 0.2, 0.1]} scale={[0.22, 0.15, 0.12]}>
        <octahedronGeometry args={[0.6, 0]} />
        {accentMaterial}
      </mesh>
      
      {/* Right eye socket */}
      <mesh position={[0.38, 0.18, 0.55]} rotation={[0.15, -0.2, -0.1]} scale={[0.22, 0.15, 0.12]}>
        <octahedronGeometry args={[0.6, 0]} />
        {accentMaterial}
      </mesh>
      
      {/* Cheek bones - left */}
      <mesh position={[-0.65, -0.1, 0.35]} rotation={[0.1, 0.35, 0.15]} scale={[0.4, 0.35, 0.2]}>
        <tetrahedronGeometry args={[0.7, 0]} />
        {mainMaterial}
      </mesh>
      
      {/* Cheek bones - right */}
      <mesh position={[0.65, -0.1, 0.35]} rotation={[0.1, -0.35, -0.15]} scale={[0.4, 0.35, 0.2]}>
        <tetrahedronGeometry args={[0.7, 0]} />
        {mainMaterial}
      </mesh>
      
      {/* Forehead ridge */}
      <mesh position={[0, 0.55, 0.3]} rotation={[0.25, 0, 0]} scale={[0.6, 0.25, 0.35]}>
        <octahedronGeometry args={[0.7, 0]} />
        {mainMaterial}
      </mesh>
      
      {/* Whisker area - left */}
      <mesh position={[-0.35, -0.35, 0.7]} rotation={[0.3, 0.15, 0]} scale={[0.15, 0.08, 0.08]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        {lightMaterial}
      </mesh>
      
      {/* Whisker area - right */}
      <mesh position={[0.35, -0.35, 0.7]} rotation={[0.3, -0.15, 0]} scale={[0.15, 0.08, 0.08]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        {lightMaterial}
      </mesh>
    </group>
  )
}

// Floating granite shards around the lynx
function GraniteShard({ position, scale, rotation, color = "#5a5850" }: { position: [number, number, number]; scale: number; rotation: [number, number, number]; color?: string }) {
  const ref = useRef<Mesh>(null)
  const reduced = useReducedMotion()
  const offset = useMemo(() => Math.random() * 10, [])
  
  useFrame((state) => {
    if (!ref.current || reduced) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = rotation[1] + Math.sin(t * 0.15 + offset) * 0.12
    ref.current.rotation.x = rotation[0] + Math.cos(t * 0.12 + offset) * 0.06
    ref.current.position.y = position[1] + Math.sin(t * 0.18 + offset) * 0.08
  })
  
  return (
    <Float speed={0.35} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.06, 0.06]}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.02} flatShading />
      </mesh>
    </Float>
  )
}

// Mineral dust particles
function MineralDust() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const count = 200
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i += 3) {
      // Concentrate particles around the right side
      values[i] = 1.5 + (Math.random() - 0.3) * 5
      values[i + 1] = (Math.random() - 0.5) * 4
      values[i + 2] = (Math.random() - 0.5) * 3 - 0.5
    }
    return values
  }, [])
  
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.008
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.015
  })
  
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#d4c9a8" size={0.025} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  )
}

// Chalk particles - white dust floating
function ChalkParticles() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const count = 100
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i += 3) {
      values[i] = 1 + (Math.random() - 0.4) * 6
      values[i + 1] = (Math.random() - 0.5) * 5
      values[i + 2] = (Math.random() - 0.5) * 3 - 1
    }
    return values
  }, [])
  
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = -state.clock.elapsedTime * 0.006
  })
  
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#f2efe7" size={0.015} sizeAttenuation depthWrite={false} opacity={0.35} />
    </Points>
  )
}

// Glowing forest green accent particles
function ForestGlow() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const count = 40
    const values = new Float32Array(count * 3)
    for (let i = 0; i < values.length; i += 3) {
      const angle = (i / count) * Math.PI * 2
      const r = 2.5 + Math.random() * 1.5
      values[i] = 2.8 + Math.cos(angle) * r * 0.6
      values[i + 1] = Math.sin(angle) * r * 0.4
      values[i + 2] = -0.5 + (Math.random() - 0.5) * 2
    }
    return values
  }, [])
  
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.z = state.clock.elapsedTime * 0.02
  })
  
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#1a5a45" size={0.04} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  )
}

function Scene() {
  return (
    <>
      {/* Ambient fill - subtle */}
      <ambientLight intensity={0.35} />
      
      {/* Main key light - warm chalk white from top-right */}
      <directionalLight position={[5, 6, 4]} intensity={1.2} color="#f2efe7" />
      
      {/* Fill light - soft from left */}
      <directionalLight position={[-4, 2, 3]} intensity={0.4} color="#d4c9a8" />
      
      {/* Accent rim light - forest green */}
      <pointLight position={[4, 0, -2]} intensity={1.5} color="#1a5a45" distance={10} decay={2} />
      
      {/* Warm accent from below */}
      <pointLight position={[2, -3, 2]} intensity={0.8} color="#a89a7a" distance={8} decay={2} />
      
      {/* The main lynx head */}
      <LynxHead />
      
      {/* Floating granite shards around the lynx */}
      <GraniteShard position={[4.5, 1.2, -0.8]} scale={0.35} rotation={[0.3, 0.25, -0.2]} color="#5a5850" />
      <GraniteShard position={[4.8, -0.8, -1.0]} scale={0.45} rotation={[-0.15, -0.35, 0.2]} color="#4a4944" />
      <GraniteShard position={[1.2, -1.3, -1.2]} scale={0.32} rotation={[0.2, 0.55, 0.1]} color="#6a6860" />
      <GraniteShard position={[0.8, 1.5, -1.4]} scale={0.28} rotation={[0.35, -0.25, 0.12]} color="#5a5850" />
      <GraniteShard position={[5.2, 0.3, -0.6]} scale={0.22} rotation={[-0.18, 0.45, -0.1]} color="#7a7a74" />
      <GraniteShard position={[1.5, 0.8, -0.9]} scale={0.18} rotation={[0.4, 0.3, 0.08]} color="#4a4944" />
      
      {/* Particles */}
      <MineralDust />
      <ChalkParticles />
      <ForestGlow />
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
        camera={{ position: [0, 0, 6.5], fov: 38 }} 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        style={{ pointerEvents: "none" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
