/**
 * ============================================================================
 *  RSVP → Google Sheets
 *  Pegar este archivo en Extensiones → Apps Script de la planilla y publicarlo
 *  como aplicación web. Instrucciones completas en README.md.
 * ============================================================================
 */

/** Debe coincidir EXACTAMENTE con la variable de entorno RSVP_SHARED_SECRET. */
var SHARED_SECRET = 'REPLACE_WITH_RSVP_SHARED_SECRET';

/** Nombre de la hoja donde se guardan las confirmaciones. */
var SHEET_NAME = 'Confirmaciones 15s Guille Chalpe';

var HEADERS = [
  'Fecha de confirmación',
  'Nombre',
  '¿Asiste?',
  'Acompañantes',
  'Total personas',
  'Restricción alimentaria',
];

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (payload.secret !== SHARED_SECRET) {
      return respond({ ok: false, error: 'unauthorized' });
    }

    var name = String(payload.name || '').trim();
    if (name.length < 3) {
      return respond({ ok: false, error: 'validation' });
    }

    var attending = payload.attending === 'yes';
    var companions = attending ? Number(payload.companions) || 0 : 0;

    var sheet = getSheet();

    // Anti-duplicado suave: si el mismo nombre confirmó hace menos de 2 minutos,
    // se ignora (cubre el doble toque en conexiones lentas).
    if (isDuplicate(sheet, name)) {
      return respond({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      name,
      attending ? 'Sí' : 'No',
      attending ? companions : '',
      attending ? companions + 1 : 0,
      attending ? String(payload.dietary || 'Ninguna') : '',
    ]);

    return respond({ ok: true });
  } catch (err) {
    console.error(err);
    return respond({ ok: false, error: 'server' });
  }
}

/** GET sólo sirve para comprobar que la publicación quedó bien. */
function doGet() {
  return respond({ ok: true, service: 'rsvp' });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setFontWeight('bold');
    header.setBackground('#17345C');
    header.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(6, 200);
  }

  return sheet;
}

function isDuplicate(sheet, name) {
  var last = sheet.getLastRow();
  if (last < 2) return false;

  var from = Math.max(2, last - 20);
  var rows = sheet.getRange(from, 1, last - from + 1, 2).getValues();
  var limit = Date.now() - 2 * 60 * 1000;

  for (var i = 0; i < rows.length; i++) {
    var when = rows[i][0];
    var who = String(rows[i][1] || '').trim().toLowerCase();
    if (who === name.toLowerCase() && when instanceof Date && when.getTime() > limit) {
      return true;
    }
  }
  return false;
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
