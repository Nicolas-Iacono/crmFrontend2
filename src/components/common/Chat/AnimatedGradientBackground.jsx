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
      
    </>
  );
}
export default AnimatedGradientBackground;