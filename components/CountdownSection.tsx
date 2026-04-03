"use client";

import { useState, useEffect } from "react";
import { EVENT_CONFIG } from "@/lib/event-config";
import ParticleField from "./ParticleField";
import ShootingStars from "./ShootingStars";

// ── Fecha del evento desde la config ─────────────────────────────────────────
// dateISO incluye el offset de timezone: "2026-04-25T15:00:00-03:00"
function getEventDate(): Date {
  return new Date(EVENT_CONFIG.dateISO);
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now  = new Date();
  const diff = getEventDate().getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days:    Math.floor(diff / (1_000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1_000 * 60 * 60 * 24)) / (1_000 * 60 * 60)),
    minutes: Math.floor((diff % (1_000 * 60 * 60)) / (1_000 * 60)),
    seconds: Math.floor((diff % (1_000 * 60)) / 1_000),
    expired: false,
  };
}

function CountdownUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`glass-card rounded-2xl p-4 md:p-6 flex flex-col items-center ${color}`}>
      <span className="font-fredoka text-4xl md:text-6xl gradient-text countdown-digit leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-nunito text-[10px] md:text-xs text-gp-text-dim uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  );
}

function EventDetails() {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-10">
      {[
        { icon: "📅", label: "Fecha",   value: EVENT_CONFIG.dateFriendly },
        { icon: "⏰", label: "Hora",    value: EVENT_CONFIG.timeFriendly },
        { icon: "📍", label: "Lugar",   value: `${EVENT_CONFIG.location}, ${EVENT_CONFIG.address.split(",").pop()?.trim() ?? ""}` },
      ].map(({ icon, label, value }) => (
        <div key={label}
             className="flex items-center gap-3 px-5 py-3 rounded-xl glass-card border border-gp-blue/20">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <p className="font-nunito text-[10px] uppercase tracking-widest text-gp-muted">{label}</p>
            <p className="font-nunito font-bold text-sm md:text-base text-white">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1_000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <section className="py-20 px-4 bg-gp-blue-dark"><div className="max-w-2xl mx-auto text-center h-32" /></section>;
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gp-blue-dark cosmic-section">
      <div className="absolute inset-0 bg-gradient-to-b from-gp-blue-bg via-gp-blue-dark to-gp-blue-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]
                      bg-gp-blue/20 rounded-full blur-[80px]" />
      <ShootingStars />
      <ParticleField count={24} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="section-divider mb-6" />
        <h2 className="font-fredoka text-3xl md:text-4xl text-white mb-1">
          {timeLeft.expired ? "¡Ya está arrancando! 🎉" : "Falta muy poquito"}
        </h2>
        <p className="font-nunito text-gp-text-dim text-sm mb-8">
          El reloj corre... ¡no te quedés sin lugar!
        </p>

        {timeLeft.expired ? (
          <div className="text-5xl animate-bounce mb-4">🎉🎊🎈</div>
        ) : (
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            <CountdownUnit value={timeLeft.days}    label="Días"  color="glow-blue"   />
            <CountdownUnit value={timeLeft.hours}   label="Horas" color="glow-orange" />
            <CountdownUnit value={timeLeft.minutes} label="Min"   color="glow-orange" />
            <CountdownUnit value={timeLeft.seconds} label="Seg"   color="glow-blue"   />
          </div>
        )}

        <EventDetails />

        <p className="mt-10 font-nunito text-gp-text-dim text-sm">
          Te esperamos para saltar, jugar y divertirnos juntos 🕹️
        </p>
      </div>
    </section>
  );
}
