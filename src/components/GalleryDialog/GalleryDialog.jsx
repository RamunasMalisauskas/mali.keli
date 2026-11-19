import { useEffect, useRef, useState } from "react";
import "./GalleryDialog.css";

export default function GalleryDialog({ slides, title, startIndex, onClose }) {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const current = slides[index];

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    return undefined;
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  function step(delta) {
    if (slides.length < 2) return;
    setIndex((value) => (value + delta + slides.length) % slides.length);
  }

  return (
    <dialog
      ref={dialogRef}
      className="gallery-dialog"
      aria-label={`${title} images`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {current ? (
        <div className="gallery-dialog-frame">
          <img src={current.src} alt={current.alt} />
          {slides.length > 1 ? (
            <>
              <button
                type="button"
                className="work-pill gallery-dialog-prev"
                onClick={() => step(-1)}
              >
                ←<span className="sr-only">Previous image</span>
              </button>
              <button
                type="button"
                className="work-pill gallery-dialog-next"
                onClick={() => step(1)}
              >
                →<span className="sr-only">Next image</span>
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="work-pill gallery-dialog-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
