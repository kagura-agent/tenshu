import { useRef, useEffect, useCallback } from "react";

const MAX_PARTICLES = 25;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: "sakura" | "firefly" | "energy" | "ember";
  color: string;
  life: number;
  maxLife: number;
}

interface AnimatedCanvasProps {
  theme: "warroom" | "deck";
  intensity: number;
  className?: string;
}

function createSakura(w: number): Particle {
  return {
    x: Math.random() * w,
    y: -10,
    vx: 0.2 + Math.random() * 0.5,
    vy: 0.4 + Math.random() * 0.6,
    size: 4 + Math.random() * 6,
    opacity: 0.4 + Math.random() * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.03,
    type: "sakura",
    color: Math.random() > 0.5 ? "#ffb7c5" : "#ff91a4",
    life: 0,
    maxLife: 600 + Math.random() * 400,
  };
}

function createFirefly(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 2 + Math.random() * 3,
    opacity: 0,
    rotation: 0,
    rotationSpeed: 0,
    type: "firefly",
    color: "#ffd700",
    life: 0,
    maxLife: 200 + Math.random() * 300,
  };
}

function createEnergy(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: h + 10,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -(1 + Math.random() * 2),
    size: 1 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.5,
    rotation: 0,
    rotationSpeed: 0,
    type: "energy",
    color: Math.random() > 0.5 ? "#06b6d4" : "#8b5cf6",
    life: 0,
    maxLife: 150 + Math.random() * 150,
  };
}

function createEmber(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: h * 0.8 + Math.random() * h * 0.2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.3 + Math.random() * 0.8),
    size: 1.5 + Math.random() * 2,
    opacity: 0.5 + Math.random() * 0.4,
    rotation: 0,
    rotationSpeed: 0,
    type: "ember",
    color: Math.random() > 0.3 ? "#ff8c00" : "#ff4500",
    life: 0,
    maxLife: 100 + Math.random() * 200,
  };
}

function drawSakura(ctx: CanvasRenderingContext2D, p: Particle, dpr: number) {
  // Use setTransform instead of save/translate/rotate/restore
  // Must include DPR scaling in the transform matrix
  const cos = Math.cos(p.rotation) * dpr;
  const sin = Math.sin(p.rotation) * dpr;
  ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Single circle glow dot — minimal draw calls
function drawGlowDot(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = p.opacity * 0.7;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

export function AnimatedCanvas({ theme, intensity, className }: AnimatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const lastFrameTimeRef = useRef(0);

  const animate = useCallback((timestamp: number) => {
    frameRef.current = requestAnimationFrame(animate);

    // Throttle to TARGET_FPS
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < FRAME_INTERVAL) return;
    lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use CSS pixel dimensions (already scaled by devicePixelRatio transform)
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    if (theme === "warroom") {
      ctx.fillStyle = "rgba(26, 20, 16, 0.15)";
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = "rgba(8, 8, 26, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Draw grid from cached offscreen canvas
      if (!gridCanvasRef.current || lastSizeRef.current.w !== w || lastSizeRef.current.h !== h) {
        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const offCtx = offscreen.getContext("2d")!;
        offCtx.strokeStyle = "rgba(6, 182, 212, 0.04)";
        offCtx.lineWidth = 1;
        offCtx.beginPath();
        for (let x = 0; x < w; x += 60) {
          offCtx.moveTo(x, 0);
          offCtx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += 60) {
          offCtx.moveTo(0, y);
          offCtx.lineTo(w, y);
        }
        offCtx.stroke();
        gridCanvasRef.current = offscreen;
        lastSizeRef.current = { w, h };
      }
      ctx.drawImage(gridCanvasRef.current, 0, 0);

      // Horizon glow — simple fill, no gradient per frame
      ctx.fillStyle = "rgba(88, 28, 135, 0.04)";
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
    }

    const particles = particlesRef.current;

    // Spawn with cap
    if (particles.length < MAX_PARTICLES) {
      const spawnRate = 0.5 + intensity * 2;
      if (Math.random() < spawnRate * 0.05) {
        if (theme === "warroom") {
          particles.push(createSakura(w));
          if (intensity > 0.3 && Math.random() < 0.3) particles.push(createFirefly(w, h));
          if (intensity > 0.5 && Math.random() < 0.2) particles.push(createEmber(w, h));
        } else {
          particles.push(createSakura(w));
          if (Math.random() < 0.4 + intensity * 0.3) particles.push(createEnergy(w, h));
        }
      }

      // Baseline sakura
      let sakuraCount = 0;
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].type === "sakura") sakuraCount++;
      }
      if (sakuraCount < 4) particles.push(createSakura(w));
    }

    // Update & draw — single pass, no save/restore for simple shapes
    let writeIdx = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life++;
      if (p.life > p.maxLife) continue;
      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.1) {
        p.opacity = (lifeRatio / 0.1) * (p.type === "firefly" ? 0.6 : 0.7);
      } else if (lifeRatio > 0.8) {
        p.opacity *= 0.98;
      }

      if (p.type === "firefly") {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
        p.opacity = Math.abs(Math.sin(p.life * 0.02)) * 0.6;
      }
      if (p.type === "sakura") {
        p.vx = Math.sin(p.life * 0.01) * 0.5 + 0.2;
      }

      if (p.type === "sakura") {
        drawSakura(ctx, p, dpr);
      } else {
        drawGlowDot(ctx, p);
      }

      particles[writeIdx++] = p;
    }
    particles.length = writeIdx;

    // Reset transform after sakura draws used setTransform
    const dpr2 = window.devicePixelRatio || 1;
    ctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
  }, [theme, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        // Invalidate grid cache on resize
        gridCanvasRef.current = null;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame((ts) => animate(ts));

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className || ""}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
