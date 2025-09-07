import React from "react";

/**
 * AnimatedGradientBackground
 * ---
 * Fondo tipo "edge blur" con manchas de color animadas + grano suave + viñeta.
 *
 * ✔️ Pega a toda la pantalla (position: fixed)
 * ✔️ No bloquea clics (pointer-events: none en las capas)
 * ✔️ Apto para React/Next.js (un solo archivo)
 * ✔️ Respeta prefers-reduced-motion
 *
 * Uso:
 *   <AnimatedGradientBackground />
 *   // Opcional: envolver tu UI para que quede por encima
 *   <div style={{ position: 'relative', zIndex: 1 }}>...tu app...</div>
 */
export function AnimatedGradientBackground({ children }) {
  return (
    <>
      <div className="ag-bg" aria-hidden />
      <div className="ag-noise" aria-hidden />
      <div className="ag-blob ag-b1" aria-hidden />
      <div className="ag-blob ag-b2" aria-hidden />
      <div className="ag-blob ag-b3" aria-hidden />
      <div className="ag-vignette" aria-hidden />

      {/* Tu contenido real va arriba del fondo */}
      {children}

      <style>{`
        /* Contenedor base oscuro */
        .ag-bg { 
          position: fixed; inset: 0; z-index: -10; 
          background: radial-gradient(1200px circle at 50% 50%, #0b1220 0%, #070d18 48%, #050a12 100%);
        }

        /* Manchas de color (blobs) */
        .ag-blob {
          position: fixed; inset: 0; z-index: -8; pointer-events: none;
          width: 60vmax; height: 60vmax; border-radius: 50%;
          filter: blur(80px) saturate(120%);
          opacity: 0.65; mix-blend-mode: screen; will-change: transform, opacity;
        }

        /* Blob rojo/naranja (arriba-izq) */
        .ag-b1 {
          left: -10vmax; top: -8vmax;
          background: radial-gradient(circle at 50% 50%, rgba(255, 94, 58, 0.95) 0%, rgba(255, 94, 58, 0.0) 60%);
          animation: ag-m1 26s ease-in-out infinite alternate;
        }

        /* Blob cian (arriba-der) */
        .ag-b2 {
          right: -10vmax; top: -6vmax;
          background: radial-gradient(circle at 50% 50%, rgba(0, 195, 255, 0.9) 0%, rgba(0, 195, 255, 0.0) 60%);
          animation: ag-m2 30s ease-in-out infinite alternate;
        }

        /* Blob violeta (abajo-izq) */
        .ag-b3 {
          left: 6vmax; bottom: -14vmax;
          background: radial-gradient(circle at 50% 50%, rgba(172, 89, 255, 0.9) 0%, rgba(172, 89, 255, 0.0) 60%);
          animation: ag-m3 34s ease-in-out infinite alternate;
        }

        /* Trayectorias */
        @keyframes ag-m1 {
          0%   { transform: translate(-4vmax, -2vmax) scale(1); }
          50%  { transform: translate(10vmax, 3vmax) scale(1.08); }
          100% { transform: translate(4vmax, 8vmax) scale(0.96); }
        }
        @keyframes ag-m2 {
          0%   { transform: translate(3vmax, -3vmax) scale(1); }
          40%  { transform: translate(-6vmax, 2vmax) scale(1.1); }
          100% { transform: translate(-2vmax, 10vmax) scale(0.95); }
        }
        @keyframes ag-m3 {
          0%   { transform: translate(-6vmax, 2vmax) scale(1); }
          60%  { transform: translate(8vmax, -4vmax) scale(1.06); }
          100% { transform: translate(2vmax, 6vmax) scale(0.98); }
        }

        /* Ruido (grano sutil) con SVG embebido */
        .ag-noise {
          position: fixed; inset: 0; z-index: -7; pointer-events: none; opacity: .05;
          background-image: url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>
              <filter id='n'>
                <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/>
              </filter>
              <rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/>
            </svg>`
          )}");
          background-size: 160px 160px; animation: ag-noise 8s steps(10) infinite;
          mix-blend-mode: overlay; 
        }
        @keyframes ag-noise { 0% {transform: translate(0,0)} 100% {transform: translate(10px,-10px)} }

        /* Viñeta: centro más oscuro para el look del ejemplo */
        .ag-vignette {
          position: fixed; inset: 0; z-index: -6; pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.0) 78%);
        }

        /* Accesibilidad: reducir motion si el usuario lo pide */
        @media (prefers-reduced-motion: reduce) {
          .ag-blob, .ag-noise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
export default AnimatedGradientBackground;