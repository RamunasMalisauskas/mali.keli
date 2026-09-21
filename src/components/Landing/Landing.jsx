import "./Landing.css";

const LOGO_SRC = "/images/logo_white.png";

export default function Landing() {
  return (
    <header className="hero">
      <img
        className="hero-image"
        src="/images/hero.jpg"
        alt="Figure standing before a wall of paintings in a dark studio"
        width="1920"
        height="1080"
        fetchPriority="high"
      />
      <div className="hero-veil" aria-hidden="true" />
      <a className="name" href="#contact" aria-label="MALI.KELI">
        <img
          className="name-logo"
          src={LOGO_SRC}
          alt=""
          width="1400"
          height="280"
        />
      </a>
      <p className="hint">
        <span className="sr-only">Scroll</span>
        <svg
          className="hint-arrow"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 9.5 12 16.5 19 9.5" />
        </svg>
      </p>
    </header>
  );
}
