import RSVPForm from "./RSVPForm";
import { EVENT_CONFIG } from "@/lib/event-config";

export default function RSVPSection() {
  return (
    <section
      id="rsvp-section"
      className="py-20 px-4 relative overflow-hidden bg-gp-blue-bg"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px]
                      bg-gp-orange/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px]
                      bg-gp-blue/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="section-divider mb-5" />
          <h2 className="font-fredoka text-3xl md:text-4xl text-white mb-2">
            Confirmá tu asistencia
          </h2>
          <p className="font-nunito text-gp-text-dim text-base">
            Completá el formulario y listo — te enviamos un recordatorio el día de{" "}
            <span className="text-white font-bold">{EVENT_CONFIG.name}</span> 🎉
          </p>
        </div>

        <div className="glass-card-orange rounded-3xl p-6 md:p-8 shadow-2xl">
          <RSVPForm />
        </div>
      </div>
    </section>
  );
}
