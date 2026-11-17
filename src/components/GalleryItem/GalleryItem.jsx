import { useEffect, useState } from "react";
import { assetSrc, prefersReducedMotion, slugId } from "../../lib/safe.js";
import "./GalleryItem.css";

const OPEN_SCROLL_PX = 40;
const EMPTY_SLOTS = 3;

export default function GalleryItem({ work }) {
  const [open, setOpen] = useState(false);
  const extraId = `work-extra-${slugId(work.id)}`;
  const cover = assetSrc(work.image);
  const extras = work.extraImages ?? [];
  const facts = [
    ["Technique", work.technique],
    ["Location", work.location],
    ["Year", work.year],
  ];

  useEffect(() => {
    if (!open) return undefined;
    window.scrollBy({
      top: OPEN_SCROLL_PX,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    return undefined;
  }, [open]);

  return (
    <article className={`work${open ? " is-open" : ""}`}>
      <button
        className="work-media"
        type="button"
        aria-expanded={open}
        aria-controls={extraId}
        onClick={() => setOpen((value) => !value)}
      >
        {cover ? (
          <img
            src={cover}
            alt={work.alt}
            width="800"
            height="800"
            loading="lazy"
          />
        ) : (
          "images incoming..."
        )}
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
          </div>
          <span className="work-dot" aria-hidden="true" />
          <p className="work-date">{work.year}</p>
        </div>
      </div>
      <div
        className="work-extra"
        id={extraId}
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
          {work.description ? (
            <p className="work-description">{work.description}</p>
          ) : null}
          <div className="work-gallery">
            {extras.length
              ? extras.map((item, index) => (
                  <img
                    key={`${item.src}-${index}`}
                    src={assetSrc(item.src)}
                    alt={item.alt}
                    loading="lazy"
                  />
                ))
              : Array.from({ length: EMPTY_SLOTS }, (_, index) => (
                  <span
                    key={`slot-${index}`}
                    className="work-gallery-slot"
                    aria-hidden="true"
                  />
                ))}
          </div>
        </div>
      </div>
    </article>
  );
}
