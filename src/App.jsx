import { Landing, GalleryItem, Footer } from "./components";
import { works } from "./data/works.js";

export default function App() {
  return (
    <>
      <Landing />
      <main>
        {works.map((work, i) => (
          <GalleryItem key={work.id} {...work} reverse={i % 2 === 1} />
        ))}
      </main>
      <Footer />
    </>
  );
}
