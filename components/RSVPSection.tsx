"use client";

import { useState, useEffect } from "react";
import RSVPForm from "./RSVPForm";
import { EVENT_CONFIG } from "@/lib/event-config";
import ParticleField from "./ParticleField";
import ShootingStars from "./ShootingStars";
import FloatingEmojis from "./FloatingEmojis";

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

export default function RSVPSection() {
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const eventEnd = new Date(EVENT_CONFIG.dateISO);
    // Consider event over 2 hours after start time
    eventEnd.setHours(eventEnd.getHours() + 2);
    setExpired(new Date() > eventEnd);
  }, []);

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
          <h2 className="font-fredoka text-3xl md:text-4xl text-white mb-2">
            {mounted && expired ? "El cumple ya paso" : "Confirma tu asistencia"}
          </h2>
          {!(mounted && expired) && (
            <p className="font-nunito text-gp-text-dim text-base">
              Completa el formulario y listo — te enviamos un recordatorio el dia de{" "}
              <span className="text-white font-bold">{EVENT_CONFIG.name}</span>
            </p>
          )}
        </div>

        <div className="glass-card-orange rounded-3xl p-6 md:p-8 shadow-2xl">
          {mounted && expired ? <EventPassed /> : <RSVPForm />}
        </div>
      </div>
    </section>
  );
}
