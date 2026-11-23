import { workFolderImages } from "../data/workImages.js";

export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzgxaBsRQMg4yYRAPc7gdwRjCgFYY8hYgumPVVxvoiKqNK8UrLmbrl8Dd3yJhOr0o0/exec";

/**
 * GET returns:
 * {
 *   works: [{
 *     id: string,
 *     index: string,
 *     title: string,
 *     association: string,
 *     year: string | number,
 *     description: string,
 *     technique: string,
 *     location: string,
 *     category: string,
 *     extraImages: [{ id: string, src: string, alt: string }]
 *   }]
 * }
 *
 * Cover `image` / `alt` are optional. Placeholder extras (clo_/acc_) are dropped.
 */

function asText(value) {
  return value == null ? "" : String(value);
}

function slugFrom(title, index) {
  const fromTitle = asText(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (fromTitle) return fromTitle;
  return (
    asText(index)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "work"
  );
}

function isPlaceholderSrc(src) {
  return /\/images\/(clo_|acc_|work-|hero)/.test(src);
}

function foldKey(value) {
  return asText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "");
}

const FOLDER_ALIASES = {
  nemunoveidas: "thefaceofthenemunas",
};

function encodeAsset(path) {
  return encodeURI(path);
}

function folderImagesFor(work) {
  const keys = [foldKey(work.title), foldKey(work.id)].filter(Boolean);
  for (const [folder, files] of Object.entries(workFolderImages)) {
    const folderKey = foldKey(folder);
    if (keys.includes(folderKey) || keys.includes(FOLDER_ALIASES[folderKey] ?? "")) {
      return files.map(encodeAsset);
    }
  }
  return [];
}

function withFolderImages(work) {
  const files = folderImagesFor(work);
  if (!files.length) return work;
  const [cover, ...rest] = files;
  return {
    ...work,
    image: cover,
    alt: work.alt || work.title,
    extraImages: rest.map((src, index) => ({
      id: work.id,
      src,
      alt: `${work.title} ${index + 2}`,
    })),
  };
}

export function normalizeWork(raw) {
  const extraImages = (Array.isArray(raw?.extraImages) ? raw.extraImages : [])
    .map((item) => ({
      id: asText(item?.id),
      src: asText(item?.src),
      alt: asText(item?.alt),
    }))
    .filter((item) => item.src && !isPlaceholderSrc(item.src));
  const id = asText(raw?.id).trim() || slugFrom(raw?.title, raw?.index);
  const rawImage = asText(raw?.image);
  const image =
    rawImage && !isPlaceholderSrc(rawImage)
      ? rawImage
      : extraImages[0]?.src || "";
  const alt = asText(raw?.alt) || extraImages[0]?.alt || asText(raw?.title);

  return {
    id,
    index: asText(raw?.index),
    title: asText(raw?.title),
    association: asText(raw?.association),
    year: asText(raw?.year),
    description: asText(raw?.description),
    image,
    alt,
    technique: asText(raw?.technique),
    location: asText(raw?.location),
    category: asText(raw?.category),
    extraImages,
  };
}

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error ?? "Sheet request failed.");
  }
  return body;
}

export function yearKey(year) {
  const years = String(year ?? "").match(/\d{4}/g);
  if (!years) return Number.NEGATIVE_INFINITY;
  return Math.max(...years.map(Number));
}

export function orderWorks(works) {
  return [...works]
    .map(withFolderImages)
    .sort(
      (a, b) =>
        yearKey(b.year) - yearKey(a.year) ||
        a.title.localeCompare(b.title, "lt"),
    )
    .map((work, index) => ({
      ...work,
      number: String(index + 1).padStart(2, "0"),
    }));
}

export async function fetchWorks() {
  const response = await fetch(SHEET_URL, { method: "GET" });
  const body = await readJson(response);
  return orderWorks((body.works ?? []).map(normalizeWork));
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
