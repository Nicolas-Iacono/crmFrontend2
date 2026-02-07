import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  alpha
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useTheme } from '@mui/material/styles';

const MobilePropiedadCard = ({ 
  propiedad, 
  onEdit,
  onDelete,
  onAddImage,
  onShare,
  onClick,
  uploading = false,
  index = 0
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

  const getGradient = (id) => gradientColors[(id || 0) % gradientColors.length];

  const InfoRow = ({ icon, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
      {React.cloneElement(icon, { 
        sx: { fontSize: 16, color: 'text.secondary', opacity: 0.7 } 
      })}
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '0.8rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );

  const ActionButton = ({ icon, onClick: onBtnClick, tooltip, color = 'primary', disabled = false }) => (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onClick={onBtnClick}
        disabled={disabled}
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'rgba(255,255,255,0.9)',
          color: theme.palette[color].main,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': {
            bgcolor: 'white',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  const hasImage = Array.isArray(propiedad.imagenes) && propiedad.imagenes.length > 0 && propiedad.imagenes[0]?.imageUrl;

  return (
    <Paper 
      data-tour={index === 0 ? 'propiedades-card' : undefined}
      elevation={0}
      onClick={onClick}
      sx={{ 
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: isDark 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Status indicator bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 6,
          height: '100%',
          bgcolor: propiedad.disponibilidad ? 'success.main' : 'error.main',
          zIndex: 1,
        }}
      />

      {/* Image section */}
      <Box sx={{ 
        position: 'relative', 
        height: 140,
        background: hasImage ? 'none' : getGradient(propiedad.id),
      }}>
        {uploading && (
          <Box sx={{ 
            position: 'absolute', 
            inset: 0, 
            bgcolor: 'rgba(255,255,255,0.7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10 
          }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {hasImage ? (
          <img
            src={propiedad.imagenes[0].imageUrl}
            alt={propiedad.direccion}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            <HomeIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)', mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Sin imagen
            </Typography>
          </Box>
        )}

        {/* Action buttons on image */}
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 12, 
          display: 'flex', 
          gap: 0.75,
          zIndex: 2,
        }}>
          <ActionButton 
            icon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(propiedad.id); }}
            tooltip="Eliminar"
            color="error"
          />
          <ActionButton 
            icon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(propiedad.id); }}
            tooltip="Editar"
            color="primary"
          />
        </Box>

        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 12, 
          display: 'flex', 
          gap: 0.75,
          zIndex: 2,
        }}>
          <ActionButton 
            icon={<AddPhotoAlternateIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); if (onAddImage) onAddImage(propiedad.id); }}
            tooltip="Agregar imagen"
            color="info"
            disabled={uploading}
          />
          <ActionButton 
            icon={<ShareIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => { e.stopPropagation(); if (onShare) onShare(propiedad); }}
            tooltip="Compartir"
            color="success"
          />
        </Box>

        {/* Status chip */}
        <Chip
          icon={propiedad.disponibilidad ? <CheckCircleIcon /> : <CancelIcon />}
          label={propiedad.disponibilidad ? 'Disponible' : 'Alquilado'}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 12,
            bgcolor: propiedad.disponibilidad 
              ? 'rgba(34, 197, 94, 0.9)' 
              : 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            '& .MuiChip-icon': { color: 'white' },
          }}
        />
      </Box>

      {/* Content section */}
      <Box sx={{ p: 2, pl: 2.5 }}>
        {/* Title and type */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: '1rem',
            }}
          >
            {propiedad.tipoPropiedad || propiedad.tipo || 'Propiedad'}
          </Typography>
          {propiedad.precio && (
            <Chip
              icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
              label={new Intl.NumberFormat('es-AR').format(propiedad.precio)}
              size="small"
              sx={{
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Address - main info */}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <HomeIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
          {propiedad.direccion}
        </Typography>

        {/* Info rows */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.25,
        }}>
          <InfoRow icon={<LocationOnIcon />} value={propiedad.localidad} />
          <InfoRow icon={<MapIcon />} value={`${propiedad.partido || ''}, ${propiedad.provincia || ''}`} />
          <InfoRow 
            icon={<PersonIcon />} 
            value={propiedad.usuarioDtoSalida?.username || 'Sin propietario asignado'} 
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default MobilePropiedadCard;
