"use client";

import { useEffect, useRef, useState } from "react";
import { CapacityState, getCapacityState } from "./event-config";

// Intervalo de polling en ms — 30 segundos
const POLL_INTERVAL_MS = 30_000;

export interface LiveCount {
  /** Cantidad actual de confirmados (incluye el inicial SSR) */
  count: number;
  /** Estado derivado: available | last-spots | full */
  state: CapacityState;
  /** true durante ~500ms cada vez que el contador cambia (útil para animaciones) */
  bumping: boolean;
}

/**
 * Hook cliente que mantiene el conteo de RSVPs sincronizado con /api/count.
 *
 * - Arranca con `initialCount` (normalmente vino del SSR)
 * - Hace polling cada 30s
 * - Devuelve además el estado de capacidad derivado
 *
 * Uso compartido entre HeroSection (para el badge y el CTA) y RSVPSection
 * (para decidir si mostrar el formulario o la pantalla de cupo lleno).
 */
export function useLiveCount(initialCount: number): LiveCount {
  const [count, setCount] = useState<number>(initialCount);
  const [bumping, setBumping] = useState<boolean>(false);
  const prevCountRef = useRef<number>(initialCount);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const next = typeof data.count === "number" ? data.count : prevCountRef.current;

        if (next !== prevCountRef.current) {
          prevCountRef.current = next;
          setCount(next);
          setBumping(true);
          setTimeout(() => {
            if (!cancelled) setBumping(false);
          }, 500);
        }
      } catch {
        // Silencioso: mantenemos el último valor conocido
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return {
    count,
    state: getCapacityState(count),
    bumping,
  };
}
