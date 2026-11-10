import { useEffect, useRef, useState } from "react";
import "./GalleryItem.css";

export default function GalleryItem({ work }) {
  const [open, setOpen] = useState(false);
  const [copyDown, setCopyDown] = useState(false);
  const itemRef = useRef(null);
  const extraRef = useRef(null);
  const {
    title,
    year,
    description,
    image,
    alt,
    index,
    technique,
    location,
    extraImages = [],
  } = work;

  useEffect(() => {
    if (!open) {
      setCopyDown(false);
      return;
    }

    const extra = extraRef.current;
    const item = itemRef.current;
    if (!extra || !item) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let copyTimer;
    let scrolled = false;
    let settled = false;

    const slideCopy = () => {
      if (settled) return;
      settled = true;
      setCopyDown(true);
    };

    const scrollToEnd = () => {
      if (scrolled) return;
      scrolled = true;
      item.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "end",
      });
      copyTimer = window.setTimeout(slideCopy, reduced ? 0 : 520);
    };

    const onEnd = (event) => {
      if (event.target !== extra) return;
      if (event.propertyName !== "grid-template-rows") return;
      scrollToEnd();
    };

    extra.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(scrollToEnd, reduced ? 0 : 560);
    return () => {
      extra.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
      window.clearTimeout(copyTimer);
    };
  }, [open]);

  return (
    <article
      ref={itemRef}
      className={[
        "work",
        open ? "is-open" : "",
        copyDown ? "is-copy-down" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        className="work-media"
        type="button"
        aria-expanded={open}
        aria-controls={`work-extra-${work.id}`}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={image} alt={alt} width="1400" height="1050" loading="lazy" />
        <span className="work-pill" aria-hidden="true">
          {open ? "Close" : "More info"}
        </span>
        <span className="sr-only">
          {open ? `Close ${title}` : `More info about ${title}`}
        </span>
      </button>
      <div className="work-copy">
        <div className="work-copy-inner">
          <div className="work-text">
            <p className="index">{index}</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <span className="work-dot" aria-hidden="true" />
          <p className="work-date">{year}</p>
        </div>
      </div>
      <div
        className="work-extra"
        id={`work-extra-${work.id}`}
        ref={extraRef}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="work-extra-inner">
          <dl className="work-meta">
            <div>
              <dt>Technique</dt>
              <dd>{technique}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{location}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{year}</dd>
            </div>
          </dl>
          <div className="work-gallery">
            {extraImages.map((item) => (
              <img
                key={item.src + item.alt}
                src={item.src}
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
