import { useEffect, useRef, useState } from "react";
import { assetSrc, prefersReducedMotion, slugId } from "../../lib/safe.js";
import "./GalleryItem.css";

const EXPAND_MS = 560;
const SLIDE_MS = 520;

export default function GalleryItem({ work }) {
  const [open, setOpen] = useState(false);
  const [copyDown, setCopyDown] = useState(false);
  const itemRef = useRef(null);
  const extraRef = useRef(null);
  const extraId = `work-extra-${slugId(work.id)}`;
  const facts = [
    ["Technique", work.technique],
    ["Location", work.location],
    ["Year", work.year],
  ];

  useEffect(() => {
    if (!open) {
      setCopyDown(false);
      return undefined;
    }

    const extra = extraRef.current;
    const item = itemRef.current;
    if (!extra || !item) return undefined;

    const instant = prefersReducedMotion();
    const timers = [];
    let didScroll = false;

    const afterExpand = () => {
      if (didScroll) return;
      didScroll = true;
      item.scrollIntoView({
        behavior: instant ? "auto" : "smooth",
        block: "end",
      });
      timers.push(
        window.setTimeout(() => setCopyDown(true), instant ? 0 : SLIDE_MS),
      );
    };

    const onTransitionEnd = (event) => {
      if (event.target !== extra) return;
      if (event.propertyName !== "grid-template-rows") return;
      afterExpand();
    };

    extra.addEventListener("transitionend", onTransitionEnd);
    timers.push(window.setTimeout(afterExpand, instant ? 0 : EXPAND_MS));

    return () => {
      extra.removeEventListener("transitionend", onTransitionEnd);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [open]);

  return (
    <article
      ref={itemRef}
      className={`work${open ? " is-open" : ""}${copyDown ? " is-copy-down" : ""}`}
    >
      <button
        className="work-media"
        type="button"
        aria-expanded={open}
        aria-controls={extraId}
        onClick={() => setOpen((value) => !value)}
      >
        <img
          src={assetSrc(work.image)}
          alt={work.alt}
          width="1400"
          height="1050"
          loading="lazy"
        />
        <span className="work-pill" aria-hidden="true">
          {open ? "Close" : "More info"}
        </span>
        <span className="sr-only">
          {open ? `Close ${work.title}` : `More info about ${work.title}`}
        </span>
      </button>
      <div className="work-copy">
        <div className="work-copy-inner">
          <div className="work-text">
            <p className="index">{work.index}</p>
            <h2>{work.title}</h2>
            <p>{work.description}</p>
          </div>
          <span className="work-dot" aria-hidden="true" />
          <p className="work-date">{work.year}</p>
        </div>
      </div>
      <div
        className="work-extra"
        id={extraId}
        ref={extraRef}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="work-extra-inner">
          <dl className="work-meta">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="work-gallery">
            {(work.extraImages ?? []).map((item, index) => (
              <img
                key={`${item.src}-${index}`}
                src={assetSrc(item.src)}
                alt={item.alt}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
