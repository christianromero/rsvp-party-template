import { EVENT_CONFIG } from "@/lib/event-config";
import ParticleField from "./ParticleField";
import ShootingStars from "./ShootingStars";
import FloatingEmojis from "./FloatingEmojis";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 relative overflow-hidden bg-gp-blue-bg border-t border-gp-blue/20 cosmic-section">
      {/* ── Orbes de fondo ────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px]
                      bg-gp-blue/12 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[280px] h-[200px]
                      bg-gp-purple/15 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] h-[200px]
                      bg-gp-orange/10 rounded-full blur-[60px] pointer-events-none" />

      {/* ── Animaciones ───────────────────────────────────────────────────── */}
      <ShootingStars />
      <ParticleField count={18} />
      <FloatingEmojis count={10} />

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-4">
        <div className="flex justify-center gap-3 text-2xl">
          {["🎈", "⭐", "🎉", "✨", "🎊"].map((e, i) => (
            <span key={i} className="select-none"
                  style={{ animation: `float ${2.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
              {e}
            </span>
          ))}
        </div>

        <p className="font-fredoka text-2xl md:text-3xl gradient-text">
          ¡Nos vemos el {EVENT_CONFIG.dateFriendly}!
        </p>
        <p className="font-nunito text-gp-text-dim text-sm">
          {EVENT_CONFIG.location} · {EVENT_CONFIG.address} · {EVENT_CONFIG.timeFriendly}
        </p>

        <div className="section-divider my-4" />

        <p className="font-nunito text-gp-muted text-xs">
          Hecho con 💙 para {EVENT_CONFIG.name} · {currentYear}
        </p>
      </div>
    </footer>
  );
}
