// ================================================================
// LBN4E — Google Apps Script backend
// ================================================================
// SETUP (à faire une seule fois) :
//   1. Ouvre un Google Spreadsheet vide
//   2. Extensions > Apps Script → colle ce fichier
//   3. Change WRITE_TOKEN ci-dessous (= sheetWriteToken dans data.js)
//   4. Déployer > Nouveau déploiement
//        Type : Application Web
//        Exécuter en tant que : Moi
//        Accès : Tout le monde
//   5. Copie l'URL de déploiement dans data.js → sheetUrl
//   6. Pour chaque modification du script : créer un NOUVEAU déploiement
// ================================================================

const WRITE_TOKEN = "lbn4e-write-2026"; // doit correspondre à sheetWriteToken dans data.js

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const infos = readSheet(ss, "infos");
  const posts = readSheet(ss, "posts");
  return jsonResponse({ infos: infos || {}, posts: posts || [] });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== WRITE_TOKEN) {
      return jsonResponse({ error: "unauthorized" });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (body.infos !== undefined) writeSheet(ss, "infos", body.infos);
    if (body.posts !== undefined) writeSheet(ss, "posts", body.posts);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
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
