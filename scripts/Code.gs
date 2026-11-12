/**
 * Paste into the Apps Script project bound to the works spreadsheet,
 * then Deploy > Web app (Execute as: Me, Who has access: Anyone).
 *
 * Sheets:
 *   Works        — id, index, title, year, description, image, alt, technique, location
 *   ExtraImages  — id, src, alt  (id matches the work)
 *
 * GET  → { works }
 * POST text/plain JSON:
 *   { action: "replace", works: [...] }
 *   { action: "upsert", work: {...} }
 *   { action: "delete", id: "power-flash" }
 */

const WORKS_SHEET = "Works";
const IMAGES_SHEET = "ExtraImages";
const WORK_HEADERS = [
  "id",
  "index",
  "title",
  "year",
  "description",
  "image",
  "alt",
  "technique",
  "location",
];
const IMAGE_HEADERS = ["id", "src", "alt"];

function doGet() {
  return json({ works: readWorks() });
}

function doPost(event) {
  let body = {};
  try {
    body = JSON.parse(event.postData.contents);
  } catch (error) {
    return json({ error: "Invalid JSON." });
  }

  if (body.action === "replace" && Array.isArray(body.works)) {
    replaceWorks(body.works);
    return json({ ok: true, works: readWorks() });
  }
  if (body.action === "upsert" && body.work) {
    upsertWork(body.work);
    return json({ ok: true, works: readWorks() });
  }
  if (body.action === "delete" && body.id) {
    deleteWork(String(body.id));
    return json({ ok: true, works: readWorks() });
  }
  return json({ error: "Unknown action." });
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function sheet(name, headers) {
  const book = SpreadsheetApp.getActive();
  let tab = book.getSheetByName(name);
  if (!tab) {
    tab = book.insertSheet(name);
  }
  if (tab.getLastRow() === 0) {
    tab.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return tab;
}

function rowsToObjects(tab, headers) {
  const last = tab.getLastRow();
  if (last < 2) return [];
  const values = tab.getRange(2, 1, last - 1, headers.length).getValues();
  return values
    .filter((row) => String(row[0]).trim())
    .map((row) => {
      const item = {};
      headers.forEach((key, index) => {
        item[key] = row[index];
      });
      return item;
    });
}

function readWorks() {
  const images = rowsToObjects(sheet(IMAGES_SHEET, IMAGE_HEADERS), IMAGE_HEADERS);
  return rowsToObjects(sheet(WORKS_SHEET, WORK_HEADERS), WORK_HEADERS).map((work) => ({
    ...work,
    year: String(work.year),
    extraImages: images
      .filter((image) => String(image.id) === String(work.id))
      .map((image) => ({
        id: String(image.id),
        src: String(image.src),
        alt: String(image.alt),
      })),
  }));
}

function writeWorks(works) {
  const worksTab = sheet(WORKS_SHEET, WORK_HEADERS);
  const imagesTab = sheet(IMAGES_SHEET, IMAGE_HEADERS);
  const workRows = works.map((work) =>
    WORK_HEADERS.map((key) => (work[key] == null ? "" : work[key])),
  );
  const imageRows = [];
  works.forEach((work) => {
    (work.extraImages || []).forEach((image) => {
      imageRows.push([work.id, image.src || "", image.alt || ""]);
    });
  });

  const workLast = Math.max(worksTab.getMaxRows(), 2);
  if (worksTab.getLastRow() > 1) {
    worksTab.getRange(2, 1, worksTab.getLastRow() - 1, WORK_HEADERS.length).clearContent();
  }
  if (workRows.length) {
    worksTab.getRange(2, 1, workRows.length, WORK_HEADERS.length).setValues(workRows);
  }

  if (imagesTab.getLastRow() > 1) {
    imagesTab.getRange(2, 1, imagesTab.getLastRow() - 1, IMAGE_HEADERS.length).clearContent();
  }
  if (imageRows.length) {
    imagesTab.getRange(2, 1, imageRows.length, IMAGE_HEADERS.length).setValues(imageRows);
  }
}

function replaceWorks(works) {
  writeWorks(works);
}

function upsertWork(work) {
  const works = readWorks().filter((item) => item.id !== work.id);
  works.push(work);
  writeWorks(works);
}

function deleteWork(id) {
  writeWorks(readWorks().filter((item) => item.id !== id));
}
