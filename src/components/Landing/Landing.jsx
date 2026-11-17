import { assetSrc } from "../../lib/safe.js";
import DescriptionPulse from "../DescriptionPulse/DescriptionPulse.jsx";
import WaveMark from "../WaveMark/WaveMark.jsx";
import "./Landing.css";

const SLOW_RATE = 0.85;
const setSlowPlay = (event) => {
  event.currentTarget.playbackRate = SLOW_RATE;
};

export default function Landing() {
  return (
    <header className="hero">
      <div className="hero-top">
        <div className="hero-media">
          <video
            className="hero-video"
            src={assetSrc("/video/hero_close.mp4")}
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
            <a href="#works">
              <WaveMark />
              works
            </a>
            <a href="#contact">
              <WaveMark />
              contacts
            </a>
          </nav>
          <p className="hero-about">
            Textile Artist & Designer, Educator <br /> Facilitating Creative &
            Social Projects
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
        <DescriptionPulse />
      </div>
      <div className="hero-bottom">
        <div className="hero-media hero-media-land">
          <video
            className="hero-video"
            src={assetSrc("/video/malikeli_hero_small.mp4")}
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
