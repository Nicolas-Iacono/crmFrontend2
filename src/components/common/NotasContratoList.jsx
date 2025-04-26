import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Avatar, CircularProgress, Stack, Chip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

const NotasContratoList = ({ idContrato }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idContrato) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/notas/listar`)
      .then(res => res.json())
      .then(data => {
        const notasFiltradas = (Array.isArray(data) ? data : []).filter(n => n.idContrato === idContrato);
        // Ordenar por fechaEmision descendente (más nuevas primero)
        notasFiltradas.sort((a, b) => (b.fechaEmision || '').localeCompare(a.fechaEmision || ''));
        setNotas(notasFiltradas);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar las notas');
        setLoading(false);
      });
  }, [idContrato]);

  if (!idContrato) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mt: 2, bgcolor: '#f9fafe' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#1F2C61' }}>
        Historial de notas
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : notas.length === 0 ? (
        <Typography color="text.secondary">No hay notas para este contrato.</Typography>
      ) : (
        <Stack spacing={2}>
          {notas.map((nota, idx) => (
            <Box
              key={nota.id || idx}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: { xs: 1, sm: 2 },
                bgcolor: '#fff',
                borderRadius: 2,
                p: { xs: 1.2, sm: 2 },
                boxShadow: 1,
                flexDirection: 'row',
                width: '90%',
                minWidth: 0,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#1F2C61',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  mt: { xs: 0.5, sm: 0 },
                  flexShrink: 0,
                }}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, flexDirection: 'column', width: '100%', minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: 13, sm: 15 },
                    wordBreak: 'break-word',
                  }}
                >
                  {nota.motivo}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <Chip size="small" label={nota.estado} color={estadoColor[nota.estado] || 'default'} sx={{ fontSize: { xs: 10, sm: 12 } }} />
                  <Chip size="small" label={nota.prioridad} variant="outlined" sx={{ fontSize: { xs: 10, sm: 12 } }} />
                  <Chip size="small" label={nota.tipo} variant="outlined" sx={{ fontSize: { xs: 10, sm: 12 } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    whiteSpace: 'pre-line',
                    fontSize: { xs: 12, sm: 14 },
                    wordBreak: 'break-word',
                  }}
                >
                  {nota.contenido}
                </Typography>
                {nota.observaciones && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic', mb: 0.5, fontSize: { xs: 11, sm: 13 } }}
                  >
                    Observaciones: {nota.observaciones}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>
                    {formatFecha(nota.fechaEmision)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default NotasContratoList;
