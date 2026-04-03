"use client";

// ── GlobalAurora ──────────────────────────────────────────────────────────────
// Capa de fondo que abarca TODA la página (position absolute dentro de <main>).
// Distribuye orbes nebulosos a lo largo de la altura completa para crear la
// sensación de que todas las secciones son una sola pieza continua.
// Las secciones están encima con sus bg semi-transparentes.
// ─────────────────────────────────────────────────────────────────────────────

const NEBULA_ORBS = [
  // top (hero)
  { top: "2%",  left: "5%",   w: 700, h: 350, color: "#1B52E8", opacity: 0.13, dur: 14, delay: 0 },
  { top: "4%",  left: "65%",  w: 500, h: 300, color: "#FF5200", opacity: 0.08, dur: 17, delay: 3 },
  // countdown
  { top: "20%", left: "15%",  w: 600, h: 350, color: "#6B2FE8", opacity: 0.10, dur: 19, delay: 2 },
  { top: "22%", left: "70%",  w: 450, h: 280, color: "#00C8FF", opacity: 0.07, dur: 13, delay: 5 },
  // rsvp
  { top: "40%", left: "0%",   w: 550, h: 400, color: "#1B52E8", opacity: 0.09, dur: 16, delay: 1 },
  { top: "42%", left: "60%",  w: 500, h: 300, color: "#FF0B7A", opacity: 0.06, dur: 21, delay: 4 },
  // mapa
  { top: "60%", left: "25%",  w: 700, h: 350, color: "#6B2FE8", opacity: 0.09, dur: 15, delay: 6 },
  { top: "62%", left: "75%",  w: 400, h: 300, color: "#1B52E8", opacity: 0.08, dur: 18, delay: 2 },
  // footer
  { top: "80%", left: "10%",  w: 500, h: 300, color: "#FF5200", opacity: 0.07, dur: 12, delay: 3 },
  { top: "82%", left: "65%",  w: 450, h: 280, color: "#00C8FF", opacity: 0.06, dur: 20, delay: 0 },
];

// Estrellas fijas distribuidas por toda la página
const PAGE_STARS = Array.from({ length: 80 }, (_, i) => ({
  id:    i,
  left:  ((i * 37 + 11) % 97) + 1,
  top:   ((i * 53 + 7)  % 98) + 1,
  size:  1 + (i % 3) * 0.8,
  delay: (i * 0.22) % 4,
  dur:   1.4 + (i % 5) * 0.4,
  color: i % 6 === 0 ? "#00C8FF" : i % 9 === 0 ? "#FF0B7A" : i % 4 === 0 ? "#FFD700" : "#ffffff",
}));

export default function GlobalAurora() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ── Orbes nebulosos ──────────────────────────────────────────────── */}
      {NEBULA_ORBS.map((orb, i) => (
        <div
          key={i}
          style={{
            position:        "absolute",
            top:             orb.top,
            left:            orb.left,
            width:           `${orb.w}px`,
            height:          `${orb.h}px`,
            background:      orb.color,
            opacity:         orb.opacity,
            borderRadius:    "50%",
            filter:          `blur(${Math.round(orb.w * 0.25)}px)`,
            animation:       `auroraOrb ${orb.dur}s ease-in-out infinite`,
            animationDelay:  `${orb.delay}s`,
            transform:       "translate(-25%, -25%)",
          }}
        />
      ))}

      {/* ── Estrellas fijas ───────────────────────────────────────────────── */}
      {PAGE_STARS.map((s) => (
        <div
          key={s.id}
          style={{
            position:        "absolute",
            left:            `${s.left}%`,
            top:             `${s.top}%`,
            width:           `${s.size}px`,
            height:          `${s.size}px`,
            borderRadius:    "50%",
            backgroundColor: s.color,
            boxShadow:       `0 0 ${s.size * 2}px ${s.color}`,
            animation:       `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay:  `${s.delay}s`,
          }}
        />
      ))}

      {/* ── Aurora diagonal lenta ─────────────────────────────────────────── */}
      <div
        style={{
          position:   "absolute",
          top:        "-10%",
          left:       "-20%",
          width:      "140%",
          height:     "60%",
          background: "linear-gradient(135deg, rgba(27,82,232,0.04) 0%, rgba(107,47,232,0.04) 40%, transparent 70%)",
          animation:  "auroraWave 25s ease-in-out infinite",
          transform:  "skewY(-8deg)",
        }}
      />
      <div
        style={{
          position:   "absolute",
          top:        "35%",
          left:       "-10%",
          width:      "130%",
          height:     "55%",
          background: "linear-gradient(135deg, transparent 0%, rgba(255,82,0,0.03) 40%, rgba(0,200,255,0.03) 70%, transparent 100%)",
          animation:  "auroraWave 30s ease-in-out infinite reverse",
          transform:  "skewY(6deg)",
        }}
      />
      <div
        style={{
          position:   "absolute",
          top:        "65%",
          left:       "-15%",
          width:      "140%",
          height:     "50%",
          background: "linear-gradient(135deg, rgba(107,47,232,0.04) 0%, rgba(27,82,232,0.03) 50%, transparent 80%)",
          animation:  "auroraWave 20s ease-in-out infinite",
          animationDelay: "5s",
          transform:  "skewY(-5deg)",
        }}
      />
    </div>
  );
}
