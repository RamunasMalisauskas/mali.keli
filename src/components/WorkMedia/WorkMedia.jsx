import { isVideoSrc } from "../../lib/safe.js";

export default function WorkMedia({ src, alt = "", zoomed = false }) {
  if (isVideoSrc(src)) {
    return (
      <video
        src={src}
        muted
        loop
        playsInline
        autoPlay
        controls={zoomed}
        preload={zoomed ? "auto" : "metadata"}
      />
    );
  }
  return <img src={src} alt={alt} loading={zoomed ? undefined : "lazy"} />;
}
