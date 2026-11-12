import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, GalleryItem, Footer } from "./components";
import Upload from "./components/Upload/Upload.jsx";
import { works as fallbackWorks } from "./data/works.js";
import { fetchWorks } from "./lib/sheet.js";
import "./App.css";

function Home() {
  const [works, setWorks] = useState(fallbackWorks);

  useEffect(() => {
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
