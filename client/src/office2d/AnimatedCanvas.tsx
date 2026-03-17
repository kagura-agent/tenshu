import { useRef, useEffect, useCallback } from 'react'

const MAX_PARTICLES = 20
const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: 'dust' | 'firefly' | 'energy' | 'petal'
  color: string
  life: number
  maxLife: number
}

interface AnimatedCanvasProps {
  theme: 'warroom' | 'deck' | 'garden'
  intensity: number
  className?: string
}

/** Warm dust motes / incense particles — drift upward lazily */
function createDust(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: h * 0.4 + Math.random() * h * 0.6,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -(0.05 + Math.random() * 0.15),
    size: 1 + Math.random() * 2,
    opacity: 0,
    type: 'dust',
    color: Math.random() > 0.4 ? '#ffd700' : '#ffb347',
    life: 0,
    maxLife: 300 + Math.random() * 400,
  }
}

/** Warm lantern glow — wanders slowly */
function createFirefly(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    size: 2 + Math.random() * 2.5,
    opacity: 0,
    type: 'firefly',
    color: '#ffd700',
    life: 0,
    maxLife: 200 + Math.random() * 300,
  }
}

/** Cyberpunk data particles — rise upward */
function createEnergy(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: h + 10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.8 + Math.random() * 1.5),
    size: 1 + Math.random() * 1.5,
    opacity: 0.3 + Math.random() * 0.4,
    type: 'energy',
    color: Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6',
    life: 0,
    maxLife: 150 + Math.random() * 150,
  }
}

/** Sakura petals — drift down and sway */
function createPetal(w: number, _h: number): Particle {
  return {
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.3) * 0.4,
    vy: 0.3 + Math.random() * 0.5,
    size: 2 + Math.random() * 2.5,
    opacity: 0,
    type: 'petal',
    color: Math.random() > 0.5 ? '#ffb7c5' : '#ff8fa3',
    life: 0,
    maxLife: 400 + Math.random() * 300,
  }
}

function drawDot(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

export function AnimatedCanvas({
  theme,
  intensity,
  className,
}: AnimatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef(0)
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastSizeRef = useRef({ w: 0, h: 0 })
  const lastFrameTimeRef = useRef(0)

  const animate = useCallback(
    (timestamp: number) => {
      frameRef.current = requestAnimationFrame(animate)

      // Throttle to TARGET_FPS
      const elapsed = timestamp - lastFrameTimeRef.current
      if (elapsed < FRAME_INTERVAL) return
      lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, w, h)

      if (theme === 'warroom') {
        ctx.fillStyle = 'rgba(26, 20, 16, 0.15)'
        ctx.fillRect(0, 0, w, h)
      } else if (theme === 'deck') {
        ctx.fillStyle = 'rgba(8, 8, 26, 0.15)'
        ctx.fillRect(0, 0, w, h)

        // Draw grid from cached offscreen canvas
        if (
          !gridCanvasRef.current ||
          lastSizeRef.current.w !== w ||
          lastSizeRef.current.h !== h
        ) {
          const offscreen = document.createElement('canvas')
          offscreen.width = w
          offscreen.height = h
          const offCtx = offscreen.getContext('2d')!
          offCtx.strokeStyle = 'rgba(6, 182, 212, 0.04)'
          offCtx.lineWidth = 1
          offCtx.beginPath()
          for (let x = 0; x < w; x += 60) {
            offCtx.moveTo(x, 0)
            offCtx.lineTo(x, h)
          }
          for (let y = 0; y < h; y += 60) {
            offCtx.moveTo(0, y)
            offCtx.lineTo(w, y)
          }
          offCtx.stroke()
          gridCanvasRef.current = offscreen
          lastSizeRef.current = { w, h }
        }
        ctx.drawImage(gridCanvasRef.current, 0, 0)

        // Horizon glow
        ctx.fillStyle = 'rgba(88, 28, 135, 0.04)'
        ctx.fillRect(0, h * 0.7, w, h * 0.3)
      } else {
        // Garden — soft pink overlay
        ctx.fillStyle = 'rgba(26, 16, 24, 0.1)'
        ctx.fillRect(0, 0, w, h)
      }

      const particles = particlesRef.current

      // Spawn with cap
      if (particles.length < MAX_PARTICLES) {
        const spawnChance = (0.3 + intensity * 1.5) * 0.05
        if (Math.random() < spawnChance) {
          if (theme === 'warroom') {
            particles.push(createDust(w, h))
            if (intensity > 0.2 && Math.random() < 0.3) {
              particles.push(createFirefly(w, h))
            }
          } else if (theme === 'deck') {
            particles.push(createEnergy(w, h))
          } else {
            particles.push(createPetal(w, h))
          }
        }

        // Baseline: keep a few particles always visible
        if (theme === 'warroom') {
          let dustCount = 0
          for (let i = 0; i < particles.length; i++) {
            if (particles[i].type === 'dust') dustCount++
          }
          if (dustCount < 3) particles.push(createDust(w, h))
        } else if (theme === 'deck') {
          let energyCount = 0
          for (let i = 0; i < particles.length; i++) {
            if (particles[i].type === 'energy') energyCount++
          }
          if (energyCount < 3) particles.push(createEnergy(w, h))
        } else {
          let petalCount = 0
          for (let i = 0; i < particles.length; i++) {
            if (particles[i].type === 'petal') petalCount++
          }
          if (petalCount < 4) particles.push(createPetal(w, h))
        }
      }

      // Update & draw — single pass
      let writeIdx = 0
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.life++
        if (p.life > p.maxLife) continue
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue

        p.x += p.vx
        p.y += p.vy

        // Fade in / fade out
        const lifeRatio = p.life / p.maxLife
        if (lifeRatio < 0.15) {
          p.opacity = (lifeRatio / 0.15) * 0.6
        } else if (lifeRatio > 0.75) {
          p.opacity *= 0.97
        }

        // Type-specific behaviors
        if (p.type === 'firefly') {
          p.vx += (Math.random() - 0.5) * 0.03
          p.vy += (Math.random() - 0.5) * 0.03
          p.opacity = Math.abs(Math.sin(p.life * 0.015)) * 0.5
        }
        if (p.type === 'dust') {
          // Gentle horizontal sway
          p.vx = Math.sin(p.life * 0.008) * 0.12
        }
        if (p.type === 'petal') {
          // Sinusoidal drift like a real falling petal
          p.vx = Math.sin(p.life * 0.012) * 0.4
          p.vy += Math.sin(p.life * 0.02) * 0.005
        }

        drawDot(ctx, p)
        particles[writeIdx++] = p
      }
      particles.length = writeIdx

      ctx.globalAlpha = 1
    },
    [theme, intensity],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.scale(dpr, dpr)
        gridCanvasRef.current = null
      }
    }

    resize()
    window.addEventListener('resize', resize)
    frameRef.current = requestAnimationFrame((ts) => animate(ts))

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className || ''}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
