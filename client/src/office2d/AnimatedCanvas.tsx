import { useRef, useEffect, useCallback } from "react";

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
  /** 0-1, how active the agents are (drives visual intensity) */
  intensity: number;
  className?: string;
}

function createSakura(w: number, _h: number): Particle {
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

function drawSakura(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  // Petal shape
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner detail
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, -p.size * 0.2, p.size * 0.2, p.size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFirefly(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  // Outer glow
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
  gradient.addColorStop(0, `${p.color}88`);
  gradient.addColorStop(0.5, `${p.color}22`);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEnergy(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  // Trail
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
  gradient.addColorStop(0, p.color);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
  ctx.fill();

  // Core dot
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEmber(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
  gradient.addColorStop(0, p.color);
  gradient.addColorStop(0.5, `${p.color}44`);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function AnimatedCanvas({ theme, intensity, className }: AnimatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear canvas — transparent so background image shows through
    ctx.clearRect(0, 0, w, h);

    if (theme === "warroom") {
      // Light translucent overlay for depth
      ctx.fillStyle = "rgba(26, 20, 16, 0.15)";
      ctx.fillRect(0, 0, w, h);
    } else {
      // Light translucent overlay + neon grid for cyberpunk feel
      ctx.fillStyle = "rgba(8, 8, 26, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Subtle neon grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Horizon glow
      const horizonGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
      horizonGrad.addColorStop(0, "transparent");
      horizonGrad.addColorStop(1, "rgba(88, 28, 135, 0.08)");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
    }

    // Spawn particles based on intensity
    const spawnRate = 0.5 + intensity * 2;
    if (Math.random() < spawnRate * 0.05) {
      if (theme === "warroom") {
        particlesRef.current.push(createSakura(w, h));
        if (intensity > 0.3 && Math.random() < 0.3) {
          particlesRef.current.push(createFirefly(w, h));
        }
        if (intensity > 0.5 && Math.random() < 0.2) {
          particlesRef.current.push(createEmber(w, h));
        }
      } else {
        particlesRef.current.push(createSakura(w, h));
        if (Math.random() < 0.4 + intensity * 0.3) {
          particlesRef.current.push(createEnergy(w, h));
        }
      }
    }

    // Always have some baseline sakura
    if (particlesRef.current.filter((p) => p.type === "sakura").length < 8) {
      particlesRef.current.push(createSakura(w, h));
    }

    // Update & draw particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life++;
      if (p.life > p.maxLife) return false;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Fade in/out
      const lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.1) {
        p.opacity = (lifeRatio / 0.1) * (p.type === "firefly" ? 0.6 : 0.7);
      } else if (lifeRatio > 0.8) {
        p.opacity *= 0.98;
      }

      // Firefly wandering
      if (p.type === "firefly") {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
        p.opacity = Math.abs(Math.sin(p.life * 0.02)) * 0.6;
      }

      // Sakura wobble
      if (p.type === "sakura") {
        p.vx = Math.sin(p.life * 0.01) * 0.5 + 0.2;
      }

      // Draw based on type
      switch (p.type) {
        case "sakura":
          drawSakura(ctx, p);
          break;
        case "firefly":
          drawFirefly(ctx, p);
          break;
        case "energy":
          drawEnergy(ctx, p);
          break;
        case "ember":
          drawEmber(ctx, p);
          break;
      }

      // Remove if off screen
      return p.x > -20 && p.x < w + 20 && p.y > -20 && p.y < h + 20;
    });

    frameRef.current = requestAnimationFrame(animate);
  }, [theme, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(animate);

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
