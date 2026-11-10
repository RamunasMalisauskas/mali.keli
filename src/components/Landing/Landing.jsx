import "./Landing.css";

const LOGO_SRC = "/images/logo.png";

export default function Landing() {
  return (
    <header className="hero">
      <div className="hero-media">
        <video
          className="hero-video"
          src="/video/malikeli_hero_small.mp4"
          poster="/images/hero.jpg"
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
          src={LOGO_SRC}
          alt="MALI.KELI"
          width="1400"
          height="280"
        />
        <p className="hero-text">
          Painting, installation, and works on paper. Slow surfaces, quiet
          rooms, and the time it takes for a piece to settle.
        </p>
        <a className="hint" href="#works">
          <span className="sr-only">Scroll to works</span>
          <svg
            className="hint-arrow"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M5 9.5 12 16.5 19 9.5" />
          </svg>
        </a>
      </div>
    </header>
  );
}
