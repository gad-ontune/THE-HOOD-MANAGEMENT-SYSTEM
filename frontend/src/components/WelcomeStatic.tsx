import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/* ------------------------------------------------------------------ */
/*  Welcome screen — glowing, shining monogram + pen-writing reveal.  */
/* ------------------------------------------------------------------ */

const PARTICLES = [
  { x: '10%', y: '26%', s: 3, o: 0.55, d: 9, delay: 0 },
  { x: '18%', y: '60%', s: 2, o: 0.4, d: 11, delay: 1.2 },
  { x: '27%', y: '18%', s: 4, o: 0.6, d: 8, delay: 2.4 },
  { x: '34%', y: '70%', s: 2, o: 0.45, d: 10, delay: 0.6 },
  { x: '42%', y: '30%', s: 3, o: 0.5, d: 9, delay: 3.1 },
  { x: '50%', y: '55%', s: 2, o: 0.4, d: 12, delay: 1.8 },
  { x: '58%', y: '22%', s: 4, o: 0.55, d: 8, delay: 0.9 },
  { x: '64%', y: '66%', s: 2, o: 0.4, d: 11, delay: 2.7 },
  { x: '72%', y: '34%', s: 3, o: 0.5, d: 9, delay: 3.6 },
  { x: '78%', y: '58%', s: 2, o: 0.45, d: 10, delay: 0.3 },
  { x: '86%', y: '24%', s: 3, o: 0.55, d: 8, delay: 2.1 },
  { x: '91%', y: '62%', s: 2, o: 0.4, d: 12, delay: 1.5 },
  { x: '46%', y: '84%', s: 3, o: 0.35, d: 13, delay: 4.2 },
  { x: '8%', y: '80%', s: 2, o: 0.3, d: 14, delay: 3.9 },
  { x: '95%', y: '80%', s: 2, o: 0.3, d: 13, delay: 2.6 },
]

const FALLING = [
  { x: '8%', s: 3, o: 0.7, d: 16, delay: 0 },
  { x: '16%', s: 2, o: 0.6, d: 19, delay: 2.4 },
  { x: '28%', s: 4, o: 0.75, d: 15, delay: 5.2 },
  { x: '40%', s: 2, o: 0.55, d: 21, delay: 1.1 },
  { x: '53%', s: 3, o: 0.7, d: 17, delay: 7.3 },
  { x: '64%', s: 2, o: 0.6, d: 20, delay: 3.5 },
  { x: '76%', s: 3, o: 0.7, d: 16, delay: 6.1 },
  { x: '88%', s: 2, o: 0.6, d: 18, delay: 4.2 },
  { x: '94%', s: 3, o: 0.65, d: 22, delay: 0.8 },
  { x: '48%', s: 2, o: 0.6, d: 18, delay: 8.5 },
]

const SPARKLES = [
  { x: '6%', y: '20%', s: 15, d: 3.2, delay: 0 },
  { x: '14%', y: '68%', s: 18, d: 4.1, delay: 0.9 },
  { x: '22%', y: '34%', s: 13, d: 3.6, delay: 1.7 },
  { x: '30%', y: '80%', s: 16, d: 4.5, delay: 2.4 },
  { x: '38%', y: '15%', s: 14, d: 3.9, delay: 0.5 },
  { x: '46%', y: '88%', s: 19, d: 4.2, delay: 3.1 },
  { x: '54%', y: '12%', s: 13, d: 3.4, delay: 1.3 },
  { x: '62%', y: '82%', s: 16, d: 4.6, delay: 2.0 },
  { x: '70%', y: '26%', s: 17, d: 3.7, delay: 0.8 },
  { x: '78%', y: '72%', s: 14, d: 4.3, delay: 2.7 },
  { x: '86%', y: '30%', s: 13, d: 3.5, delay: 1.2 },
  { x: '93%', y: '64%', s: 16, d: 4.0, delay: 3.4 },
  { x: '10%', y: '45%', s: 12, d: 3.8, delay: 2.2 },
  { x: '88%', y: '12%', s: 12, d: 3.3, delay: 1.6 },
  { x: '45%', y: '4%', s: 15, d: 4.4, delay: 0.2 },
  { x: '52%', y: '94%', s: 13, d: 3.6, delay: 2.9 },
]

