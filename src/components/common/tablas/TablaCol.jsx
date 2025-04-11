import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid2,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Pagination,
  Zoom,
  Fab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PreviewIcon from '@mui/icons-material/Preview';
import contratoApi from '../../api/contratoApi';
import TextEditor from '../editorDTexto/TextEditor';
import GenerarContrato from '../pdfPlantilla/GenerarContrato';
import MoreInfoGarantes from './MoreInfoGarantes';
import MoreInfoPropietario from './MoreInfoPropietario';
import MoreInfoInquilino from './MoreInfoInquilino';
import Swal from 'sweetalert2';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const TablaCol = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [contratos, setContratos] = useState([]);
  const [pressTimer, setPressTimer] = useState(null);
  const [showBubbles, setShowBubbles] = useState({});
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const contractsPerPage = 6;

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

  useEffect(() => {
    const fetchContratos = async () => {
      if (user.name) {
        try {
          const { data } = await contratoApi.buscarContratoPorUsuario(user.name);
          setContratos(data || []);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchContratos();
  }, [user.name]);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when search term changes
  }, [searchTerm]);

  const pausarContrato = async(id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contrato/finalizar/${id}`);
      await Swal.fire({
        title: 'Contrato Pausado!',
        text: 'Ahora puedes eliminar el contrato',
        icon: 'warning',
      });
      const { data } = await contratoApi.buscarContratoPorUsuario(user.name);
      setContratos(data || []);
    } catch (error) {
      console.error("Error al finalizar contrato: ", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo pausar el contrato. Inténtalo de nuevo más tarde.',
        icon: 'error',
      });
    }
  };

  const eliminarContrato = async(id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contrato/delete/${id}`);
      await Swal.fire({
        title: 'Contrato Eliminado!',
        text: 'El contrato fue eliminado correctamente',
        icon: 'success',
      });
      const { data } = await contratoApi.buscarContratoPorUsuario(user.name);
      setContratos(data || []);
    } catch (error) {
      console.error("Error al eliminar contrato: ", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el contrato. No se pueden eliminar contratos activos, asegurese de que el contrato se encuentra pausado.',
        icon: 'error',
      });
    }
  };

  const handleDownloadPDF = async (contrato) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contrato/download/${contrato.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contrato.nombreContrato}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar PDF: ", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo descargar el PDF. Inténtalo de nuevo más tarde.',
        icon: 'error',
      });
    }
  };

  const contratosFiltrados = contratos ? contratos.filter(contrato =>
    contrato.nombreContrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.propietario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.inquilino.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.propiedad.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditContract = (contrato) => {
    setSelectedContract(contrato);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedContract(null);
  };

  const handlePressStart = (contratoId) => {
    const timer = setTimeout(() => {
      setShowBubbles(prev => ({ ...prev, [contratoId]: true }));
    }, 200);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setShowBubbles({});
  };

  const renderMobileView = (contratosFiltrados) => {
    const pageCount = Math.ceil(contratosFiltrados.length / contractsPerPage);
    const startIndex = currentPage * contractsPerPage;
    const endIndex = startIndex + contractsPerPage;
    const currentContracts = contratosFiltrados.slice(startIndex, endIndex);

    return (
      <Box sx={{ 
        width: "90%",
        margin: "0 auto",
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {currentContracts.map((contrato) => (
          <Card 
            key={contrato.id}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              },
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {contrato.estado === 'pausado' && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'warning.main'
              }} />
            )}
            <CardContent>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography variant="h6" sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    flex: 1,
                    pr: 2
                  }}>
                    {contrato.nombreContrato}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title="Descargar PDF">
                      <IconButton
                        onClick={() => handleDownloadPDF(contrato)}
                        sx={{ 
                          p: 1,
                          color: theme.palette.success.main,
                          bgcolor: 'rgba(76, 175, 80, 0.04)',
                          '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' }
                        }}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pausar contrato">
                      <IconButton
                        onClick={() => pausarContrato(contrato.id)}
                        sx={{ 
                          p: 1,
                          bgcolor: 'rgba(0,0,0,0.04)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                        }}
                      >
                        <PauseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar contrato">
                      <IconButton
                        onClick={() => eliminarContrato(contrato.id)}
                        sx={{ 
                          p: 1,
                          color: theme.palette.error.main,
                          bgcolor: 'rgba(211, 47, 47, 0.04)',
                          '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
                        }}
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        onTouchStart={() => handlePressStart(contrato.id)}
                        onTouchEnd={handlePressEnd}
                        onMouseDown={() => handlePressStart(contrato.id)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                      >
                        <PersonIcon />
                      </IconButton>
                      {showBubbles[contrato.id] && (
                        <>
                          <Zoom in={showBubbles[contrato.id]} style={{ transitionDelay: '0ms' }}>
                            <Fab
                              size="small"
                              sx={{
                                position: 'absolute',
                                right: '0px',
                                top: '-60px',
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                transform: 'scale(0.8)',
                                '&:hover': { backgroundColor: theme.palette.primary.dark }
                              }}
                            >
                              <Tooltip title="Propietario">
                                <Typography variant="caption">{contrato.propietario.nombre.split(' ')[0]}</Typography>
                              </Tooltip>
                            </Fab>
                          </Zoom>
                          <Zoom in={showBubbles[contrato.id]} style={{ transitionDelay: '100ms' }}>
                            <Fab
                              size="small"
                              sx={{
                                position: 'absolute',
                                right: '0px',
                                top: '-100px',
                                backgroundColor: theme.palette.secondary.main,
                                color: 'white',
                                transform: 'scale(0.8)',
                                '&:hover': { backgroundColor: theme.palette.secondary.dark }
                              }}
                            >
                              <Tooltip title="Inquilino">
                                <Typography variant="caption">{contrato.inquilino.nombre.split(' ')[0]}</Typography>
                              </Tooltip>
                            </Fab>
                          </Zoom>
                          <Zoom in={showBubbles[contrato.id]} style={{ transitionDelay: '200ms' }}>
                            <Fab
                              size="small"
                              sx={{
                                position: 'absolute',
                                right: '0px',
                                top: '-140px',
                                backgroundColor: theme.palette.success.main,
                                color: 'white',
                                transform: 'scale(0.8)',
                                '&:hover': { backgroundColor: theme.palette.success.dark }
                              }}
                            >
                              <Tooltip title="Garante">
                                <Typography variant="caption">{contrato.garantes[0]?.nombre.split(' ')[0] || 'N/A'}</Typography>
                              </Tooltip>
                            </Fab>
                          </Zoom>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75
                }}>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PersonIcon fontSize="small" sx={{ color: 'action.active' }} />
                    {contrato.inquilino?.nombre || 'Sin inquilino'} {contrato.inquilino?.apellido || ''}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <HomeIcon fontSize="small" sx={{ color: 'action.active' }} />
                    {contrato.propiedad?.direccion || 'Sin propiedad'}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CalendarTodayIcon fontSize="small" sx={{ color: 'action.active' }} />
                    {new Date(contrato.fechaCreacion).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <GroupIcon fontSize="small" sx={{ color: 'action.active' }} />
                    {contrato.garantes?.length || 0} garantes
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleEditContract(contrato)}
                  sx={{
                    mt: 1,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  Editar Contrato
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {pageCount > 1 && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            mb: 4
          }}>
            <Pagination
              count={pageCount}
              page={currentPage + 1}
              onChange={(e, page) => setCurrentPage(page - 1)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderDesktopView = (contratosFiltrados) => {
    const pageCount = Math.ceil(contratosFiltrados.length / contractsPerPage);
    const startIndex = currentPage * contractsPerPage;
    const displayedContracts = contratosFiltrados.slice(startIndex, startIndex + contractsPerPage);

    return (
      <Box sx={{ width: "80%", margin: "0 auto" }}>
        {contratosFiltrados.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            mt: 2,
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            maxWidth: 400,
            mx: 'auto',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }}
            >
              No se encontraron contratos con los criterios de búsqueda.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gridTemplateRows: {
                xs: 'auto',
                sm: 'repeat(3, auto)',
                md: 'repeat(2, auto)'
              },
              gap: 3,
              justifyItems: 'center',
              alignItems: 'start',
              mb: 4
            }}>
              {displayedContracts.map((contrato) => (
                <Box key={contrato.id} sx={{ width: { xs: '90%', sm: '19rem', md: '20rem' } }}>
                  <Card 
                    sx={{
                      height: '100%',
                      width: '100%',
                      borderRadius: 3,
                      background: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="h6" sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}>
                        {contrato.nombreContrato}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Grid2 
                        container 
                        spacing={{ xs: 1.5, sm: 2 }}
                        sx={{ pt: 0.5, display: 'flex', flexDirection: 'column' }}
                      >
                        <Grid2 xs={12}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}>
                            📅 {contrato.fecha_inicio} - {contrato.fecha_fin}
                          </Typography>
                        </Grid2>
                        <Grid2 xs={12}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}>
                            👤 {contrato.propietario.nombre} {contrato.propietario.apellido}
                          </Typography>
                        </Grid2>
                        <Grid2 xs={12}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}>
                            👥 {contrato.inquilino.nombre} {contrato.inquilino.apellido}
                          </Typography>
                        </Grid2>
                        <Grid2 xs={12}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}>
                            🏠 {contrato.propiedad.direccion}
                          </Typography>
                        </Grid2>
                        <Grid2 xs={12}>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}>
                            👥 {contrato.garantes.length} garantes
                          </Typography>
                        </Grid2>
                        <Grid2 xs={12} sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Tooltip title="Descargar PDF">
                            <IconButton 
                              onClick={() => handleDownloadPDF(contrato)}
                              sx={{ 
                                bgcolor: 'rgba(76, 175, 80, 0.04)',
                                '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.08)' }
                              }}
                            >
                              <PictureAsPdfIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Pausar contrato">
                            <IconButton 
                              onClick={() => pausarContrato(contrato.id)}
                              sx={{ 
                                bgcolor: 'rgba(0,0,0,0.04)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                              }}
                            >
                              <PauseIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar contrato">
                            <IconButton 
                              onClick={() => eliminarContrato(contrato.id)}
                              sx={{ 
                                bgcolor: 'rgba(255,0,0,0.04)',
                                '&:hover': { bgcolor: 'rgba(255,0,0,0.08)' }
                              }}
                            >
                              <DeleteForeverIcon color="error" />
                            </IconButton>
                          </Tooltip>
                          <Button 
                            variant="contained"
                            fullWidth
                            onClick={() => handleEditContract(contrato)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: 2
                            }}
                          >
                            Ver contrato
                          </Button>
                        </Grid2>
                      </Grid2>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
            {pageCount > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                mt: 2,
                flexWrap: 'wrap',
                px: 2
              }}>
                {Array.from({ length: pageCount }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? "contained" : "outlined"}
                    onClick={() => setCurrentPage(index)}
                    sx={{
                      minWidth: '40px',
                      height: '40px',
                      p: 0,
                      borderRadius: 2
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Box>
            )}
            {editorOpen && selectedContract && (
              <Box 
                sx={{ 
                  mt: 4,
                  pt: 4,
                  borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3
                    }}>
                      <Typography variant="h5" sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      }}>
                        Editor de Contrato - {selectedContract.nombreContrato}
                      </Typography>
                      <IconButton 
                        onClick={handleCloseEditor}
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.04)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                        }}
                      >
                        <PreviewIcon />
                      </IconButton>
                    </Box>
                    <TextEditor 
                      contrato={selectedContract} 
                      isOpen={editorOpen}
                      onClose={handleCloseEditor}
                    />
                    <Box sx={{ mt: 3 }}>
                      <GenerarContrato contratoId={selectedContract?.id} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  const renderSearchBar = () => (
    <Box sx={{ 
      width: { xs: '90%', md: '80%' }, 
      mx: 'auto', 
      alignItems: "center",
      mb: 4,
      px: { xs: 0, md: 0 }
    }}>
      <TextField
        variant="outlined"
        placeholder="Buscar por contrato, propietario, inquilino o propiedad..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  return (
    <Box 
      sx={{
        backgroundColor: "#f8fafc",
        minHeight: '100vh',
        pt: { xs: 3, sm: 4 }
      }}
    >
      <Typography 
        variant="h4" 
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          mb: { xs: 3, sm: 4 },
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '1.75rem' }
        }}
      >
        Contratos
      </Typography>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Cargando contratos...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          bgcolor: '#fee2e2', 
          p: 3, 
          borderRadius: 2,
          mt: 3,
          mx: "auto",
          width: { xs: "90%", md: "80%" },
          textAlign: 'center'
        }}>
          <Typography color="error">
            Error al cargar los contratos: {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            width: { xs: "90%", md: "80%" }, 
            mx: "auto",
            mb: 3
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)'
                  }
                }
              }}
            />
          </Box>

          {contratosFiltrados.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 4,
              color: 'text.secondary'
            }}>
              <Typography>No se encontraron contratos</Typography>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <>
                  {renderMobileView(contratosFiltrados)}
                  {selectedContract && (
                    <TextEditor 
                      contrato={selectedContract} 
                      isOpen={editorOpen}
                      onClose={handleCloseEditor}
                    />
                  )}
                </>
              ) : (
                renderDesktopView(contratosFiltrados)
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default TablaCol;
