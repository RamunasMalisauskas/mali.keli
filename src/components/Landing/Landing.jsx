import { useEffect, useState } from "react";
import { assetSrc, prefersReducedMotion } from "../../lib/safe.js";
import "./Landing.css";

const SLOW_RATE = 0.85;
const setSlowPlay = (event) => {
  event.currentTarget.playbackRate = SLOW_RATE;
};

const BOLD_MS = 1200;
const DELAY_MS = 400;
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

function DescriptionPulse({ text }) {
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

export default function Landing() {
  return (
    <header className="hero">
      <div className="hero-top">
        <div className="hero-media">
          <video
            className="hero-video"
            src={assetSrc("/video/hero_rain.mp4")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlay={setSlowPlay}
          />
        </div>
        <div className="hero-name">
          <h1>
            Ieva
            <br />
            Keli
            <br />
            ausk
            <br />
            aitė
            <br />-<br />
            Mali
            <br />
            šau
            <br />
            skė
          </h1>
        </div>
        <aside className="hero-aside">
          <nav className="hero-nav" aria-label="Page">
            <a href="#works">〰️ works</a>
            <a href="#contact">〰️ contacts</a>
          </nav>
          <p className="hero-about">
            A multidisciplinary creator blending textiles & embroidery,
            installation, zero-waste fashion, and analog photography to explore
            mental health and social inclusion—backed by 5+ years as an educator
            and speaker.
          </p>
        </aside>
        <span className="work-dot hero-dot-start" aria-hidden="true" />
        <p className="hero-mark hero-mark-about">
          <span className="work-dot" aria-hidden="true" />
          about me
        </p>
      </div>
      <div className="hero-copy-row">
        <p className="hero-fullname">Ieva Keliauskaitė - Mališauskė</p>
        <DescriptionPulse text={HERO_DESCRIPTION} />
      </div>
      <div className="hero-bottom">
        <div className="hero-media hero-media-land">
          <video
            className="hero-video"
            src={assetSrc("/video/malikeli_hero_small.mp4")}
            poster={assetSrc("/images/clo_1.png")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlay={setSlowPlay}
          />
        </div>
        <p className="hero-mark hero-works-mark" id="works">
          <span className="work-dot" aria-hidden="true" />
          Works
        </p>
      </div>
      <p className="hero-coming">Works under construction</p>
    </header>
  );
}
