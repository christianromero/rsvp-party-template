import { NextRequest, NextResponse } from "next/server";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface RSVPPayload {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  observaciones?: string;
  _hp?: string; // honeypot anti-spam
}

// ── Sanitización básica ───────────────────────────────────────────────────────
function sanitizeString(val: unknown, maxLen = 100): string {
  if (typeof val !== "string") return "";
  return val.trim().replace(/[<>]/g, "").substring(0, maxLen);
}

// ── Validación server-side ────────────────────────────────────────────────────
function validate(data: RSVPPayload): string | null {
  const dniClean = data.dni.replace(/\D/g, "");
  if (!dniClean || dniClean.length < 7 || dniClean.length > 8) {
    return "DNI inválido (debe tener 7 u 8 dígitos)";
  }
  if (!data.nombre || data.nombre.length < 2) {
    return "El nombre es obligatorio";
  }
  if (!data.apellido || data.apellido.length < 2) {
    return "El apellido es obligatorio";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return "El email es inválido";
  }
  return null;
}

// ── POST /api/rsvp ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Anti-spam: honeypot ──────────────────────────────────────────────────
    // Si el campo oculto _hp viene relleno, es un bot → aceptamos silenciosamente
    if (body._hp) {
      return NextResponse.json({ success: true });
    }

    // ── Sanitizar entradas ───────────────────────────────────────────────────
    const payload: RSVPPayload = {
      dni:           sanitizeString(body.dni, 10).replace(/\D/g, ""),
      nombre:        sanitizeString(body.nombre, 80),
      apellido:      sanitizeString(body.apellido, 80),
      email:         sanitizeString(body.email, 200).toLowerCase(),
      telefono:      sanitizeString(body.telefono, 50),
      observaciones: sanitizeString(body.observaciones, 300),
    };

    // ── Validar ──────────────────────────────────────────────────────────────
    const error = validate(payload);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // ── Reenviar al Apps Script ───────────────────────────────────────────────
    // URL fija del deployment activo (versión 4, 3 abr 2026)
    // NOTA: si se cambia el deployment, actualizar esta URL
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbwoGXlNZNf1VvqgpHE7IhQqz3w4z6yzqk1HcyCmUabjjiD3CmnadQwMJbN3BzvTz7Fp/exec";

    // IMPORTANTE: Google Apps Script redirige (302) las solicitudes POST al echo server.
    // Si se sigue el redirect automáticamente, el echo server devuelve 401 (requiere login).
    // Solución: NO seguir el redirect. Un 302 significa que el script ejecutó correctamente.
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual",  // No seguir el redirect 302
      signal: AbortSignal.timeout(10_000),
    });

    console.log("Apps Script status:", response.status);

    // 302 = Apps Script procesó el POST y redirigió al echo (éxito)
    // 200 = respuesta directa (sin redirect)
    if (response.status === 302 || response.ok) {
      return NextResponse.json({ success: true });
    }

    // Cualquier otro status es error
    const bodyText = await response.text().catch(() => "");
    console.error("Apps Script respondió con:", response.status, bodyText.substring(0, 200));
    return NextResponse.json(
      { error: "Error guardando la inscripción. Intentá de nuevo en unos minutos." },
      { status: 502 }
    );

  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "El servidor tardó demasiado. Intentá de nuevo." },
        { status: 504 }
      );
    }
    console.error("Error en /api/rsvp:", err);
    return NextResponse.json(
      { error: "Error inesperado. Intentá de nuevo." },
      { status: 500 }
    );
  }
}

// Rechazar otros métodos
export async function GET() {
  return NextResponse.json({ error: "Método no permitido" }, { status: 405 });
}
