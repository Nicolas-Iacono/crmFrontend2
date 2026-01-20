import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';

const RecibosGeneradosSection = ({
  contrato,
  isLoading,
  error,
  recibos,
  filteredRecibos,
  filtro,
  setFiltro,
  handleOpenReciboModal,
  handleUpdateEstado,
  getTipoImpuestoIcon,
  formatFecha,
  handleDownloadPDF,
  updatingEstado,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleHorizontalScroll = (event) => {
    const container = event.currentTarget;
    const children = Array.from(container.children);
    const center = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5, padding:"0 1rem" , marginTop:"4rem"}}>
       
      <Box sx={{ display: 'flex', alignItems: 'center', gap: .1 , justifyContent: 'center', flexDirection:"row"}}>
        <IconButton  onClick={() => navigate(`/contratos`) }>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            fontSize: '1.4rem',
            color: theme.palette.mode === 'dark' ? 'white' : 'rgba(12, 14, 117, 0.88)'
          }}
          data-tour="reciboform-list-title"
        >
          Recibos Generados
        </Typography>
        </Box>
        <Tooltip title="Nuevo recibo">
          <Fab color="primary" onClick={() => navigate(`/recibos/${contrato?.id}`)} sx={{ backgroundColor:"rgba(12, 14, 117, 0.88)", color:"white", hover:{backgroundColor:"rgba(12, 14, 117, 0.88)", color:"white"}}}> 
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      {isLoading || !contrato ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress color="primary" />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Cargando información del contrato...
              </Typography>
            </>
          ) : (
            <>
              <InfoIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                No se pudo cargar la información del contrato
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/contratos')}
                startIcon={<ArrowBackIcon />}
                sx={{ mt: 2 }}
              >
                Volver a contratos
              </Button>
            </>
          )}
        </Box>
      ) : error ? (
        <Box
          sx={{
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.dark,
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography>{error}</Typography>
        </Box>
      ) : recibos.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: theme.palette.text.secondary,
          }}
        >
          <Typography>No hay recibos generados</Typography>
        </Box>
      ) : isMobile ? (
        // Vista móvil con tarjetas en carrusel horizontal
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl:1, pr:1, marginBottom:"5rem" }} data-tour="reciboform-list">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            data-tour="reciboform-filters"
          > 
            <Button
              onClick={() => setFiltro('todos')}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                height: '2rem',
                borderRadius: '16px',
                backgroundColor:
                  filtro === 'todos'
                    ? 'rgba(12, 14, 117, 0.88)'
                    : 'rgba(207, 205, 207, 0.9)',
                color:
                filtro === 'todos'
                ? 'white'
                : 'black',
                width: '7rem',
      
                '&:hover': {
                  backgroundColor: 'rgba(16, 30, 156, 0.9)',
                  color:'white'
                },
              }}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFiltro('pagados')}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                height: '2rem',
                borderRadius: '16px',
                  backgroundColor:
                  filtro === 'pagados'
                    ? 'rgba(12, 14, 117, 0.88)'
                    : 'rgba(207, 205, 207, 0.9)',
                color:
                filtro === 'pagados'
                ? 'white'
                : 'black',
                width: '7rem',
      
                '&:hover': {
                  backgroundColor: 'rgba(16, 30, 156, 0.9)',
                  color:'white'
                },
              }}
            >
              Pagados
            </Button>
            <Button
              onClick={() => setFiltro('pendientes')}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                height: '2rem',
                borderRadius: '16px',
                    backgroundColor:
                  filtro === 'pendientes'
                    ? 'rgba(12, 14, 117, 0.88)'
                    : 'rgba(207, 205, 207, 0.9)',
                color:
                filtro === 'pendientes'
                ? 'white'
                : 'black',
                width: '7rem',
      
                '&:hover': {
                  backgroundColor: 'rgba(16, 30, 156, 0.9)',
                  color:'white'
                },
              }}
            >
              Pendientes
            </Button>
           
          </Box>
          {filteredRecibos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: theme.palette.text.secondary }}>
              <Typography>No hay recibos que coincidan con el filtro seleccionado</Typography>
            </Box>
          ) : (
            <Box
              onScroll={handleHorizontalScroll}
              sx={{
                width: '100%',
                position: 'static',
                mt: 1,
                px: 0,
                py: 1,
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                height: 'auto',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {filteredRecibos.map((recibo, index) => (
                <Card
                  key={recibo.id || index}
                  elevation={activeIndex === index ? 8 : 2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    minWidth: '80%',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100dvh - 180px)',
                    overflowY: 'hidden',
                    flexShrink: 0,
                    scrollSnapAlign: 'center',
                    transform:
                      activeIndex === index
                        ? 'scale(1) translateZ(0)'
                        : 'scale(0.92) translateZ(-10px)',
                    opacity: activeIndex === index ? 1 : 0.9,
                    boxShadow:
                      activeIndex === index
                        ? '0 16px 24px rgba(0,0,0,0.25)'
                        : '0 8px 16px rgba(0,0,0,0.15)',
                    transition:
                      'transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                  }}
                  onClick={() => handleOpenReciboModal(recibo)}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      py: 1.5,
                      px: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                      Recibo °{recibo.numeroRecibo}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Descargar PDF">
                        <IconButton size="small" sx={{ color: 'white' }} onClick={(e) => { e.stopPropagation(); handleDownloadPDF && handleDownloadPDF(recibo, e); }}>
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Chip
                        icon={recibo.estado ? <CheckCircleIcon /> : <CancelIcon />}
                        label={
                          updatingEstado?.[recibo.id]
                            ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: .75 }}>
                                  {recibo.estado ? 'Pagado' : 'Pendiente'}
                                  <CircularProgress size={12} color="inherit" />
                                </Box>
                              )
                            : (recibo.estado ? 'Pagado' : 'Pendiente')
                        }
                        color={recibo.estado ? 'success' : 'warning'}
                        size="small"
                        className="estado-chip"
                        sx={{
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            fontSize: 16,
                          },
                          cursor: updatingEstado?.[recibo.id] ? 'default' : 'pointer',
                          opacity: updatingEstado?.[recibo.id] ? 0.85 : 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!updatingEstado?.[recibo.id]) handleUpdateEstado(recibo);
                        }}
                      />
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Periodo:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recibo.periodo || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha:
                      </Typography>
                      <Typography variant="body1">
                        {formatFecha(recibo.fechaEmision) || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Concepto:
                      </Typography>
                      <Typography variant="body1">{recibo.concepto || 'N/A'}</Typography>
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Monto:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: '#273D97' }}
                      >
                        ${
                          recibo.montoTotal
                            ? recibo.montoTotal.toLocaleString('es-AR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : '0'
                        }
                      </Typography>

                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                      {recibo.impuestos && recibo.impuestos.length > 0 && (
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 1, display: 'flex', gap: 0.5,
                          flexWrap:"wrap"
                         }}>
                          {recibo.impuestos.map((imp, idx) => {
                            const monto = parseFloat(imp?.montoAPagar || 0);
                            const porcentaje = parseFloat(imp?.porcentaje || 0);
                            const calculado = (porcentaje === 0 || porcentaje === 100)
                              ? monto
                              : monto * (porcentaje / 100);
                            return (
                              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                                {(() => {
                                  const tipo = String(imp?.tipoImpuesto || '').toUpperCase();
                                  const map = {
                                    AGUA:            { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0' },
                                    LUZ:             { bg: '#fff9c4', border: '#fdd835', text: '#f57f17' },
                                    GAS:             { bg: '#ffe0b2', border: '#ffa726', text: '#e65100' },
                                    MUNICIPAL:       { bg: '#eeeeee', border: '#bdbdbd', text: '#424242' },
                                    EXP_ORD:         { bg: '#e8f5e9', border: '#81c784', text: '#1b5e20' },
                                    EXP_EXT_ORD:     { bg: '#e8f5e9', border: '#81c784', text: '#1b5e20' },
                                    DEUDA_PENDIENTE: { bg: '#ffebee', border: '#ef9a9a', text: '#b71c1c' },
                                    DEFAULT:         { bg: '#f5f5f5', border: '#e0e0e0', text: '#424242' },
                                  };
                                  const chosen = map[tipo] || map.DEFAULT;
                                  return (
                                    <Chip
                                      icon={getTipoImpuestoIcon && getTipoImpuestoIcon(imp.tipoImpuesto)}
                                      size="medium"
                                      variant="outlined"
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        px: 0,
                                        minWidth: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: chosen.bg,
                                        borderColor: chosen.border,
                                        color: chosen.text,
                                        '& .MuiChip-icon': { margin: 0, fontSize: 20, color: chosen.text },
                                        '& .MuiChip-label': { padding: 0 },
                                      }}
                                    />
                                  );
                                })()}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                      {(() => {
                        const impuestosTotal = Array.isArray(recibo?.impuestos)
                          ? recibo.impuestos.reduce((acc, imp) => {
                              const monto = parseFloat(imp?.montoAPagar || 0);
                              const porcentaje = parseFloat(imp?.porcentaje || 0);
                              const calculado = (porcentaje === 0 || porcentaje === 100) ? monto : monto * (porcentaje / 100);
                              return acc + calculado;
                            }, 0)
                          : 0;
                        const total = Number(recibo?.montoTotal || 0) + impuestosTotal;
                        return (
                          <Box sx={{ pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.paper' }}>
                            <Typography variant="body2" color="text.secondary">Total:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#273D97' }}>
                              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        );
                      })()}
                    </Box>

                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        // Vista desktop con tabla
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden',
          }}
          data-tour="reciboform-list"
        >
          <Table>
            <TableHead
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[100],
              }}
            >
              <TableRow
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[100],
                  '& th': {
                    color:
                      theme.palette.mode === 'dark' ? 'white' : 'black',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    padding: '16px',
                  },
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell>Fecha Emisión</TableCell>
                <TableCell>Fecha Vencimiento</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Concepto</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Impuestos</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecibos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay recibos que coincidan con el filtro seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecibos.map((recibo, index) => (
                  <TableRow
                    key={recibo.id || index}
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? 'white'
                          : theme.palette.grey[50],
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transition: 'background-color 0.3s ease',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => handleOpenReciboModal(recibo)}
                  >
                    <TableCell sx={{ padding: '16px' }}>
                      {recibo.id || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      {formatFecha(recibo.fechaEmision)}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      {formatFecha(recibo.fechaVencimiento)}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      {recibo.periodo || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      {recibo.concepto || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      ${
                        recibo.montoTotal
                          ? recibo.montoTotal.toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0'
                      }
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      {recibo.impuestos && recibo.impuestos.length > 0 ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          {recibo.impuestos.map((impuesto) => (
                            (() => {
                              const tipo = String(impuesto?.tipoImpuesto || '').toUpperCase();
                              const map = {
                                AGUA:            { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0' },
                                LUZ:             { bg: '#fff9c4', border: '#fdd835', text: '#f57f17' },
                                GAS:             { bg: '#ffe0b2', border: '#ffa726', text: '#e65100' },
                                MUNICIPAL:       { bg: '#eeeeee', border: '#bdbdbd', text: '#424242' },
                                EXP_ORD:         { bg: '#e8f5e9', border: '#81c784', text: '#1b5e20' },
                                EXP_EXT_ORD:     { bg: '#e8f5e9', border: '#81c784', text: '#1b5e20' },
                                DEUDA_PENDIENTE: { bg: '#ffebee', border: '#ef9a9a', text: '#b71c1c' },
                                DEFAULT:         { bg: '#f5f5f5', border: '#e0e0e0', text: '#424242' },
                              };
                              const chosen = map[tipo] || map.DEFAULT;
                              return (
                                <Chip
                                  key={impuesto.id}
                                  icon={getTipoImpuestoIcon(impuesto.tipoImpuesto)}
                                  label={`${impuesto.tipoImpuesto} - $${impuesto.montoAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 500,
                                    backgroundColor: chosen.bg,
                                    borderColor: chosen.border,
                                    color: chosen.text,
                                    '& .MuiChip-icon': { fontSize: 16, color: chosen.text },
                                  }}
                                />
                              );
                            })()
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin impuestos
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      <Chip
                        icon={recibo.estado ? <CheckCircleIcon /> : <CancelIcon />}
                        label={
                          updatingEstado?.[recibo.id]
                            ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: .75 }}>
                                  {recibo.estado ? 'Pagado' : 'Pendiente'}
                                  <CircularProgress size={12} color="inherit" />
                                </Box>
                              )
                            : (recibo.estado ? 'Pagado' : 'Pendiente')
                        }
                        color={recibo.estado ? 'success' : 'warning'}
                        size="small"
                        className="estado-chip"
                        sx={{
                          fontWeight: 500,
                          minWidth: '120px',
                          '& .MuiChip-icon': {
                            fontSize: 16,
                          },
                          cursor: updatingEstado?.[recibo.id] ? 'default' : 'pointer',
                          opacity: updatingEstado?.[recibo.id] ? 0.85 : 1,
                          '&:hover': updatingEstado?.[recibo.id]
                            ? undefined
                            : {
                                opacity: 0.8,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                              },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!updatingEstado?.[recibo.id]) handleUpdateEstado(recibo);
                        }}
                        title="Haz clic para cambiar el estado"
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '16px' }}>
                      <Tooltip title="Descargar PDF">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownloadPDF && handleDownloadPDF(recibo, e); }}>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RecibosGeneradosSection;
