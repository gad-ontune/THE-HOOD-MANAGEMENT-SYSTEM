import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  drift: number
}

export default function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = []
    const count = 30
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 2 + 1
      const opacity = Math.random() * 0.15 + 0.1
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        opacity,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 40,
      })
    }
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brand-gold"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, p.drift, p.drift * 0.5],
            opacity: [p.opacity, p.opacity * 0.4, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
