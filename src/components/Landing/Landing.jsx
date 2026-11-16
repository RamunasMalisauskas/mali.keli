import { assetSrc } from "../../lib/safe.js";
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
        <p className="hero-description">
          A creator experimenting with an expanded idea of textile and zero-waste
          fashion design in relation to analog photography, sculpture, and space.
          Conceptually creating around the themes of mental health,
          destigmatization, and social inclusion. For more than five years,
          passing on knowledge and providing emotional support as an educator,
          sharing experience in panel discussions and festivals.
        </p>
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
