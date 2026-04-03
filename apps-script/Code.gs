// ════════════════════════════════════════════════════════════════════════════
// RSVP Backend — Google Apps Script
// Cumple Carme & Inne · Gravity Park · 25/04/2026
//
// Cómo usar:
//  1. Crear un nuevo Google Apps Script en script.google.com
//  2. Pegar este código
//  3. Ajustar las constantes de configuración abajo
//  4. Desplegar como Web App (ver README para instrucciones detalladas)
//  5. Ejecutar setupEventDayTrigger() UNA SOLA VEZ para programar el recordatorio
// ════════════════════════════════════════════════════════════════════════════

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
// ⚠️ CAMBIAR estos valores antes de desplegar

var CONFIG = {
  // ID del Google Sheet donde se guardan las inscripciones
  // Lo encontrás en la URL: docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
  SPREADSHEET_ID: "PEGAR_AQUÍ_EL_ID_DE_TU_GOOGLE_SHEET",

  // Nombre de la hoja dentro del Spreadsheet
  SHEET_NAME: "RSVP",

  // Datos del evento (para los emails)
  EVENT_NAME:    "Carme & Inne",
  EVENT_DATE_STR: "Sábado 25 de abril de 2026",
  EVENT_TIME:    "14:45 a 16:20 hs",
  EVENT_ADDRESS: "Gravity Park · Av. Gaona 1837, Caballito",

  // Asunto del email recordatorio
  EMAIL_SUBJECT: "¡Hoy es el cumple de Carme & Inne! 🎉",

  // URL pública de la tarjeta de invitación
  // Opción A: subís la imagen a Google Drive, la hacés pública y pegás la URL directa
  // Opción B: usás la URL de tu Vercel deploy, ej: https://tu-app.vercel.app/assets/invitation-card.jpg
  INVITATION_IMAGE_URL: "https://TU_APP.vercel.app/assets/invitation-card.jpg",

  // URL del deploy de tu landing (para el botón en el email)
  LANDING_URL: "https://TU_APP.vercel.app",

  // Año del evento (para el trigger)
  EVENT_YEAR:  2026,
  EVENT_MONTH: 4,   // Abril
  EVENT_DAY:   25,
  REMINDER_HOUR: 9, // 9 AM Argentina — el script timezone DEBE ser America/Argentina/Buenos_Aires
};

// ── COLUMNAS DEL SHEET ────────────────────────────────────────────────────────
// El orden importa — si cambiás esto, cambiá también las referencias de índice
var COLUMNS = {
  TIMESTAMP:   1,  // A: Fecha de inscripción
  DNI:         2,  // B: DNI
  NOMBRE:      3,  // C: Nombre
  APELLIDO:    4,  // D: Apellido
  EMAIL:       5,  // E: Email
  TELEFONO:    6,  // F: Teléfono
  ESTADO:      7,  // G: Estado RSVP
  RECORDATORIO:8,  // H: Recordatorio enviado (SI/NO)
  FECHA_REC:   9,  // I: Fecha envío recordatorio
  LOG:         10, // J: Log / observaciones técnicas
};

// ═══════════════════════════════════════════════════════════════════
// SETUP: Crear la hoja con cabeceras (ejecutar una sola vez)
// ═══════════════════════════════════════════════════════════════════
function setupSheet() {
  var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  // Si ya tiene datos, no sobreescribir
  if (sheet.getLastRow() > 0) {
    Logger.log("La hoja ya tiene datos. No se sobreescriben las cabeceras.");
    return;
  }

  // Cabeceras
  var headers = [
    "Fecha inscripción",
    "DNI",
    "Nombre",
    "Apellido",
    "Email",
    "Teléfono",
    "Estado RSVP",
    "Recordatorio enviado",
    "Fecha recordatorio",
    "Log técnico",
  ];
  sheet.appendRow(headers);

  // Formato de cabeceras
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1B52E8");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);

  // Congelar la primera fila
  sheet.setFrozenRows(1);

  // Ancho de columnas
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 100); // DNI
  sheet.setColumnWidth(3, 120); // Nombre
  sheet.setColumnWidth(4, 120); // Apellido
  sheet.setColumnWidth(5, 200); // Email
  sheet.setColumnWidth(6, 130); // Teléfono
  sheet.setColumnWidth(7, 110); // Estado
  sheet.setColumnWidth(8, 160); // Recordatorio
  sheet.setColumnWidth(9, 160); // Fecha rec
  sheet.setColumnWidth(10, 250);// Log

  Logger.log("✅ Hoja RSVP creada y configurada correctamente.");
}

