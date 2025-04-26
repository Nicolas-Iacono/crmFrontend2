import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const CarouselPropiedad = ({ imagenes = [], height = 700 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        // Swipe left
        setActiveIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
      } else {
        // Swipe right
        setActiveIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!imagenes || imagenes.length === 0) {
    return (
      <Box sx={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111', color: '#fff' }}>
        Sin imagen
      </Box>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#e0e0e0', // gris de fondo
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {imagenes.length > 0 ? (
        <img
          src={imagenes[activeIndex]?.imageUrl}
          alt={`Imagen ${activeIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#e0e0e0',
            borderRadius: 0,
            display: 'block',
            transition: 'object-fit 0.3s',
          }}
        />
      ) : (
        <Typography color="text.secondary">Sin imágenes</Typography>
      )}
      {imagenes.length > 1 && (
        <>
          <IconButton
            sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            onClick={handlePrev}
            size="small"
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            onClick={handleNext}
            size="small"
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </>
      )}
      {/* Indicadores */}
      {imagenes.length > 1 && (
        <Box sx={{ position: 'absolute', bottom: 10, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 1 }}>
          {imagenes.map((_, idx) => (
            <Box
              key={idx}
              sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: idx === activeIndex ? 'primary.main' : 'grey.400', transition: 'bgcolor 0.2s' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CarouselPropiedad;
