"use client";

import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const hiVariations = ['Hi', 'Hiiiiii', 'H111111', 'hiiiiiiii'];
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    const hiDrops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
      hiDrops[i] = 0;
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#FD4C00';
      ctx.font = `${fontSize}px VT323, monospace`;

      for (let i = 0; i < drops.length; i++) {
        let text;
        if (hiDrops[i] > 0) {
          text = hiVariations[Math.floor(Math.random() * hiVariations.length)];
          hiDrops[i]--;
        } else {
          text = characters[Math.floor(Math.random() * characters.length)];
        }

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          if (Math.random() > 0.95) {
            hiDrops[i] = text.length;
          }
        }

        drops[i]++;
      }
    }

    const intervalId = setInterval(draw, 33);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default MatrixBackground;