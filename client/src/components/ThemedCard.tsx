import type { ReactNode, CSSProperties } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode } from '@/hooks/useTheme'

interface ThemedCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  glow?: boolean
  onClick?: () => void
}

const CARD_STYLES: Record<
  ThemeMode,
  { bg: string; border: string; hoverBorder: string }
> = {
  warroom: {
    bg: 'linear-gradient(135deg, rgba(46, 38, 28, 0.8) 0%, rgba(34, 30, 22, 0.8) 100%)',
    border: 'rgba(180, 140, 80, 0.15)',
    hoverBorder: 'rgba(245, 158, 11, 0.3)',
  },
  deck: {
    bg: 'linear-gradient(135deg, rgba(12, 12, 46, 0.8) 0%, rgba(8, 8, 26, 0.8) 100%)',
    border: 'rgba(6, 182, 212, 0.15)',
    hoverBorder: 'rgba(6, 182, 212, 0.35)',
  },
  garden: {
    bg: 'linear-gradient(135deg, rgba(60, 35, 50, 0.6) 0%, rgba(40, 22, 35, 0.6) 100%)',
    border: 'rgba(244, 114, 182, 0.12)',
    hoverBorder: 'rgba(244, 114, 182, 0.3)',
  },
}

export function ThemedCard({
  children,
  className = '',
  style,
  glow,
  onClick,
}: ThemedCardProps) {
  const { theme } = useTheme()
  const s = CARD_STYLES[theme]

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] ${className}`}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: theme === 'garden' ? 'blur(8px)' : undefined,
        boxShadow: glow ? `0 0 20px ${s.border}` : `0 2px 8px rgba(0,0,0,0.2)`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
