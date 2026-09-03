import { useEffect, useRef } from 'react';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#d4af37', '#f5e6a3', '#c9a227', '#ffffff', '#e6c84a'];
    const pieces: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      velocityX: number;
      velocityY: number;
      gravity: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: Math.random() * 3 + 2,
        gravity: 0.05 + Math.random() * 0.05,
        opacity: 1,
      });
    }

    let animId: number;
    let frame = 0;
    const maxFrames = 300;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (const p of pieces) {
        p.velocityY += p.gravity;
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.rotation += p.rotationSpeed;
        if (frame > maxFrames * 0.7) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (frame < maxFrames) {
        animId = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
