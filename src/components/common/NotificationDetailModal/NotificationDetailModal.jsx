import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import {EventBusy as FinalizeIcon,
  Autorenew as RenewIcon,
  Description as ContractIcon
} from '@mui/icons-material';

import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { showWarning, showSuccess, showError } from '../../alertas/showAlert';

const NotificationDetailModal = ({ open, onClose, notification }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!notification) return null;

  const handleGoToContract = () => {
    // Navegar al contrato específico
    navigate(`/contratos/${notification.contratoId}`);
    onClose();
  };

  const handleFinalizeContract = async () => {
    // Cerrar el modal inmediatamente al hacer clic
    onClose();
    
    // Mostrar confirmación antes de finalizar usando estilos consistentes con la app
    const result = await Swal.fire({
      title: '¿Finalizar Contrato?',
      text: `¿Estás seguro que deseas finalizar el contrato "${notification.raw?.nombreContrato || ''}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'custom-popup',
        title: 'custom-header',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button'
      },
      heightAuto: false
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/finalizar/${notification.contratoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          showSuccess('El contrato se ha finalizado correctamente', 'Contrato Finalizado');
          onClose();
        } else {
          const errorData = await response.json();
          showError(errorData.message || 'No se pudo finalizar el contrato');
        }
      } catch (error) {
        console.error('Error al finalizar contrato:', error);
        showError('No se pudo conectar con el servidor. Intente nuevamente.', 'Error de Conexión');
      }
    }
  };

  const handleRenewContract = () => {
    // Redirigir al formulario de nuevo contrato para renovación con el ID del contrato
    navigate(`/nuevo-contrato-form?contratoId=${notification.contratoId}`);
    onClose();
  };

  const getContractStatus = () => {
    if (notification.raw?.vencido) {
      return { label: 'Vencido', color: 'error', severity: 'error' };
    } else if (notification.raw?.diasRestantes <= 7) {
      return { label: 'Por vencer', color: 'warning', severity: 'warning' };
    } else {
      return { label: 'Activo', color: 'success', severity: 'success' };
    }
  };

  const status = getContractStatus();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="notification-detail-modal"
      aria-describedby="notification-detail-description"
    >
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: { xs: '88%', sm: '90%' },
        margin: '0 auto',
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        borderRadius: "25px 25px 0 0",
        boxShadow: 24,
        p: 3,
        outline: 'none',
        zIndex: 1300,
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Detalles de Alerta
          </Typography>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Contenido de la notificación */}
        <Box sx={{ mb: 3 }}>
          {/* Título y estado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {notification.title}
            </Typography>
            <Chip 
              label={status.label} 
              color={status.color} 
              size="small" 
              variant="outlined"
            />
          </Box>

          {/* Información del contrato */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Contrato: <strong>{notification.raw?.nombreContrato || 'N/A'}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Fecha de vencimiento: <strong>{notification.raw?.fechaFin || 'N/A'}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Días restantes: <strong>{notification.raw?.diasRestantes || 'N/A'}</strong>
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Estado: <strong>{notification.raw?.estado || 'N/A'}</strong>
            </Typography>
          </Box>

          {/* Mensaje adicional */}
          <Typography variant="body2" sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            p: 2,
            borderRadius: 1,
            borderLeft: `4px solid ${theme.palette.warning.main}`
          }}>
            {notification.message}
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            startIcon={<ContractIcon />}
            onClick={handleGoToContract}
            sx={{ flex: 1, borderRadius:"25px" }}
          >
            Ir al Contrato
          </Button>
          
          {notification.raw?.finalizable && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<FinalizeIcon />}
              onClick={handleFinalizeContract}
              sx={{ flex: 1, borderRadius:"25px" }}
            >
              Finalizar Contrato
            </Button>
          )}
          
          {notification.raw?.renovable && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<RenewIcon />}
              onClick={handleRenewContract}
              sx={{ flex: 1, borderRadius:"25px" }}
            >
              Renovar Contrato
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default NotificationDetailModal;
