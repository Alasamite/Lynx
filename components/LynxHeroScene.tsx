"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Points, PointMaterial } from "@react-three/drei"
import { useMemo, useRef } from "react"
import type { Group, Mesh, Points as PointsType } from "three"

function useReducedMotion() {
  if (typeof window === "undefined") return true
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function StoneShard({ position, scale, rotation }: { position: [number, number, number]; scale: number; rotation: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  const reduced = useReducedMotion()
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.18 + position[0]) * 0.12
    ref.current.rotation.x = rotation[0] + Math.cos(state.clock.elapsedTime * 0.14 + position[1]) * 0.06
  })
  return (
    <Float speed={0.55} rotationIntensity={0.18} floatIntensity={0.35}>
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#615f58" roughness={0.92} metalness={0.08} flatShading />
      </mesh>
    </Float>
  )
}

function MineralDust() {
  const ref = useRef<PointsType>(null)
  const reduced = useReducedMotion()
  const positions = useMemo(() => {
    const values = new Float32Array(360)
    for (let i = 0; i < values.length; i += 3) {
      const n = i / 3
      values[i] = Math.sin(n * 12.9898) * 4.8
      values[i + 1] = Math.cos(n * 4.1414) * 2.25
      values[i + 2] = Math.sin(n * 2.718) * 2
    }
    return values
  }, [])
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.018
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#c3b58f" size={0.018} sizeAttenuation depthWrite={false} opacity={0.48} />
    </Points>
  )
}

function LynxPlanes() {
  const ref = useRef<Group>(null)
  const reduced = useReducedMotion()
  useFrame((state) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y = -0.32 + Math.sin(state.clock.elapsedTime * 0.12) * 0.08
    ref.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
  })
  const material = <meshStandardMaterial color="#8b8370" roughness={0.88} metalness={0.05} flatShading transparent opacity={0.72} />
  return (
    <group ref={ref} position={[2.15, 0.05, -0.35]} rotation={[0.05, -0.32, -0.08]} scale={0.62}>
      <mesh position={[0, 0, 0]} rotation={[0.1, 0.15, 0.4]} scale={[1.45, 0.52, 0.16]}>
        <tetrahedronGeometry args={[1.2, 0]} />
        {material}
      </mesh>
      <mesh position={[-0.72, 0.58, 0.05]} rotation={[0.1, -0.1, -0.48]} scale={[0.46, 0.82, 0.12]}>
        <tetrahedronGeometry args={[1, 0]} />
        {material}
      </mesh>
      <mesh position={[0.7, 0.56, 0.04]} rotation={[0.08, 0.2, 0.44]} scale={[0.46, 0.82, 0.12]}>
        <tetrahedronGeometry args={[1, 0]} />
        {material}
      </mesh>
      <mesh position={[0.08, -0.32, 0.05]} rotation={[0.15, 0.05, -0.08]} scale={[0.9, 0.34, 0.12]}>
        <octahedronGeometry args={[1, 0]} />
        {material}
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f2efe7" />
      <pointLight position={[-3, 1.5, 2]} intensity={2.4} color="#a89a7a" />
      <LynxPlanes />
      <StoneShard position={[3.05, 0.95, -1.0]} scale={0.48} rotation={[0.4, 0.35, -0.28]} />
      <StoneShard position={[3.15, -1.0, -1.2]} scale={0.58} rotation={[-0.18, -0.45, 0.25]} />
      <StoneShard position={[-2.8, -1.2, -1.7]} scale={0.42} rotation={[0.2, 0.7, 0.12]} />
      <MineralDust />
    </>
  )
}

export default function LynxHeroScene() {
  return (
    <div className="hero-three-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5.6], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <Scene />
      </Canvas>
    </div>
  )
}
