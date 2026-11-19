import { useEffect, useState } from "react";
import { assetSrc, prefersReducedMotion, slugId } from "../../lib/safe.js";
import GalleryDialog from "../GalleryDialog/GalleryDialog.jsx";
import "./GalleryItem.css";

const OPEN_SCROLL_PX = 40;
const EMPTY_SLOTS = 3;

export default function GalleryItem({ work }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(-1);
  const extraId = `work-extra-${slugId(work.id)}`;
  const cover = assetSrc(work.image);
  const extras = (work.extraImages ?? [])
    .map((item) => ({ src: assetSrc(item.src), alt: item.alt }))
    .filter((item) => item.src);
  const slides = [...(cover ? [{ src: cover, alt: work.alt }] : []), ...extras];
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
                  <button
                    key={`${item.src}-${index}`}
                    className="work-gallery-item"
                    type="button"
                    aria-label={`Zoom in ${item.alt || `${work.title} image ${index + 1}`}`}
                    onClick={() => setZoom(cover ? index + 1 : index)}
                  >
                    <img src={item.src} alt="" loading="lazy" />
                    <span className="work-pill" aria-hidden="true">
                      Zoom in
                    </span>
                  </button>
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
      {zoom >= 0 ? (
        <GalleryDialog
          slides={slides}
          title={work.title}
          startIndex={zoom}
          onClose={() => setZoom(-1)}
        />
      ) : null}
    </article>
  );
}
