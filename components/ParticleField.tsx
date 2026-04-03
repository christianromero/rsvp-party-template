"use client";

import { useMemo } from "react";

// Colores brand: azul GP, naranja GP, dorado, cyan, rosa
const COLORS = ["#1B52E8", "#FF5200", "#FFD700", "#00C8FF", "#FF0B7A", "#6B2FE8", "#FF9500"];

// Variantes de animación
const ANIMATIONS = ["particleFloat", "particleDrift", "particleSpinFloat"];

// Formas: circle, diamond
type Shape = "circle" | "diamond" | "ring";

interface Particle {
  id:        number;
  size:      number;
  left:      number;
  startY:    number;   // % desde abajo
  duration:  number;
  delay:     number;
  color:     string;
  blur:      number;
  anim:      string;
  shape:     Shape;
  opacity:   number;
}

interface ParticleFieldProps {
  count?:     number;
  className?: string;
}

export default function ParticleField({ count = 28, className = "" }: ParticleFieldProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const shape: Shape =
          i % 7 === 0 ? "ring" :
          i % 3 === 0 ? "diamond" : "circle";

        return {
          id:       i,
          shape,
          size:     shape === "ring" ? 10 + (i * 2.1) % 16 :
                    shape === "diamond" ? 3 + (i * 1.4) % 5 :
                    1.5 + (i * 1.8) % 4,
          left:     ((i * 41 + 17) % 94) + 3,
          startY:   (i % 5) * 5,          // algunos arrancan más arriba
          duration: 8 + (i * 1.3) % 12,
          delay:    (i * 0.6) % 10,
          color:    COLORS[i % COLORS.length],
          blur:     shape === "ring" ? 0 : (i % 3),
          anim:     ANIMATIONS[i % ANIMATIONS.length],
          opacity:  shape === "ring" ? 0.25 + (i % 3) * 0.1 : 1,
        };
      }),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {particles.map((p) => {
        const commonStyle: React.CSSProperties = {
          position:   "absolute",
          left:       `${p.left}%`,
          bottom:     `${p.startY}%`,
          animation:  `${p.anim} ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          opacity:    0,
          filter:     p.blur > 0 ? `blur(${p.blur}px)` : undefined,
        };

        if (p.shape === "ring") {
          return (
            <div
              key={p.id}
              style={{
                ...commonStyle,
                width:        p.size,
                height:       p.size,
                borderRadius: "50%",
                border:       `1.5px solid ${p.color}80`,
                boxShadow:    `0 0 ${p.size}px ${p.color}40`,
              }}
            />
          );
        }

        if (p.shape === "diamond") {
          return (
            <div
              key={p.id}
              style={{
                ...commonStyle,
                width:           p.size,
                height:          p.size,
                backgroundColor: p.color,
                boxShadow:       `0 0 ${p.size * 3}px ${p.color}90`,
                transform:       "rotate(45deg)",
              }}
            />
          );
        }

        // circle (default)
        return (
          <div
            key={p.id}
            style={{
              ...commonStyle,
              width:           p.size,
              height:          p.size,
              borderRadius:    "50%",
              backgroundColor: p.color,
              boxShadow:       `0 0 ${p.size * 4}px ${p.color}80`,
            }}
          />
        );
      })}
    </div>
  );
}
