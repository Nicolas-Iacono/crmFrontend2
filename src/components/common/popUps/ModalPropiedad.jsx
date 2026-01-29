import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  Chip,
  Grid2,
  useTheme,
  useMediaQuery,
  Slide,
  CardMedia
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CarouselPropiedad from './CarouselPropiedad';


const ModalPropiedad = ({ open, onClose, propiedad = {} }) => {
      const theme = useTheme();
      const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
      const Transition = React.useMemo(() =>
        React.forwardRef(function Transition(props, ref) {
          return <Slide direction="up" ref={ref} {...props} />;
        }),
      []);

  const navigate = useNavigate();
  const [imgHeight, setImgHeight] = useState(500);
  const dialogContentRef = useRef(null);
  // Drag-to-close state
  const paperRef = useRef(null);
  const startYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const getClientY = (e) => (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY);

  const handleDragStart = (e) => {
    const y = getClientY(e);
    setIsDragging(true);
    startYRef.current = y;
    setDragY(0);
    // Attach listeners to the document to track drag outside header
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const y = getClientY(e);
    const delta = Math.max(0, y - startYRef.current);
    setDragY(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Remove listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);

    const paperEl = paperRef.current;
    const height = paperEl ? paperEl.clientHeight : 0;
    const threshold = Math.max(120, Math.floor(height * 0.25));
    if (dragY > threshold) {
      // Close if beyond threshold
      onClose?.();
      setDragY(0);
    } else {
      // Bounce back
      setDragY(0);
    }
  };

  useEffect(() => {
    if (open) {
      setImgHeight(404);
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
    const handleScroll = () => {
      if (!dialogContentRef.current) return;
      const scrollTop = dialogContentRef.current.scrollTop;
      const minH = 400, maxH = 400;
      let newHeight = maxH - scrollTop;
      if (newHeight < minH) newHeight = minH;
      if (newHeight > maxH) newHeight = maxH;
      setImgHeight(newHeight);
    };
    const ref = dialogContentRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll); };
  }, [open]);

  if (!propiedad) {
    return null;
  }

  const {
    direccion,
    localidad,
    partido,
    provincia,
    disponibilidad,
    precio,
    cantidadAmbientes,
    cochera,
    patio,
    jardin,
    pileta,
  } = propiedad;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={open ? 'open' : 'closed'}
    TransitionComponent={Transition}
    sx={{
      '& .MuiDialog-paper': {
        borderRadius:{xs:0, md:"20px"},
        maxWidth:{xs:"100%", md:"80%"},
        width: { xs: '100vw', md: 'auto' },
        m: { xs: 0, md: 'auto' },
        position:"absolute",
        bottom:"0",
        borderRadius:"20px 20px 0 0",
        transform: `translateY(${dragY}px)`,
        transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
      },
    }}>
      <DialogTitle
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          color: 'text.primary',
          cursor: 'grab',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>{direccion || 'Sin dirección'}</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      {/* Imagen con efecto de reducción al hacer scroll */}
      <Grid2 
        sx={{ 
          width: "100%", 
          height: imgHeight, 
          backgroundColor: "black", 
          position: 'sticky', 
          top: 0, 
          zIndex: 2, 
          transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CarouselPropiedad
          sx={{ width: '100%', height: '100%', objectFit:'contain' }}
          imagenes={Array.isArray(propiedad.imagenes) ? propiedad.imagenes : []}
          height={imgHeight}
        />
      </Grid2>
      <DialogContent 
        sx={{ bgcolor: 'background.default', color: 'text.primary', p: 2 }}
        ref={dialogContentRef}
      >
        <Grid2 container spacing={2} sx={{display:"flex", flexDirection:"column", width:"100%"}}>
        
          
         
          <Grid2 item xs={12} sm={6}>
           <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Localidad</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="primary" />
              <Typography>{localidad}</Typography>
            </Box>
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Partido / Provincia</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon fontSize="small" color="primary" />
              <Typography>{partido}{provincia ? `, ${provincia}` : ''}</Typography>
            </Box>
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Propietario</Typography>
                        {propiedad.propietarioSalidaDto ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="primary" />
                <Typography>{propiedad.propietarioSalidaDto?.nombre} {propiedad.propietarioSalidaDto?.apellido}</Typography>
              </Box>
            ) : (
              <Button variant="contained" onClick={() => navigate(`/propiedades/asignar-propietario/${propiedad.id}`)}>
                Asignar Propietario
              </Button>
            )}
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Tipo de Propiedad</Typography>
            <Typography>{propiedad.tipo}</Typography>
          </Grid2>
        
          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Inventario</Typography>
            <Typography sx={{textAlign:"justify"}}>{propiedad.inventario? propiedad.inventario : "sin inventario"}</Typography>
          </Grid2>

          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Precio</Typography>
            <Typography>{precio ? `$${precio}` : 'Sin precio'}</Typography>
          </Grid2>

          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Ambientes</Typography>
            <Typography>{cantidadAmbientes ?? '—'}</Typography>
          </Grid2>

          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Amenities</Typography>
            <Typography>
              {[cochera && 'Cochera', patio && 'Patio', jardin && 'Jardín', pileta && 'Pileta']
                .filter(Boolean)
                .join(', ') || 'Sin amenities'}
            </Typography>
          </Grid2>
    
          <Grid2 item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Disponibilidad</Typography>
            <Chip
              label={disponibilidad  ? 'Libre' : 'Alquilada'}
              color={disponibilidad ? 'success' : 'warning'}
              icon={disponibilidad  ? <CheckCircleIcon /> : <CancelIcon />}
              sx={{ fontWeight: 600 }}
            />
          </Grid2>
   
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" onClick={() => navigate(`/propiedades/editar/${propiedad.id}`)}>
          Editar propiedad
        </Button>
      </DialogActions>
  
    </Dialog>
  );
};

export default ModalPropiedad;
