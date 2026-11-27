import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, GalleryItem, Footer } from "./components";
import { workMatchesFilter } from "./components/Landing/Landing.jsx";
import Upload from "./components/Upload/Upload.jsx";
import { works as fallbackWorks } from "./data/works.js";
import { fetchWorks, normalizeWork, orderWorks } from "./lib/sheet.js";
import "./App.css";

const SHOW_GALLERY = true;

function Home() {
  const [works, setWorks] = useState(
    SHOW_GALLERY ? orderWorks(fallbackWorks.map(normalizeWork)) : [],
  );
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    if (!SHOW_GALLERY) return undefined;

    let ignore = false;
    fetchWorks()
      .then((next) => {
        if (!ignore && next.length) setWorks(next);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="page">
      <div className="spine" aria-hidden="true" />
      <Landing
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {SHOW_GALLERY ? (
        <main>
          {works
            .filter((work) => workMatchesFilter(work, activeFilter))
            .map((work) => (
              <GalleryItem key={work.id} work={work} />
            ))}
        </main>
      ) : null}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}
