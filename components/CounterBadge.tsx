"use client";

import { useState, useEffect, useRef } from "react";

interface CounterBadgeProps {
  initialCount: number;
}

export default function CounterBadge({ initialCount }: CounterBadgeProps) {
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const prevCountRef = useRef(initialCount);

  // Polling cada 30 segundos para actualizar el contador en tiempo real
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const newCount = typeof data.count === "number" ? data.count : count;

        if (newCount !== prevCountRef.current) {
          prevCountRef.current = newCount;
          setCount(newCount);
          // Animación de rebote cuando cambia el número
          setAnimating(true);
          setTimeout(() => setAnimating(false), 500);
        }
      } catch {
        // Silencioso — si falla el fetch, mantenemos el número anterior
      }
    };

    // Primera carga al montar
    fetchCount();

    // Polling cada 30 segundos
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Texto con manejo correcto de singular/plural
  const confirmacionesText =
    count === 1 ? "¡1 confirmación!" : `¡${count} confirmaciones!`;

  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-full glass-card glow-blue
                  transition-all duration-300 ${animating ? "animate-count-bounce" : ""}`}
    >
      {/* Indicador de "en vivo" */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gp-green opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gp-green" />
      </span>

      <span className="font-fredoka text-lg md:text-xl text-white">
        {count === 0 ? (
          <>
            <span className="text-gp-text-dim">Sé el primero en confirmar</span>
            {" "}
            <span>👀</span>
          </>
        ) : (
          <>
            <span className="gradient-text-gold font-fredoka text-xl md:text-2xl">
              Ya hay {confirmacionesText}
            </span>
            {" "}
            <span>🎉</span>
          </>
        )}
      </span>
    </div>
  );
}
