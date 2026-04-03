import type { Metadata } from "next";
import "./globals.css";

// ── Metadata de la página ────────────────────────────────────────────────────
const SITE_URL = "https://rsvp-party-template.vercel.app";
const OG_IMAGE = `${SITE_URL}/assets/invitation-card.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "¡Cumple Carme & Inne! 🎉 — Confirmá tu asistencia",
  description:
    "Carme & Inne te invitan a su cumpleaños en Gravity Park, Caballito. Sábado 25 de abril a las 14:45 hs. ¡Confirmá tu asistencia!",
  keywords: ["cumpleaños", "Gravity Park", "Carme", "Inne", "RSVP", "Caballito"],
  openGraph: {
    title: "¡Cumple Carme & Inne! 🎉",
    description:
      "Sábado 25 de abril a las 14:45 hs — Gravity Park, Av. Gaona 1837, Caballito. ¡Confirmá tu asistencia!",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 600,
        height: 860,
        alt: "Tarjeta de invitación — Cumple Carme & Inne en Gravity Park",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "¡Cumple Carme & Inne! 🎉",
    description: "Sábado 25 de abril a las 14:45 hs — Gravity Park, Caballito.",
    images: [OG_IMAGE],
  },
  // Evitar que buscadores indexen la página privada de invitados
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Favicon emoji 🎉 */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎉</text></svg>"
        />

        {/* ── Google Fonts — Fredoka (festiva) + Nunito (body) ───────────────── */}
        {/* Carga como <link> para compatibilidad con entornos sin acceso a Google a build-time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gp-blue-bg text-white font-nunito">
        {children}
      </body>
    </html>
  );
}
