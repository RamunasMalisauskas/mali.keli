import "./WaveMark.css";

export default function WaveMark() {
  return (
    <svg
      className="wave-mark"
      viewBox="0 0 28 8"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0.5 4 Q1.9 0.55 3.3 4 T6.1 4 T8.9 4 T11.7 4 T14.5 4 T17.3 4 T20.1 4 T22.9 4 T25.7 4 T27.6 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
