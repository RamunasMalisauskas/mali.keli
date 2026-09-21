import "./GalleryItem.css";

export default function GalleryItem({
  index,
  title,
  description,
  image,
  alt,
  reverse = false,
}) {
  return (
    <article className={reverse ? "work work--reverse" : "work"}>
      <div className="work-media">
        <img src={image} alt={alt} width="1400" height="1050" loading="lazy" />
      </div>
      <div className="work-copy">
        <p className="index">{index}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