// ═══════════════════════════════════════════════════════════════════
// doPost — recibe inscripciones desde Next.js /api/rsvp
// ═══════════════════════════════════════════════════════════════════
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Parsear body JSON
    var data = JSON.parse(e.postData.contents);

    // ── Validación básica server-side ──────────────────────────────
    if (!data.dni || !data.nombre || !data.apellido || !data.email) {
      output.setContent(JSON.stringify({ error: "Faltan campos obligatorios." }));
      return output;
    }

    var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      output.setContent(JSON.stringify({ error: "La hoja de datos no existe. Contactá a los organizadores." }));
      return output;
    }

    // ── Verificar duplicados por DNI o email ───────────────────────
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) { // hay datos (no solo cabecera)
      var dniCol   = sheet.getRange(2, COLUMNS.DNI, lastRow - 1, 1).getValues();
      var emailCol = sheet.getRange(2, COLUMNS.EMAIL, lastRow - 1, 1).getValues();

      var dniNorm   = String(data.dni).replace(/\D/g, "");
      var emailNorm = String(data.email).toLowerCase().trim();

      for (var i = 0; i < dniCol.length; i++) {
        if (String(dniCol[i][0]).replace(/\D/g, "") === dniNorm) {
          output.setContent(JSON.stringify({
            error: "Ya hay una inscripción con ese DNI. Si cometiste un error, contactá a los organizadores."
          }));
          return output;
        }
        if (String(emailCol[i][0]).toLowerCase().trim() === emailNorm) {
          output.setContent(JSON.stringify({
            error: "Ya hay una inscripción con ese email. Si cometiste un error, contactá a los organizadores."
          }));
          return output;
        }
      }
    }

    // ── Guardar inscripción ────────────────────────────────────────
    var now = new Date();
    sheet.appendRow([
      now,                                    // A: Timestamp
      data.dni,                               // B: DNI
      data.nombre,                            // C: Nombre
      data.apellido,                          // D: Apellido
      data.email.toLowerCase().trim(),        // E: Email
      data.telefono    || "",                 // F: Teléfono
      "CONFIRMADO",                           // G: Estado
      "NO",                                   // H: Recordatorio enviado
      "",                                     // I: Fecha recordatorio (vacía aún)
      "",                                     // J: Log
    ]);

    // Contar total de inscriptos (excluyendo cabecera)
    var count = Math.max(0, sheet.getLastRow() - 1);

    output.setContent(JSON.stringify({ success: true, count: count }));
    return output;

  } catch (err) {
    Logger.log("Error en doPost: " + err.message);
    output.setContent(JSON.stringify({ error: "Error interno: " + err.message }));
    return output;
  }
}

// ═══════════════════════════════════════════════════════════════════
// doGet — devuelve el conteo actual de inscriptos
// GET ?action=count → { count: N }
// ═══════════════════════════════════════════════════════════════════
function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      output.setContent(JSON.stringify({ count: 0 }));
      return output;
    }

    var count = Math.max(0, sheet.getLastRow() - 1);
    output.setContent(JSON.stringify({ count: count }));
    return output;

  } catch (err) {
    output.setContent(JSON.stringify({ count: 0, error: err.message }));
    return output;
  }
}

