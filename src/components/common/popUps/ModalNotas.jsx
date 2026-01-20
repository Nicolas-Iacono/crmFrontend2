import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Modal, IconButton, Chip, Stack, Grid, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ModalImgFull from './ModalImgFull';
import SharedNota from '../SharedNota';
import http from '../../api/http';

const estadoColor = {
  'PENDIENTE': 'warning',
  'EN_PROCESO': 'info',
  'RESUELTO': 'success',
  'CANCELADO': 'error',
};

const preposicion = (autor) => {
  if (autor === 'INQUILINO' || autor === 'PROPIETARIO') {
    return 'el'
  }else{
    return 'la'
  }
}

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
  const [galleryVersion, setGalleryVersion] = useState(Date.now());
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorImgs, setErrorImgs] = useState(null);


  // Helper: refetch imágenes de la nota
  const refetchImagenes = async () => {
    if (!nota?.id) return;
    setLoadingImgs(true);
    setErrorImgs(null);
    try {
      const res = await http.get(`${import.meta.env.VITE_API_URL}/notas/${nota.id}`, { params: { t: Date.now() } });
      const data = res?.data ?? {};
      setImagenes(Array.isArray(data.imagenes) ? data.imagenes : []);
      setGalleryVersion(Date.now());
    } catch {
      setErrorImgs('Error al cargar imágenes');
    } finally {
      setLoadingImgs(false);
    }
  };

  // Cargar imágenes al abrir el modal o cambiar la nota
  useEffect(() => {
    refetchImagenes();
  }, [nota]);

  // Helper: esperar a que la URL esté disponible usando un Image() (evita CORS issues de HEAD)
  const waitForImageAvailability = async (url, tries = 6, delayMs = 600) => {
    if (!url) return false;
    for (let i = 0; i < tries; i++) {
      const attemptUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}_${i+1}`;
      const ok = await new Promise(resolve => {
        const img = new Image();
        const timer = setTimeout(() => { resolve(false); }, delayMs);
        img.onload = () => { clearTimeout(timer); resolve(true); };
        img.onerror = () => { clearTimeout(timer); resolve(false); };
        img.src = attemptUrl;
      });
      if (ok) return true;
      await new Promise(r => setTimeout(r, delayMs));
    }
    return false;
  };

  // Subir imagen
  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !nota?.id) return;
    setUploading(true);
    setErrorImgs(null);
    const formData = new FormData();
    formData.append('files', file);
    // Vista previa optimista local
    const tempId = `temp-${Date.now()}`;
    const tempUrl = URL.createObjectURL(file);
    setImagenes(prev => [...prev, { id: tempId, url: tempUrl, temp: true }]);
    try {
      const res = await http.post(`${import.meta.env.VITE_API_URL}/notas/${nota.id}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const payload = res?.data;
      const imgRaw = Array.isArray(payload)
        ? payload[0]
        : (Array.isArray(payload?.data)
            ? payload.data[0]
            : (payload?.data ?? payload));
      const img = imgRaw && (imgRaw.imageUrl || imgRaw.url) ? imgRaw : null;
      if (!img) throw new Error('Error al subir imagen');
      const url = img.imageUrl || img.url;
      // Esperar disponibilidad para evitar <img> roto por CDN cache
      const available = await waitForImageAvailability(url);
      if (available) {
        // Reemplazar preview local con la versión del servidor
        setImagenes(prev => {
          const withoutTemp = prev.filter(i => !i.temp);
          return [...withoutTemp, img];
        });
        // Refetch para asegurar URL final y evitar caches
        await refetchImagenes();
        setGalleryVersion(Date.now());
      } else {
        // Mantener preview local y reintentar un refetch diferido
        setTimeout(() => {
          refetchImagenes();
          setGalleryVersion(Date.now());
        }, 1500);
      }
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
      await http.delete(`${import.meta.env.VITE_API_URL}/notas/${nota.id}/imagenes/${imgId}`);
      setImagenes(prev => prev.filter(i => i.idImage !== imgId));
      setGalleryVersion(Date.now());
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
          position: 'absolute',
  
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(31, 44, 97, 0.22)',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            position: 'relative',
            height:"60%",
            bottom: 0,
            left: 0,
            bgcolor: theme.palette.mode === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(253, 253, 253)',
            borderRadius: "20px 20px 0 0",
            boxShadow: 24,
            width: '100vw',
            p: 4,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '90vh',
            overflowY: 'auto',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
               Reporte emitido por {preposicion(nota.autor)} {nota.autor}
              </Typography>
            </Box>
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
                {imagenes.filter(i => (i?.url || i?.imageUrl)).map((img, idx) => {
                  const baseUrl = img.url || img.imageUrl;
                  const ts = img.fechaSubida ? new Date(img.fechaSubida).getTime() : Date.now();
                  const srcUrl = baseUrl ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${ts}&v=${galleryVersion}` : '';
                  return (
                  <Grid item xs={6} sm={4} key={(img.idImage || img.id || idx) + '-' + galleryVersion}>
                    <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                      <img
                        src={srcUrl}
                        alt={`Imagen ${idx + 1}`}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                        onClick={() => setImgFull(baseUrl)}
                        onError={(e) => {
                          // Reintentos de carga con cache-busting incremental
                          const imgEl = e.currentTarget;
                          const tries = Number(imgEl.dataset.tries || 0);
                          if (tries < 3 && baseUrl) {
                            imgEl.dataset.tries = String(tries + 1);
                            const nextSrc = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}_${tries+1}`;
                            imgEl.src = nextSrc;
                          } else {
                            // Último recurso: refetch listado
                            refetchImagenes();
                          }
                        }}
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
                );})}
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
