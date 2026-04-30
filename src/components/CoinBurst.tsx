import { useEffect } from "react";

const COIN_SRC = "/cursor-coin-active.svg";
const SELECTORS = "button, a, [role='button'], summary, label, input[type='submit'], input[type='button'], select";

function spawnCoins(x: number, y: number) {
  const count = 7 + Math.floor(Math.random() * 4); // 7–10 coins

  for (let i = 0; i < count; i++) {
    const coin = document.createElement("img");
    coin.src = COIN_SRC;
    coin.setAttribute("aria-hidden", "true");
    Object.assign(coin.style, {
      position: "fixed",
      left: `${x - 18}px`,
      top: `${y - 18}px`,
      width: "36px",
      height: "36px",
      pointerEvents: "none",
      zIndex: "99999",
      userSelect: "none",
    });
    document.body.appendChild(coin);

    // Random trajectory — spread full 360° with an upward bias
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
    const speed = 90 + Math.random() * 110;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 70; // bias upward
    const gravity = 180 + Math.random() * 80; // arc drop
    const rot = (Math.random() - 0.5) * 540;
    const duration = 650 + Math.random() * 250;
    const size = 0.6 + Math.random() * 0.5; // vary end scale

    coin.animate(
      [
        {
          transform: "translate(0,0) scale(1) rotate(0deg)",
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate(${vx * 0.55}px, ${vy * 0.55}px) scale(${0.85 + Math.random() * 0.2}) rotate(${rot * 0.45}deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${vx}px, ${vy + gravity}px) scale(${size}) rotate(${rot}deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fill: "forwards",
      }
    );

    setTimeout(() => coin.remove(), duration + 60);
  }
}

export function CoinBurst() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest(SELECTORS)) {
        spawnCoins(e.clientX, e.clientY);
      }
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return null;
}
