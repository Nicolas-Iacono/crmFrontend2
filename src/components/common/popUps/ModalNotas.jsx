import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Modal, IconButton, Chip, Stack, Grid, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ModalImgFull from './ModalImgFull';
import SharedNota from '../SharedNota';

const estadoColor = {
  'PENDIENTE': 'warning',
  'EN_PROCESO': 'info',
  'RESUELTO': 'success',
  'CANCELADO': 'error',
};

function formatFecha(fechaStr) {
  if (!fechaStr) return '';
  try {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return fechaStr;
  }
}

const ModalNotas = ({ open, onClose, nota, contrato, contratoInfo }) => {
  const [imgFull, setImgFull] = useState(null); // Nueva: imagen en pantalla completa
  const fileInputRef = useRef();
  const [imagenes, setImagenes] = useState([]);
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorImgs, setErrorImgs] = useState(null);


  // Cargar imágenes al abrir el modal o cambiar la nota
  useEffect(() => {
    if (!nota?.id) return;
  
    setLoadingImgs(true);
    setErrorImgs(null);
  
    fetch(`${import.meta.env.VITE_API_URL}/notas/${nota.id}`)
      .then(res => res.json())
      .then(data => {
        setImagenes(Array.isArray(data.imagenes) ? data.imagenes : []);
        setLoadingImgs(false);
      })
      .catch(() => {
        setErrorImgs('Error al cargar imágenes');
        setLoadingImgs(false);
      });
  }, [nota]);

  // Subir imagen
  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !nota?.id) return;
    setUploading(true);
    setErrorImgs(null);
    const formData = new FormData();
    formData.append('files', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notas/${nota.id}/imagenes`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir imagen');
      const img = await res.json();
      setImagenes(prev => [...prev, img]);
    } catch {
      setErrorImgs('Error al subir imagen');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // Eliminar imagen
  const handleDelete = async (imgId) => {
    if (!nota?.id || !imgId) {
      console.warn('handleDelete abortado: falta nota.id o imgId', { nota, imgId });
      return;
    }
    setErrorImgs(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notas/${nota.id}/imagenes/${imgId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar imagen');
      setImagenes(prev => prev.filter(i => i.idImage !== imgId));
    } catch {
      setErrorImgs('Error al eliminar imagen');
    }
  };

  if (!nota) return null;
  return (
    <>
    
    {
      imgFull !== null
        ? <ModalImgFull open={!!imgFull} onClose={() => setImgFull(null)} img={imgFull} />
        : (
          <Modal open={open} onClose={onClose} disableEnforceFocus>
            <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(31,44,97,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            bgcolor: theme.palette.mode === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(253, 253, 253)',
            borderRadius: 3,
            boxShadow: 24,
            maxWidth: 540,
            width: '96vw',
            p: 4,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          })}
        >
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', top: 12, right: 12, color: '#1F2C61' }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatBubbleOutlineIcon color="primary" />
            <Typography variant="h6"  sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? 'rgb(188, 188, 188)' : '#1F2C61',fontWeight: 700 })}>
              {nota.motivo}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={nota.estado} color={estadoColor[nota.estado] || 'default'} />
            <Chip size="small" label={nota.prioridad} variant="outlined" />
            <Chip size="small" label={nota.tipo} variant="outlined" />
          </Stack>
          <Typography variant="body1"  sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? 'rgb(188, 188, 188)' : '#1F2C61', whiteSpace: 'pre-line', fontSize: 16 })}>
            {nota.contenido}
          </Typography>
          {nota.observaciones && (
            <Typography variant="body2" color="text.secondary"  sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? 'rgb(188, 188, 188)' : '#1F2C61', fontStyle: 'italic' })}>
              Observaciones: {nota.observaciones}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {formatFecha(nota.fechaCreacion)}
              </Typography>
              <SharedNota contrato={nota?.contrato || nota?.contratoInfo} nota={nota} info={contratoInfo}/>
            </Box>
          </Box>

          {/* Galería de imágenes */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1F2C61', fontWeight: 600 }}>
              Imágenes adjuntas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={uploading}
                size="small"
              >
                {uploading ? <CircularProgress size={18} /> : 'Adjuntar imagen'}
              </Button>
              {loadingImgs && <CircularProgress size={18} />}
            </Box>
            {errorImgs && <Typography color="error" variant="body2">{errorImgs}</Typography>}
            {imagenes.length === 0 && !loadingImgs ? (
              <Typography color="text.secondary" variant="body2">No hay imágenes adjuntas.</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {imagenes.map((img, idx) => (
                  <Grid item xs={6} sm={4} key={img.id || idx}>
                    <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                      <img
                        src={img.url || img.imageUrl}
                        alt={`Imagen ${idx + 1}`}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                        onClick={() => setImgFull(img.url || img.imageUrl)}
                      />
                      <IconButton
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(img.idImage);
                        }}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
                        size="small"
                      >
    

                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box> 
        </Box>
      </Box>
    </Modal>
        )
      }
 </>
  );
};

export default ModalNotas;
