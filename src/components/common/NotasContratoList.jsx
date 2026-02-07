import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Avatar, CircularProgress, Stack, Chip, IconButton } from '@mui/material';
import ModalNotas from './popUps/ModalNotas';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTheme } from '@mui/material';
import http from '../api/http';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#8b5cf6';
  const accentDark = '#7c3aed';
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
    http
      .get(`${import.meta.env.VITE_API_URL}/notas/listar`)
      .then(res => {
        const payload = res?.data;
        const data = Array.isArray(payload) ? payload : (payload?.data && Array.isArray(payload.data) ? payload.data : []);
        const notasFiltradas = data.filter(n => n.idContrato === idContrato);
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
  // Suscribirse a creación de notas para actualizar en vivo
  useEffect(() => {
    const handler = (e) => {
      const nueva = e.detail;
      if (!nueva) return;
      if (nueva.idContrato !== idContrato) return;
      setNotas((prev) => {
        const next = [nueva, ...prev];
        // ordenar por id desc si existe, sino por fechaCreacion desc
        next.sort((a, b) => {
          if (a.id && b.id) return b.id - a.id;
          const ta = new Date(a.fechaCreacion || 0).getTime();
          const tb = new Date(b.fechaCreacion || 0).getTime();
          return tb - ta;
        });
        return next;
      });
      // si la nueva inserción dejó la página fuera de rango, volver a 1
      setPage(1);
    };
    window.addEventListener('nota-creada', handler);
    return () => window.removeEventListener('nota-creada', handler);
  }, [idContrato]);

  if (!idContrato) return null;

  return (
    <>
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
      <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
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
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: { xs: 1, sm: 1.5 },
                borderRadius: 2.5,
                p: { xs: 1.5, sm: 2 },
                width: '100%',
                minWidth: 0,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                '&:hover': {
                  borderColor: accentColor,
                  bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.03)',
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
                  color: accentColor,
                  width: { xs: 30, sm: 34 },
                  height: { xs: 30, sm: 34 },
                  mt: 0.25,
                  flexShrink: 0,
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
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
                  <Chip size="small" label={nota.estado} color={estadoColor[nota.estado] || 'default'} sx={{ fontSize: { xs: 9, sm: 11 }, height: 20, fontWeight: 600 }} />
                  <Chip size="small" label={nota.prioridad} variant="outlined" sx={{ fontSize: { xs: 9, sm: 11 }, height: 20 }} />
                  <Chip size="small" label={nota.tipo} variant="outlined" sx={{ fontSize: { xs: 9, sm: 11 }, height: 20 }} />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1.5 }}>
          <IconButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} size="small" sx={{ color: isDark ? '#a78bfa' : accentDark }}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', borderRadius: 1.5, py: 0.5, px: 1, fontSize: '0.7rem' }}>{page}</Typography>
          <IconButton onClick={() => setPage(p => Math.min(Math.ceil(notas.length / notasPorPagina), p + 1))} disabled={page === Math.ceil(notas.length / notasPorPagina) || notas.length === 0} size="small" sx={{ color: isDark ? '#a78bfa' : accentDark }}>
            <NavigateNextIcon fontSize="small" />
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
