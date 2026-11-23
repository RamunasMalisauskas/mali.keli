import { useEffect, useRef, useState } from "react";
import {
  materializeRichInlineLineRange,
  prepareRichInline,
  walkRichInlineLineRanges,
} from "@chenglou/pretext/rich-inline";
import { watchLetters } from "../../lib/pretextPointer.js";
import "./PretextLetters.css";

const RADIUS = 220;
const MAX_PUSH = 52;
const EASE = 0.2;

const graphemesOf = (text) =>
  [
    ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
  ].map((part) => part.segment);

function layoutLetters(text, font, letterSpacing) {
  const prepared = prepareRichInline(
    graphemesOf(text).map((ch) => ({
      text: ch,
      font,
      letterSpacing,
      break: "never",
    })),
  );
  const letters = [];
  walkRichInlineLineRanges(prepared, 4000, (range) => {
    const line = materializeRichInlineLineRange(prepared, range);
    let x = 0;
    for (const fragment of line.fragments) {
      x += fragment.gapBefore;
      letters.push({
        ch: fragment.text,
        x,
        width: fragment.occupiedWidth,
      });
      x += fragment.occupiedWidth;
    }
  });
  return letters;
}

function wordItems(text, font, letterSpacing) {
  const items = [];
  let word = "";
  for (const ch of graphemesOf(text)) {
    if (!ch.trim()) {
      if (word) {
        items.push({ text: word, font, letterSpacing, break: "never" });
        word = "";
      }
      items.push({ text: ch, font, letterSpacing });
    } else {
      word += ch;
    }
  }
  if (word) items.push({ text: word, font, letterSpacing, break: "never" });
  return items;
}

function layoutBlock(text, font, letterSpacing, maxWidth, lineHeight) {
  const prepared = prepareRichInline(wordItems(text, font, letterSpacing), {
    whiteSpace: "pre-wrap",
  });
  const lines = [];
  let y = 0;
  walkRichInlineLineRanges(prepared, maxWidth, (range) => {
    const line = materializeRichInlineLineRange(prepared, range);
    let x = 0;
    const letters = [];
    for (const fragment of line.fragments) {
      x += fragment.gapBefore;
      for (const letter of layoutLetters(fragment.text, font, letterSpacing)) {
        letters.push({
          ...letter,
          x: x + letter.x,
          y,
          lineHeight,
        });
      }
      x += fragment.occupiedWidth;
    }
    lines.push({ letters, width: x, y, lineHeight });
    y += lineHeight;
  });
  return lines;
}

function alignLines(lines, maxWidth, align) {
  if (align !== "end") return lines;
  return lines.map((line) => ({
    ...line,
    letters: line.letters.map((letter) => ({
      ...letter,
      x: letter.x + Math.max(0, maxWidth - line.width),
    })),
  }));
}

export default function PretextLetters({
  as: Tag = "h2",
  text = "",
  lines: lineTexts,
  ariaLabel,
  uppercase = false,
  className = "",
}) {
  const boxRef = useRef(null);
  const nodes = useRef({});
  const [lines, setLines] = useState([]);
  const sources = lineTexts ?? [text];
  const packed = sources.join("\0");
  const label = ariaLabel || text;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    let cancelled = false;

    const measure = async () => {
      const styles = getComputedStyle(box);
      const fontSize = Math.round(parseFloat(styles.fontSize));
      const spacingRaw = parseFloat(styles.letterSpacing);
      const letterSpacing = Number.isFinite(spacingRaw) ? spacingRaw : 0;
      const family = styles.fontFamily
        .split(",")[0]
        .replace(/['"]/g, "")
        .trim();
      const font = `${styles.fontWeight} ${fontSize}px ${family}`;
      const lineHeightRaw = styles.lineHeight;
      const lineHeight = lineHeightRaw.endsWith("px")
        ? parseFloat(lineHeightRaw)
        : fontSize * (parseFloat(lineHeightRaw) || 1.15);
      const wrap = lineTexts
        ? Math.max(box.clientWidth, 4000)
        : Math.max(1, box.parentElement?.clientWidth || box.clientWidth);
      const align =
        styles.textAlign === "right" || styles.textAlign === "end"
          ? "end"
          : "start";
      const sample = uppercase
        ? sources.join(" ").toUpperCase()
        : sources.join(" ");

      await document.fonts.load(font, sample || "H");
      if (cancelled) return;

      setLines(
        sources.flatMap((source, lineIndex) => {
          const value = uppercase ? source.toUpperCase() : source;
          return alignLines(
            layoutBlock(value, font, letterSpacing, wrap, lineHeight).map(
              (line) => ({
                ...line,
                y: lineTexts ? lineIndex * lineHeight : line.y,
                letters: line.letters.map((letter) => ({
                  ...letter,
                  y: lineTexts ? lineIndex * lineHeight : letter.y,
                })),
              }),
            ),
            wrap,
            align,
          );
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      cancelled = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [packed, uppercase, lineTexts]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;

    return watchLetters((mouse) => {
      const bounds = box.getBoundingClientRect();
      const near =
        mouse.x >= bounds.left - RADIUS &&
        mouse.x <= bounds.right + RADIUS &&
        mouse.y >= bounds.top - RADIUS &&
        mouse.y <= bounds.bottom + RADIUS;

      for (const node of Object.values(nodes.current)) {
        if (!node?.el) continue;
        const cx = bounds.left + node.x + node.width / 2;
        const cy = bounds.top + node.y + node.lineHeight / 2;
        let targetX = 0;
        let targetY = 0;

        if (near) {
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const falloff = Math.max(0, 1 - dist / RADIUS);
          const push = falloff * falloff * MAX_PUSH;
          targetX = (dx / dist) * push;
          targetY = (dy / dist) * push;
        }

        node.tx += (targetX - node.tx) * EASE;
        node.ty += (targetY - node.ty) * EASE;
        node.el.style.transform = `translate(${node.tx}px, ${node.ty}px)`;
      }
    });
  }, [lines]);

  return (
    <Tag
      ref={boxRef}
      className={`pretext-letters ${className}`.trim()}
      aria-label={label}
    >
      {lines.length === 0
        ? sources.map((source) => (
            <span className="pretext-fallback" key={source}>
              {uppercase ? source.toUpperCase() : source}
            </span>
          ))
        : null}
      {lines.map((line, lineIndex) => (
        <span
          className="pretext-line"
          key={`line-${lineIndex}`}
          aria-hidden="true"
          style={{ height: `${line.lineHeight}px` }}
        >
          {line.letters.map((letter, letterIndex) => (
            <span
              className="pretext-letter"
              key={`${letter.ch}-${letterIndex}`}
              style={{
                left: `${letter.x}px`,
                width: `${letter.width}px`,
                height: `${letter.lineHeight}px`,
              }}
              ref={(el) => {
                const key = `${lineIndex}-${letterIndex}`;
                if (!el) {
                  delete nodes.current[key];
                  return;
                }
                const prev = nodes.current[key];
                nodes.current[key] = {
                  el,
                  x: letter.x,
                  y: letter.y || 0,
                  width: letter.width,
                  lineHeight: letter.lineHeight,
                  tx: prev?.tx ?? 0,
                  ty: prev?.ty ?? 0,
                };
              }}
            >
              {letter.ch}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
