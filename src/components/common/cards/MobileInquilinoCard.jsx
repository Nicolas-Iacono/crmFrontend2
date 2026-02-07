import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Collapse,
  Avatar,
  Tooltip,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';

const MobileInquilinoCard = ({ 
  inquilino, 
  isExpanded, 
  onToggle,
  onEdit,
  onDelete,
  onCreateProfile,
  hasAccount,
  onHasAccount,
  onOpenDocs
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return `${n}${a}` || '?';
  };

  const gradientColors = [
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  ];

  const getGradient = (id) => gradientColors[(id || 0) % gradientColors.length];

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 32, 
        height: 32, 
        borderRadius: '8px',
        bgcolor: isDark ? alpha(theme.palette.info.main, 0.15) : alpha(theme.palette.info.main, 0.08),
      }}>
        {React.cloneElement(icon, { 
          sx: { fontSize: 18, color: theme.palette.info.main } 
        })}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );

  const ActionButton = ({ icon, onClick, tooltip, color = 'primary', disabled = false }) => (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 36,
          height: 36,
          bgcolor: isDark ? alpha(theme.palette[color].main, 0.15) : alpha(theme.palette[color].main, 0.08),
          color: theme.palette[color].main,
          '&:hover': {
            bgcolor: isDark ? alpha(theme.palette[color].main, 0.25) : alpha(theme.palette[color].main, 0.15),
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        transition: 'all 0.3s ease',
        '&:hover': { 
          boxShadow: isDark 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
        bgcolor: 'background.paper',
      }}
    >
      <Box 
        sx={{ 
          p: 2,
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
        }}
        onClick={() => onToggle(inquilino.id)}
      >
        <Avatar
          sx={{
            width: 52,
            height: 52,
            background: getGradient(inquilino.id),
            fontSize: '1.1rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          {getInitials(inquilino.nombre, inquilino.apellido)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {inquilino.nombre} {inquilino.apellido}
            </Typography>
            {hasAccount && (
              <Tooltip title="Tiene cuenta activa">
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              </Tooltip>
            )}
          </Box>
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
            {inquilino.email || 'Sin email'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggle(inquilino.id); 
          }}
          sx={{
            width: 36,
            height: 36,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'all 0.3s ease',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    
      <Collapse in={isExpanded}>
        <Box sx={{ 
          px: 2, 
          pb: 2,
          pt: 0,
        }}>
          <Box sx={{ 
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            p: 1.5,
            mb: 2,
          }}>
            <InfoRow icon={<BadgeIcon />} label="DNI" value={inquilino.dni} />
            <InfoRow icon={<PhoneIcon />} label="Teléfono" value={inquilino.telefono} />
            <InfoRow icon={<LocationOnIcon />} label="Dirección" value={inquilino.direccionResidencial} />
            <InfoRow icon={<PersonIcon />} label="Usuario" value={inquilino.usuarioDtoSalida?.username} />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="WhatsApp" arrow>
                <IconButton
                  size="small"
                  href={`https://wa.me/${(inquilino.telefono || '').replace(/\D/g, '')}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#25D366',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#128C7E',
                      transform: 'scale(1.08)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email" arrow>
                <IconButton
                  size="small"
                  href={`mailto:${inquilino.email}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: isDark ? '#5c6bc0' : '#3f51b5',
                    color: 'white',
                    '&:hover': {
                      bgcolor: isDark ? '#3f51b5' : '#303f9f',
                      transform: 'scale(1.08)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <EmailIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <ActionButton 
                icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
                onClick={(e) => { e.stopPropagation(); if (onOpenDocs) onOpenDocs(inquilino.id); }}
                tooltip="Documentos"
                color="info"
              />
              <ActionButton 
                icon={<EditIcon sx={{ fontSize: 18 }} />}
                onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(inquilino.id); }}
                tooltip="Editar"
                color="primary"
              />
              {hasAccount ? (
                <ActionButton 
                  icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                  onClick={(e) => { e.stopPropagation(); if (onHasAccount) onHasAccount(inquilino.id); }}
                  tooltip="Ver credenciales"
                  color="success"
                />
              ) : (
                <ActionButton 
                  icon={<PersonAddAlt1Icon sx={{ fontSize: 18 }} />}
                  onClick={(e) => { e.stopPropagation(); if (onCreateProfile) onCreateProfile(inquilino.id); }}
                  tooltip="Crear perfil"
                  color="success"
                />
              )}
              <ActionButton 
                icon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(inquilino.id); }}
                tooltip="Eliminar"
                color="error"
              />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MobileInquilinoCard;
