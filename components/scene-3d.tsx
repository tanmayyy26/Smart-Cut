
"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

// Flowing gradient particles with organic motion
function FluidParticles() {
  const count = 400
  const meshRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 25
      positions[i + 1] = (Math.random() - 0.5) * 25
      positions[i + 2] = (Math.random() - 0.5) * 25
    }
    return { positions }
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      timeRef.current += 0.002
      const posAttr = meshRef.current.geometry.getAttribute("position") as THREE.BufferAttribute
      const pos = posAttr.array as Float32Array

      for (let i = 0; i < pos.length; i += 3) {
        const idx = i / 3
        const wave = Math.sin(idx * 0.05 + timeRef.current) * 2
        pos[i + 1] += Math.sin(timeRef.current + idx * 0.1) * 0.05
        pos[i] += Math.cos(timeRef.current + idx * 0.08) * 0.03
        
        // Wrap around boundaries
        if (pos[i + 1] > 15) pos[i + 1] = -15
        if (pos[i + 1] < -15) pos[i + 1] = 15
      }
      
      posAttr.needsUpdate = true
      meshRef.current.rotation.z = timeRef.current * 0.05
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#A3C9A8"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        fog={false}
      />
    </points>
  )
}

// Rotating gradient mesh
function GradientMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[5, 6]} />
      <meshPhongMaterial
        color="#C7E8C5"
        emissive="#A3C9A8"
        emissiveIntensity={0.2}
        wireframe={true}
        opacity={0.3}
        transparent
      />
    </mesh>
  )
}

// Orbiting rings
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.3
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <lineSegments key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from({ length: 64 }, (_, idx) => {
                    const angle = (idx / 64) * Math.PI * 2
                    const radius = 4 + i * 1.5
                    return [
                      Math.cos(angle) * radius,
                      Math.sin(angle) * (i % 2 === 0 ? radius : radius * 0.7),
                      Math.sin(angle * 0.5) * radius * 0.5,
                    ]
                  }).flat(),
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={i === 0 ? "#A3C9A8" : i === 1 ? "#C7E8C5" : "#7ee5c7"}
            opacity={0.5 + i * 0.15}
            transparent
            linewidth={1}
          />
        </lineSegments>
      ))}
    </group>
  )
}

// Pulsing central sphere
function PulsingCore() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      sphereRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#A3C9A8" transparent opacity={0.1} />
    </mesh>
  )
}

// Rotating wireframe cube with glow effect
function RotatingWireframeCube({ color = "#A3C9A8", speed = 1, size = 4 }) {
  const group = useRef<THREE.Group>(null)
  const edges = useMemo(() => {
    const geometry = new THREE.BoxGeometry(size, size, size)
    return new THREE.EdgesGeometry(geometry)
  }, [size])
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.5 * speed
      group.current.rotation.y = state.clock.elapsedTime * 0.7 * speed
      group.current.rotation.z = state.clock.elapsedTime * 0.3 * speed
    }
  })
  
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial 
          color={color} 
          opacity={0.9} 
          transparent 
          linewidth={2}
        />
      </lineSegments>
    </group>
  )
}

// Rotating sphere with wireframe effect
function RotatingSphere({ color = "#C7E8C5", speed = 0.7, size = 2 }) {
  const group = useRef<THREE.Group>(null)
  const edges = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(size, 4)
    return new THREE.EdgesGeometry(geometry)
  }, [size])
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.3 * speed
      group.current.rotation.y = state.clock.elapsedTime * 0.5 * speed
      group.current.rotation.z = state.clock.elapsedTime * 0.2 * speed
    }
  })
  
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial 
          color={color} 
          opacity={0.8} 
          transparent 
          linewidth={1.5}
        />
      </lineSegments>
    </group>
  )
}

// Torus rotating at different axis
function RotatingTorus({ color = "#A3C9A8", speed = 0.4, majorRadius = 3, minorRadius = 0.8 }) {
  const group = useRef<THREE.Group>(null)
  const edges = useMemo(() => {
    const geometry = new THREE.TorusGeometry(majorRadius, minorRadius, 16, 32)
    return new THREE.EdgesGeometry(geometry)
  }, [majorRadius, minorRadius])
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = state.clock.elapsedTime * 0.3 * speed
      group.current.rotation.y = state.clock.elapsedTime * 0.4 * speed
    }
  })
  
  return (
    <group ref={group}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial 
          color={color} 
          opacity={0.7} 
          transparent 
          linewidth={1}
        />
      </lineSegments>
    </group>
  )
}



export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0" style={{ opacity: 0.7 }}>
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={1} color="#A3C9A8" />
        <pointLight position={[-20, -20, -20]} intensity={0.6} color="#C7E8C5" />
        <pointLight position={[10, 0, 15]} intensity={0.8} color="#7ee5c7" decay={2} />
        
        {/* Fluid flowing particles */}
        <FluidParticles />
        
        {/* Orbital rings */}
        <OrbitalRings />
        
        {/* Pulsing core */}
        <PulsingCore />
        
        {/* Gradient mesh */}
        <GradientMesh />
      </Canvas>
    </div>
  )
}
