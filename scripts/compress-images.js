import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

const ROOT = "public/images";
const MAX_EDGE = 2400;
const MIN_SAVE = 0.05;
const FORMATS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (FORMATS.has(extname(entry.name).toLowerCase())) files.push(path);
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

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)}k`;
}

const files = await walk(ROOT);
let before = 0;
let after = 0;
let rewritten = 0;

for (const file of files) {
  const input = await readFile(file);
  before += input.length;
  const ext = extname(file).toLowerCase();
  const output = await encode(
    sharp(input)
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toColorspace("srgb"),
    ext,
  ).toBuffer();

  if (output.length <= input.length * (1 - MIN_SAVE)) {
    await writeFile(file, output);
    after += output.length;
    rewritten += 1;
    console.log(`${file}: ${kb(input.length)} → ${kb(output.length)}`);
  } else {
    after += input.length;
  }
}

console.log(
  `\n${rewritten}/${files.length} rewritten  ${kb(before)} → ${kb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`,
);
