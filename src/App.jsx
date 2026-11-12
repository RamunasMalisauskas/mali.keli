import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, GalleryItem, Footer } from "./components";
import Upload from "./components/Upload/Upload.jsx";
import { works } from "./data/works.js";
import "./App.css";

function Home() {
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
