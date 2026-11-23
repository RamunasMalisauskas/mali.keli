import PretextLetters from "../PretextLetters/PretextLetters.jsx";
import "./HeroName.css";

const LINES = ["Ieva", "Keli", "ausk", "aitė", "-", "Mali", "šau", "skė"];
const TITLE = "Ieva Keliauskaitė - Mališauskė";

export default function HeroName() {
  return (
    <div className="hero-name">
      <PretextLetters as="h1" lines={LINES} ariaLabel={TITLE} uppercase />
    </div>
  );
}
