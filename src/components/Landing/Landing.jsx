import { useEffect } from "react";
import { assetSrc, prefersReducedMotion } from "../../lib/safe.js";
import "./Landing.css";

const INTRO_DELAY_MS = 400;
const INTRO_DISTANCE = 140;
const INTRO_DURATION_MS = 2400;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (2 * (1 - t)) ** 2 / 2;
}

export default function Landing() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let cancelled = false;
    let frame = 0;

    const stop = () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      const from = window.scrollY;
      if (from >= INTRO_DISTANCE) return;

      const to = INTRO_DISTANCE;
      let start = 0;

      const step = (now) => {
        if (cancelled) return;
        if (!start) start = now;
        const t = Math.min(1, (now - start) / INTRO_DURATION_MS);
        const y = from + (to - from) * easeInOut(t);
        document.documentElement.scrollTop = y;
        document.body.scrollTop = y;
        if (t < 1) frame = window.requestAnimationFrame(step);
      };

      frame = window.requestAnimationFrame(step);
    }, INTRO_DELAY_MS);

    return () => {
      stop();
      window.clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);

  return (
    <header className="hero">
      <div className="hero-media">
        <video
          className="hero-video"
          src={assetSrc("/video/malikeli_hero_small.mp4")}
          poster={assetSrc("/images/clo_01.jpg")}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className="hero-copy">
        <div className="hero-copy-text">
          <h1>Ieva Keliauskaitė - Mališauskė</h1>
          <p className="hero-text">
            Textile Artist & Designer 〰️ Cyanotype & Embroidery Educator 〰️
            Facilitating Creative & Social Projects
          </p>
          <p className="hero-text">Page is under maintenance.</p>
        </div>
        <span className="work-dot" aria-hidden="true" />
      </div>
    </header>
  );
}
