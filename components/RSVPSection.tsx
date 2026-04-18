"use client";

import { useState, useEffect } from "react";
import RSVPForm from "./RSVPForm";
import { EVENT_CONFIG } from "@/lib/event-config";
import { useLiveCount } from "@/lib/useLiveCount";
import ParticleField from "./ParticleField";
import ShootingStars from "./ShootingStars";
import FloatingEmojis from "./FloatingEmojis";

// ── Pantalla: el evento ya pasó ──────────────────────────────────────────────
function EventPassed() {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="text-6xl mb-6">
        <span style={{ animation: "float 2.5s ease-in-out infinite" }}>*</span>
      </div>
      <h3 className="font-fredoka text-3xl md:text-4xl gradient-text mb-3">
        Gracias por venir
      </h3>
      <p className="font-nunito text-white/85 text-lg mb-2">
        El cumple de Carme & Inne ya fue un exito
      </p>
      <p className="font-nunito text-gp-text-dim text-sm max-w-xs">
        La pasamos increible en Gravity Park. Gracias a todos los que vinieron a festejar con nosotros.
      </p>
    </div>
  );
}

// ── Pantalla: cupo completo ──────────────────────────────────────────────────
// Mensaje cálido y agradecido — nunca se menciona el número de tope.
function FullCapacity() {
  const scrollToMap = () => {
    document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="py-10 flex flex-col items-center text-center">
      {/* Emojis festivos con animación */}
      <div className="flex gap-3 text-5xl mb-5" aria-hidden>
        <span style={{ animation: "float 2.8s ease-in-out infinite" }}>🎉</span>
        <span style={{ animation: "float 2.2s ease-in-out infinite", animationDelay: "0.3s" }}>🎈</span>
        <span style={{ animation: "float 3.2s ease-in-out infinite", animationDelay: "0.6s" }}>🎊</span>
      </div>

      <h3 className="font-fredoka text-3xl md:text-4xl gradient-text mb-3">
        ¡Ya somos todos!
      </h3>

      <p className="font-nunito text-white/90 text-lg mb-4 max-w-sm leading-relaxed">
        Todos los lugares para el cumple de{" "}
        <span className="font-bold gradient-text-gold">{EVENT_CONFIG.name.replace(/^Cumple\s+/i, "")}</span>{" "}
        ya están confirmados.
      </p>

      <p className="font-nunito text-gp-text-dim text-sm max-w-xs mb-6">
        Gracias por el cariño y las ganas de festejar con nosotros —
        nos vemos muy pronto en Gravity Park para saltar juntos ✨
      </p>

      {/* Info mínima del evento para los que ya confirmaron y vuelven */}
      <div className="glass-card rounded-2xl px-5 py-4 mb-6 border border-gp-blue/30">
        <p className="font-nunito text-[10px] uppercase tracking-widest text-gp-muted mb-1">
          Nos vemos el
        </p>
        <p className="font-fredoka text-lg text-white">
          {EVENT_CONFIG.dateFriendly} · {EVENT_CONFIG.startTimeFriendly}
        </p>
        <p className="font-nunito text-sm text-gp-text-dim mt-1">
          {EVENT_CONFIG.location} — {EVENT_CONFIG.address.split(",").pop()?.trim()}
        </p>
      </div>

      <button
        onClick={scrollToMap}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                   bg-gp-blue/15 border border-gp-blue/40 text-white
                   font-nunito font-bold text-sm
                   hover:bg-gp-blue/25 hover:border-gp-blue/60
                   transition-all duration-200"
      >
        <span>📍</span> Ver cómo llegar
      </button>
    </div>
  );
}

// ── Sección principal ────────────────────────────────────────────────────────
interface RSVPSectionProps {
  initialCount: number;
}

export default function RSVPSection({ initialCount }: RSVPSectionProps) {
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { state } = useLiveCount(initialCount);
  const isFull = state === "full";

  useEffect(() => {
    setMounted(true);
    const eventEnd = new Date(EVENT_CONFIG.dateISO);
    // Consider event over 2 hours after start time
    eventEnd.setHours(eventEnd.getHours() + 2);
    setExpired(new Date() > eventEnd);
  }, []);

  // ── Elegir qué mostrar ──────────────────────────────────────────────────
  // Prioridad: evento pasado > cupo lleno > formulario
  const showPassed = mounted && expired;
  const showFull   = mounted && !expired && isFull;

  let title = "Confirma tu asistencia";
  let subtitle: React.ReactNode = (
    <>
      Completa el formulario y listo — te enviamos un recordatorio el dia de{" "}
      <span className="text-white font-bold">{EVENT_CONFIG.name}</span>
    </>
  );
  if (showPassed) {
    title = "El cumple ya paso";
    subtitle = null;
  } else if (showFull) {
    title = "¡Cupos completos!";
    subtitle = (
      <>
        Los lugares para <span className="text-white font-bold">{EVENT_CONFIG.name}</span> ya están todos confirmados ✨
      </>
    );
  }

  return (
    <section
      id="rsvp-section"
      className="py-20 px-4 relative overflow-hidden bg-gp-blue-bg cosmic-section"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px]
                      bg-gp-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px]
                      bg-gp-blue/15 rounded-full blur-[80px] pointer-events-none" />
      <ShootingStars />
      <ParticleField count={26} />
      <FloatingEmojis count={8} />
      {/* Orbe central extra */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[500px] h-[250px] bg-gp-purple/08 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="section-divider mb-5" />
          <h2 className={`font-fredoka text-3xl md:text-4xl mb-2 ${showFull ? "gradient-text" : "text-white"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito text-gp-text-dim text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="glass-card-orange rounded-3xl p-6 md:p-8 shadow-2xl">
          {showPassed ? <EventPassed /> : showFull ? <FullCapacity /> : <RSVPForm />}
        </div>
      </div>
    </section>
  );
}
