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
  const contractsPerPage = 3;

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
  console.log(contratos)
 
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
      Swal.fire({
        title: 'Error',
        text: 'No se pudo pausar el contrato',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDeleteClick = async(id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/contrato/${id}`);
          Swal.fire(
            'Eliminado!',
            'El contrato ha sido eliminado.',
            'success'
          );
          const updatedContratos = contratos.filter(contrato => contrato.id !== id);
          setContratos(updatedContratos);
        } catch (error) {
          console.error('Error al eliminar contrato:', error);
          Swal.fire(
            'Error!',
            'No se pudo eliminar el contrato.',
            'error'
          );
        }
      }
    });
  };

  const handleSelectContrato = (contrato) => {
    setSelectedContract(contrato);
    setEditorOpen(true);
  };

  const handleGenerateReceipt = (contratos) => {
    if (contratos && contratos.id) {
      let contratoId = contratos.id;
      console.log("Enviando contrato a página de recibos:", contratos);
      navigate(`/recibos/${contratoId}`, { 
        state: { 
          contrato: contratos, 
          formValues: { id: contratoId } 
        } 
      });
      setSelectedContract(contratos);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se puede acceder a los recibos de este contrato',
        icon: 'error'
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
    
    Swal.fire({
      title: 'Nota guardada',
      text: 'La nota se ha guardado correctamente',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleWhatsAppClick = (phone) => {
    if (!phone) {
      Swal.fire({
        title: 'Error',
        text: 'No hay número de teléfono disponible',
        icon: 'error'
      });
      return;
    }
    
    // Formatear número para WhatsApp
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email) => {
    if (!email) {
      Swal.fire({
        title: 'Error',
        text: 'No hay correo electrónico disponible',
        icon: 'error'
      });
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
      <Box sx={{ width: '90%', mx: 'auto' }}>
        {currentContratos.map((contrato) => (
          <Card 
            key={contrato.id} 
            sx={{ 
              mb: 2.5, 
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
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ color: '#1F2C61', mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2C61' }}>
                  {contrato.nombreContrato}
                </Typography>
              </Box>
              
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
                <span style={{ fontWeight: 500 }}>Monto:</span> ${contrato.montoAlquiler?.toLocaleString() || '0'}
              </Typography>
              
              <Box sx={{ display: 'flex', mt: 2, justifyContent: 'center', gap: 2 }}>
                <Tooltip title="Ver detalles" placement="top">
                  <IconButton 
                    onClick={() => handleOpenDetailModal(contrato)}
                    sx={{ 
                      color: '#1F2C61', 
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
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
                        Swal.fire({
                          title: 'Error',
                          text: 'No se puede acceder a los recibos de este contrato',
                          icon: 'error'
                        });
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
      <Box sx={{ width: '100%' }}>
        <Grid2 container spacing={3}>
          {currentContratos.map((contrato) => (
            <Grid2 item xs={12} sm={6} md={4} key={contrato.id}>
              <Card 
                sx={{ 
                  height: '100%', 
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
                            Swal.fire({
                              title: 'Error',
                              text: 'No se puede acceder a los recibos de este contrato',
                              icon: 'error'
                            });
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
        
        {/* <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
                Información del contrato
              </Typography>
              
              <Grid2 container spacing={2}>
                <Grid2 item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <HomeIcon sx={{ mr: 1, color: '#1F2C61' }} />
                    <Typography variant="body1" fontWeight={500}>
                      {selectedContract.propiedad?.direccion || 'Sin dirección'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: '#C22961' }} />
                    <Typography variant="body2">
                      Fecha de inicio: {new Date(selectedContract.fechaCreacion).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: '#C22961' }} />
                    <Typography variant="body2">
                      Fecha de finalización: {selectedContract.fechaFinalizacion ? new Date(selectedContract.fechaFinalizacion).toLocaleDateString() : 'No especificada'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <DescriptionIcon sx={{ mr: 1, color: '#1F2C61' }} />
                    <Typography variant="body2">
                      Destino: {selectedContract.destino || 'No especificado'}
                    </Typography>
                  </Box>
                </Grid2>
                
                <Grid2 item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'green' }} />
                    <Typography variant="body1" fontWeight={500}>
                      Monto: ${selectedContract.monto?.toLocaleString() || 'No especificado'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'green' }} />
                    <Typography variant="body2">
                      Depósito: ${selectedContract.deposito?.toLocaleString() || 'No especificado'}
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>
            </Paper>
            
            {/* Sección Propietario */}
            {/* <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
                Propietario
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {selectedContract.propietario?.nombre} {selectedContract.propietario?.apellido}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Email: {selectedContract.propietario?.email || 'No disponible'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Teléfono: {selectedContract.propietario?.telefono || 'No disponible'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    DNI: {selectedContract.propietario?.dni || 'No disponible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Tooltip title="Contactar por WhatsApp">
                    <IconButton 
                      color="success" 
                      onClick={() => handleWhatsAppClick(selectedContract.propietario?.telefono)}
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar Email">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEmailClick(selectedContract.propietario?.email)}
                      sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
             */}
            {/* Sección Inquilino */}
            {/* <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
                Inquilino
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {selectedContract.inquilino?.nombre} {selectedContract.inquilino?.apellido}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Email: {selectedContract.inquilino?.email || 'No disponible'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Teléfono: {selectedContract.inquilino?.telefono || 'No disponible'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    DNI: {selectedContract.inquilino?.dni || 'No disponible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Tooltip title="Contactar por WhatsApp">
                    <IconButton 
                      color="success" 
                      onClick={() => handleWhatsAppClick(selectedContract.inquilino?.telefono)}
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar Email">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEmailClick(selectedContract.inquilino?.email)}
                      sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper> */}
            
            {/* Sección Garantes */}
            {/* <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
                Garantes ({selectedContract.garantes?.length || 0})
              </Typography>
              
              {selectedContract.garantes && selectedContract.garantes.length > 0 ? (
                selectedContract.garantes.map((garante, index) => (
                  <Box 
                    key={garante.id || index} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 2,
                      mb: 2,
                      pb: 2,
                      borderBottom: index < selectedContract.garantes.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                        {garante.nombre} {garante.apellido}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Email: {garante.email || 'No disponible'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Teléfono: {garante.telefono || 'No disponible'}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        DNI: {garante.dni || 'No disponible'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Tooltip title="Contactar por WhatsApp">
                        <IconButton 
                          color="success" 
                          onClick={() => handleWhatsAppClick(garante.telefono)}
                          sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Enviar Email">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEmailClick(garante.email)}
                          sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay garantes asociados a este contrato
                </Typography>
              )}
            </Paper> */}
            
            {/* Sección Notas */}
            {/* Sección Notas - Nuevo Componente */}
            {/* <NotaContratoForm idContrato={selectedContract?.id} />
            <NotasContratoList idContrato={selectedContract?.id} />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="contained"
            onClick={() => handleGenerateReceipt(selectedContract)}
            startIcon={<ReceiptIcon />}
            sx={{
              mr: 'auto',
              borderRadius: '8px',
              backgroundColor: '#C22961',
              '&:hover': {
                backgroundColor: '#991f4d'
              }
            }}
          >
            Ver recibos
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCloseDetailModal}
            sx={{
              borderRadius: '8px',
              borderColor: '#1F2C61',
              color: '#1F2C61',
              '&:hover': {
                borderColor: '#1F2C61',
                backgroundColor: 'rgba(31, 44, 97, 0.08)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions> */}
         <ModalContract
          selectedContract={selectedContract}
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
        pt: { xs: 3, sm: 4 }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: { xs: '90%', md: '100%' },
        mx: 'auto',
        mt: { xs: 3, md: 4 },
        mb: { xs: 3, md: 3 }
      }}>
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
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
              onClick={() => navigate('/nuevo-contrato')}
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
            width: { xs: "90%", md: "100%" }, 
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
      {renderDetailModal()}
    </Box>
  );
};

export default ContratosPage;
