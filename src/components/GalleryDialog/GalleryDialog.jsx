import { useEffect, useRef, useState } from "react";
import WorkMedia from "../WorkMedia/WorkMedia.jsx";
import "./GalleryDialog.css";

export default function GalleryDialog({ slides, title, startIndex, onClose }) {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const current = slides[index];
  const many = slides.length > 1;

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (!many) return;
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % slides.length);
      if (event.key === "ArrowLeft") {
        setIndex((value) => (value - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [many, slides.length]);

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
          <button
            type="button"
            className="work-pill gallery-dialog-close"
            onClick={onClose}
          >
            Close
          </button>
          {many ? (
            <button
              type="button"
              className="work-pill gallery-dialog-prev"
              onClick={() =>
                setIndex((value) => (value - 1 + slides.length) % slides.length)
              }
            >
              ←<span className="sr-only">Previous image</span>
            </button>
          ) : (
            <span className="gallery-dialog-spacer" aria-hidden="true" />
          )}
          <WorkMedia src={current.src} alt={current.alt} zoomed />
          {many ? (
            <button
              type="button"
              className="work-pill gallery-dialog-next"
              onClick={() => setIndex((value) => (value + 1) % slides.length)}
            >
              →<span className="sr-only">Next image</span>
            </button>
          ) : (
            <span className="gallery-dialog-spacer" aria-hidden="true" />
          )}
        </div>
      ) : null}
    </dialog>
  );
}