// ═══════════════════════════════════════════════════════════════════
// sendEventDayReminders — envía email recordatorio a todos los confirmados
// Se ejecuta automáticamente el día del evento a las 9 AM (via trigger)
// ═══════════════════════════════════════════════════════════════════
function sendEventDayReminders() {
  Logger.log("=== Iniciando envío de recordatorios ===");

  var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    Logger.log("ERROR: No se encontró la hoja " + CONFIG.SHEET_NAME);
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log("No hay inscriptos. Nada que enviar.");
    return;
  }

  // Leer todos los datos de una sola vez (más eficiente que fila por fila)
  var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();

  var enviados  = 0;
  var omitidos  = 0;
  var errores   = 0;

  for (var i = 0; i < data.length; i++) {
    var row              = data[i];
    var email            = String(row[COLUMNS.EMAIL - 1]          || "").trim();
    var nombre           = String(row[COLUMNS.NOMBRE - 1]         || "");
    var estado           = String(row[COLUMNS.ESTADO - 1]         || "");
    var yaEnviado        = String(row[COLUMNS.RECORDATORIO - 1]   || "").toUpperCase();

    // Solo enviar a CONFIRMADOS que no hayan recibido el recordatorio
    if (estado !== "CONFIRMADO" || yaEnviado === "SI" || !email) {
      omitidos++;
      continue;
    }

    try {
      _sendReminderEmail(email, nombre);

      // Marcar como enviado en la hoja
      var sheetRow = i + 2; // +2 porque la data arranca en row 2 y los arrays en 0
      sheet.getRange(sheetRow, COLUMNS.RECORDATORIO).setValue("SI");
      sheet.getRange(sheetRow, COLUMNS.FECHA_REC).setValue(new Date());

      enviados++;
      Logger.log("✅ Email enviado a: " + email);

      // Pequeña pausa para no superar los límites de Gmail (100 emails/día en cuentas gratuitas)
      Utilities.sleep(300);

    } catch (err) {
      errores++;
      Logger.log("❌ Error enviando a " + email + ": " + err.message);
      // Registrar el error en el log de la fila
      var sheetRow = i + 2;
      sheet.getRange(sheetRow, COLUMNS.LOG).setValue("Error recordatorio: " + err.message);
    }
  }

  Logger.log("=== Resumen ===");
  Logger.log("Enviados: " + enviados);
  Logger.log("Omitidos: " + omitidos);
  Logger.log("Errores:  " + errores);
}

// ── Función interna: enviar el email con la tarjeta ──────────────────────────
function _sendReminderEmail(email, nombre) {
  var subject = CONFIG.EMAIL_SUBJECT;

  // Email HTML: SOLO la tarjeta de invitación centrada, limpio, sin texto extra
  var htmlBody = '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
    '  <meta charset="utf-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>' + subject + '</title>' +
    '</head>' +
    '<body style="margin:0;padding:0;background-color:#060D22;font-family:Arial,sans-serif;">' +

    // Preheader oculto (aparece en el preview del mail)
    '<div style="display:none;max-height:0;overflow:hidden;">' +
    '¡Hoy es el gran día! Te esperamos a las 14:45 hs en Gravity Park, Caballito 🎉' +
    '</div>' +

    // Contenedor principal
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#060D22;">' +
    '<tr><td align="center" style="padding:30px 16px 10px;">' +

    // Tarjeta de invitación como imagen centrada
    '<img ' +
    '  src="' + CONFIG.INVITATION_IMAGE_URL + '" ' +
    '  alt="Tarjeta de invitación — Cumple Carme &amp; Inne" ' +
    '  width="400" ' +
    '  style="max-width:400px;width:100%;height:auto;display:block;border-radius:16px;' +
    '         box-shadow:0 8px 40px rgba(27,82,232,0.4);" ' +
    '/>' +

    '</td></tr>' +

    // Botón CTA opcional bajo la tarjeta
    '<tr><td align="center" style="padding:20px 16px 30px;">' +
    '<a href="' + CONFIG.LANDING_URL + '" ' +
    '   style="display:inline-block;background:linear-gradient(135deg,#FF5200,#FF7A00);' +
    '          color:#fff;font-size:16px;font-weight:bold;text-decoration:none;' +
    '          padding:14px 32px;border-radius:50px;' +
    '          box-shadow:0 4px 20px rgba(255,82,0,0.4);">' +
    '¡Ya nos vemos hoy! 🎉' +
    '</a>' +
    '</td></tr>' +

    '</table>' +
    '</body></html>';

  // Texto plano como fallback
  var plainText = "¡Hoy es el cumple de " + CONFIG.EVENT_NAME + "!\n\n" +
    "📅 " + CONFIG.EVENT_DATE_STR + "\n" +
    "⏰ " + CONFIG.EVENT_TIME + "\n" +
    "📍 " + CONFIG.EVENT_ADDRESS + "\n\n" +
    "¡Te esperamos!\n\n" +
    "Ver detalles: " + CONFIG.LANDING_URL;

  GmailApp.sendEmail(email, subject, plainText, {
    htmlBody: htmlBody,
    name: "Cumple Carme & Inne 🎉",
  });
}

