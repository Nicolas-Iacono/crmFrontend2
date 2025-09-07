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

  const navigate = useNavigate();
  const [imgHeight, setImgHeight] = useState(500);
  const dialogContentRef = useRef(null);

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
  } = propiedad;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth key={open ? 'open' : 'closed'}
    sx={{
      '& .MuiDialog-paper': {
        borderRadius:{xs:"10px", md:"20px"},
        maxWidth:{xs:"100%", md:"80%"},
      },
    }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon color="primary" />
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
  
    </Dialog>
  );
};

export default ModalPropiedad;
