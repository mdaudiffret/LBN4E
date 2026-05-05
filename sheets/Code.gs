// ================================================================
// LBN4E — Google Apps Script backend
// ================================================================
// IMPORTANT : après toute modification, créer un NOUVEAU déploiement
// (Déployer > Gérer les déploiements > Nouveau) et mettre à jour
// sheetUrl dans data.js avec la nouvelle URL.
// ================================================================

const WRITE_TOKEN = "lbn4e-write-2026";

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "read";

  if (action === "read") {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const infos = readSheet(ss, "infos");
    const posts = readSheet(ss, "posts");
    return jsonResponse({ infos: infos || {}, posts: posts || [] });
  }

  if (action === "write_infos" || action === "write_posts") {
    if (!e.parameter.token || e.parameter.token !== WRITE_TOKEN) {
      return jsonResponse({ error: "unauthorized" });
    }
    try {
      const json = fromUrlSafeBase64(e.parameter.data);
      const data = JSON.parse(json);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      writeSheet(ss, action === "write_infos" ? "infos" : "posts", data);
      return jsonResponse({ ok: true });
    } catch (err) {
      return jsonResponse({ error: err.toString() });
    }
  }

  return jsonResponse({ error: "unknown action" });
}

function fromUrlSafeBase64(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Utilities.newBlob(Utilities.base64Decode(s)).getDataAsString();
}

function readSheet(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return null;
  const val = sheet.getRange("A1").getValue();
  return val ? JSON.parse(val) : null;
}

function writeSheet(ss, name, data) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.getRange("A1").setValue(JSON.stringify(data));
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
