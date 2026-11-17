import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/safe.js";
import "./DescriptionPulse.css";

const BOLD_MS = 600;
const DELAY_MS = 300;
const HIGHLIGHTS = [
  "textile",
  "mental health",
  "zero-waste",
  "educator",
  "fashion",
  "destigmatization",
];
const HIGHLIGHT_RE = new RegExp(
  `(${[...HIGHLIGHTS]
    .sort((a, b) => b.length - a.length)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "gi",
);

const HERO_DESCRIPTION =
  "A creator experimenting with an expanded idea of textile and zero-waste fashion design in relation to analog photography, sculpture, and space. Conceptually creating around the themes of mental health, destigmatization, and social inclusion. For more than five years, passing on knowledge and providing emotional support as an educator, sharing experience in panel discussions and festivals.";

export default function DescriptionPulse({ text = HERO_DESCRIPTION }) {
  const [active, setActive] = useState("");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (window.matchMedia("(max-width: 800px)").matches) return undefined;

    const timers = [];
    let cancelled = false;

    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const run = async () => {
      await wait(DELAY_MS);
      let index = 0;
      while (!cancelled) {
        const phrase = HIGHLIGHTS[index % HIGHLIGHTS.length];
        setActive(phrase);
        setShown(0);
        const step = BOLD_MS / phrase.length;
        for (let count = 1; count <= phrase.length; count += 1) {
          if (cancelled) return;
          setShown(count);
          await wait(step);
        }
        await wait(DELAY_MS);
        if (cancelled) return;
        setActive("");
        setShown(0);
        index += 1;
      }
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <p className="hero-description">
      {text.split(HIGHLIGHT_RE).map((part, index) => {
        const phrase = HIGHLIGHTS.find(
          (item) => item.toLowerCase() === part.toLowerCase(),
        );
        if (!phrase) return part;
        const on = active === phrase;
        return (
          <span key={`${phrase}-${index}`}>
            <span className="sr-only">{part}</span>
            <span aria-hidden="true">
              {[...part].map((letter, letterIndex) => (
                <span
                  key={letterIndex}
                  className={
                    on && letterIndex < shown
                      ? "hero-hl-letter is-on"
                      : "hero-hl-letter"
                  }
                >
                  {letter}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </p>
  );
}
