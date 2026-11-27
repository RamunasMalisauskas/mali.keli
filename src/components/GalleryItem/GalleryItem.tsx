import { useEffect, useState } from "react";
import {
  assetSrc,
  prefersReducedMotion,
  slugId,
  workAnchor,
} from "../../lib/safe.js";
import type { Work } from "../../types/work";
import GalleryDialog from "../GalleryDialog/GalleryDialog.jsx";
import PretextLetters from "../PretextLetters/PretextLetters.jsx";
import WorkMedia from "../WorkMedia/WorkMedia.jsx";
import "./GalleryItem.css";

type GalleryItemProps = {
  work: Work;
};

type Slide = {
  src: string;
  alt: string;
};

const FACTS = [
  ["Technique", "technique"],
  ["Location", "location"],
  ["Association", "association"],
  ["Year", "year"],
] as const;

export default function GalleryItem({ work }: GalleryItemProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(-1);
  const extraId = `work-extra-${slugId(work.id)}`;
  const anchor = workAnchor(work.url, work.id);
  const hidden = Boolean(work.hide);
  const cover = hidden ? "" : assetSrc(work.image);
  const extras: Slide[] = hidden
    ? []
    : (work.extraImages ?? [])
        .map((item) => ({ src: assetSrc(item.src), alt: item.alt }))
        .filter((item) => item.src);
  const slides: Slide[] = [
    cover ? { src: cover, alt: work.alt } : null,
    ...extras,
  ].filter((item): item is Slide => Boolean(item));
  const facts = FACTS.filter(([, key]) => work[key].trim());

  useEffect(() => {
    if (!open) return;
    window.scrollBy({
      top: 40,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [open]);

  useEffect(() => {
    if (!anchor || window.location.hash !== `#${anchor}`) return;
    document.getElementById(anchor)?.scrollIntoView();
  }, [anchor]);

  return (
    <article
      id={anchor || undefined}
      className={`work${open ? " is-open" : ""}${hidden ? " is-hidden" : ""}`}
    >
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
            <PretextLetters
              as="h2"
              text={`${work.number ? `${work.number} - ` : ""}${work.title}`}
            />
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
          {facts.length ? (
            <dl className="work-meta">
              {facts.map(([label, key]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{work[key]}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {work.description ? (
            <p className="work-description">{work.description}</p>
          ) : null}
          {hidden || extras.length === 0 ? null : (
            <div className="work-gallery">
              {extras.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  className="work-gallery-item"
                  type="button"
                  aria-label={`Zoom in ${item.alt || work.title}`}
                  onClick={() => setZoom(cover ? index + 1 : index)}
                >
                  <WorkMedia src={item.src} />
                  <span className="work-pill" aria-hidden="true">
                    Zoom in
                  </span>
                </button>
              ))}
            </div>
          )}
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
