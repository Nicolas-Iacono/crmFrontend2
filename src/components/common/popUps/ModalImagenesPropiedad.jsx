import React, { useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Grid, Box, Typography, Button, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const ModalImagenesPropiedad = ({ open, onClose, imagenes = [], onDelete, onUpload, uploading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && onUpload) onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Imágenes de la propiedad
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            size="small"
          >
            {uploading ? <CircularProgress size={18} /> : 'Subir imagen'}
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {imagenes.length === 0 ? (
          <Typography color="text.secondary" align="center">No hay imágenes subidas.</Typography>
        ) : (
          <Grid container spacing={2}>
            {imagenes.map((img, idx) => (
              <Grid item xs={6} sm={4} key={img.imageUrl || idx}>
                <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                  <img
                    src={img.imageUrl}
                    alt={`Imagen ${idx + 1}`}
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <IconButton
                    onClick={() => onDelete(img, idx)}
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
      </DialogContent>
    </Dialog>
  );
};

export default ModalImagenesPropiedad;
