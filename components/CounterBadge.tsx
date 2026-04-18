"use client";

import { CapacityState } from "@/lib/event-config";

interface CounterBadgeProps {
  count: number;
  state: CapacityState;
  bumping?: boolean;
}

/**
 * Badge de "en vivo" que muestra el estado del cupo.
 *
 * 3 estados posibles:
 * - "available":  verde/azul — "Ya hay N confirmaciones"
 * - "last-spots": dorado con pulso — "¡Últimas entradas! Corré"
 * - "full":       naranja/gradient — "¡Cupos completos! Gracias"
 *
 * El número exacto de capacidad NO se muestra nunca (a pedido del organizador).
 */
export default function CounterBadge({ count, state, bumping = false }: CounterBadgeProps) {
  // ── Estado: cupo completo ─────────────────────────────────────────────────
  if (state === "full") {
    return (
      <div
        className="inline-flex items-center gap-3 px-5 py-3 rounded-full glass-card-orange glow-orange
                   transition-all duration-300"
      >
        <span className="text-xl" aria-hidden>🎉</span>
        <span className="font-fredoka text-lg md:text-xl">
          <span className="gradient-text font-fredoka text-xl md:text-2xl">
            ¡Cupos completos!
          </span>
          <span className="ml-2 text-white/85">Gracias por sumarse</span>
        </span>
      </div>
    );
  }

  // ── Estado: últimas entradas ──────────────────────────────────────────────
  if (state === "last-spots") {
    return (
      <div
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-full glass-card-orange glow-gold
                    transition-all duration-300 ${bumping ? "animate-count-bounce" : ""}`}
      >
        {/* Punto pulsante naranja/dorado para urgencia */}
        <span className="relative flex h-3 w-3" aria-hidden>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gp-orange opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gp-orange" />
        </span>
        <span className="font-fredoka text-lg md:text-xl">
          <span className="gradient-text-gold font-fredoka text-xl md:text-2xl">
            ¡Últimas entradas!
          </span>
          <span className="ml-2 text-white/85">No te quedes afuera</span>{" "}
          <span aria-hidden>⚡</span>
        </span>
      </div>
    );
  }

  // ── Estado: disponible (comportamiento original) ──────────────────────────
  const confirmacionesText =
    count === 1 ? "¡1 confirmación!" : `¡${count} confirmaciones!`;

  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-full glass-card glow-blue
                  transition-all duration-300 ${bumping ? "animate-count-bounce" : ""}`}
    >
      {/* Indicador de "en vivo" */}
      <span className="relative flex h-3 w-3" aria-hidden>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gp-green opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gp-green" />
      </span>

      <span className="font-fredoka text-lg md:text-xl text-white">
        {count === 0 ? (
          <>
            <span className="text-gp-text-dim">¡Sé la primer persona en confirmar!</span>{" "}
            <span aria-hidden>👀</span>
          </>
        ) : (
          <>
            <span className="gradient-text-gold font-fredoka text-xl md:text-2xl">
              Ya hay {confirmacionesText}
            </span>{" "}
            <span aria-hidden>🎉</span>
          </>
        )}
      </span>
    </div>
  );
}