// ═══════════════════════════════════════════════════════════════════
// setupEventDayTrigger — EJECUTAR UNA SOLA VEZ desde el editor
// Programa el envío automático para el 25/4/2026 a las 9 AM Argentina
// ═══════════════════════════════════════════════════════════════════
function setupEventDayTrigger() {
  // IMPORTANTE: antes de ejecutar esto, ir a:
  // Configuración del proyecto → Zona horaria → America/Argentina/Buenos_Aires

  // Eliminar triggers anteriores del mismo handler para no duplicar
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === "sendEventDayReminders") {
      ScriptApp.deleteTrigger(existing[i]);
      Logger.log("Trigger anterior eliminado.");
    }
  }

  // Crear trigger: 25 de abril de 2026 a las 9:00 AM
  // ScriptApp usa la timezone del proyecto (debe ser America/Argentina/Buenos_Aires)
  ScriptApp.newTrigger("sendEventDayReminders")
    .timeBased()
    .atDate(CONFIG.EVENT_YEAR, CONFIG.EVENT_MONTH, CONFIG.EVENT_DAY)
    .atHour(CONFIG.REMINDER_HOUR)
    .create();

  Logger.log("✅ Trigger configurado: sendEventDayReminders el " +
    CONFIG.EVENT_DAY + "/" + CONFIG.EVENT_MONTH + "/" + CONFIG.EVENT_YEAR +
    " a las " + CONFIG.REMINDER_HOUR + ":00 hs (Argentina)");
}

// ═══════════════════════════════════════════════════════════════════
// testSendOneEmail — para probar el envío a un email antes del evento
// Cambiar TEST_EMAIL por tu email y ejecutar desde el editor
// ═══════════════════════════════════════════════════════════════════
function testSendOneEmail() {
  var TEST_EMAIL = "TU_EMAIL_DE_PRUEBA@gmail.com"; // ← Cambiar
  var TEST_NAME  = "Test";

  _sendReminderEmail(TEST_EMAIL, TEST_NAME);
  Logger.log("Email de prueba enviado a: " + TEST_EMAIL);
}

// ═══════════════════════════════════════════════════════════════════
// getStats — ver estadísticas rápidas desde el editor
// ═══════════════════════════════════════════════════════════════════
function getStats() {
  var ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) { Logger.log("No existe la hoja."); return; }

  var total     = Math.max(0, sheet.getLastRow() - 1);
  var data      = total > 0 ? sheet.getRange(2, 1, total, 10).getValues() : [];
  var enviados  = 0;
  var pendientes = 0;

  data.forEach(function(row) {
    if (String(row[COLUMNS.RECORDATORIO - 1]).toUpperCase() === "SI") {
      enviados++;
    } else if (String(row[COLUMNS.ESTADO - 1]) === "CONFIRMADO") {
      pendientes++;
    }
  });

  Logger.log("═══ Estadísticas RSVP ═══");
  Logger.log("Total inscriptos:       " + total);
  Logger.log("Recordatorios enviados: " + enviados);
  Logger.log("Pendientes de envío:    " + pendientes);
}
