import HeroSection from "@/components/HeroSection";
import CountdownSection from "@/components/CountdownSection";
import RSVPSection from "@/components/RSVPSection";
import MapSection from "@/components/MapSection";
import FooterSection from "@/components/FooterSection";
import GlobalAurora from "@/components/GlobalAurora";

// ── Obtener conteo inicial desde la API (SSR) ────────────────────────────────
// Se hace server-side para que el primer render ya tenga el número real
async function getInitialCount(): Promise<number> {
  try {
    // En server-side usamos la URL absoluta según la variable de entorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/count`, {
      next: { revalidate: 60 }, // revalidar cada 60s en producción
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    // Si falla, arrancamos en 0 — el componente cliente actualizará solo
    return 0;
  }
}

export default async function Home() {
  const initialCount = await getInitialCount();

  return (
    <main className="min-h-screen overflow-x-hidden relative">
      {/* ── Capa de fondo global: une todas las secciones en una sola pieza ── */}
      <GlobalAurora />

      {/* 1. Hero: título, tarjeta, CTA, contador */}
      <HeroSection initialCount={initialCount} />

      {/* 2. Countdown: días/horas/minutos/segundos hasta el evento */}
      <CountdownSection />

      {/* 3. Formulario RSVP */}
      <RSVPSection initialCount={initialCount} />

      {/* 4. Mapa de Google Maps */}
      <MapSection />

      {/* 5. Footer */}
      <FooterSection />
    </main>
  );
}
