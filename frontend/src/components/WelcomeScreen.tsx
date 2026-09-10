import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import YHLogo from '@/components/YHLogo'
import ParticleSystem from '@/components/ParticleSystem'

export default function WelcomeScreen({ onFinish }: { onFinish: () => void }) {
  const [show, setShow] = useState(true)
  const [showSkip, setShowSkip] = useState(false)
  const [logoPhase, setLogoPhase] = useState<'idle' | 'drawing' | 'complete' | 'transition'>('idle')

  const bgControls = useAnimation()
  const ambientGlowControls = useAnimation()
  const logoContainerControls = useAnimation()
  const theControls = useAnimation()
  const yadsControls = useAnimation()
  const hoodControls = useAnimation()
  const hotelControls = useAnimation()
  const taglineControls = useAnimation()
  const overlayControls = useAnimation()

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const timers = timersRef.current
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery.matches) {
      onFinish()
      return
    }

    const introSeen = localStorage.getItem('introSeen') === 'true'
    if (introSeen) {
      onFinish()
      return
    }

    const addTimer = (delay: number, fn: () => void) => {
      timers.push(setTimeout(fn, delay))
    }

    // 0.0s — Background fades from black to forest green
    addTimer(0, () => {
      bgControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      })
    })

    // 0.5s — Gold ambient glow appears
    addTimer(500, () => {
      ambientGlowControls.start({
        opacity: [0, 0.15, 0.25],
        transition: { duration: 0.6, ease: 'easeOut' },
      })
    })

    // 0.8s — Logo drawing phase begins (YHLogo handles internal timing)
    addTimer(800, () => {
      setLogoPhase('drawing')
    })

    // 4.2s — "THE" fades in
    addTimer(4200, () => {
      theControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      })
    })

    // 4.5s — "YADS" slides in from the left
    addTimer(4500, () => {
      yadsControls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: 'easeOut' },
      })
    })

    // 5.0s — "HOOD" slides in from the right
    addTimer(5000, () => {
      hoodControls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: 'easeOut' },
      })
    })

    // 5.7s — "HOTEL" writes itself (letter by letter)
    addTimer(5700, () => {
      hotelControls.start({
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
      })
    })

    // 6.3s — "Hospitality With Heart" fades in
    addTimer(6300, () => {
      taglineControls.start({
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
      })
    })

    // 6.8s — Logo phase changes to complete (triggers shine sweep + glow)
    addTimer(6800, () => {
      setLogoPhase('complete')
    })

    // 7.3s — Gentle two-pulse glow (handled inside YHLogo 'complete' phase with offset)
    // 8.2s — Logo shrinks smoothly
    addTimer(8200, () => {
      logoContainerControls.start({
        scale: 0.35,
        x: -280,
        y: -320,
        transition: { duration: 0.6, ease: 'easeInOut' },
      })
      setLogoPhase('transition')
    })

    // 8.8s — Welcome overlay fades away
    addTimer(8800, () => {
      overlayControls.start({
        opacity: 0,
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
    })

    // 9.2s — Overlay fully gone, intro complete
    addTimer(9200, () => {
      setShow(false)
      localStorage.setItem('introSeen', 'true')
      onFinish()
    })

    // Skip button appears after 1 second
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(skipTimer)
    }
  }, [
    onFinish,
    bgControls,
    ambientGlowControls,
    theControls,
    yadsControls,
    hoodControls,
    hotelControls,
    taglineControls,
    logoContainerControls,
    overlayControls,
  ])

  const handleSkip = () => {
    timersRef.current.forEach(clearTimeout)
    localStorage.setItem('introSeen', 'true')
    setShow(false)
    onFinish()
  }

  if (!show) return null

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={bgControls}
        exit={{ opacity: 0 }}
      >
        {/* Background: radial gradient + vignette + mist + ambient glow */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, var(--color-brand-forest) 0%, var(--color-brand-charcoal) 70%, var(--color-brand-charcoal) 100%)',
            }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 60, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          />

          {/* Dark vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(8,28,20,0.8)_100%)]" />

          {/* Subtle animated mist */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,_rgba(217,184,74,0.03)_0%,_transparent_40%)]"
            animate={{
              background: [
                'radial-gradient(ellipse at 30% 30%, rgba(217,184,74,0.03) 0%, transparent 40%)',
                'radial-gradient(ellipse at 70% 40%, rgba(217,184,74,0.04) 0%, transparent 40%)',
                'radial-gradient(ellipse at 30% 30%, rgba(217,184,74,0.03) 0%, transparent 40%)',
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Soft gold ambient glow behind the logo */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-brand-soft-gold) 0%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={ambientGlowControls}
          />
        </div>

        {/* Gold particle system */}
        <ParticleSystem />

        {/* Logo + text container */}
        <motion.div
          className="relative flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            animate={logoContainerControls}
            initial={{ scale: 1, x: 0, y: 0 }}
          >
            <YHLogo size={200} phase={logoPhase} />
          </motion.div>

          {/* Text block */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.5 }}
          >
            {/* ── THE ── : small-caps serif in gold with divider lines */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-2"
              initial={{ opacity: 0, y: 15 }}
              animate={theControls}
            >
              <motion.span
                className="w-8 h-px bg-brand-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 4.2 }}
              />
              <motion.span className="text-brand-white text-3xl md:text-4xl font-heading font-semibold tracking-widest" style={{ fontVariant: 'small-caps' }}>
                THE
              </motion.span>
              <motion.span
                className="w-8 h-px bg-brand-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 4.2 }}
              />
            </motion.div>

            {/* YADS HOOD : large white serif, YADS slides from left, HOOD from right */}
            <div className="flex items-center justify-center gap-1 mb-3">
              <motion.span
                className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-brand-white"
                initial={{ opacity: 0, x: -100 }}
                animate={yadsControls}
              >
                YADS
              </motion.span>
              <motion.span
                className="text-3xl md:text-4xl xl:text-5xl font-heading font-bold text-brand-white"
                initial={{ opacity: 0, x: 100 }}
                animate={hoodControls}
              >
                HOOD
              </motion.span>
            </div>

            {/* ── H O T E L ── : gold serif with wide tracking, divider lines */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-3"
              initial={{ opacity: 0, y: 15 }}
              animate={hotelControls}
            >
              <motion.span
                className="w-6 h-px bg-brand-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 5.7 }}
              />
              <div className="flex items-center justify-center gap-1 text-brand-gold text-3xl md:text-4xl font-heading font-semibold tracking-[0.15em]">
                {'HOTEL'.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 5.7 + i * 0.08 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <motion.span
                className="w-6 h-px bg-brand-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 5.7 + 0.4 }}
              />
            </motion.div>

            {/* ♥ HOSPITALITY WITH HEART ♥ : gold hearts, white serif text */}
            <motion.p
              className="flex items-center justify-center gap-2 text-brand-white text-lg md:text-xl xl:text-2xl font-heading font-semibold tracking-wider"
              initial={{ opacity: 0 }}
              animate={taglineControls}
            >
              <motion.span
                className="text-brand-gold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 6.3 }}
              >
                ♥
              </motion.span>
              HOSPITALITY WITH HEART
              <motion.span
                className="text-brand-gold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 6.3 }}
              >
                ♥
              </motion.span>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Fade-out overlay */}
        <motion.div
          className="fixed inset-0 bg-brand-charcoal pointer-events-none"
          initial={{ opacity: 0 }}
          animate={overlayControls}
        />

        {/* Skip Intro button (appears after 1 second) */}
        {showSkip && (
          <motion.button
            onClick={handleSkip}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSkip()
              }
            }}
            className="fixed top-6 right-6 text-brand-white/60 hover:text-brand-white text-sm font-medium transition-colors z-[110] focus:outline-none focus:ring-2 focus:ring-brand-soft-gold rounded px-3 py-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Skip Intro
          </motion.button>
        )}
      </motion.div>
    </>
  )
}
