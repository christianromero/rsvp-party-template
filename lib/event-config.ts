// ════════════════════════════════════════════════════════════════════════════
// EVENT CONFIG — configuración centralizada del evento
//
// Para personalizar un nuevo evento, solo cambiás estas variables de entorno
// en Vercel (o en .env.local para desarrollo):
//
//   NEXT_PUBLIC_EVENT_NAME="Cumple Juan"
//   NEXT_PUBLIC_EVENT_DATE="2026-11-15T16:00:00-03:00"
//   NEXT_PUBLIC_EVENT_LOCATION="Parque de la Costa"
//   NEXT_PUBLIC_EVENT_ADDRESS="Vivanco 1509, Tigre"
//   NEXT_PUBLIC_EVENT_DATE_FRIENDLY="Sábado 15 de noviembre"
//   NEXT_PUBLIC_EVENT_TIME_FRIENDLY="16:00 hs"
//   NEXT_PUBLIC_EVENT_MAP_QUERY="Parque+de+la+Costa,+Vivanco+1509,+Tigre"
//   NEXT_PUBLIC_INVITATION_IMAGE="/assets/invitation-card.jpg"
//
// SIN tocar ningún componente ni lógica.
// ════════════════════════════════════════════════════════════════════════════

export const EVENT_CONFIG = {
  // ── Nombre del evento (aparece en título, hero, footer, emails) ────────────
  name: process.env.NEXT_PUBLIC_EVENT_NAME ?? "Cumple Carme & Inne",

  // ── Fecha/hora en ISO 8601 con offset Argentina (UTC-3) ───────────────────
  // Usada por el countdown. Siempre incluir el offset -03:00
  dateISO: process.env.NEXT_PUBLIC_EVENT_DATE ?? "2026-04-25T14:45:00-03:00",

  // ── Nombre del lugar ──────────────────────────────────────────────────────
  location: process.env.NEXT_PUBLIC_EVENT_LOCATION ?? "Gravity Park",

  // ── Dirección completa ────────────────────────────────────────────────────
  address: process.env.NEXT_PUBLIC_EVENT_ADDRESS ?? "Av. Gaona 1837, Caballito",

  // ── Texto de la fecha para mostrar en pantalla (formato amigable) ─────────
  dateFriendly: process.env.NEXT_PUBLIC_EVENT_DATE_FRIENDLY ?? "Sábado 25 de abril",

  // ── Texto de la hora para mostrar en pantalla ─────────────────────────────
  timeFriendly: process.env.NEXT_PUBLIC_EVENT_TIME_FRIENDLY ?? "14:45 a 16:20 hs",

  // ── Hora de inicio y fin por separado (para badges individuales) ──────────
  startTimeFriendly: process.env.NEXT_PUBLIC_EVENT_START_TIME ?? "14:45 hs",
  endTimeFriendly:   process.env.NEXT_PUBLIC_EVENT_END_TIME   ?? "16:20 hs",

  // ── Query para Google Maps embed/link ─────────────────────────────────────
  // Reemplazar espacios con + y usar nombre del lugar + dirección
  mapQuery: process.env.NEXT_PUBLIC_EVENT_MAP_QUERY
    ?? "Gravity+Park,+Av.+Gaona+1837,+Caballito,+Buenos+Aires",

  // ── Ruta a la imagen de la tarjeta de invitación ──────────────────────────
  // Poner la imagen en public/assets/ y actualizar esta variable
  invitationImage: process.env.NEXT_PUBLIC_INVITATION_IMAGE ?? "/assets/invitation-card.jpg",
} as const;

// ── Helpers derivados ─────────────────────────────────────────────────────────

/** Texto compacto para subtítulos: "Sábado 25 de abril · 15:00 hs · Gravity Park, Caballito" */
export function getEventSubtitle(): string {
  return `${EVENT_CONFIG.dateFriendly} · ${EVENT_CONFIG.timeFriendly} · ${EVENT_CONFIG.location}, ${EVENT_CONFIG.address.split(",").pop()?.trim() ?? EVENT_CONFIG.address}`;
}

/** URL para "Abrir en Google Maps" */
export function getMapsUrl(): string {
  return `https://maps.google.com/?q=${EVENT_CONFIG.mapQuery}`;
}

/** URL del iframe embed de Google Maps — muestra el pin del lugar */
export function getMapsEmbedUrl(): string {
  // Formato ?q= sin API key: Google Maps muestra el marker automáticamente
  return `https://maps.google.com/maps?q=${EVENT_CONFIG.mapQuery}&output=embed&hl=es&z=16`;
}
