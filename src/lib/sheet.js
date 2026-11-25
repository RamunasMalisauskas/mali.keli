import { workFolderImages } from "../data/workImages.js";
import { workFolderVideos } from "../data/workVideos.js";

export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzgxaBsRQMg4yYRAPc7gdwRjCgFYY8hYgumPVVxvoiKqNK8UrLmbrl8Dd3yJhOr0o0/exec";

const FIELDS = [
  "index",
  "title",
  "association",
  "year",
  "description",
  "technique",
  "location",
  "category",
];

const FOLDER_ALIASES = {
  nemunoveidas: "thefaceofthenemunas",
  istrauktinis:
    "drawnthreadworkorwhatremainsbetweenthreadstextileandmaternalexperiences",
};

function asText(value) {
  return value == null ? "" : String(value);
}

function asFlag(value) {
  return value === true || /^(x|true|yes|1|hide)$/i.test(asText(value).trim());
}

function slugFrom(...parts) {
  return (
    parts
      .map(asText)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "work"
  );
}

function foldKey(value) {
  return asText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isPlaceholderSrc(src) {
  return /\/images\/(clo_|acc_|work-|hero)/.test(src);
}

function sortKey(id) {
  return /^\d+$/.test(asText(id).trim())
    ? Number(asText(id).trim())
    : Number.POSITIVE_INFINITY;
}

function mediaFor(work, library) {
  const keys = [
    foldKey(work.title),
    sortKey(work.id) === Number.POSITIVE_INFINITY ? foldKey(work.id) : "",
  ].filter(Boolean);
  for (const [name, files] of Object.entries(library)) {
    const key = foldKey(name);
    if (keys.includes(key) || keys.includes(FOLDER_ALIASES[key] ?? "")) {
      return files.map(encodeURI);
    }
  }
  return [];
}

function toExtra(work, src, alt) {
  return { id: work.id, src, alt };
}

function withFolderMedia(work) {
  const photos = mediaFor(work, workFolderImages);
  const videos = mediaFor(work, workFolderVideos);
  if (!photos.length && !videos.length) return work;
  const [cover, ...rest] = photos;
  return {
    ...work,
    hide: false,
    image: cover || work.image,
    alt: work.alt || work.title,
    extraImages: [
      ...videos.map((src, i) =>
        toExtra(work, src, `${work.title} video ${i + 1}`),
      ),
      ...rest.map((src, i) => toExtra(work, src, `${work.title} ${i + 2}`)),
    ],
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

  return {
    id,
    ...Object.fromEntries(FIELDS.map((key) => [key, asText(raw?.[key])])),
    image,
    alt: asText(raw?.alt) || extraImages[0]?.alt || asText(raw?.title),
    hide: asFlag(raw?.hide),
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
  return years ? Math.max(...years.map(Number)) : Number.NEGATIVE_INFINITY;
}

export function orderWorks(works) {
  return [...works]
    .map(withFolderMedia)
    .sort(
      (a, b) =>
        Number(a.hide) - Number(b.hide) ||
        sortKey(a.id) - sortKey(b.id) ||
        yearKey(b.year) - yearKey(a.year) ||
        a.title.localeCompare(b.title, "lt"),
    )
    .map((work, index) => ({
      ...work,
      number: String(index + 1).padStart(2, "0"),
    }));
}

async function postSheet(payload) {
  const response = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function fetchWorks() {
  const response = await fetch(SHEET_URL, { method: "GET" });
  const body = await readJson(response);
  return orderWorks((body.works ?? []).map(normalizeWork));
}

export async function saveWorksToSheet(works) {
  const body = await postSheet({
    action: "replace",
    works: works.map(normalizeWork),
  });
  return (body.works ?? works).map(normalizeWork);
}

export async function upsertWorkOnSheet(work) {
  const body = await postSheet({ action: "upsert", work: normalizeWork(work) });
  return (body.works ?? []).map(normalizeWork);
}

export async function deleteWorkOnSheet(id) {
  const body = await postSheet({ action: "delete", id });
  return (body.works ?? []).map(normalizeWork);
}
