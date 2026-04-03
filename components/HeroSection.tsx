"use client";

import Image from "next/image";
import CounterBadge from "./CounterBadge";
import ShootingStars from "./ShootingStars";
import ParticleField from "./ParticleField";
import { EVENT_CONFIG, getEventSubtitle } from "@/lib/event-config";

// ── Estrellas decorativas en el fondo ────────────────────────────────────────
const STARS = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  size:  1.5 + Math.floor(((i * 7) % 4)),
  left:  ((i * 37 + 11) % 95) + 1,
  top:   ((i * 53 + 7)  % 95) + 1,
  delay: (i * 0.25) % 4,
  dur:   1.2 + (i % 4) * 0.5,
  color: i % 5 === 0 ? "#00C8FF" : i % 7 === 0 ? "#FF0B7A" : "#FFD700",
}));

interface HeroSectionProps {
  initialCount: number;
}

export default function HeroSection({ initialCount }: HeroSectionProps) {
  const scrollToForm = () => {
    document.getElementById("rsvp-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Separar "Cumple Carme & Inne" → prefix="Cumple", partyName="Carme & Inne"
  const ampIndex = EVENT_CONFIG.name.indexOf("&");
  const hasAmp = ampIndex !== -1;
  const firstChunk = hasAmp ? EVENT_CONFIG.name.slice(0, ampIndex).trim() : EVENT_CONFIG.name;
  const secondChunk = hasAmp ? EVENT_CONFIG.name.slice(ampIndex + 1).trim() : null;
  const firstWords = firstChunk.split(" ");
  const prefix    = firstWords.length > 1 ? firstWords[0] : null;          // "Cumple"
  const name1     = firstWords.length > 1 ? firstWords.slice(1).join(" ") : firstChunk; // "Carme"
  const partyName = secondChunk ? `${name1} & ${secondChunk}` : name1;    // "Carme & Inne"

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-bg stripe-bg">

      {/* ── Estrellas fugaces ─────────────────────────────────────────────── */}
      <ShootingStars />

      {/* ── Partículas flotantes ──────────────────────────────────────────── */}
      <ParticleField count={22} />

      {/* ── Orbes de luz ──────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                      bg-gp-blue/25 rounded-full blur-[100px] animate-orb"
           style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px]
                      bg-gp-orange/15 rounded-full blur-[80px] animate-orb"
           style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px]
                      bg-gp-purple/20 rounded-full blur-[70px] animate-orb"
           style={{ animationDelay: "1.5s" }} />

      {/* ── Estrellas doradas ────────────────────────────────────────────── */}
      {STARS.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full pointer-events-none select-none"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.left}%`,
            top: `${s.top}%`,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            animation: `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-16 pb-12 w-full max-w-2xl mx-auto">

        {/* Chip superior */}
        <div className="flex items-center gap-2 mb-6 px-5 py-2 rounded-full glass-card border border-gp-blue/40">
          <span className="text-xl">🎊</span>
          <span className="font-nunito text-sm font-bold text-gp-text-dim uppercase tracking-[0.25em]">
            {prefix ? `Invitación ${prefix}` : "Invitación"}
          </span>
          <span className="text-xl">🎊</span>
        </div>

        {/* ── Título ────────────────────────────────────────────────────────── */}
        <h1 className="leading-none mb-1 text-center">
          <span
            className="block gradient-text drop-shadow-lg font-pacifico"
            style={{ fontSize: "clamp(2.6rem, 12vw, 5.8rem)" }}
          >
            {partyName}
          </span>
        </h1>

        <p className="font-nunito text-lg md:text-xl text-white/85 mt-2 mb-1">
          te invitan a su cumple 🥳
        </p>
        <p className="font-nunito text-sm md:text-base text-gp-text-dim mb-8">
          {getEventSubtitle()}
        </p>

        {/* ── Tarjeta de invitación ──────────────────────────────────────── */}
        <div className="relative w-full max-w-[260px] md:max-w-[300px] mx-auto mb-8 animate-float">
          <div className="absolute inset-0 rounded-3xl bg-gp-orange/20 blur-2xl scale-110" />
          <div className="relative rounded-3xl overflow-hidden glow-orange shadow-2xl border border-gp-orange/30">
            <Image
              src={EVENT_CONFIG.invitationImage}
              alt={`Tarjeta de invitación — ${EVENT_CONFIG.name}`}
              width={300}
              height={430}
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="absolute -top-5 -right-5 text-3xl select-none"
               style={{ animation: "floatAlt 3.5s ease-in-out infinite" }}>⭐</div>
          <div className="absolute -bottom-4 -left-5 text-3xl select-none"
               style={{ animation: "float 4s ease-in-out infinite", animationDelay: "0.8s" }}>🎈</div>
          <div className="absolute top-1/2 -right-6 text-2xl select-none"
               style={{ animation: "floatAlt 5s ease-in-out infinite", animationDelay: "1.5s" }}>✨</div>
        </div>

        {/* ── Contador en vivo ──────────────────────────────────────────── */}
        <CounterBadge initialCount={initialCount} />

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <button
          onClick={scrollToForm}
          className="btn-primary mt-6 px-10 py-4 rounded-full font-fredoka text-xl md:text-2xl
                     text-white shadow-2xl cursor-pointer"
          aria-label="Ir al formulario de confirmación de asistencia"
        >
          Confirmar asistencia 🙋
        </button>

        <div className="mt-10 flex flex-col items-center text-gp-muted animate-bounce">
          <span className="font-nunito text-xs mb-1">Ver detalles del evento</span>
          <span className="text-xl">↓</span>
        </div>
      </div>
    </section>
  );
}
