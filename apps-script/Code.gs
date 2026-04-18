// ── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID:  "1dyjPU7uxuxgWmVRjVl0OEeMNDa3yOYK-bw6rZYu6hOE",
  SHEET_NAME:      "RSVPs",
  EVENT_DATE:      "25 de abril de 2026",
  EVENT_TIME:      "14:45 hs",
  EVENT_LOCATION:  "Gravity Park - Av. Gaona 1837, Caballito",
  MAPS_LINK:       "https://maps.google.com/?q=Av.+Gaona+1837,+Caballito,+Buenos+Aires",
  SENDER_NAME:     "Invitaciones Digitales",
  FROM_EMAIL:      "invitacionesdigitales.latam@gmail.com",
  ORGANIZER_EMAILS: ["christian.romero.a@gmail.com", "pcbarredo@gmail.com"],
  // Tope de capacidad — último muro defensivo. Cambiar aquí si se mueve.
  CAPACITY:        20,
};

// ── GET: devuelve el conteo de RSVPs ─────────────────────────────────────────
function doGet(e) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  const count = Math.max(0, sheet.getLastRow() - 1);
  return ContentService
    .createTextOutput(JSON.stringify({ count: count }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── POST: recibe el RSVP y lo guarda ─────────────────────────────────────────
function doPost(e) {
  // Lock para evitar race conditions entre RSVPs simultáneos que chequean
  // el count antes de insertar.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10_000); // espera hasta 10s por el lock
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "lock_timeout" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp","Nombre","Apellido","DNI","Email","Telefono","Observaciones"]);
    }

    // ── Muro final: validar capacidad ─────────────────────────────────────
    // Incluso si el cliente se saltea las validaciones frontend/API route,
    // acá cortamos. Con el lock activo, el count es consistente al momento
    // de chequear y del append.
    const currentCount = Math.max(0, sheet.getLastRow() - 1);
    const capacity = CONFIG.CAPACITY || 20;
    if (currentCount >= capacity) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "full", count: currentCount }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      new Date(),
      data.nombre        || "",
      data.apellido      || "",
      data.dni           || "",
      data.email         || "",
      data.telefono      || "",
      data.observaciones || "",
    ]);

    notifyOrganizer(data);
    sendConfirmation(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e) { /* ignorar */ }
  }
}

