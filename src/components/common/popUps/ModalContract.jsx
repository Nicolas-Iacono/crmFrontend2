import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid2,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Collapse,
  Alert,
  CircularProgress,
  Slide,
  Chip,
} from '@mui/material';
import axios from 'axios';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material';
import NotaContratoForm from '../NotaContratoForm';
import NotasContratoList from '../NotasContratoList';
import PutMontoForm from '../PutMontoForm';
import { useNavigate } from 'react-router-dom';


// Transition: slide up on open, slide down on close
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const ModalContract = ({selectedContract, setSelectedContract, setContratos, handleCloseDetailModal, detailModalOpen, handleWhatsAppClick, handleEmailClick, handleGenerateReceipt, contractNote, setContractNote, handleSaveNote}) => {
const navigate = useNavigate();
 
 const [actualizacionData , setActualizacionData] = useState({});
  
  // States for percentage editing
  const [showPercentageEdit, setShowPercentageEdit] = useState(false);
  const [porcentajeContrato, setPorcentajeContrato] = useState('');
  const [porcentajeMensual, setPorcentajeMensual] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAlert, setUpdateAlert] = useState({ show: false, type: '', message: '' });

    const theme = useTheme();
   const isDark = theme.palette.mode === 'dark';
   const accentColor = '#8b5cf6';
   const accentDark = '#7c3aed';
   
   const actualizacion = async () => {
  try {
    if (!selectedContract || !selectedContract.id) {
      console.warn("No hay contrato seleccionado o falta ID");
      return;
    }
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/verificar-actualizacion/${selectedContract.id}`);
    setActualizacionData(response.data); // Asumiendo que tienes un estado para almacenar los datos de la actualización
  } catch (error) {
    console.error("Error al obtener la actualización:", error);
  }
};


 
  // Function to handle percentage updates
  const handleUpdatePercentages = async () => {
    if (!selectedContract?.id) return;
    
    setIsUpdating(true);
    setUpdateAlert({ show: false, type: '', message: '' });
    
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        idContrato: selectedContract.id
      };
      
      if (porcentajeContrato !== '') {
        updateData.comisionContratoPorc = parseFloat(porcentajeContrato);
      }
      if (porcentajeMensual !== '') {
        updateData.comisionMensualPorc = parseFloat(porcentajeMensual);
      }
      
      if (Object.keys(updateData).length === 1) { // Only idContrato is present
        setUpdateAlert({ 
          show: true, 
          type: 'warning', 
          message: 'Por favor, ingrese al menos un porcentaje para actualizar.' 
        });
        setIsUpdating(false);
        return;
      }
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/contrato/comisiones`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        setUpdateAlert({ 
          show: true, 
          type: 'success', 
          message: 'Porcentajes actualizados correctamente.' 
        });
        
        // Update the selected contract with new values from response
        const updatedContract = {
          ...selectedContract,
          porcentajeContrato: response.data.porcentajeContrato || selectedContract.porcentajeContrato,
          porcentajeMensual: response.data.porcentajeMensual || selectedContract.porcentajeMensual,
          comisionContratoMonto: response.data.comisionContratoMonto || selectedContract.comisionContratoMonto,
          comisionMensualMonto: response.data.comisionMensualMonto || selectedContract.comisionMensualMonto
        };
        
        setSelectedContract(updatedContract);
        
        // Update the contracts list in the parent component if available
        if (typeof setContratos === 'function') {
          setContratos(prev => 
            Array.isArray(prev) 
              ? prev.map(contrato => 
                  contrato.id === selectedContract.id 
                    ? updatedContract 
                    : contrato
                )
              : prev
          );
        }
        
        // Clear the input fields
        setPorcentajeContrato('');
        setPorcentajeMensual('');
        
        // Hide the edit section after successful update
        setTimeout(() => {
          setShowPercentageEdit(false);
          setUpdateAlert({ show: false, type: '', message: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating percentages:', error);
      console.error('Request payload sent:', {
        idContrato: selectedContract.id,
        comisionContratoPorc: porcentajeContrato !== '' ? parseFloat(porcentajeContrato) : undefined,
        comisionMensualPorc: porcentajeMensual !== '' ? parseFloat(porcentajeMensual) : undefined
      });
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error response:', error.response);
      
      let errorMessage = 'Error al actualizar los porcentajes. Inténtelo nuevamente.';
      if (error.response?.status === 500) {
        const backendError = error.response?.data?.message || error.response?.data?.error || 'Error interno del servidor';
        errorMessage = `Error del servidor: ${backendError}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setUpdateAlert({ 
        show: true, 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Llamar a la función de actualización cuando el componente se monte o cambie el contrato
  useEffect(() => {
    if (detailModalOpen && selectedContract?.id) {
      actualizacion();
    }
  }, [detailModalOpen, selectedContract]);

  
   const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';

  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

   
   
   return (
            <Box >




        
    <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth={false}
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            bgcolor: isDark ? '#0f0f17' : '#f8f7fc',
            width: '100vw',
            maxWidth: { xs: '1400px', sm: '1500px', md: '2000px' },
            margin: 'auto',
            position: 'absolute',
            bottom: '0',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: 'white',
          py: 2,
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {selectedContract.nombreContrato}
          </Typography>
          <IconButton
            onClick={handleCloseDetailModal}
            sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
       
        
        


          <Box sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
                Información del contrato
              </Typography>
              
              <Grid2 container spacing={2}>
                <Grid2 item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedContract.propiedad?.direccion || 'Sin dirección'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2">
                      Destino: {selectedContract.destino || 'No especificado'}
                    </Typography>
                  </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2">
                      Fecha de inicio: {formatDate(selectedContract.fecha_inicio)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2">
                      Fecha de finalización: {formatDate(selectedContract.fecha_fin)}
                    </Typography>
                  </Box>
                
                 
                </Grid2>
                {actualizacionData && (
  <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
    <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.85rem' }}>
      Vigencia del contrato
    </Typography>

    <Typography variant="body2" sx={{ mb: 1 }}>
      <strong>Próxima actualización:</strong>{' '}
      {actualizacionData && actualizacionData.data && actualizacionData.data.fechaProximaActualizacion
        ? new Date(actualizacionData.data.fechaProximaActualizacion).toLocaleDateString()
        : 'No disponible'}
    </Typography>

    {actualizacionData && actualizacionData.data && actualizacionData.data.mesesRestantes !== undefined && (
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Faltan:</strong> {actualizacionData.data.mesesRestantes} meses y {actualizacionData.data.diasRestantes} días
      </Typography>
    )}

 <Typography variant="body2" sx={{ mb: 1 }}>
  <strong>Estado:</strong>{' '}
  {selectedContract?.activo ? (
    <Chip label="ACTIVO" size="small" sx={{ ml: 1, fontWeight: 700, fontSize: '0.65rem', height: 22, bgcolor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)', color: '#22c55e' }} />
  ) : (
    <Chip label="VENCIDO" size="small" sx={{ ml: 1, fontWeight: 700, fontSize: '0.65rem', height: 22, bgcolor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)', color: '#ef4444' }} />
  )}
</Typography>

    {actualizacionData && actualizacionData.mensaje && (
      <Typography variant="body2" color="text.secondary">
        {actualizacionData.mensaje}
      </Typography>
    )}
  </Box>
)}
                <Grid2 item xs={12} sm={6}>
                
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body1" fontWeight={500}>
  Monto: ${selectedContract.montoAlquiler?.toLocaleString() || 'No especificado'}
</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body1" fontWeight={500}>
  Hon.contrato: ${selectedContract.comisionContratoMonto
?.toLocaleString() || 'No especificado'}

</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body1" fontWeight={500}>
  Hon.mensual: ${selectedContract.comisionMensualMonto

?.toLocaleString() || 'No especificado'}

</Typography>
                  </Box>
                  
                </Grid2>
              </Grid2>
              <Box sx={{ mt: 3, mb: 3 }}>
              <PutMontoForm selectedContract={selectedContract} setSelectedContract={setSelectedContract} setContratos={setContratos}/>
              </Box>
              
              {/* Collapsible Percentage Edit Section */}
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowPercentageEdit(!showPercentageEdit)}
                  startIcon={<EditIcon />}
                  endIcon={showPercentageEdit ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{
                    mb: 2,
                    borderColor: isDark ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.3)',
                    color: isDark ? '#a78bfa' : accentDark,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: accentColor,
                      bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={500} >
                  {showPercentageEdit ? 'Ocultar' : 'Editar'} Porcentajes de Comisión
                  </Typography>
                </Button>
                
                <Collapse in={showPercentageEdit}>
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2.5, 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.02)' 
                        : 'rgba(0, 0, 0, 0.01)',
                      borderRadius: 2,
                      border: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.08)' 
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {updateAlert.show && (
                      <Alert 
                        severity={updateAlert.type} 
                        sx={{ 
                          mb: 2,
                          borderRadius: 1.5,
                          '& .MuiAlert-icon': { fontSize: 18 }
                        }}
                        onClose={() => setUpdateAlert({ show: false, type: '', message: '' })}
                      >
                        {updateAlert.message}
                      </Alert>
                    )}
                    
                    <Grid2 container spacing={2} sx={{ mb: 2.5 }}>
                      <Grid2 item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contrato"
                          type="number"
                          value={porcentajeContrato}
                          onChange={(e) => setPorcentajeContrato(e.target.value)}
                          placeholder={`${selectedContract.porcentajeContrato || 0}%`}
                          inputProps={{ 
                            min: 0, 
                            max: 100, 
                            step: 0.01 
                          }}
                          disabled={isUpdating}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              fontSize: '0.9rem',
                              '& fieldset': {
                                borderColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.12)' 
                                  : 'rgba(0, 0, 0, 0.12)'
                              },
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                              '&.Mui-focused fieldset': {
                                borderWidth: 1
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid2>
                      
                      <Grid2 item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Mensual"
                          type="number"
                          value={porcentajeMensual}
                          onChange={(e) => setPorcentajeMensual(e.target.value)}
                          placeholder={`${selectedContract.porcentajeMensual || 0}%`}
                          inputProps={{ 
                            min: 0, 
                            max: 100, 
                            step: 0.01 
                          }}
                          disabled={isUpdating}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              fontSize: '0.9rem',
                              '& fieldset': {
                                borderColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.12)' 
                                  : 'rgba(0, 0, 0, 0.12)'
                              },
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                              '&.Mui-focused fieldset': {
                                borderWidth: 1
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid2>
                    </Grid2>
                    
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                      <Button
                        variant="text"
                        onClick={() => {
                          setPorcentajeContrato('');
                          setPorcentajeMensual('');
                          setUpdateAlert({ show: false, type: '', message: '' });
                        }}
                        disabled={isUpdating}
                        size="small"
                        sx={{
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 2,
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        Limpiar
                      </Button>
                      
                      <Button
                        variant="contained"
                        onClick={handleUpdatePercentages}
                        disabled={isUpdating || (porcentajeContrato === '' && porcentajeMensual === '')}
                        startIcon={isUpdating ? <CircularProgress size={16} /> : <SaveIcon sx={{ fontSize: 16 }} />}
                        size="small"
                        sx={{
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            background: theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isUpdating ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            <Divider/>

           
  

            </Paper>
            
            {/* Sección Propietario */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
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
                      onClick={() => handleWhatsAppClick(selectedContract.propietario?.telefono)}
                      sx={{ bgcolor: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)', color: '#22c55e', '&:hover': { bgcolor: 'rgba(34,197,94,0.2)' } }}
                      size="small"
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar Email">
                    <IconButton 
                      onClick={() => handleEmailClick(selectedContract.propietario?.email)}
                      sx={{ bgcolor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', color: accentColor, '&:hover': { bgcolor: 'rgba(139,92,246,0.2)' } }}
                      size="small"
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
            
            {/* Sección Inquilino */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
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
                      onClick={() => handleWhatsAppClick(selectedContract.inquilino?.telefono)}
                      sx={{ bgcolor: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)', color: '#22c55e', '&:hover': { bgcolor: 'rgba(34,197,94,0.2)' } }}
                      size="small"
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Enviar Email">
                    <IconButton 
                      onClick={() => handleEmailClick(selectedContract.inquilino?.email)}
                      sx={{ bgcolor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', color: accentColor, '&:hover': { bgcolor: 'rgba(139,92,246,0.2)' } }}
                      size="small"
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
            
            {/* Sección Garantes */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
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
                          onClick={() => handleWhatsAppClick(garante.telefono)}
                          sx={{ bgcolor: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)', color: '#22c55e', '&:hover': { bgcolor: 'rgba(34,197,94,0.2)' } }}
                          size="small"
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Enviar Email">
                        <IconButton 
                          onClick={() => handleEmailClick(garante.email)}
                          sx={{ bgcolor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', color: accentColor, '&:hover': { bgcolor: 'rgba(139,92,246,0.2)' } }}
                          size="small"
                        >
                          <EmailIcon fontSize="small" />
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
            </Paper>
            
            {/* Sección Notas */}
            <NotaContratoForm idContrato={selectedContract?.id} />
            <NotasContratoList idContrato={selectedContract?.id} contrato={selectedContract} />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/recibos-page/${selectedContract.id}`)}
            startIcon={<ReceiptIcon sx={{ fontSize: 18 }} />}
            size="small"
            sx={{
              mr: 'auto',
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              }
            }}
          >
            Ver recibos
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCloseDetailModal}
            size="small"
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      </Box>

  )
}

export default ModalContract
