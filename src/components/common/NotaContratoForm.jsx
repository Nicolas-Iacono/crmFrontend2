import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      };
      console.log('Enviando nota:', notaPayload);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notas/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notaPayload),
      });
      if (!response.ok) throw new Error('Error al guardar la nota');
      setSuccess(true);
      setContenido('');
      setMotivo('');
      setEstado('EN_PROCESO');
      setPrioridad('Media');
      setTipo('reparacion');
      setObservaciones('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
        Notas
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : '#f5f5f5',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Motivo"
              fullWidth
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              variant="outlined"
              required
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
            />
          </Grid>
        </Grid>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mt: 2 }}>Nota guardada correctamente.</Typography>}
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
          sx={{
            borderRadius: '8px',
            backgroundColor: '#1F2C61',
            mt: 2,
            '&:hover': {
              backgroundColor: '#151e40',
            },
          }}
        >
          Guardar nota
        </Button>
      </form>
    </Paper>
  );
};

export default NotaContratoForm;
