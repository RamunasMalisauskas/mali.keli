import { assetSrc } from "../../lib/safe.js";
import "./Landing.css";

export default function Landing() {
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
      <div className="hero-side">
        <img
          className="name-logo"
          src={assetSrc("/images/logo.png")}
          alt="MALI.KELI"
          width="1400"
          height="280"
        />
        <p className="hero-text">
          Painting, installation, and works on paper. Slow surfaces, quiet
          rooms, and the time it takes for a piece to settle.
        </p>
        <a className="hint" href="#works" aria-label="Scroll to works">
          <span className="work-dot" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
