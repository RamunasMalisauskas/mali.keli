import { useEffect, useRef, useState } from "react";
import {
  materializeRichInlineLineRange,
  prepareRichInline,
  walkRichInlineLineRanges,
} from "@chenglou/pretext/rich-inline";
import { prefersReducedMotion } from "../../lib/safe.js";
import "./HeroName.css";

const LINES = ["Ieva", "Keli", "ausk", "aitė", "-", "Mali", "šau", "skė"];
const TITLE = "Ieva Keliauskaitė - Mališauskė";
const LINE_HEIGHT = 0.94;
const RADIUS = 220;
const MAX_PUSH = 52;
const EASE = 0.2;

const graphemesOf = (text) =>
  [
    ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
  ].map((part) => part.segment);

function layoutLine(text, font, letterSpacing, maxWidth) {
  const items = graphemesOf(text.toUpperCase()).map((ch) => ({
    text: ch,
    font,
    letterSpacing,
    break: "never",
  }));
  const prepared = prepareRichInline(items);
  const letters = [];
  walkRichInlineLineRanges(prepared, maxWidth, (range) => {
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

export default function HeroName() {
  const boxRef = useRef(null);
  const titleRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, inside: false });
  const nodes = useRef({});
  const frame = useRef(0);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const box = boxRef.current;
    const title = titleRef.current;
    if (!box || !title) return undefined;

    let cancelled = false;

    const measure = async () => {
      const styles = getComputedStyle(title);
      const fontSize = Math.round(parseFloat(styles.fontSize));
      const spacingRaw = parseFloat(styles.letterSpacing);
      const letterSpacing = Number.isFinite(spacingRaw) ? spacingRaw : 0;
      const font = `900 ${fontSize}px Raleway`;
      const lineHeight = fontSize * LINE_HEIGHT;
      const maxWidth = Math.max(1, title.clientWidth);

      await document.fonts.load(font, TITLE);
      if (cancelled) return;

      setLines(
        LINES.map((text, lineIndex) => ({
          text,
          letters: layoutLine(
            text,
            font,
            letterSpacing,
            Math.max(maxWidth, 4000),
          ).map((letter) => ({
            ...letter,
            y: lineIndex * lineHeight,
            lineHeight,
          })),
        })),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(title);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      cancelled = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, []);

  useEffect(() => {
    nodes.current = {};
  }, [lines]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || prefersReducedMotion()) return undefined;

    const onMove = (event) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
      mouse.current.inside = true;
    };

    window.addEventListener("pointermove", onMove);

    const boxStyles = getComputedStyle(box);
    const padX = parseFloat(boxStyles.paddingLeft) || 0;
    const padY = parseFloat(boxStyles.paddingTop) || 0;

    const tick = () => {
      const bounds = box.getBoundingClientRect();
      const mx = mouse.current.x - bounds.left;
      const my = mouse.current.y - bounds.top;

      for (const node of Object.values(nodes.current)) {
        if (!node?.el) continue;
        const cx = padX + node.x + node.width / 2;
        const cy = padY + node.y + node.lineHeight / 2;
        let targetX = 0;
        let targetY = 0;

        if (mouse.current.inside) {
          const dx = mx - cx;
          const dy = my - cy;
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

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("pointermove", onMove);
    };
  }, [lines]);

  return (
    <div className="hero-name" ref={boxRef}>
      <h1 ref={titleRef} aria-label={TITLE}>
        {lines.length === 0
          ? LINES.map((text) => (
              <span className="hero-name-fallback" key={text}>
                {text.toUpperCase()}
              </span>
            ))
          : null}
        {lines.map((line, lineIndex) => (
          <span
            className="hero-name-line"
            key={`${line.text}-${lineIndex}`}
            aria-hidden="true"
          >
            {line.letters.map((letter, letterIndex) => (
              <span
                className="hero-name-letter"
                key={`${letter.ch}-${letterIndex}`}
                style={{
                  left: `${letter.x}px`,
                  width: `${letter.width}px`,
                  height: `${letter.lineHeight || "1em"}`,
                }}
                ref={(el) => {
                  if (!el) return;
                  nodes.current[`${lineIndex}-${letterIndex}`] = {
                    el,
                    x: letter.x,
                    y: letter.y || 0,
                    width: letter.width,
                    lineHeight: letter.lineHeight || el.offsetHeight,
                    tx: 0,
                    ty: 0,
                  };
                }}
              >
                {letter.ch}
              </span>
            ))}
          </span>
        ))}
      </h1>
    </div>
  );
}
