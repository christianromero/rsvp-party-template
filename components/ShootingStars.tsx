"use client";

// ── Estrellas fugaces decorativas ────────────────────────────────────────────
// CSS-only: 8 estrellas con delays escalonados en un ciclo de ~18s
// Cada estrella es un elemento rotado con cola degradada

const SHOOTING_STARS = [
  { top: "4%",  left: "5%",  delay: "0s",    dur: "2.8s", len: 180, color: "#00C8FF" },
  { top: "12%", left: "35%", delay: "2.5s",  dur: "2.4s", len: 150, color: "#FFD700" },
  { top: "6%",  left: "60%", delay: "4.8s",  dur: "3s",   len: 200, color: "#ffffff" },
  { top: "20%", left: "15%", delay: "7s",    dur: "2.6s", len: 160, color: "#FF0B7A" },
  { top: "3%",  left: "80%", delay: "9.2s",  dur: "2.9s", len: 140, color: "#00C8FF" },
  { top: "16%", left: "50%", delay: "11.5s", dur: "2.3s", len: 170, color: "#FFD700" },
  { top: "8%",  left: "25%", delay: "13.8s", dur: "3.1s", len: 190, color: "#ffffff" },
  { top: "22%", left: "70%", delay: "16s",   dur: "2.5s", len: 155, color: "#1B52E8" },
];

interface ShootingStarsProps {
  className?: string;
}

export default function ShootingStars({ className = "" }: ShootingStarsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {SHOOTING_STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position:        "absolute",
            top:             star.top,
            left:            star.left,
            width:           `${star.len}px`,
            height:          "1.5px",
            background:      `linear-gradient(90deg, transparent 0%, ${star.color}cc 40%, ${star.color} 70%, transparent 100%)`,
            transform:       "rotate(35deg)",
            transformOrigin: "left center",
            borderRadius:    "2px",
            animation:       `shootingStarAnim ${star.dur} ease-in forwards infinite`,
            animationDelay:  star.delay,
            opacity:         0,
          }}
        />
      ))}
    </div>
  );
}
