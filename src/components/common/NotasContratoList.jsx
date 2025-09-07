import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Avatar, CircularProgress, Stack, Chip, IconButton } from '@mui/material';
import ModalNotas from './popUps/ModalNotas';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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

const NotasContratoList = ({ idContrato, contrato }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const notasPorPagina = 3;

  useEffect(() => {
    if (!idContrato) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/notas/listar`)
      .then(res => res.json())
      .then(data => {
        const notasFiltradas = (Array.isArray(data) ? data : []).filter(n => n.idContrato === idContrato);
        // Ordenar por id descendente (más nuevas primero)
        notasFiltradas.sort((a, b) => b.id - a.id);
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
    <>
    <Paper elevation={1}  sx={(theme) => ({
    bgcolor: theme.palette.mode === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(253, 253, 253)',
    p: 2,
    borderRadius: 2,
    mt: 2,
  })}>
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
        <>
        <Stack spacing={2}>
          {notas.slice((page - 1) * notasPorPagina, page * notasPorPagina).map((nota, idx) => (
            <Box
              key={nota.id || idx}
              onClick={() => { setNotaSeleccionada(nota); setModalOpen(true); }}
              sx={(theme) => ({
                bgcolor: theme.palette.mode === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(253, 253, 253)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: { xs: 1, sm: 2 },
                borderRadius: 2,
                p: { xs: 1.2, sm: 2 },
                boxShadow: 1,
                flexDirection: 'row',
                width: '90%',
                minWidth: 0,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(253, 253, 253)' },
              })}
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
        
              
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>
                    {formatFecha(nota.fechaCreacion)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
        {/* Controles de paginación */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 32, textAlign: 'center', fontSize: { xs: 12, sm: 14 }, fontWeight: 600,
            color: '#f9fafe', backgroundColor: '#1F2C61', borderRadius: 2, padding: 1 }}>{page}</Typography>
          <IconButton onClick={() => setPage(p => Math.min(Math.ceil(notas.length / notasPorPagina), p + 1))} disabled={page === Math.ceil(notas.length / notasPorPagina) || notas.length === 0}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
        </>
      )}
    </Paper>
    <ModalNotas open={modalOpen} onClose={() => setModalOpen(false)} nota={notaSeleccionada} contrato={idContrato} contratoInfo={contrato} />
 </>
  );
};

export default NotasContratoList;
