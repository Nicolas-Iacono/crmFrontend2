import React from 'react';

const TourTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size,
}) => {
  const progress = ((index + 1) / size) * 100;

  return (
    <div {...tooltipProps} style={{ ...tooltipProps.style, maxWidth: 380, minWidth: 280 }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1b2e 0%, #17142a 100%)',
        borderRadius: 20,
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.08)',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Poppins', -apple-system, sans-serif",
        position: 'relative',
      }}>
        {/* Progress bar */}
        <div style={{
          height: 3,
          background: 'rgba(255,255,255,0.06)',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #fbbf24)',
            borderRadius: '0 4px 4px 0',
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: '20px 22px 16px' }}>
          {/* Step counter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#a78bfa',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Paso {index + 1} de {size}
            </span>
            {skipProps && (
              <button
                {...skipProps}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(247, 176, 43, 0.7)',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 6,
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.target.style.color = 'rgba(255,255,255,0.7)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.35)'; e.target.style.background = 'none'; }}
              >
                Saltar tour
              </button>
            )}
          </div>

          {/* Title */}
          {step.title && (
            <h3 style={{
              margin: '0 0 8px',
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.3,
              letterSpacing: -0.2,
            }}>
              {step.title}
            </h3>
          )}

          {/* Body */}
          {step.content && (
            <p style={{
              margin: 0,
              fontSize: 13.5,
              lineHeight: 1.55,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 400,
            }}>
              {step.content}
            </p>
          )}
        </div>

        {/* Footer / Buttons */}
        <div style={{
          padding: '0 22px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              Atrás
            </button>
          )}

          {continuous && (
            <button
              {...primaryProps}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.35)'; e.target.style.transform = 'translateY(0)'; }}
            >
              {isLastStep ? 'Finalizar ✓' : 'Siguiente →'}
            </button>
          )}

          {!continuous && (
            <button
              {...closeProps}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                fontFamily: 'inherit',
              }}
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
};

export const modernTourStyles = {
  options: {
    arrowColor: '#1e1b2e',
    backgroundColor: '#1e1b2e',
    overlayColor: 'rgba(0, 0, 0, 0.65)',
    primaryColor: '#8b5cf6',
    textColor: '#fff',
    zIndex: 20000,
  },
  spotlight: {
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  tooltipWrapper: {
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    backgroundColor: 'transparent',
  },
  overlay: {
    mixBlendMode: 'normal',
  },
  beacon: {
    inner: '#8b5cf6',
    outer: 'rgba(139, 92, 246, 0.3)',
  },
  beaconInner: {
    backgroundColor: '#8b5cf6',
  },
  beaconOuter: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    border: '2px solid #8b5cf6',
  },
};

export const modernTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export default TourTooltip;
