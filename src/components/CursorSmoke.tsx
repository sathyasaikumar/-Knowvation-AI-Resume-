import React, { useEffect, useRef } from 'react';

export const CursorSmoke: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseSize: number;
      alpha: number;
      decay: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    
    // Theme colors: sleek purple, indigo, cyan, and deep blue
    const smokeColors = [
      'rgba(99, 102, 241, 0.12)', // Indigo
      'rgba(168, 85, 247, 0.10)', // Purple
      'rgba(59, 130, 246, 0.08)',  // Blue
      'rgba(6, 182, 212, 0.08)',   // Cyan
    ];

    const createParticle = (x: number, y: number) => {
      const baseSize = Math.random() * 15 + 15; // Starting size
      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2, // Spread velocity
        vy: -Math.random() * 0.8 - 0.4, // Upward draft
        size: baseSize,
        baseSize,
        alpha: 0.8, // Start semi-visible
        decay: Math.random() * 0.012 + 0.008, // Dissipate speed
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    };

    // Track mouse coordinates and spawn particles
    const handleMouseMove = (e: MouseEvent) => {
      // Spawn 2 smoke puff particles per mouse move event for rich density
      createParticle(e.clientX, e.clientY);
      if (Math.random() > 0.5) {
        createParticle(e.clientX + (Math.random() - 0.5) * 10, e.clientY + (Math.random() - 0.5) * 10);
      }
    };

    // Support touch devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        createParticle(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Reset composite operation to source-over so fillRect correctly draws the dark background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#070b13';
      ctx.fillRect(0, 0, width, height);

      // Blend modes for rendering smoke particles
      ctx.globalCompositeOperation = 'screen';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 1.2; // Expand smoke puff size
        p.alpha -= p.decay; // Dissipate opacity
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0 || p.size > 200) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Volumetric gradient for realistic smoke puff shape
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        const activeAlpha = (p.alpha * 0.12).toFixed(3);
        const midAlpha = (p.alpha * 0.05).toFixed(3);
        
        grad.addColorStop(0, p.color.replace(/[^,]+\)$/, `${activeAlpha})`));
        grad.addColorStop(0.4, p.color.replace(/[^,]+\)$/, `${midAlpha})`));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