// ── Notifica al organizador por email ────────────────────────────────────────
function notifyOrganizer(data) {
  const nombre  = ((data.nombre || "") + " " + (data.apellido || "")).trim();
  const subject = "Nuevo RSVP: " + nombre;
  const plain = "Nuevo RSVP de " + nombre + "\n"
    + "Nombre: "        + (data.nombre        || "(no informado)") + "\n"
    + "Apellido: "      + (data.apellido      || "(no informado)") + "\n"
    + "DNI: "           + (data.dni           || "(no informado)") + "\n"
    + "Email: "         + (data.email         || "(no informado)") + "\n"
    + "Telefono: "      + (data.telefono      || "(no informado)") + "\n"
    + "Observaciones: " + (data.observaciones || "(no informado)") + "\n"
    + "Fecha: "         + new Date().toLocaleString("es-AR");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
  <h2 style="margin:0 0 4px;color:#1f2937">Nuevo RSVP para el cumple!</h2>
  <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Se registró un nuevo invitado</p>
  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 4px;color:#6b7280;width:40%">Nombre</td><td style="padding:8px 4px;color:#111827;font-weight:600">${data.nombre || "(no informado)"}</td></tr>
    <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 4px;color:#6b7280">Apellido</td><td style="padding:8px 4px;color:#111827;font-weight:600">${data.apellido || "(no informado)"}</td></tr>
    <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 4px;color:#6b7280">DNI</td><td style="padding:8px 4px;color:#111827">${data.dni || "(no informado)"}</td></tr>
    <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 4px;color:#6b7280">Email</td><td style="padding:8px 4px;color:#111827">${data.email || "(no informado)"}</td></tr>
    <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 4px;color:#6b7280">Telefono</td><td style="padding:8px 4px;color:#111827">${data.telefono || "(no informado)"}</td></tr>
    <tr><td style="padding:8px 4px;color:#6b7280">Observaciones</td><td style="padding:8px 4px;color:#111827">${data.observaciones || "(no informado)"}</td></tr>
  </table>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:13px">Registrado el ${new Date().toLocaleString("es-AR")}</p>
</div>
</body></html>`;
  CONFIG.ORGANIZER_EMAILS.forEach(function(addr) {
    GmailApp.sendEmail(addr, subject, plain, {
      name: CONFIG.SENDER_NAME,
      htmlBody: html,
    });
  });
}

// ── Confirmación al inscripto ────────────────────────────────────────────────
function sendConfirmation(data) {
  const email = data.email || "";
  if (!email) return;
  const nombre = ((data.nombre || "") + " " + (data.apellido || "")).trim();
  const subject = "Confirmaste tu asistencia al cumple de Carme & Inne";
  const plain = "Hola " + nombre + "!\n\n"
    + "Ya quedaste anotado/a para el cumple de Carme & Inne.\n"
    + "Te esperamos el " + CONFIG.EVENT_DATE + " a las " + CONFIG.EVENT_TIME + ".\n\n"
    + "Donde: " + CONFIG.EVENT_LOCATION + "\n"
    + "Como llegar: " + CONFIG.MAPS_LINK + "\n\n"
    + "Nos vemos ahi!\n-- Cumple Carme & Inne";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#060D22;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060D22;padding:32px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,82,232,0.3);">
      <!-- Header con degradado Gravity Park -->
      <tr>
        <td style="background:linear-gradient(135deg,#0A1535 0%,#1440C0 50%,#1B52E8 100%);padding:40px 32px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-family:sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#FF9500;">Confirmacion</p>
          <h1 style="margin:0 0 4px;font-family:sans-serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">Cumple de</h1>
          <h1 style="margin:0;font-family:sans-serif;font-size:38px;font-weight:700;color:#FFD700;line-height:1.2;">Carme & Inne</h1>
          <div style="margin:20px auto 0;width:60px;height:3px;background:#FF5200;border-radius:2px;"></div>
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="background:#0D1B3E;padding:32px;">
          <p style="margin:0 0 20px;font-family:sans-serif;font-size:17px;color:#e2e8f0;line-height:1.5;">Hola <strong style="color:#FFD700;">${nombre}</strong>, tu lugar esta confirmado.</p>
          <!-- Card de datos del evento -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1535;border-radius:12px;border:1px solid #1B52E8;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A0B0D0;">Cuando</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">${CONFIG.EVENT_DATE}</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:15px;color:#FF9500;">${CONFIG.EVENT_TIME}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #1B52E8;padding:16px 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A0B0D0;">Donde</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">Gravity Park</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:14px;color:#A0B0D0;">Av. Gaona 1837, Caballito</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #1B52E8;padding:16px 0 0;">
                      <a href="${CONFIG.MAPS_LINK}" style="display:inline-block;background:#FF5200;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">Ver en Google Maps</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:0;font-family:sans-serif;font-size:15px;color:#A0B0D0;line-height:1.5;">Te esperamos para pasarla increible. No te olvides de llevar medias para saltar en los trampolines.</p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#060D22;padding:20px 32px;text-align:center;border-top:1px solid #0A1535;">
          <p style="margin:0;font-family:sans-serif;font-size:13px;color:#5A6A8A;">Cumple Carme & Inne -- Gravity Park 2026</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
  GmailApp.sendEmail(email, subject, plain, {
    name: CONFIG.SENDER_NAME,
    htmlBody: html,
  });
}

// ── Recordatorio masivo (activador 25 abr) ───────────────────────────────────
function sendReminderEmails() {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const [, nombre, apellido, , email] = rows[i];
    if (!email) continue;
    const nombreCompleto = (nombre + " " + apellido).trim();
    const subject = "Hoy es el cumple de Carme & Inne!";
    const plain = "Hola " + nombreCompleto + "!\n\n"
      + "Te recordamos que hoy es el gran dia.\n\n"
      + "Cuando: " + CONFIG.EVENT_DATE + "\n"
      + "Horario: " + CONFIG.EVENT_TIME + "\n"
      + "Donde: " + CONFIG.EVENT_LOCATION + "\n\n"
      + "Como llegar: " + CONFIG.MAPS_LINK + "\n\n"
      + "Los esperamos!";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#060D22;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060D22;padding:32px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,82,232,0.3);">
      <!-- Header con degradado Gravity Park -->
      <tr>
        <td style="background:linear-gradient(135deg,#0A1535 0%,#1440C0 50%,#1B52E8 100%);padding:40px 32px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-family:sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#FF9500;">Recordatorio</p>
          <h1 style="margin:0 0 4px;font-family:sans-serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">Cumple de</h1>
          <h1 style="margin:0;font-family:sans-serif;font-size:38px;font-weight:700;color:#FFD700;line-height:1.2;">Carme & Inne</h1>
          <div style="margin:20px auto 0;width:60px;height:3px;background:#FF5200;border-radius:2px;"></div>
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="background:#0D1B3E;padding:32px;">
          <p style="margin:0 0 20px;font-family:sans-serif;font-size:17px;color:#e2e8f0;line-height:1.5;">Hola <strong style="color:#FFD700;">${nombreCompleto}</strong>, te recordamos que hoy es el gran dia.</p>
          <!-- Card de datos del evento -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1535;border-radius:12px;border:1px solid #1B52E8;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A0B0D0;">Cuando</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">${CONFIG.EVENT_DATE}</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:15px;color:#FF9500;">${CONFIG.EVENT_TIME}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #1B52E8;padding:16px 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A0B0D0;">Donde</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">Gravity Park</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:14px;color:#A0B0D0;">Av. Gaona 1837, Caballito</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #1B52E8;padding:16px 0 0;">
                      <a href="${CONFIG.MAPS_LINK}" style="display:inline-block;background:#FF5200;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">Ver en Google Maps</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:0;font-family:sans-serif;font-size:15px;color:#A0B0D0;line-height:1.5;">Te esperamos para pasarla increible. No te olvides de llevar medias para saltar en los trampolines.</p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#060D22;padding:20px 32px;text-align:center;border-top:1px solid #0A1535;">
          <p style="margin:0;font-family:sans-serif;font-size:13px;color:#5A6A8A;">Cumple Carme & Inne -- Gravity Park 2026</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
    GmailApp.sendEmail(email, subject, plain, {
      name: CONFIG.SENDER_NAME,
      htmlBody: html,
    });
  }
}
