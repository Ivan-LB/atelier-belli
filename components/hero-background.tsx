"use client"

import type * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import { useRef, useState } from "react"

function Stars(props: any) {
  const ref = useRef<THREE.Points>(null!)
  const [sphere] = useState(() => {
    // Genera posiciones aleatorias para las estrellas dentro de una esfera
    const positions = new Float32Array(5000 * 3)
    for (let i = 0; i < 5000; i++) {
      const r = 4.5 + Math.random() * 2
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      positions.set([x, y, z], i * 3)
    }
    return positions
  })

  useFrame((state, delta) => {
    // Rotación sutil de las estrellas
    ref.current.rotation.x -= delta / 20
    ref.current.rotation.y -= delta / 25
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffa0e0" // Un rosa que complementa el gradiente
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  )
}
