
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
        `}</style>
      </>
    );
  }
  
  export default AnimatedGradientBackgroundLight;