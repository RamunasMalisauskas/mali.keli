import { assetSrc } from "../../lib/safe.js";
import DescriptionPulse from "../DescriptionPulse/DescriptionPulse.jsx";
import HeroName from "../HeroName/HeroName.jsx";
import WaveMark from "../WaveMark/WaveMark.jsx";
import "./Landing.css";

const SLOW_RATE = 0.65;
const setSlowPlay = (event) => {
  event.currentTarget.playbackRate = SLOW_RATE;
};

export const FILTERS = [
  "installations",
  "workshops",
  "community",
  "accessories",
  "fashion",
  "fabrics",
];

const FILTER_TERMS = {
  installations: ["installation", "visual arts"],
  workshops: ["workshop", "education", "co-creation"],
  community: ["community", "education", "curatorial"],
  accessories: ["accessor", "wearable"],
  fashion: ["fashion", "costume", "wearable", "runway"],
  fabrics: ["fabric", "textile", "zero-waste", "linen"],
};

export function workMatchesFilter(work, filter) {
  if (!filter) return true;
  const hay = [
    work.index,
    work.category,
    work.title,
    work.technique,
    work.description,
    work.association,
  ]
    .join(" ")
    .toLowerCase();
  return (FILTER_TERMS[filter] ?? [filter]).some((term) => hay.includes(term));
}

export default function Landing({ activeFilter = "", onFilterChange }) {
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
        <HeroName />
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
            // onPlay={setSlowPlay}
          />
        </div>
        <p className="hero-mark hero-works-mark" id="works">
          <span className="work-dot" aria-hidden="true" />
          Works
        </p>
      </div>
      <ul className="hero-filters">
        {FILTERS.map((filter) => (
          <li key={filter}>
            <button
              type="button"
              className={activeFilter === filter ? "is-active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() =>
                onFilterChange?.(activeFilter === filter ? "" : filter)
              }
            >
              <WaveMark />
              {filter}
            </button>
          </li>
        ))}
      </ul>
    </header>
  );
}
