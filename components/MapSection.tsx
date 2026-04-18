import { EVENT_CONFIG, getMapsUrl, getMapsEmbedUrl } from "@/lib/event-config";
import ParticleField from "./ParticleField";
import ShootingStars from "./ShootingStars";
import FloatingEmojis from "./FloatingEmojis";

export default function MapSection() {
  return (
    <section id="map-section" className="py-20 px-4 relative overflow-hidden bg-gp-blue-dark cosmic-section">
      <div className="absolute inset-0 bg-gradient-to-b from-gp-blue-bg to-gp-blue-dark" />

      {/* ── Orbes de fondo ────────────────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[350px] bg-gp-blue/12 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[350px] h-[350px]
                      bg-gp-purple/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px]
                      bg-gp-orange/10 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-[200px] h-[400px]
                      bg-gp-cyan/08 rounded-full blur-[60px] pointer-events-none" />

      {/* ── Animaciones ───────────────────────────────────────────────────── */}
      <ShootingStars />
      <ParticleField count={22} />
      <FloatingEmojis count={6} />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="section-divider mb-5" />
          <h2 className="font-fredoka text-3xl md:text-4xl text-white mb-2">
            ¿Cómo llegar? 📍
          </h2>
          <p className="font-nunito text-gp-text-dim text-base">
            {EVENT_CONFIG.location} · {EVENT_CONFIG.address}
          </p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden border border-gp-blue/30 glow-blue shadow-2xl">
          <div className="map-container">
            <iframe
              src={getMapsEmbedUrl()}
              title={`Mapa — ${EVENT_CONFIG.location}, ${EVENT_CONFIG.address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              style={{
                filter: "invert(93%) hue-rotate(177deg) brightness(0.88) saturate(1.4) contrast(0.92)",
              }}
            />
          </div>

          <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center
                          justify-between gap-3 border-t border-gp-blue/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏟️</span>
              <div>
                <p className="font-nunito font-bold text-sm text-white">{EVENT_CONFIG.location}</p>
                <p className="font-nunito text-xs text-gp-text-dim">{EVENT_CONFIG.address}</p>
              </div>
            </div>
            <a
              href={getMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gp-blue/20 hover:bg-gp-blue/35
                         border border-gp-blue/40 text-white font-nunito text-sm font-bold
                         transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <span>🗺️</span>
              Abrir en Maps
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "🚇", title: "Subte",      text: "Línea A — Estación Primera Junta (5 min caminando)" },
            { icon: "🚌", title: "Colectivos", text: "Líneas 1, 26, 55, 56 y más por Av. Rivadavia" },
          ].map(({ icon, title, text }) => (
            <div key={title}
                 className="glass-card rounded-2xl p-4 border border-gp-blue/15 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-nunito font-bold text-sm text-white mb-1">{title}</p>
              <p className="font-nunito text-xs text-gp-text-dim">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
