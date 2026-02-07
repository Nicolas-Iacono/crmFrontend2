import React, { useRef, useState } from 'react';
import { Paper, Typography, TextField, Button, MenuItem, Grid, Collapse, IconButton, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material';

const estados = [
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'RESUELTO', label: 'Resuelto' },
  { value: 'CANCELADO', label: 'Cancelado' }
];

const prioridades = [
  { value: 'Alta', label: 'Alta' },
  { value: 'Media', label: 'Media' },
  { value: 'Baja', label: 'Baja' },
];

const tipos = [
  { value: 'reparacion', label: 'Reparación' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'otro', label: 'Otro' },
];

const NotaContratoForm = ({ idContrato, onSuccess }) => {
  
  const [contenido, setContenido] = useState('');
  const [motivo, setMotivo] = useState('');
  const [estado, setEstado] = useState('EN_PROCESO');
  const [prioridad, setPrioridad] = useState('Media');
  const [tipo, setTipo] = useState('reparacion');
  const [observaciones, setObservaciones] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openNotes, setOpenNotes] = useState(false); // State for collapse/expand
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#8b5cf6';
  const accentDark = '#7c3aed';

  const getAuthToken = () => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('propietario_token') ||
      localStorage.getItem('inquilino_token')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const notaPayload = {
        idContrato,
        contenido,
        motivo,
        estado,
        prioridad,
        tipo,
        observaciones,
        visibilidad: 'PUBLICA',
      };

      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(notaPayload)], { type: 'application/json' }));
      (imagenes || []).forEach((file) => {
        formData.append('imagenes', file);
      });

      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notas/crear-con-imagenes`, {
        method: 'POST',
        headers: { 
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Error al guardar la nota');
      // Intentar obtener la nota creada desde el backend
      let createdNote = null;
      try {
        const payload = await response.json();
        createdNote = Array.isArray(payload) ? payload[0] : (payload?.data || payload);
      } catch (_) {
        // si no se puede parsear, continuamos sin la nota
      }
      setSuccess(true);
      setContenido('');
      setMotivo('');
      setEstado('EN_PROCESO');
      setPrioridad('Media');
      setTipo('reparacion');
      setObservaciones('');
      setImagenes([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Notificar globalmente que se creó una nota para refrescar listas sin recargar
      try {
        window.dispatchEvent(new CustomEvent('nota-creada', { detail: createdNote || {
          idContrato,
          contenido,
          motivo,
          estado,
          prioridad,
          tipo,
          observaciones,
          visibilidad: 'PUBLICA',
          fechaCreacion: new Date().toISOString(),
        }}));
      } catch (_) {}
      if (onSuccess) onSuccess(createdNote);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: openNotes ? 2 : 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
          Notas
        </Typography>
        <IconButton
          onClick={() => setOpenNotes(!openNotes)}
          aria-expanded={openNotes}
          aria-label="mostrar notas"
          size="small"
          sx={{
            transform: openNotes ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: isDark ? '#a78bfa' : accentDark,
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>
      <Collapse in={openNotes} timeout="auto" unmountOnExit>
        <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>

    <Grid item xs={12} sm={6}>
            <TextField
              label="Titulo"
              fullWidth
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              variant="outlined"
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            />
          </Grid>



          <Grid item xs={12}>
            <TextField
              label="Contenido"
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="Escribe tus notas sobre este contrato aquí..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              variant="outlined"
              required
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            />
          </Grid>



      


          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Estado"
              fullWidth
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            >
              {estados.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Prioridad"
              fullWidth
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            >
              {prioridades.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Tipo"
              fullWidth
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            >
              {tipos.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              fullWidth
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              variant="outlined"
              multiline
              minRows={2}
              maxRows={5}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              disabled={loading}
              size="small"
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                borderColor: isDark ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.3)',
                color: isDark ? '#a78bfa' : accentDark,
                '&:hover': { borderColor: accentColor, bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)' },
              }}
            >
              Seleccionar imágenes
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => setImagenes(Array.from(e.target.files || []))}
              />
            </Button>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {imagenes?.length ? `${imagenes.length} imagen(es) seleccionada(s)` : 'Sin imágenes'}
            </Typography>
          </Grid>
        </Grid>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Nota guardada correctamente.</Typography>}
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          disabled={loading}
          size="small"
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            mt: 2,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            },
          }}
        >
          Guardar nota
        </Button>
      </form>
      </Collapse>
    </Paper>
  );
};

export default NotaContratoForm;
