export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzgxaBsRQMg4yYRAPc7gdwRjCgFYY8hYgumPVVxvoiKqNK8UrLmbrl8Dd3yJhOr0o0/exec";

function asText(value) {
  return value == null ? "" : String(value);
}

export function normalizeWork(raw) {
  const id = asText(raw?.id).trim();
  return {
    id,
    index: asText(raw?.index),
    title: asText(raw?.title),
    year: asText(raw?.year),
    description: asText(raw?.description),
    image: asText(raw?.image),
    alt: asText(raw?.alt),
    technique: asText(raw?.technique),
    location: asText(raw?.location),
    extraImages: (Array.isArray(raw?.extraImages) ? raw.extraImages : []).map(
      (item) => ({
        id,
        src: asText(item?.src),
        alt: asText(item?.alt),
      }),
    ),
  };
}

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error ?? "Sheet request failed.");
  }
  return body;
}

export async function fetchWorks() {
  const response = await fetch(SHEET_URL, { method: "GET" });
  const body = await readJson(response);
  return (body.works ?? []).map(normalizeWork);
}

async function postSheet(payload) {
  const response = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function saveWorksToSheet(works) {
  const body = await postSheet({
    action: "replace",
    works: works.map(normalizeWork),
  });
  return (body.works ?? works).map(normalizeWork);
}

export async function upsertWorkOnSheet(work) {
  const body = await postSheet({
    action: "upsert",
    work: normalizeWork(work),
  });
  return (body.works ?? []).map(normalizeWork);
}

export async function deleteWorkOnSheet(id) {
  const body = await postSheet({
    action: "delete",
    id,
  });
  return (body.works ?? []).map(normalizeWork);
}
