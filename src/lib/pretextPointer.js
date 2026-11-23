import { prefersReducedMotion } from "./safe.js";

const mouse = { x: 0, y: 0 };
const ticks = new Set();
let frame = 0;

function onMove(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function loop() {
  for (const tick of ticks) tick(mouse);
  frame = requestAnimationFrame(loop);
}

export function watchLetters(tick) {
  if (prefersReducedMotion()) return () => {};
  ticks.add(tick);
  if (ticks.size === 1) {
    window.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(loop);
  }
  return () => {
    ticks.delete(tick);
    if (ticks.size === 0) {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    }
  };
}
