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
import { useTheme } from '@mui/material';
import NotaContratoForm from '../NotaContratoForm';
import NotasContratoList from '../NotasContratoList';

const ModalContract = ({selectedContract, handleCloseDetailModal,detailModalOpen,handleWhatsAppClick,handleEmailClick,handleGenerateReceipt,contractNote, setContractNote, handleSaveNote}) => {
 
 const [actualizacionData , setActualizacionData] = useState({});
    const theme = useTheme();
   console.log("📦 actualizacionData en modal:", actualizacionData);
   
   const actualizacion = async () => {
    try {
      if (!selectedContract || !selectedContract.id) {
        console.warn("No hay contrato seleccionado o falta ID");
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/verificar-actualizacion/${selectedContract.id}`);
      console.log("📦 Respuesta de la API:", response.data);
      setActualizacionData(response.data); // Asumiendo que tienes un estado para almacenar los datos de la actualización
    } catch (error) {
      console.error("Error al obtener la actualización:", error);
    }
  };

  // Llamar a la función de actualización cuando el componente se monte o cambie el contrato
  useEffect(() => {
    if (detailModalOpen && selectedContract?.id) {
      actualizacion();
    }
  }, [detailModalOpen, selectedContract]);

  
   
console.log(actualizacionData)
   
   
   return (
            <Box>



<Box sx={{ p: 2, backgroundColor: 'orange' }}>
  <Typography>✅ Estoy dentro del ModalContract</Typography>
</Box>
        
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
        
        <DialogContent sx={{ py: 3 }}>
       
        
        


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
                      Fecha de inicio: {new Date(selectedContract.fecha_inicio).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: '#C22961' }} />
                    <Typography variant="body2">
                      Fecha de finalización: {selectedContract.fecha_fin? new Date(selectedContract.fecha_fin).toLocaleDateString() : 'No especificada'}
                    </Typography>
                  </Box>
                
                 
                </Grid2>
                
                <Grid2 item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <DescriptionIcon sx={{ mr: 1, color: '#1F2C61' }} />
                    <Typography variant="body2">
                      Destino: {selectedContract.destino || 'No especificado'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'green' }} />
                    <Typography variant="body1" fontWeight={500}>
                      Monto: ${selectedContract.montoAlquiler?.toLocaleString() || 'No especificado'}
                    </Typography>
                  </Box>
                  
                 
                  
                </Grid2>
              </Grid2>
            <Divider/>

           
    {actualizacionData && (
  <Box sx={{mb: 3, borderRadius: 2 }}>
    <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
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

    {actualizacionData && (
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Estado:</strong>{' '}
        {actualizacionData.vencido ? '⚠️ Vencido' : '✅ Al día'}
      </Typography>
    )}

    {actualizacionData && actualizacionData.mensaje && (
      <Typography variant="body2" color="text.secondary">
        {actualizacionData.mensaje}
      </Typography>
    )}
  </Box>
)}
            </Paper>
            
            {/* Sección Propietario */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
            
            {/* Sección Inquilino */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
            </Paper>
            
            {/* Sección Garantes */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
            </Paper>
            
            {/* Sección Notas */}
            <NotaContratoForm idContrato={selectedContract?.id} />
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
        </DialogActions>
      </Dialog>
      </Box>

  )
}

export default ModalContract
