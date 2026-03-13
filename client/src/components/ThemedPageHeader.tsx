import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/hooks/useTheme";

interface ThemedPageHeaderProps {
  kanji: string;
  title: string;
}

const ACCENT: Record<ThemeMode, { color: string; glow: string }> = {
  warroom: { color: "rgba(245, 158, 11, 0.7)", glow: "rgba(245, 158, 11, 0.3)" },
  deck: { color: "rgba(6, 182, 212, 0.8)", glow: "rgba(6, 182, 212, 0.4)" },
  garden: { color: "rgba(244, 114, 182, 0.7)", glow: "rgba(244, 114, 182, 0.3)" },
};

export function ThemedPageHeader({ kanji, title }: ThemedPageHeaderProps) {
  const { theme } = useTheme();
  const accent = ACCENT[theme];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 max-w-16" style={{
          background: `linear-gradient(to right, transparent, ${accent.glow})`,
        }} />
        <h1 className="text-lg font-light tracking-[0.3em]" style={{ color: accent.color }}>
          {kanji} <span className="text-sm tracking-[0.2em] opacity-80">{title}</span>
        </h1>
        <div className="h-px flex-1 max-w-16" style={{
          background: `linear-gradient(to left, transparent, ${accent.glow})`,
        }} />
      </div>
      <div className="mt-2 h-px w-full" style={{
        background: `linear-gradient(to right, transparent, ${accent.glow}, transparent)`,
      }} />
    </div>
  );
}
