import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  useTheme,
  Slide,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { showSuccess, showError } from '../alertas/showAlert';

const apiRoot = `${import.meta.env.VITE_API_URL}${String(import.meta.env.VITE_API_URL || '').includes('/api') ? '' : '/api'}`;

const SlideUp = (props) => {
  return <Slide {...props} direction="up" />;
};

export default function ConfigurarPagosModal({ open, onClose }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    alias: '',
    cbu: '',
    titular: '',
    cuit: '',
    banco: '',
  });
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('propietario_token') ||
      localStorage.getItem('admin_token');

    if (!token) {
      setFormData({
        alias: '',
        cbu: '',
        titular: '',
        cuit: '',
        banco: '',
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setPrefillLoading(true);
        const resp = await axios.get(`${apiRoot}/usuario/me/datosmp`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;
        const data = resp?.data || {};

        setFormData({
          alias: data.alias || '',
          cbu: data.cbu || '',
          titular: data.titular || '',
          cuit: data.cuit || '',
          banco: data.banco || '',
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Error al obtener datos de cobro (MP):', error);
        setFormData({
          alias: '',
          cbu: '',
          titular: '',
          cuit: '',
          banco: '',
        });
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.alias.trim()) {
      showError('El alias es obligatorio');
      return;
    }
    
    if (!formData.titular.trim()) {
      showError('El titular es obligatorio');
      return;
    }
    
    if (!formData.cuit.trim()) {
      showError('El CUIT es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem("token") || 
                   localStorage.getItem("propietario_token") || 
                   localStorage.getItem("admin_token");

      if (!token) {
        showError('Debes iniciar sesión para guardar la configuración de pagos');
        return;
      }
      
      await axios.put(`${apiRoot}/usuario/me/datosmp`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Configuración de pagos guardada exitosamente');
      handleClose();
      
    } catch (error) {
      console.error('Error al configurar pagos:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          'Error al guardar la configuración de pagos';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      alias: '',
      cbu: '',
      titular: '',
      cuit: '',
      banco: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <SlideUp in={open}>
        <Paper
          sx={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            bgcolor: theme.palette.background.paper,
            borderTopLeftRadius: '25px',
            borderTopRightRadius: '25px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 -4px 20px rgba(0,0,0,0.3)' 
              : '0 -4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Configurar Pagos
              </Typography>
              {prefillLoading && <CircularProgress size={18} />}
            </Box>
            <IconButton onClick={handleClose} sx={{ p: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3, maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configura tus datos bancarios para recibir pagos de los alquileres.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Alias (Obligatorio) */}
                <TextField
                  fullWidth
                  label="Alias *"
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  disabled={prefillLoading || loading}
                  placeholder="Ej: mi.banco.alias"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />

                {/* CBU (Opcional) */}
                <TextField
                  fullWidth
                  label="CBU"
                  name="cbu"
                  value={formData.cbu}
                  onChange={handleChange}
                  disabled={prefillLoading || loading}
                  placeholder="Ej: 1234567890123456789012"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />

                {/* Titular (Obligatorio) */}
                <TextField
                  fullWidth
                  label="Titular de la cuenta *"
                  name="titular"
                  value={formData.titular}
                  onChange={handleChange}
                  disabled={prefillLoading || loading}
                  placeholder="Ej: Juan Pérez"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />

                {/* CUIT (Obligatorio) */}
                <TextField
                  fullWidth
                  label="CUIT *"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleChange}
                  disabled={prefillLoading || loading}
                  placeholder="Ej: 20-12345678-9"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />

                {/* Banco (Opcional) */}
                <TextField
                  fullWidth
                  label="Banco"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  disabled={prefillLoading || loading}
                  placeholder="Ej: Banco Galicia"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Box>

              {/* Botones de acción */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 4,
                position: 'sticky',
                bottom: 0,
                bgcolor: theme.palette.background.paper,
                py: 2,
              }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClose}
                  disabled={loading || prefillLoading}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading || prefillLoading}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #00B5E2 0%, #0055A4 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0099CC 0%, #004488 100%)',
                    },
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </SlideUp>
    </Modal>
  );
}
