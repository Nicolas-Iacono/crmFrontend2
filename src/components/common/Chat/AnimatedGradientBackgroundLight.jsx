
// === Versión para tema CLARO ===
export function AnimatedGradientBackgroundLight({ children }) {
    return (
      <>
        <div className="agl-bg" aria-hidden />
        <div className="agl-noise" aria-hidden />
        <div className="agl-blob agl-b1" aria-hidden />
        <div className="agl-blob agl-b2" aria-hidden />
        <div className="agl-blob agl-b3" aria-hidden />
        <div className="agl-vignette" aria-hidden />
  
        {children}
  
        <style>{`
          /* Base clara */
          .agl-bg {
            position: fixed; inset: 0; z-index: -10;
            background: radial-gradient(1200px circle at 50% 50%,rgb(219, 206, 236) 0%, #fbfcfe 55%, #f4f6fb 100%);
          }
  
          /* Blobs en tema claro (más sutiles y con multiply) */
          .agl-blob {
            position: fixed; inset: 0; z-index: -8; pointer-events: none;
            width: 60vmax; height: 60vmax; border-radius: 50%;
            filter: blur(90px) saturate(110%);
            opacity: 0.45; mix-blend-mode: multiply; will-change: transform, opacity;
          }
  
          .agl-b1 {
            left: -12vmax; top: -10vmax;
            background: radial-gradient(circle at 50% 50%, rgba(108, 52, 240, 0.9) 0%, rgba(255, 163, 102, 0) 60%);
            animation: agl-m1 28s ease-in-out infinite alternate;
          }
          .agl-b2 {
            right: -12vmax; top: -6vmax;
            background: radial-gradient(circle at 50% 50%, rgba(80, 220, 255, 0.85) 0%, rgba(80, 220, 255, 0) 60%);
            animation: agl-m2 32s ease-in-out infinite alternate;
          }
          .agl-b3 {
            left: 8vmax; bottom: -16vmax;
            background: radial-gradient(circle at 50% 50%, rgba(186, 138, 255, 0.85) 0%, rgba(186, 138, 255, 0) 60%);
            animation: agl-m3 36s ease-in-out infinite alternate;
          }
  
          @keyframes agl-m1 {
            0%   { transform: translate(-4vmax, -2vmax) scale(1); }
            50%  { transform: translate(8vmax, 2vmax) scale(1.06); }
            100% { transform: translate(2vmax, 8vmax) scale(0.98); }
          }
          @keyframes agl-m2 {
            0%   { transform: translate(2vmax, -3vmax) scale(1); }
            40%  { transform: translate(-6vmax, 2vmax) scale(1.08); }
            100% { transform: translate(-2vmax, 10vmax) scale(0.97); }
          }
          @keyframes agl-m3 {
            0%   { transform: translate(-6vmax, 2vmax) scale(1); }
            60%  { transform: translate(8vmax, -4vmax) scale(1.05); }
            100% { transform: translate(2vmax, 6vmax) scale(0.99); }
          }
  
          /* Ruido más suave en claro */
          .agl-noise {
            position: fixed; inset: 0; z-index: -7; pointer-events: none; opacity: .12;
            background-image: url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'>
                <filter id='n'>
                  <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/>
                </filter>
                <rect width='100%' height='100%' filter='url(%23n)' opacity='0.65'/>
              </svg>`
            )}");
            background-size: 160px 160px; animation: agl-noise 8s steps(10) infinite;
            mix-blend-mode: multiply;
          }
          @keyframes agl-noise { 0% {transform: translate(0,0)} 100% {transform: translate(10px,-10px)} }
  
          /* Viñeta sutil (bordes apenas más oscuros) */
          .agl-vignette {
            position: fixed; inset: 0; z-index: -6; pointer-events: none;
            background: radial-gradient(ellipse at 50% 50%, rgba(163, 145, 243, 0.92) 0%, rgba(209, 174, 248, 0.78) 55%, rgba(0,0,0,0.06) 100%);
          }
  
          @media (prefers-reduced-motion: reduce) {
            .agl-blob, .agl-noise { animation: none !important; }
          }
        `}</style>
      </>
    );
  }
  
  export default AnimatedGradientBackgroundLight;