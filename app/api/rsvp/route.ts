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

    // ── Reenviar al Apps Script (la URL es secreta y vive en el servidor) ────
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
      console.error("APPS_SCRIPT_URL no configurado");
      return NextResponse.json(
        { error: "El sistema de inscripción no está configurado aún. Contactá a los organizadores." },
        { status: 503 }
      );
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10_000),
    });

    // Apps Script a veces devuelve 302 (redirect) que fetch sigue automáticamente
    if (!response.ok && response.status !== 302) {
      console.error("Apps Script respondió con:", response.status);
      return NextResponse.json(
        { error: "Error guardando la inscripción. Intentá de nuevo en unos minutos." },
        { status: 502 }
      );
    }

    const result = await response.json().catch(() => ({ success: true }));

    if (result.error) {
      // El Apps Script nos devuelve un error de negocio (ej: duplicado)
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      count: result.count ?? null,
    });

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
