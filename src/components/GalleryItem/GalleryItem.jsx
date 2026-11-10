import { useState } from "react";
import "./GalleryItem.css";

export default function GalleryItem({ work }) {
  const [open, setOpen] = useState(false);
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

  return (
    <article className={open ? "work is-open" : "work"}>
      <button
        className="work-media"
        type="button"
        aria-expanded={open}
        aria-controls={`work-extra-${work.id}`}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={image} alt={alt} width="1400" height="1050" loading="lazy" />
        <span className="sr-only">
          {open ? `Close ${title}` : `Open ${title}`}
        </span>
      </button>
      <div className="work-copy">
        <div className="work-text">
          <p className="index">{index}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="work-dot" aria-hidden="true" />
        <p className="work-date">{year}</p>
      </div>
      {open ? (
        <div className="work-extra" id={`work-extra-${work.id}`}>
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
      ) : null}
    </article>
  );
}
