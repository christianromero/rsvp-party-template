import { NextResponse } from "next/server";

// ── GET /api/count ───────────────────────────────────────────────────────────
// Devuelve el número actual de inscriptos consultando el Apps Script.
// Se cachea 30 segundos para no sobrecargar el Apps Script con polling.
export async function GET() {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      // Si no hay Apps Script configurado, devolvemos 0 sin error visible
      return NextResponse.json({ count: 0 }, {
        headers: { "Cache-Control": "public, s-maxage=30" },
      });
    }

    // El Apps Script responde a GET con { count: number }
    const response = await fetch(`${appsScriptUrl}?action=count`, {
      next: { revalidate: 30 }, // revalidar en 30s (Next.js cache)
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return NextResponse.json({ count: 0 }, {
        headers: { "Cache-Control": "public, s-maxage=30" },
      });
    }

    const data = await response.json().catch(() => ({ count: 0 }));
    const count = typeof data.count === "number" ? Math.max(0, data.count) : 0;

    return NextResponse.json({ count }, {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });

  } catch {
    // En caso de cualquier error, devolvemos 0 silenciosamente
    return NextResponse.json({ count: 0 }, {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });
  }
}
