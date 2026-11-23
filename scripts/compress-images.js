import { execFile } from "node:child_process";
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { extname, join, parse } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = "public/images";
const MAX_EDGE = 2400;
const MIN_SAVE = 0.05;
const KEEP = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CONVERT = new Set([".heic"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function encode(image, ext) {
  if (ext === ".png") {
    return image.png({ compressionLevel: 9, quality: 80, palette: true });
  }
  if (ext === ".webp") {
    return image.webp({ quality: 80 });
  }
  return image.jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" });
}

function prepared(input) {
  return sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toColorspace("srgb");
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)}k`;
}

function publicSrc(file) {
  return `/${file.split("\\").join("/").replace(/^public\//, "")}`;
}

const files = await walk(ROOT);
let before = 0;
let after = 0;
let rewritten = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!KEEP.has(ext) && !CONVERT.has(ext)) continue;

  const input = await readFile(file);
  before += input.length;

  if (CONVERT.has(ext)) {
    const jpgPath = `${parse(file).dir}/${parse(file).name}.jpg`;
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", file, "--out", jpgPath]);
    const jpeg = await readFile(jpgPath);
    const output = await encode(prepared(jpeg), ".jpg").toBuffer();
    await writeFile(jpgPath, output);
    await unlink(file);
    after += output.length;
    rewritten += 1;
    console.log(`${file} → ${jpgPath}: ${kb(input.length)} → ${kb(output.length)}`);
    continue;
  }

  const output = await encode(prepared(input), ext).toBuffer();
  if (output.length <= input.length * (1 - MIN_SAVE)) {
    await writeFile(file, output);
    after += output.length;
    rewritten += 1;
    console.log(`${file}: ${kb(input.length)} → ${kb(output.length)}`);
  } else {
    after += input.length;
  }
}

const folders = {};
for (const entry of await readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const names = (await readdir(join(ROOT, entry.name)))
    .filter((name) => KEEP.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (names.length) {
    folders[entry.name] = names.map((name) =>
      publicSrc(join(ROOT, entry.name, name)),
    );
  }
}

const map = `export const workFolderImages = ${JSON.stringify(folders, null, 2)};\n`;
await writeFile("src/data/workImages.js", map);

console.log(
  `\n${rewritten} rewritten  ${kb(before)} → ${kb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`,
);
