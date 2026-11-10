import { Landing, GalleryItem, Footer } from "./components";
import { works } from "./data/works.js";
import "./App.css";

export default function App() {
  return (
    <div className="page">
      <Landing />
      <div className="stream">
        <div className="spine" aria-hidden="true" />
        <main id="works">
          {works.map((work) => (
            <GalleryItem key={work.id} work={work} />
          ))}
        </main>
      </div>
      <Footer />
    </div>
  );
}
