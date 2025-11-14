import React, { useEffect, useState } from 'react';
import {
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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PreviewIcon from '@mui/icons-material/Preview';
import contratoApi from '../api/contratoApi';
import TextEditor from '../common/editorDTexto/TextEditor';
import GenerarContrato from '../common/pdfPlantilla/GenerarContrato';
import Swal from 'sweetalert2';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import NotaContratoForm from '../common/NotaContratoForm';
import NotasContratoList from '../common/NotasContratoList';
import ModalContract from '../common/popUps/ModalContract';
import EditIcon from '@mui/icons-material/Edit';
import ContractsTour from '../common/tour/ContractsTour';
import { showSuccess, showError, showInfo } from '../alertas/showAlert';
import http from '../api/http';

const ContratosPage = () => {
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [contractNote, setContractNote] = useState('');
  const [contractNotes, setContractNotes] = useState({});
  const navigate = useNavigate();
  const contractsPerPage = isMobile ? 3 : 4;

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
          const res = await http.get(`${import.meta.env.VITE_API_URL}/contrato/me`);
          const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
          setContratos(data || []);
          
          // Recuperar notas guardadas del localStorage
          const savedNotes = localStorage.getItem('contractNotes');
          if (savedNotes) {
            setContractNotes(JSON.parse(savedNotes));
          }
          
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
      await axios.post(`${import.meta.env.VITE_API_URL}/contrato/finalizar/${id}`);
      await Swal.fire({
        title: 'Contrato Pausado!',
        text: 'Ahora puedes eliminar el contrato',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchContratos();
    } catch (error) {
      console.error('Error al pausar contrato:', error);
      showError('No se pudo pausar el contrato');
    }
  };

  const handleDeleteClick = async(id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/contrato/delete/${id}`);
      showSuccess('Contrato eliminado');
      
      // Remove the deleted contract from the frontend state
      const updatedContratos = contratos.filter(contrato => contrato.id !== id);
      setContratos(updatedContratos);
      
    } catch (error) {
      const mensajeError = error.response?.data?.message || '';
    
      if (
        error.response?.status === 500 ||
        (error.response?.status === 500 &&
         mensajeError.includes("contrato activo"))
      ) {
        const confirmar = await Swal.fire({
          title: 'Contrato activo',
          text: '¿Querés eliminarlo de todas formas?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar igual',
          cancelButtonText: 'Cancelar',
        });
    
        if (confirmar.isConfirmed) {
          await axios.delete(`${import.meta.env.VITE_API_URL}/contrato/delete-forzado/${id}`);
          showSuccess('✅ Eliminado forzadamente');
          
          // Remove the deleted contract from the frontend state after forced deletion
          const updatedContratos = contratos.filter(contrato => contrato.id !== id);
          setContratos(updatedContratos);
        }
      } else {
        showError('No se pudo eliminar el contrato');
      }
    }}
  const handleSelectContrato = (contrato) => {
    setSelectedContract(contrato);
    setEditorOpen(true);
  };

  const handleGenerateReceipt = (contratos) => {
    if (contratos && contratos.id) {
      let contratoId = contratos.id;
      navigate(`/recibos/${contratoId}`, { 
        state: { 
          contrato: contratos, 
          formValues: { id: contratoId } 
        } 
      });
      setSelectedContract(contratos);
    } else {
      showError('No se puede acceder a los recibos de este contrato');
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

  const handleOpenDetailModal = (contrato) => {
    setSelectedContract(contrato);
    setDetailModalOpen(true);
    // Cargar nota existente si hay alguna
    if (contractNotes[contrato.id]) {
      setContractNote(contractNotes[contrato.id]);
    } else {
      setContractNote('');
    }
  };
  const handleEditorSaved = (html) => {
    // actualiza el seleccionado
    setSelectedContract(prev =>
      prev ? { ...prev, contratoPdf: html } : prev
    );
    // si manejás una lista base:
    setContratos(prev =>
      Array.isArray(prev)
        ? prev.map(c => c.id === selectedContract?.id ? { ...c, contratoPdf: html } : c)
        : prev
    );
    // si renderizás desde contratosFiltrados derivados, con que actualices la base alcanza
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedContract(null);
  };

  const handleSaveNote = () => {
    if (!selectedContract) return;
    
    const updatedNotes = {
      ...contractNotes,
      [selectedContract.id]: contractNote
    };

    
    setContractNotes(updatedNotes);
    localStorage.setItem('contractNotes', JSON.stringify(updatedNotes));
    
    showSuccess('Nota guardada');
    
  };

  const handleWhatsAppClick = (phone) => {
    if (!phone) {
      showError('No hay número de teléfono disponible');
      return;
    }
    
    // Formatear número para WhatsApp
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email) => {
    if (!email) {
      showError('No hay correo electrónico disponible');
      return;
    }
    
    window.open(`mailto:${email}`, '_blank');
  };

  const renderMobileView = (contratosFiltrados) => {
    const pageCount = Math.ceil(contratosFiltrados.length / contractsPerPage);
    const startIndex = currentPage * contractsPerPage;
    const endIndex = startIndex + contractsPerPage;
    const currentContratos = contratosFiltrados.slice(startIndex, endIndex);

    return (
      <Box sx={{ width: {xs:"90%",md:"100vw"}, mx: 'auto'}}>
        {currentContratos.map((contrato) => (
          <Card 
            key={contrato.id} 
            sx={{ 
              mb: 2.5, 
              borderRadius: 3,
              background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(47, 51, 88) 0%,rgb(12, 12, 33) 100%)' : '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'visible',
              position: 'relative',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgb(190, 190, 190)' : '#1F2C61', mr: 1.5 }} />
                <Typography variant="h6" sx={{ 
                 fontWeight: 600,
                 fontFamily:'Poppins, sans-serif',
                 color:  theme.palette.mode === 'dark' ? 'rgb(190, 190, 190)' : '#1F2C61',
                 }}>
                  {contrato.nombreContrato}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Dirección:</span> {contrato.propiedad?.direccion || 'No especificada'}

              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Propietario:</span> {contrato.propietario?.nombre} {contrato.propietario?.apellido}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Inquilino:</span> {contrato.inquilino?.nombre} {contrato.inquilino?.apellido}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Monto:</span> ${contrato.montoAlquiler?.toLocaleString() || '0'}
              </Typography>
              
              <Box sx={{ display: 'flex', mt: 2, justifyContent: 'center', gap: 2 }}>
                <Tooltip title="Ver detalles" placement="top">
                  <IconButton 
                    onClick={() => handleOpenDetailModal(contrato)}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #1F2C61', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(132, 63, 181) 0%,rgb(38, 53, 185) 100%)' : 'rgba(31, 44, 97, 0.29)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' } 
                    }}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Generar contrato" placement="top">
                      <IconButton 
                        onClick={() => handleSelectContrato(contrato)}
                        sx={{ 
                          color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #C22961', 
                          background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(225, 185, 9) 0%,rgb(185, 38, 38) 100%)' : 'rgba(194, 41, 97, 0.34)',
                          '&:hover': { bgcolor: 'rgba(194, 41, 97, 0.12)' } 
                        }}
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                
                <Tooltip title="Ver recibos" placement="top">
                  <IconButton 
                    onClick={() => {
                      if (contrato && contrato.id) {
                        navigate(`/recibos/${contrato.id}`);
                      } else {
                        showError('No se puede acceder a los recibos de este contrato');
                      }
                    }}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #4CAF50', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(31, 200, 39) 0%,rgb(18, 119, 102) 100%)' : 'rgba(76, 175, 79, 0.3)',
                      '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.12)' } 
                    }}
                  >
                    <ReceiptIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Eliminar contrato" placement="top">
                  <IconButton 
                    onClick={() => handleDeleteClick(contrato.id)}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #FF5252', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(242, 42, 42) 0%,rgb(136, 25, 25) 100%)' : 'rgba(255, 82, 82, 0.31)',
                      '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.12)' } 
                    }}
                  >
                    <DeleteForeverIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 5 }}>
            <Pagination 
              count={pageCount} 
              page={currentPage + 1}
              onChange={(_, page) => setCurrentPage(page - 1)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
                mb: '5rem'
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
    const endIndex = startIndex + contractsPerPage;
    const currentContratos = contratosFiltrados.slice(startIndex, endIndex);

    return (
      <Box sx={{ width: '100%',padding:{xs:"0",md:"1rem"} }}>
        <Grid2 container spacing={3} sx={{ 
          display: 'flex', 
          justifyContent: "flex-start",
          flexWrap: 'wrap'
        }}>
          {currentContratos.map((contrato) => (
            <Grid2 item key={contrato.id} sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '30%',
              minWidth: '300px',
              maxWidth: '400px'
            }}>
              <Card 
                sx={{ 
                  height: '24rem', 
                  width: '20rem',
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'visible',
                  position: 'relative',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HomeIcon sx={{ color: '#1F2C61', mr: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2C61' }}>
                      {contrato.nombreContrato}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Dirección:</span> {contrato.propiedad?.direccion || 'No especificada'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Propietario:</span> {contrato.propietario?.nombre} {contrato.propietario?.apellido}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Inquilino:</span> {contrato.inquilino?.nombre} {contrato.inquilino?.apellido}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Monto:</span> ${contrato.monto?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PreviewIcon />}
                      onClick={() => handleOpenDetailModal(contrato)}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#1F2C61',
                        color: '#1F2C61',
                        '&:hover': {
                          borderColor: '#1F2C61',
                          backgroundColor: 'rgba(31, 44, 97, 0.08)'
                        }
                      }}
                    >
                      Ver detalles
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="Generar contrato" placement="top">
                      <IconButton 
                        onClick={() => handleSelectContrato(contrato)}
                        sx={{ 
                          color: '#C22961', 
                          bgcolor: 'rgba(194, 41, 97, 0.08)',
                          '&:hover': { bgcolor: 'rgba(194, 41, 97, 0.12)' } 
                        }}
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Ver recibos" placement="top">
                      <IconButton 
                        onClick={() => {
                          if (contrato && contrato.id) {
                            navigate(`/recibos/${contrato.id}`);
                          } else {
                            showError('No se puede acceder a los recibos de este contrato');
                          }
                        }}
                        sx={{ 
                          color: '#4CAF50', 
                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                          '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.12)' } 
                        }}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar contrato" placement="top">
                      <IconButton 
                        onClick={() => handleDeleteClick(contrato.id)}
                        sx={{ 
                          color: '#FF5252', 
                          bgcolor: 'rgba(255, 82, 82, 0.08)',
                          '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.12)' } 
                        }}
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
        
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 5 }}>
            <Pagination 
              count={pageCount} 
              page={currentPage + 1}
              onChange={(_, page) => setCurrentPage(page - 1)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
                mb: '5rem'
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderSearchBar = () => (
    <Box sx={{ 
      width: { xs: '90%', md: '100%' }, 
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
          backgroundColor: theme.palette.background.paper,
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

  const renderDetailModal = () => {
    if (!selectedContract) return null;
    
    return (
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: '#1F2C61',
          color: 'white'
        }}>
          <Typography variant="h6" component="div">
            {selectedContract.nombreContrato}
          </Typography>
          <IconButton 
            onClick={handleCloseDetailModal}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        
         <ModalContract
          selectedContract={selectedContract}
          setSelectedContract={setSelectedContract}
          setContratos={setContratos}
          handleCloseDetailModal={handleCloseDetailModal}
          detailModalOpen={detailModalOpen}
          handleWhatsAppClick={handleWhatsAppClick}
          handleEmailClick={handleEmailClick}
          handleGenerateReceipt={handleGenerateReceipt}
          contractNote={contractNote}
          setContractNote={setContractNote}
          handleSaveNote={handleSaveNote}
        />
      </Dialog>
    );
  };

  return (
    <Box 
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        width: { xs: '100%', md: '100vw' },
        pt: { xs: 3, sm: 4 },
      }}
    >
      <ContractsTour />
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: { xs: '90%', md: '90%' },
        mx: 'auto',
        mt: { xs: 3, md: 4 },
        mb: { xs: 3, md: 3 },
        margin:"2rem" 
      }}>
        <Typography 
          data-tour="contracts-title"
          variant="h4" 
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? 'rgb(240, 240, 240)' : 'rgb(30, 31, 136)',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Contratos
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Nuevo Contrato" placement="bottom">
            <Fab
              color="primary"
              size="small"
              aria-label="add"
              data-tour="contracts-add"
              onClick={() => navigate('/contratos/crear')}
              sx={{
                boxShadow: theme.shadows[1],
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Ir al inicio" placement="bottom">
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                '&:hover': {
                  bgcolor: theme.palette.background.paper,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[3]
                }
              }}
            >
              <HomeIcon color="primary" />
            </IconButton>
          </Tooltip> 
        </Box>
      </Box>

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
          bgcolor: theme.palette.error.main, 
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
            width: { xs: "90%", md: "90%" }, 
            mx: "auto",
            mb: 3
          }}>
            <TextField
              data-tour="contracts-search"
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
                  backgroundColor: theme.palette.background.paper,
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
              color: 'text.secondary',
            }}>
              <Typography>No se encontraron contratos</Typography>
            </Box>
          ) : (
            <>
              {/* Renderizar modales globalmente */}
              {renderDetailModal()}
              {selectedContract && (
                <TextEditor
                  contrato={selectedContract}
                  isOpen={editorOpen}
                  onClose={handleCloseEditor}
                  onSaved={handleEditorSaved}
                />
              )}
              
              {isMobile ? (
                <>
                  {renderMobileView(contratosFiltrados)}
                  {/* Mobile pagination anchor */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }} data-tour="contracts-pagination" />
                </>
              ) : (
                <>
                  {renderDesktopView(contratosFiltrados)}
                  {/* Desktop pagination anchor */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }} data-tour="contracts-pagination" />
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ContratosPage;
