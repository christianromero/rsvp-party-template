"use client";

import { useMemo } from "react";

// Colores brand: azul GP, naranja GP, dorado, cyan, rosa
const COLORS = ["#1B52E8", "#FF5200", "#FFD700", "#00C8FF", "#FF0B7A"];

interface Particle {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  color: string;
  blur: number;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export default function ParticleField({ count = 18, className = "" }: ParticleFieldProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        size:     1.5 + (i * 1.7) % 3,
        left:     ((i * 41 + 17) % 94) + 3,
        duration: 7 + (i * 1.3) % 9,
        delay:    (i * 0.55) % 8,
        color:    COLORS[i % COLORS.length],
        blur:     (i % 3) * 1,
      })),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width:    p.size,
            height:   p.size,
            left:     `${p.left}%`,
            bottom:   "-8px",
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}80`,
            filter:   p.blur > 0 ? `blur(${p.blur}px)` : undefined,
            animation: `particleFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity:  0,
          }}
        />
      ))}
    </div>
  );
}
