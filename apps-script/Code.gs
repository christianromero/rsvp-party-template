// ── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID:  "1dyjPU7uxuxgWmVRjVl0OEeMNDa3yOYK-bw6rZYu6hOE",
  SHEET_NAME:      "RSVPs",
  EVENT_DATE:      "25 de abril de 2026",
  EVENT_TIME:      "14:45 hs",
  EVENT_LOCATION:  "Gravity Park - Av. Gaona 1837, Caballito",
  MAPS_LINK:       "https://maps.google.com/?q=Av.+Gaona+1837,+Caballito,+Buenos+Aires",
  SENDER_NAME:     "Cumple Carme & Inne",
  FROM_EMAIL:      "invitacionesdigitales.latam@gmail.com",
  ORGANIZER_EMAIL: "christian.romero.a@gmail.com",
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
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp","Nombre","Apellido","DNI","Email","Telefono","Observaciones"]);
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
  GmailApp.sendEmail(CONFIG.ORGANIZER_EMAIL, subject, plain, {
    name: CONFIG.SENDER_NAME,
    htmlBody: html,
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
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0b0f1a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f1a;padding:32px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <!-- Header con degradado festivo -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a1040 0%,#2d1b69 40%,#4c1d95 100%);padding:40px 32px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#c4b5fd;">Estas invitado/a</p>
          <h1 style="margin:0 0 4px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">Cumple de</h1>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:38px;font-weight:700;color:#fbbf24;line-height:1.2;">Carme & Inne</h1>
          <div style="margin:20px auto 0;width:60px;height:2px;background:#fbbf24;border-radius:2px;"></div>
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="background:#13172a;padding:32px;">
          <p style="margin:0 0 20px;font-family:sans-serif;font-size:17px;color:#e2e8f0;line-height:1.5;">Hola <strong style="color:#fbbf24;">${nombre}</strong>, tu lugar esta confirmado.</p>
          <!-- Card de datos del evento -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e2340;border-radius:12px;border:1px solid #2d3561;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">Cuando</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">${CONFIG.EVENT_DATE}</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:15px;color:#c4b5fd;">${CONFIG.EVENT_TIME}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #2d3561;padding:16px 0 16px;">
                      <p style="margin:0 0 2px;font-family:sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">Donde</p>
                      <p style="margin:0;font-family:sans-serif;font-size:16px;font-weight:600;color:#ffffff;">Gravity Park</p>
                      <p style="margin:2px 0 0;font-family:sans-serif;font-size:14px;color:#94a3b8;">Av. Gaona 1837, Caballito</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #2d3561;padding:16px 0 0;">
                      <a href="${CONFIG.MAPS_LINK}" style="display:inline-block;background:#4c1d95;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">Ver en Google Maps</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:0;font-family:sans-serif;font-size:15px;color:#94a3b8;line-height:1.5;">Te esperamos para pasarla increible. No te olvides de llevar medias para saltar en los trampolines.</p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#0e1225;padding:20px 32px;text-align:center;border-top:1px solid #1e2340;">
          <p style="margin:0;font-family:sans-serif;font-size:13px;color:#475569;">Cumple Carme & Inne -- Gravity Park 2026</p>
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
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
  <h1 style="margin:0 0 8px;font-size:26px;color:#111827">¡Hoy es el gran día!</h1>
  <p style="margin:0 0 24px;color:#4b5563;font-size:16px">Hola <strong>${nombreCompleto}</strong>, te recordamos que hoy es el cumple de <strong>Carme &amp; Inne</strong>.</p>
  <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
    <p style="margin:0 0 10px;color:#374151;font-size:15px"><strong>${CONFIG.EVENT_DATE}</strong></p>
    <p style="margin:0 0 10px;color:#374151;font-size:15px"><strong>${CONFIG.EVENT_TIME}</strong></p>
    <p style="margin:0 0 10px;color:#374151;font-size:15px">${CONFIG.EVENT_LOCATION}</p>
    <p style="margin:0;font-size:15px"><a href="${CONFIG.MAPS_LINK}" style="color:#6366f1;text-decoration:none">Como llegar →</a></p>
  </div>
  <p style="margin:0;color:#6b7280;font-size:15px">¡Los esperamos!</p>
  <p style="margin:16px 0 0;color:#9ca3af;font-size:13px">— Cumple Carme &amp; Inne</p>
</div>
</body></html>`;
    GmailApp.sendEmail(email, subject, plain, {
      name: CONFIG.SENDER_NAME,
      htmlBody: html,
    });
  }
}