const EMBLEM_STARS = [
  { x: 190, y: 142, r: 14, d: 2.4, delay: 0 },
  { x: 412, y: 150, r: 12, d: 3.2, delay: 0.7 },
  { x: 298, y: 232, r: 16, d: 2.8, delay: 1.3 },
  { x: 290, y: 316, r: 12, d: 3.6, delay: 0.4 },
  { x: 302, y: 386, r: 14, d: 2.6, delay: 1.9 },
  { x: 332, y: 300, r: 11, d: 3.4, delay: 1.1 },
  { x: 442, y: 300, r: 12, d: 2.5, delay: 2.2 },
  { x: 388, y: 312, r: 10, d: 3.8, delay: 0.9 },
  { x: 342, y: 224, r: 10, d: 3.0, delay: 1.7 },
  { x: 442, y: 382, r: 11, d: 2.9, delay: 2.6 },
  { x: 132, y: 118, r: 11, d: 3.3, delay: 0.6 },
  { x: 452, y: 128, r: 10, d: 2.7, delay: 2.4 },
  { x: 457, y: 220, r: 10, d: 3.5, delay: 1.4 },
  { x: 326, y: 362, r: 11, d: 3.1, delay: 3.0 },
]

const starPath = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} L ${cx + r * 0.3} ${cy - r * 0.3} L ${cx + r} ${cy} ` +
  `L ${cx + r * 0.3} ${cy + r * 0.3} L ${cx} ${cy + r} ` +
  `L ${cx - r * 0.3} ${cy + r * 0.3} L ${cx - r} ${cy} ` +
  `L ${cx - r * 0.3} ${cy - r * 0.3} Z`

const GOLD_GRAD_TEXT: CSSProperties = {
  backgroundImage:
    'linear-gradient(120deg,#FDF6E3 0%,#EACF9B 38%,#D9A860 62%,#B07E2E 85%,#E8C880 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

function EmblemMark() {
  return (
    <svg
      viewBox="0 0 590 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="halo" cx="50%" cy="46%" r="55%">
          <stop offset="0" stopColor="#EACF9B" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#C08838" stopOpacity="0.22" />
          <stop offset="1" stopColor="#C08838" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="y-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor="#F2E8D6" />
          <stop offset="0.8" stopColor="#DCCB9F" />
          <stop offset="1" stopColor="#C9B27A" />
        </linearGradient>
        <linearGradient id="h-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0DCA8" />
          <stop offset="0.4" stopColor="#D9A860" />
          <stop offset="0.75" stopColor="#B07E2E" />
          <stop offset="1" stopColor="#8A5A16" />
        </linearGradient>
        <g id="hBars">
          <rect x="320" y="211" width="27" height="202" rx="3" />
          <rect x="428" y="211" width="27" height="202" rx="3" />
          <rect x="350" y="304" width="74" height="10" rx="3" />
          <rect x="304" y="205" width="79" height="7" rx="3" />
          <rect x="410" y="205" width="73" height="7" rx="3" />
          <rect x="304" y="413" width="79" height="7" rx="3" />
          <rect x="410" y="413" width="73" height="7" rx="3" />
        </g>
        <text
          id="yGlyph"
          x="0"
          y="0"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="488"
          fontWeight="700"
        >
          Y
        </text>
      </defs>

      {/* Halo behind the monogram */}
      <ellipse
        cx="295"
        cy="275"
        rx="300"
        ry="280"
        fill="url(#halo)"
        style={{ animation: 'halo-pulse 5s ease-in-out infinite' }}
      />

      {/* Crest ring framing the letters */}
      <ellipse
        cx="295"
        cy="275"
        rx="250"
        ry="238"
        fill="none"
        stroke="#EACF9B"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <ellipse
        cx="295"
        cy="275"
        rx="235"
        ry="224"
        fill="none"
        stroke="#C08838"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeDasharray="8 12"
        style={{ animation: 'halo-pulse 6s ease-in-out infinite' }}
      />

      {/* H (gold gradient) — embossed with a dark underlay, drawn before the Y */}
      <use href="#hBars" transform="translate(0 3)" fill="#241703" opacity="0.55" />
      <g style={{ animation: 'letter-breathe 4.5s ease-in-out infinite' }}>
        <use href="#hBars" fill="url(#h-grad)" />
      </g>

      {/* Y (gradient) — large serif in front of the H, embossed with a dark underlay */}
      <g transform="translate(295 411) scale(1.18,1)" opacity="0.55">
        <use href="#yGlyph" fill="#241703" />
      </g>
      <g
        transform="translate(295 408) scale(1.18,1)"
        style={{ animation: 'letter-breathe 4.5s ease-in-out infinite' }}
      >
        <use href="#yGlyph" fill="url(#y-grad)" />
      </g>

      {/* Twinkling sparkles over the letters */}
      <g>
        {EMBLEM_STARS.map((s, i) => (
          <path
            key={i}
            d={starPath(s.x, s.y, s.r)}
            fill="#FDF6E3"
            style={{
              opacity: 0,
              animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
              filter: 'drop-shadow(0 0 3px rgba(253,246,227,0.9))',
            }}
          />
        ))}
      </g>
    </svg>
  )
}

function PenNib() {
  return (
    <svg width="34" height="42" viewBox="0 0 40 44" style={{ display: 'block' }}>
      <path
        d="M20 4 C 24 14 28 24 36 34 C 30 38 24 40 20 41 C 16 40 10 38 4 34 C 12 24 16 14 20 4 Z"
        fill="#EACF9B"
        stroke="#F7ECD0"
        strokeWidth="1"
      />
      <path d="M20 4 L 20 41" stroke="#082615" strokeWidth="1.5" />
    </svg>
  )
}

function RowSparkle({
  left,
  top,
  s,
  d,
  delay,
}: {
  left: string
  top: string
  s: number
  d: number
  delay: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute"
      style={{
        left,
        top,
        width: s,
        height: s,
        opacity: 0,
        animation: `twinkle ${d}s ease-in-out ${delay}s infinite`,
        filter: 'drop-shadow(0 0 4px rgba(253,246,227,0.9))',
      }}
    >
      <path
        d="M12 0 C 13 8 16 11 24 12 C 16 13 13 16 12 24 C 11 16 8 13 0 12 C 8 11 11 8 12 0 Z"
        fill="#FDF6E3"
      />
    </svg>
  )
}

function Dance({
  text,
  gradient,
  color,
  className,
  fontSize,
  letterSpacing,
  glow,
  breatheDelay,
  startDelay,
  parentStyle,
}: {
  text: string
  gradient?: boolean
  color?: string
  className?: string
  fontSize: string
  letterSpacing: string
  glow: string
  breatheDelay?: string
  startDelay?: number
  parentStyle?: CSSProperties
}) {
  return (
    <span
      className={className}
      style={{
        fontSize,
        letterSpacing,
        fontVariant: parentStyle?.fontVariant,
        animation: `letter-breathe 4.5s ease-in-out ${breatheDelay ?? '0s'} infinite`,
      }}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            ...(gradient ? GOLD_GRAD_TEXT : { color }),
            filter: glow,
            animation: `letter-dance 2.6s ease-in-out ${(startDelay ?? 0) + i * 0.16}s infinite`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  )
}

function Flourish() {
  return (
    <svg
      style={{
        width: 'calc(var(--ew)*0.5)',
        height: 'calc(var(--ew)*0.04)',
        filter: 'drop-shadow(0 0 6px rgba(216,168,96,0.45))',
      }}
      viewBox="0 0 200 16"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flourishGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B07E2E" />
          <stop offset="0.5" stopColor="#F7ECD0" />
          <stop offset="1" stopColor="#B07E2E" />
        </linearGradient>
      </defs>
      <path d="M6 10 C 58 2 138 14 194 8" fill="none" stroke="url(#flourishGrad)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M100 1.5 L104.5 9 L100 15.5 L95.5 9 Z" fill="#F7ECD0" />
    </svg>
  )
}

export default function WelcomeStatic({ onFinish }: { onFinish?: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const emblemRef = useRef<HTMLDivElement>(null)
  const theRef = useRef<HTMLDivElement>(null)
  const yadsRef = useRef<HTMLDivElement>(null)
  const hotelRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)
  const penRef = useRef<HTMLDivElement>(null)

  const particles = useMemo(
    () =>
      PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={
            {
              left: p.x,
              top: p.y,
              width: p.s,
              height: p.s,
              background: 'radial-gradient(circle, #F7ECD0 0%, #D9A860 60%, transparent 100%)',
              opacity: 0,
              ['--p-op' as string]: p.o,
              animation: `particle-rise ${p.d}s ease-in-out ${p.delay}s infinite`,
            } as CSSProperties
          }
        />
      )),
    [],
  )

  const sparkles = useMemo(
    () =>
      SPARKLES.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={
            {
              left: s.x,
              top: s.y,
              width: s.s,
              height: s.s,
              opacity: 0,
              animation: `twinkle ${s.d}s ease-in-out ${s.delay}s infinite`,
              filter:
                'drop-shadow(0 0 5px rgba(253,246,227,0.85)) drop-shadow(0 0 14px rgba(216,168,96,0.55))',
            } as CSSProperties
          }
        >
          <path
            d="M12 0 C 13 8 16 11 24 12 C 16 13 13 16 12 24 C 11 16 8 13 0 12 C 8 11 11 8 12 0 Z"
            fill="#FDF6E3"
          />
        </svg>
      )),
    [],
  )

  const falling = useMemo(
    () =>
      FALLING.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full"
          style={
            {
              left: f.x,
              width: f.s * 2,
              height: f.s * 2,
              background:
                'radial-gradient(circle, #FDF6E3 0%, #EACF9B 45%, rgba(216,168,96,0) 70%)',
              boxShadow: '0 0 8px rgba(253,246,227,0.7), 0 0 18px rgba(216,168,96,0.5)',
              opacity: 0,
              ['--p-op' as string]: f.o,
              animation: `fall ${f.d}s linear ${f.delay}s infinite`,
            } as CSSProperties
          }
        />
      )),
    [],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const targets = {
      emblem: emblemRef.current,
      the: theRef.current,
      yads: yadsRef.current,
      hotel: hotelRef.current,
      tag: tagRef.current,
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.values(targets).forEach((el) => {
        if (el) el.style.clipPath = 'inset(0 0 0 0)'
      })
      if (penRef.current) penRef.current.style.opacity = '0'
      return
    }

    const c = container.getBoundingClientRect()
    const box = (el: HTMLDivElement | null) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        left: r.left - c.left,
        right: r.right - c.left,
        top: r.top - c.top,
        bottom: r.bottom - c.top,
        midY: (r.top + r.bottom) / 2 - c.top,
      }
    }
    const E = box(targets.emblem)
    const T = box(targets.the)
    const Yd = box(targets.yads)
    const Ht = box(targets.hotel)
    const Tg = box(targets.tag)
    if (!E || !T || !Yd || !Ht || !Tg) return

    const D = 1.6
    const M = 0.13
    const W = 0.5
    const segs = [
      { t0: 0, t1: D, from: { x: E.left, y: E.top }, to: { x: E.right, y: E.bottom }, reveal: 'emblem' as const },
      { t0: D, t1: D + M, from: { x: E.right, y: E.bottom }, to: { x: T.left, y: T.midY } },
      { t0: D + M, t1: D + M + W, from: { x: T.left, y: T.midY }, to: { x: T.right, y: T.midY }, reveal: 'the' as const },
      { t0: D + M + W, t1: D + 2 * M + W, from: { x: T.right, y: T.midY }, to: { x: Yd.left, y: Yd.midY } },
      { t0: D + 2 * M + W, t1: D + 2 * M + 2 * W, from: { x: Yd.left, y: Yd.midY }, to: { x: Yd.right, y: Yd.midY }, reveal: 'yads' as const },
      { t0: D + 2 * M + 2 * W, t1: D + 3 * M + 2 * W, from: { x: Yd.right, y: Yd.midY }, to: { x: Ht.left, y: Ht.midY } },
      { t0: D + 3 * M + 2 * W, t1: D + 3 * M + 3 * W, from: { x: Ht.left, y: Ht.midY }, to: { x: Ht.right, y: Ht.midY }, reveal: 'hotel' as const },
      { t0: D + 3 * M + 3 * W, t1: D + 4 * M + 3 * W, from: { x: Ht.right, y: Ht.midY }, to: { x: Tg.left, y: Tg.midY } },
      { t0: D + 4 * M + 3 * W, t1: D + 4 * M + 4 * W, from: { x: Tg.left, y: Tg.midY }, to: { x: Tg.right, y: Tg.midY }, reveal: 'tag' as const },
    ]
    const total = D + 4 * M + 4 * W + 0.35

    const revealed: Record<string, boolean> = {}
    const setClip = (name: string, p: number) => {
      const el = targets[name as keyof typeof targets]
      if (el) el.style.clipPath = `inset(0 ${Math.round((1 - p) * 100)}% 0 0)`
    }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1000, total)
      let active = segs[segs.length - 1]
      for (const s of segs) {
        if (t <= s.t1) {
          active = s
          break
        }
      }
      const segP = Math.min(1, Math.max(0, (t - active.t0) / (active.t1 - active.t0)))
      const x = active.from.x + (active.to.x - active.from.x) * segP
      const y = active.from.y + (active.to.y - active.from.y) * segP

      if (active.reveal) {
        revealed[active.reveal] = true
        setClip(active.reveal, segP)
      }
      ;(Object.keys(targets) as Array<keyof typeof targets>).forEach((k) => {
        if (revealed[k] && k !== active.reveal) setClip(k, 1)
      })

      if (penRef.current) {
        const ang = Math.atan2(active.to.y - active.from.y, active.to.x - active.from.x) + Math.PI / 2
        penRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${ang}rad)`
        penRef.current.style.opacity =
          t > total - 0.35 ? String(Math.max(0, (total - t) / 0.35)) : '1'
      }

      if (t < total) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const leavingRef = useRef(false)
  const fadeTimer = useRef<number>(0)
  const startLeave = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    fadeTimer.current = window.setTimeout(() => onFinish?.(), 800)
  }, [onFinish])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hold = reduced ? 1500 : 8000
    const t = window.setTimeout(startLeave, hold)
    return () => {
      clearTimeout(t)
      clearTimeout(fadeTimer.current)
    }
  }, [startLeave])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{
        background:
          'linear-gradient(180deg, #103D2E 0%, #0B3024 40%, #071913 100%)',
        opacity: leaving ? 0 : 1,
      }}
    >
      {/* ── Skip intro ── */}
      <button
        type="button"
        onClick={startLeave}
        className="welcome-skip pointer-events-auto absolute right-4 top-4 z-20 rounded-full px-5 py-2 font-heading text-sm font-semibold tracking-widest backdrop-blur-sm transition-all duration-300 sm:right-6 sm:top-6"
        style={{ animation: 'fade-in 1s ease-out 0.7s both' }}
      >
        SKIP INTRO
      </button>

      {/* ── Ambient background ── */}
      {/* Warm top light + emerald side glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(216,168,96,0.16) 0%, transparent 60%),' +
            'radial-gradient(ellipse 45% 40% at 12% 85%, rgba(21,70,52,0.5) 0%, transparent 70%),' +
            'radial-gradient(ellipse 45% 40% at 90% 80%, rgba(21,70,52,0.45) 0%, transparent 70%)',
          animation: 'bg-breathe 26s ease-in-out infinite',
        }}
      />
      {/* Slow-spinning golden rays */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'repeating-conic-gradient(from 0deg at 50% -25%, transparent 0deg 9deg, rgba(216,168,96,0.05) 9deg 12deg, transparent 12deg 26deg)',
          animation: 'ray-spin 90s linear infinite',
        }}
      />
      {/* Floating gold dust */}
      <div className="pointer-events-none absolute inset-0" style={{ animation: 'fade-in 2s ease-out 0.5s both' }}>
        {particles}
      </div>
      {/* Twinkling stars */}
      <div className="pointer-events-none absolute inset-0" style={{ animation: 'fade-in 2.2s ease-out 0.8s both' }}>
        {sparkles}
      </div>
      {/* Falling gold glimmer */}
      <div className="pointer-events-none absolute inset-0" style={{ animation: 'fade-in 2.4s ease-out 1.1s both' }}>
        {falling}
      </div>
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(3,14,9,0.55) 100%)',
        }}
      />
      {/* Auto-transition progress bar */}
      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 h-px w-[min(60vw,420px)] -translate-x-1/2 overflow-hidden"
        style={{ background: 'rgba(216,168,96,0.25)' }}
      >
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg,#D9A860,#F7ECD0)',
            boxShadow: '0 0 8px rgba(216,168,96,0.6)',
            animation: 'progress 8s linear forwards',
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="welcome-stage relative flex flex-col items-center"
      >
        {/* ── Pen nib ── */}
        <div
          ref={penRef}
          className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
          style={{
            opacity: 0,
            filter: 'drop-shadow(0 0 6px rgba(216,168,96,0.7)) drop-shadow(0 0 18px rgba(216,168,96,0.4))',
            transform: 'translate(0px, 0px)',
          }}
        >
          <div style={{ position: 'relative', width: 0, height: 0 }}>
            <div style={{ position: 'absolute', left: -20, top: -4 }}>
              <PenNib />
            </div>
          </div>
        </div>

        {/* ── Emblem (Y + H, glowing) ── */}
        <div
          ref={emblemRef}
          style={{
            width: 'var(--ew)',
            clipPath: 'inset(0 100% 0 0)',
            position: 'relative',
            filter: 'drop-shadow(0 0 34px rgba(216,168,96,0.28))',
          }}
        >
          <div style={{ aspectRatio: '590 / 560' }}>
            <EmblemMark />
          </div>
          {/* Shining light sweep over the monogram */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            style={{ mixBlendMode: 'screen' }}
          >
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background:
                  'linear-gradient(100deg, transparent 0%, rgba(253,246,227,0.35) 50%, transparent 100%)',
                animation: 'sheen-sweep 6s ease-in-out 2s infinite',
              }}
            />
          </div>

          {/* Orbiting sparkles around the monogram */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ width: 0, height: 0 }}
          >
            <div
              style={{
                ['--orbit-r' as string]: 'calc(var(--ew)*0.52)',
                animation: 'orbit 9s linear infinite',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <svg
                className="absolute"
                style={{
                  left: 'calc(var(--orbit-r) * -1)',
                  top: -7,
                  width: 14,
                  height: 14,
                  filter: 'drop-shadow(0 0 5px rgba(253,246,227,0.9))',
                }}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 0 C 13 8 16 11 24 12 C 16 13 13 16 12 24 C 11 16 8 13 0 12 C 8 11 11 8 12 0 Z"
                  fill="#FDF6E3"
                />
              </svg>
            </div>
            <div
              style={{
                ['--orbit-r' as string]: 'calc(var(--ew)*0.38)',
                animation: 'orbit 7s linear infinite reverse',
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              <svg
                className="absolute"
                style={{
                  left: 'calc(var(--orbit-r) * -1)',
                  top: -5,
                  width: 10,
                  height: 10,
                  filter: 'drop-shadow(0 0 5px rgba(216,168,96,0.9))',
                }}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 0 C 13 8 16 11 24 12 C 16 13 13 16 12 24 C 11 16 8 13 0 12 C 8 11 11 8 12 0 Z"
                  fill="#EACF9B"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── THE ── */}
        <div
          ref={theRef}
          className="mt-[calc(var(--ew)*0.061)] flex items-center justify-center gap-[calc(var(--ew)*0.02)]"
          style={{ clipPath: 'inset(0 100% 0 0)', position: 'relative' }}
        >
          <RowSparkle left="46%" top="-10px" s={12} d={3.0} delay={0.5} />
          <RowSparkle left="55%" top="-8px" s={10} d={3.6} delay={1.8} />
          <div
            className="h-px"
            style={{
              width: 'calc(var(--ew)*0.416)',
              background: 'linear-gradient(90deg, transparent, #D9A860 40%, #EACF9B 100%)',
              boxShadow: '0 0 8px rgba(216,168,96,0.5)',
            }}
          />
          <Dance
            text="THE"
            gradient={false}
            color="#FDF6E3"
            className="font-heading font-semibold"
            fontSize="calc(var(--ew)*0.118)"
            letterSpacing="0.12em"
            glow="drop-shadow(0 0 8px rgba(216,168,96,0.6))"
            parentStyle={{ fontVariant: 'small-caps' }}
          />
          <div
            className="h-px"
            style={{
              width: 'calc(var(--ew)*0.416)',
              background: 'linear-gradient(90deg, transparent, #D9A860 40%, #EACF9B 100%)',
              boxShadow: '0 0 8px rgba(216,168,96,0.5)',
            }}
          />
        </div>

        {/* ── YADS HOOD ── */}
        <div
          ref={yadsRef}
          className="mt-[calc(var(--ew)*0.057)] flex items-center justify-center gap-[calc(var(--ew)*0.1)]"
          style={{ clipPath: 'inset(0 100% 0 0)', position: 'relative' }}
        >
          <RowSparkle left="36%" top="-14px" s={16} d={2.8} delay={0.4} />
          <RowSparkle left="49%" top="-16px" s={12} d={3.5} delay={1.5} />
          <RowSparkle left="62%" top="-12px" s={14} d={3.0} delay={2.3} />
          <Dance
            text="YADS"
            gradient
            className="font-heading font-bold"
            fontSize="calc(var(--ew)*0.26)"
            letterSpacing="0.02em"
            glow="drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 0 16px rgba(216,168,96,0.5))"
          />
          <Dance
            text="HOOD"
            gradient
            className="font-heading font-bold"
            fontSize="calc(var(--ew)*0.26)"
            letterSpacing="0.02em"
            glow="drop-shadow(0 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 0 16px rgba(216,168,96,0.5))"
            breatheDelay="0.3s"
            startDelay={0.5}
          />
        </div>

        {/* ── H O T E L ── */}
        <div
          ref={hotelRef}
          className="mt-[calc(var(--ew)*0.061)] flex items-center justify-center gap-[calc(var(--ew)*0.018)]"
          style={{ clipPath: 'inset(0 100% 0 0)', position: 'relative' }}
        >
          <RowSparkle left="44%" top="-11px" s={12} d={3.3} delay={0.9} />
          <RowSparkle left="57%" top="-9px" s={10} d={2.7} delay={2.0} />
          <div
            className="h-px"
            style={{
              width: 'calc(var(--ew)*0.26)',
              background: 'linear-gradient(90deg, transparent, #D9A860 45%, #EACF9B 100%)',
              boxShadow: '0 0 8px rgba(216,168,96,0.45)',
            }}
          />
          <Dance
            text="H O T E L"
            gradient
            className="font-heading font-semibold"
            fontSize="calc(var(--ew)*0.15)"
            letterSpacing="0.18em"
            glow="drop-shadow(0 0 10px rgba(216,168,96,0.45))"
          />
          <div
            className="h-px"
            style={{
              width: 'calc(var(--ew)*0.26)',
              background: 'linear-gradient(90deg, #EACF9B, #D9A860 55%, transparent)',
              boxShadow: '0 0 8px rgba(216,168,96,0.45)',
            }}
          />
        </div>

        {/* ── Tagline ── */}
        <div
          ref={tagRef}
          className="mt-[calc(var(--ew)*0.033)] flex flex-col items-center"
          style={{ clipPath: 'inset(0 100% 0 0)', position: 'relative' }}
        >
          <RowSparkle left="35%" top="-10px" s={13} d={3.1} delay={1.1} />
          <RowSparkle left="66%" top="-8px" s={11} d={2.9} delay={2.5} />
          <div className="flex items-center justify-center gap-[calc(var(--ew)*0.03)]">
            <div
              className="h-px"
              style={{
                width: 'calc(var(--ew)*0.35)',
                background: 'linear-gradient(90deg, transparent, #D9A860 40%, #EACF9B 100%)',
                boxShadow: '0 0 8px rgba(216,168,96,0.5)',
              }}
            />
            <div
              className="rotate-45"
              style={{
                width: 'calc(var(--ew)*0.022)',
                height: 'calc(var(--ew)*0.022)',
                background: 'linear-gradient(135deg,#EACF9B,#B07E2E)',
                boxShadow: '0 0 10px rgba(216,168,96,0.6)',
              }}
            />
            <div
              className="h-px"
              style={{
                width: 'calc(var(--ew)*0.35)',
                background: 'linear-gradient(90deg, #EACF9B, #D9A860 60%, transparent)',
                boxShadow: '0 0 8px rgba(216,168,96,0.5)',
              }}
            />
          </div>

          <div className="mt-[calc(var(--ew)*0.03)] flex items-center justify-center gap-[calc(var(--ew)*0.025)]">
            <Heart size="calc(var(--ew)*0.062)" />
            <Dance
              text="HOSPITALITY WITH HEART"
              gradient={false}
              color="#F8F8F8"
              className="font-heading font-semibold"
              fontSize="calc(var(--ew)*0.078)"
              letterSpacing="0.09em"
              glow="drop-shadow(0 0 8px rgba(216,168,96,0.45))"
            />
            <Heart size="calc(var(--ew)*0.062)" />
          </div>

          <div className="mt-[calc(var(--ew)*0.026)]">
            <Flourish />
          </div>
        </div>
      </div>
    </div>
  )
}

function Heart({ size }: { size: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}
      fill="url(#heart-grad)"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heart-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7ECD0" />
          <stop offset="1" stopColor="#B07E2E" />
        </linearGradient>
      </defs>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}
