import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';

const MobilePropietarioCard = ({ 
  propietario, 
  isExpanded, 
  onToggle,
  onEdit,
  onDelete,
  onCreateProfile,
  hasAccount,
  onHasAccount,
  onDocuments
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2, position: 'relative' }}>
      {/* Pestañas que aparecen arriba cuando está expandida */}
      {isExpanded && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'end', 
          gap: 1, 
          padding:".4rem .3rem",
          position: 'relative',
          zIndex: 2,
          borderRadius:"10px 10px 0 0",
          boxShadow:"0px 0px 1px rgba(0, 0, 0, 0.1)",
        }}>
          <Chip
            icon={<DescriptionIcon />}
            onClick={(e) => { e.stopPropagation(); if (onDocuments) onDocuments(propietario); }}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(63, 81, 181, 0.35)' : 'rgba(63, 81, 181, 0.2)',
              color: 'primary.main', padding: 0,
              '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(63, 81, 181, 0.5)' : 'rgba(63, 81, 181, 0.3)', transform: 'translateY(-1px)', boxShadow: 2 },
              transition: 'all 0.2s ease', boxShadow: 1,
            }}
          />
          <Chip
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
                onEdit(propietario.id);
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
              width: 50,
              minWidth: 40,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(98, 9, 199, 0.59)' : 'rgba(98, 9, 199, 0.2)',
              color: 'primary.main',
              padding: 0,
              '& .MuiChip-icon': { 
                margin: 0,
                marginLeft: 0,
                marginRight: 0
              },
              '& .MuiChip-label': {
                display: 'none'
              },
              '&:hover': { 
                bgcolor: 'rgba(98, 9, 199, 0.46)',
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.2s ease',
              boxShadow: 1,
            }}
          />

          {hasAccount ? (
            <Chip
              icon={<CheckCircleIcon />}
              onClick={(e) => { e.stopPropagation(); if (onHasAccount) onHasAccount(propietario.id); }}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.4)' : 'rgba(56, 142, 60, 0.2)',
                color: 'success.main', padding: 0,
                '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.55)' : 'rgba(56, 142, 60, 0.35)', boxShadow: 2 },
                transition: 'all 0.2s ease', boxShadow: 1,
              }}
            />
          ) : (
            <Chip
              icon={<PersonAddAlt1Icon />}
              onClick={(e) => { e.stopPropagation(); if (onCreateProfile) onCreateProfile(propietario.id); }}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(67, 160, 71, 0.35)' : 'rgba(67, 160, 71, 0.2)',
                color: 'success.main', padding: 0,
                '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(56, 142, 60, 0.5)' : 'rgba(56, 142, 60, 0.35)', transform: 'translateY(-1px)', boxShadow: 2 },
                transition: 'all 0.2s ease', boxShadow: 1,
              }}
            />
          )}
          <Chip
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(propietario.id);
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
              width: 50,
              minWidth: 40,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(243, 29, 197, 0.59)' : 'rgba(244, 67, 54, 0.2)',
              color: 'error.main',
              padding: 0,
              '& .MuiChip-icon': { 
                margin: 0,
                marginLeft: 0,
                marginRight: 0
              },
              '& .MuiChip-label': {
                display: 'none'
              },
              '&:hover': { 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(185, 14, 148, 0.59)' : 'rgba(224, 14, 14, 0.39)',
                transform: 'translateY(-1px)',
                boxShadow: 2
              },
              transition: 'all 0.2s ease',
              boxShadow: 1,
            }}
          />
        </Box>
      )}
      
      <Paper 
        sx={{ 
          borderRadius: 2, 
          boxShadow: 1, 
          '&:hover': { boxShadow: 3 }, 
          bgcolor: 'background.paper' 
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer' 
          }}
          onClick={() => onToggle(propietario.id)}
        >
          <Typography variant="h6">
            {propietario.nombre} {propietario.apellido}
          </Typography>
          <IconButton
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggle(propietario.id); 
            }}
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      
        <Collapse in={isExpanded}>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              <strong>DNI:</strong> {propietario.dni || 'No disponible'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              <strong>Email:</strong> {propietario.email || 'No disponible'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              <strong>Teléfono:</strong> {propietario.telefono || 'No disponible'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              <strong>Dirección:</strong> {propietario.direccionResidencial || 'No disponible'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              <strong>Usuario:</strong> {propietario.usuarioUsername || 'No asignado'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'row', 
            height: '4rem', 
            width: "100%" 
          }}>
            <Box sx={{ 
              borderRadius: "0 0 0 10px",
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 1.5, 
              backgroundColor: 'rgb(28, 110, 13)',
              width: "50%" 
            }}>
              <IconButton 
                href={`https://wa.me/${propietario.telefono}`} 
                target="_blank" 
                sx={{ color: 'white' }}
              >
                <WhatsAppIcon sx={{ fontSize: 45 }} />
              </IconButton>
            </Box>
            
            <Box sx={{ 
              borderRadius: "0 0 10px 0",
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 1.5, 
              backgroundColor: 'rgb(19, 21, 62)',
              width: "50%" 
            }}>
              <IconButton 
                href={`mailto:${propietario.email}`} 
                sx={{ color: 'white' }}
              >
                <EmailIcon sx={{ fontSize: 45 }} />
              </IconButton>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default MobilePropietarioCard;
