import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const COOKIE = "mk_upload";
const EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASSET = /^\/(?:images|video)\/[A-Za-z0-9._-]+$/;
const FILE_NAME = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/i;
const sessions = new Set();
const attempts = new Map();

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.end(payload);
}

function cookieValue(req) {
  const header = req.headers.cookie ?? "";
  const match = header.match(new RegExp(`(?:^|; )${COOKIE}=([A-Fa-f0-9]+)`));
  return match?.[1] ?? "";
}

function isAuthed(req) {
  const token = cookieValue(req);
  return token.length === 64 && sessions.has(token);
}

function text(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : "";
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const size = Math.max(a.length, b.length, 1);
  const aa = Buffer.alloc(size);
  const bb = Buffer.alloc(size);
  a.copy(aa);
  b.copy(bb);
  return timingSafeEqual(aa, bb) && a.length === b.length;
}

function rateLimited(ip) {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || record.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 15 * 60 * 1000 });
    return false;
  }
  record.count += 1;
  return record.count > 8;
}

function validateFooter(body) {
  const studio = text(body?.studio, 80);
  const email = text(body?.email, 120);
  const handle = text(body?.instagram?.handle, 60);
  const url = text(body?.instagram?.url, 200);
  const inquiries = text(body?.inquiries, 240);
  if (!studio || !handle || !inquiries || !EMAIL.test(email)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (!["www.instagram.com", "instagram.com"].includes(parsed.hostname)) {
      return null;
    }
  } catch {
    return null;
  }
  return {
    studio,
    email,
    instagram: { handle, url },
    inquiries,
  };
}

function validateWork(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = text(raw.id, 60).toLowerCase();
  const extra = Array.isArray(raw.extraImages) ? raw.extraImages : [];
  if (!SLUG.test(id) || extra.length > 12) return null;
  const work = {
    id,
    index: text(raw.index, 80),
    title: text(raw.title, 80),
    year: text(raw.year, 12),
    description: text(raw.description, 600),
    image: text(raw.image, 120),
    alt: text(raw.alt, 180),
    technique: text(raw.technique, 120),
    location: text(raw.location, 120),
    extraImages: extra.map((item) => ({
      src: text(item?.src, 120),
      alt: text(item?.alt, 180),
    })),
  };
  const fields = [
    work.index,
    work.title,
    work.year,
    work.description,
    work.image,
    work.alt,
    work.technique,
    work.location,
  ];
  if (fields.some((value) => !value)) return null;
  if (!ASSET.test(work.image)) return null;
  if (work.extraImages.some((item) => !ASSET.test(item.src) || !item.alt)) {
    return null;
  }
  return work;
}

function validateWorks(body) {
  if (!Array.isArray(body?.works) || body.works.length > 40) return null;
  const works = [];
  const ids = new Set();
  for (const item of body.works) {
    const work = validateWork(item);
    if (!work || ids.has(work.id)) return null;
    ids.add(work.id);
    works.push(work);
  }
  return works;
}

async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("payload too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function toModule(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)};\n`;
}

function cookieHeader(token, maxAge) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export function uploadApi(root, password) {
  const footerFile = path.join(root, "src/data/footer.js");
  const worksFile = path.join(root, "src/data/works.js");
  const imagesDir = path.join(root, "public/images");

  return async function handleUpload(req, res, next) {
    const url = req.url?.split("?")[0] ?? "";
    if (!url.startsWith("/api/")) return next();

    if (req.method === "GET" && url === "/api/session") {
      return send(res, isAuthed(req) ? 200 : 401, { ok: isAuthed(req) });
    }

    if (req.method === "POST" && url === "/api/logout") {
      sessions.delete(cookieValue(req));
      return send(res, 200, { ok: true }, { "Set-Cookie": cookieHeader("", 0) });
    }

    if (req.method === "POST" && url === "/api/login") {
      const ip = req.socket?.remoteAddress ?? "unknown";
      if (rateLimited(ip)) return send(res, 429, { error: "Too many attempts." });
      try {
        const body = await readJson(req, 4_000);
        if (!password || !safeEqual(String(body?.password ?? ""), password)) {
          return send(res, 401, { error: "Wrong password." });
        }
        const token = randomBytes(32).toString("hex");
        sessions.add(token);
        return send(res, 200, { ok: true }, { "Set-Cookie": cookieHeader(token, 60 * 60 * 12) });
      } catch {
        return send(res, 400, { error: "Invalid request." });
      }
    }

    if (!isAuthed(req)) return send(res, 401, { error: "Sign in required." });

    try {
      if (req.method === "PUT" && url === "/api/footer") {
        const footer = validateFooter(await readJson(req, 20_000));
        if (!footer) return send(res, 400, { error: "Check the footer fields." });
        await writeFile(footerFile, toModule("footer", footer), "utf8");
        return send(res, 200, { ok: true });
      }

      if (req.method === "PUT" && url === "/api/works") {
        const works = validateWorks(await readJson(req, 200_000));
        if (!works) return send(res, 400, { error: "Check the work fields." });
        await writeFile(worksFile, toModule("works", works), "utf8");
        return send(res, 200, { ok: true });
      }

      if (req.method === "POST" && url === "/api/image") {
        const body = await readJson(req, 8_000_000);
        const filename = text(body?.filename, 80);
        const data = typeof body?.data === "string" ? body.data : "";
        if (!FILE_NAME.test(filename) || !data.startsWith("data:image/")) {
          return send(res, 400, { error: "Use a jpg, png, or webp image." });
        }
        const comma = data.indexOf(",");
        const buffer = Buffer.from(data.slice(comma + 1), "base64");
        if (!buffer.length || buffer.length > 6_000_000) {
          return send(res, 400, { error: "Image is too large." });
        }
        const safeName = `${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}-${filename.toLowerCase()}`;
        await mkdir(imagesDir, { recursive: true });
        await writeFile(path.join(imagesDir, safeName), buffer);
        return send(res, 200, { src: `/images/${safeName}` });
      }
    } catch {
      return send(res, 400, { error: "Invalid request." });
    }

    return send(res, 404, { error: "Not found." });
  };
}
