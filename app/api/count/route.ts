import { NextResponse } from "next/server";

// URL del deployment activo (App web, acceso: Cualquier persona)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwSY6CFFQQzbxfcPOk_OBcM3l_mfb49e94ASlJVCptezoKtrNq8pVyf5O-phAduRnJ8/exec";

// ── GET /api/count ───────────────────────────────────────────────────────────
// Devuelve el número actual de confirmados consultando el Apps Script.
// El Apps Script doGet responde con { count: number }
export async function GET() {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      next: { revalidate: 30 },
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
    return NextResponse.json({ count: 0 }, {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });
  }
}
