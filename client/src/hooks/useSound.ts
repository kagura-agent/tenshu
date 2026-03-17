import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { useTheme, type ThemeMode } from './useTheme'

type SoundEvent =
  | 'status-working'
  | 'status-idle'
  | 'status-error'
  | 'cycle-complete'
  | 'theme-switch'

const STORAGE_KEY = 'tenshu-sound-muted'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// Shared muted state so all useSound() instances stay in sync
let mutedState = localStorage.getItem(STORAGE_KEY) === 'true'
const listeners = new Set<() => void>()
function getMuted() {
  return mutedState
}
function subscribeMuted(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function writeMuted(val: boolean) {
  mutedState = val
  localStorage.setItem(STORAGE_KEY, String(val))
  listeners.forEach((cb) => cb())
}

// --- Synthesized sounds per theme ---

function playTaiko() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(80, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.4)
}

function playBamboo() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.2)
}

function playWarroomError() {
  const ctx = getCtx()
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime + i * 0.15)
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + i * 0.15 + 0.12,
    )
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + i * 0.15)
    osc.stop(ctx.currentTime + i * 0.15 + 0.12)
  }
}

function playSynthBeep() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

function playDigitalWhoosh() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.25)
}

function playDeckError() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(220, ctx.currentTime)
  osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1)
  osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.3)
}

function playWindChime() {
  const ctx = getCtx()
  const freqs = [1200, 1500, 1800]
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
    gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + i * 0.08 + 0.6,
    )
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + i * 0.08)
    osc.stop(ctx.currentTime + i * 0.08 + 0.6)
  })
}

function playWaterDrop() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1400, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.3)
}

function playGardenError() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}

const SOUND_MAP: Record<ThemeMode, Record<SoundEvent, () => void>> = {
  warroom: {
    'status-working': playTaiko,
    'status-idle': playBamboo,
    'status-error': playWarroomError,
    'cycle-complete': () => {
      playTaiko()
      setTimeout(playBamboo, 300)
    },
    'theme-switch': playBamboo,
  },
  deck: {
    'status-working': playSynthBeep,
    'status-idle': playDigitalWhoosh,
    'status-error': playDeckError,
    'cycle-complete': () => {
      playSynthBeep()
      setTimeout(playDigitalWhoosh, 200)
    },
    'theme-switch': playDigitalWhoosh,
  },
  garden: {
    'status-working': playWindChime,
    'status-idle': playWaterDrop,
    'status-error': playGardenError,
    'cycle-complete': () => {
      playWindChime()
      setTimeout(playWaterDrop, 500)
    },
    'theme-switch': playWindChime,
  },
}

export function useSound() {
  const { theme } = useTheme()
  const muted = useSyncExternalStore(subscribeMuted, getMuted)

  const play = useCallback(
    (event: SoundEvent) => {
      if (getMuted()) return
      try {
        SOUND_MAP[theme]?.[event]?.()
      } catch {
        // Audio context may not be available
      }
    },
    [theme],
  )

  const setMuted = useCallback((val: boolean) => {
    writeMuted(val)
  }, [])

  return { play, muted, setMuted }
}

export function useSoundOnStatusChange(agentStatuses: Record<string, string>) {
  const { play } = useSound()
  const prevRef = useRef<Record<string, string>>({})

  useEffect(() => {
    const prev = prevRef.current
    for (const [id, status] of Object.entries(agentStatuses)) {
      const old = prev[id]
      if (old && old !== status) {
        if (status === 'working' || status === 'thinking')
          play('status-working')
        else if (status === 'idle') play('status-idle')
        else if (status === 'error') play('status-error')
      }
    }
    prevRef.current = { ...agentStatuses }
  }, [agentStatuses, play])
}
