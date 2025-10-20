"use client";

import { useEffect, useRef } from "react";

interface FlickeringGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  maxOpacity?: number;
}

export const FlickeringGrid = ({
  className = "",
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  maxOpacity = 0.2,
}: FlickeringGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let cols = 0;
    let rows = 0;
    let squares: number[][] = [];

    const getGridColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
    };

    const recomputeGrid = () => {
      cols = Math.ceil(canvas.width / (squareSize + gridGap));
      rows = Math.ceil(canvas.height / (squareSize + gridGap));
      squares = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random())
      );
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      recomputeGrid();
    };

    // Initial size and grid
    resizeCanvas();

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const color = getGridColor();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() < flickerChance) {
            squares[row][col] = Math.random();
          }

          const opacity = squares[row][col] * maxOpacity;
          ctx.fillStyle = color.replace("rgb", "rgba").replace(")", `, ${opacity})`);

          const x = col * (squareSize + gridGap);
          const y = row * (squareSize + gridGap);

          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }

      animationFrameId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    // Observe theme class changes to redraw with new color immediately
    const observer = new MutationObserver(() => {
      // No need to recompute layout, color is read every frame
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [squareSize, gridGap, flickerChance, maxOpacity]);

  return <canvas ref={canvasRef} className={className} />;
};

