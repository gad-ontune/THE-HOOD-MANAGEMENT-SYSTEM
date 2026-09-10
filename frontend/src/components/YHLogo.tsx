import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'

interface YHLogoProps {
  size?: number
  phase?: 'idle' | 'drawing' | 'complete' | 'transition'
  variant?: 'full' | 'nav'
  onDrawingComplete?: () => void
  className?: string
}

const CRESCENT_PATH = 'M 175 65 A 85 85 0 0 0 40 175'
const WAVE_TOP = 'M55 180 C78 170 100 190 125 180 C150 170 178 190 195 180'
const WAVE_BOTTOM = 'M60 200 C83 190 105 210 130 200 C155 190 178 210 195 200'
const SHINE_PATH = 'M 175 65 A 85 85 0 0 0 40 175'

const ARC_LENGTH = 230
const WAVE_LENGTH = 380
const SHINE_LENGTH = 280

export default function YHLogo({
  size = 200,
  phase = 'idle',
  variant = 'full',
  onDrawingComplete,
  className = '',
}: YHLogoProps) {
  const crescentControls = useAnimation()
  const yControls = useAnimation()
  const hControls = useAnimation()
  const waveTopControls = useAnimation()
  const waveBottomControls = useAnimation()
  const glowControls = useAnimation()
  const shineControls = useAnimation()

  const isNav = variant === 'nav'

  useEffect(() => {
    if (phase === 'idle' || (phase === 'transition' && isNav)) {
      crescentControls.set({ opacity: 1, strokeDashoffset: 0 })
      yControls.set({ opacity: 1 })
      hControls.set({ opacity: 1 })
      waveTopControls.set({ opacity: 1, strokeDashoffset: 0 })
      waveBottomControls.set({ opacity: 1, strokeDashoffset: 0 })
      glowControls.set({ opacity: 0 })
      shineControls.set({ opacity: 0 })
      return
    }

    if (phase === 'drawing') {
      crescentControls.set({ opacity: 0, strokeDashoffset: ARC_LENGTH })
      yControls.set({ opacity: 0 })
      hControls.set({ opacity: 0 })
      waveTopControls.set({ opacity: 0, strokeDashoffset: WAVE_LENGTH })
      waveBottomControls.set({ opacity: 0, strokeDashoffset: WAVE_LENGTH })
      glowControls.set({ opacity: 0 })
      shineControls.set({ opacity: 0 })

      crescentControls.start({
        strokeDashoffset: 0,
        opacity: 1,
        transition: { duration: 1, ease: 'easeInOut' },
      })

      setTimeout(() => {
        yControls.start({
          opacity: 1,
          transition: { duration: 0.6, ease: 'easeOut' },
        })
      }, 1000)

      setTimeout(() => {
        hControls.start({
          opacity: 1,
          transition: { duration: 0.6, ease: 'easeOut' },
        })
      }, 1900)

      setTimeout(() => {
        waveTopControls.start({
          strokeDashoffset: 0,
          opacity: 1,
          transition: { duration: 0.5, ease: 'easeInOut' },
        })
        waveBottomControls.start({
          strokeDashoffset: 0,
          opacity: 1,
          transition: { duration: 0.5, ease: 'easeInOut', delay: 0.1 },
        })
        onDrawingComplete?.()
      }, 2700)
      return
    }

    if (phase === 'complete') {
      crescentControls.set({ opacity: 1, strokeDashoffset: 0 })
      yControls.set({ opacity: 1 })
      hControls.set({ opacity: 1 })
      waveTopControls.set({ opacity: 1, strokeDashoffset: 0 })
      waveBottomControls.set({ opacity: 1, strokeDashoffset: 0 })

      if (!isNav) {
        shineControls.set({ opacity: 0 })
        shineControls.start({
          strokeDashoffset: [-SHINE_LENGTH, SHINE_LENGTH],
          opacity: [0, 0.8, 0],
          transition: { duration: 0.8, ease: 'easeInOut' },
        })

        setTimeout(() => {
          glowControls.start({
            opacity: [0, 0.3, 0, 0.3, 0],
            scale: [1, 1.08, 1, 1.08, 1],
            transition: { duration: 1.5, ease: 'easeOut' },
          })
        }, 450)
      }
      return
    }

    if (phase === 'transition') {
      crescentControls.set({ opacity: 1, strokeDashoffset: 0 })
      yControls.set({ opacity: 1 })
      hControls.set({ opacity: 1 })
      waveTopControls.set({ opacity: 1, strokeDashoffset: 0 })
      waveBottomControls.set({ opacity: 1, strokeDashoffset: 0 })
      glowControls.set({ opacity: 0 })
      shineControls.set({ opacity: 0 })
    }
  }, [phase, crescentControls, yControls, hControls, waveTopControls, waveBottomControls, glowControls, shineControls, onDrawingComplete, isNav])

  const fontSizeY = Math.round(size * 0.32)
  const fontSizeH = Math.round(size * 0.32)

  if (isNav) {
    const font = 84
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="navRingGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#D9B84A" />
              <stop offset="1" stopColor="#B07E2E" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="#0F3D2E" stroke="url(#navRingGrad)" strokeWidth="4" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(232,200,128,0.4)" strokeWidth="1.5" />
          <text
            x="78"
            y="121"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize={font}
            fontWeight="700"
            fill="#FDF6E3"
            style={{ filter: 'drop-shadow(0 0 4px rgba(253,246,227,0.6))' }}
          >
            Y
          </text>
          <text
            x="126"
            y="121"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize={font}
            fontWeight="700"
            fill="#D9A860"
            style={{ filter: 'drop-shadow(0 0 4px rgba(216,168,96,0.6))' }}
          >
            H
          </text>
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size + 60}
        viewBox="0 0 200 260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="goldGlowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-brand-soft-gold)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-brand-soft-gold)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand-white)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-brand-soft-gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-brand-white)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Glow layer (behind emblem) */}
        <motion.circle
          cx="100"
          cy="120"
          r="85"
          fill="url(#goldGlowGradient)"
          initial={{ opacity: 0 }}
          animate={glowControls}
        />

        {/* Gold Crescent Arc — wraps around left and top, from upper-right to lower-left */}
        <motion.path
          d={CRESCENT_PATH}
          fill="none"
          stroke="var(--color-brand-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          animate={crescentControls}
        />

        {/* Gold H (rendered first = behind Y, positioned on the LEFT) */}
        <motion.text
          x="60"
          y="140"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize={fontSizeH}
          fontWeight="700"
          fill="var(--color-brand-gold)"
          animate={hControls}
        >
          H
        </motion.text>

        {/* White Y (rendered second = in front of H, positioned on the RIGHT) */}
        <motion.text
          x="130"
          y="140"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize={fontSizeY}
          fontWeight="700"
          fill="var(--color-brand-white)"
          animate={yControls}
        >
          Y
        </motion.text>

        {/* Signature Gold Waves (two sweeping curves beneath monogram) */}
        <motion.path
          d={WAVE_TOP}
          fill="none"
          stroke="var(--color-brand-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={WAVE_LENGTH}
          animate={waveTopControls}
        />
        <motion.path
          d={WAVE_BOTTOM}
          fill="none"
          stroke="var(--color-brand-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={WAVE_LENGTH}
          animate={waveBottomControls}
        />

        {/* Shine layer (sweep across emblem) */}
        <motion.path
          d={SHINE_PATH}
          fill="none"
          stroke="url(#shineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={SHINE_LENGTH}
          animate={shineControls}
        />
      </svg>
    </div>
  )
}
