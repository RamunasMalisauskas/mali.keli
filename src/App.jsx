import { Landing, GalleryItem, Footer } from "./components";
import { works } from "./data/works.js";
import "./App.css";

export default function App() {
  return (
    <div className="page">
      <div className="spine" aria-hidden="true" />
      <Landing />
      <main id="works">
        {works.map((work) => (
          <GalleryItem key={work.id} work={work} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
