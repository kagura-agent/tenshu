import { useDemo } from "@/hooks/useDemo";

export function DemoBanner() {
  const { isDemo } = useDemo();
  if (!isDemo) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center py-1.5 px-4 rounded-lg mx-6 mt-2 mb-0">
      Demo Mode — showing simulated agent data.{" "}
      <a href="https://github.com/JesseRWeigel/tenshu" className="underline hover:text-amber-100" target="_blank" rel="noopener noreferrer">
        Set up OpenClaw
      </a>{" "}
      to connect real agents.
    </div>
  );
}
