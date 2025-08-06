import React, { useEffect, useState } from 'react';
import { 
  IconButton, 
  Box, 
  Avatar, 
  useTheme, 
  useMediaQuery, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Typography,
  ListItemButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ShareIcon from '@mui/icons-material/Share';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import QRCode from 'react-qr-code';


export const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, usuarioFetch, authUser } = useAuth();
  const {  logout } = useAuth(); // Get user from AuthContext
  const handleOpenQR = () => setOpenQR(true);
  const handleCloseQR = () => setOpenQR(false);
  // Local user state and useEffect are no longer needed as authUser provides the data.
    const [openQR, setOpenQR] = useState(false);
  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }
  const nombreNegocio = usuarioFetch?.nombreNegocio || 'Nombre de usuario';
  const email = usuarioFetch?.email || 'usuario@email.com';
  const razonSocial = usuarioFetch?.razonSocial || 'Ciudad, País';
  const cuit = usuarioFetch?.cuit || 'Ciudad, País';
  const telefono = usuarioFetch?.telefono || 'Ciudad, País';
  const localidad = usuarioFetch?.localidad || 'Ciudad, País';
  const provincia = usuarioFetch?.provincia || 'Ciudad, País';
  const matricula = usuarioFetch?.matricula || '000000';
  const qrData = usuarioFetch


  ? `BEGIN:VCARD
VERSION:3.0
FN:${nombreNegocio}
TEL;TYPE=WORK,VOICE:${telefono || ''}
ADR;TYPE=WORK:;;${razonSocial || ''};${localidad || ''};${provincia || ''}.
EMAIL:${email}
NOTE:Matricula: ${matricula} / CUIT: ${cuit || ''}
END:VCARD`
  : '';
  function stringAvatar(name) {
    if (!name) return {};
    const initials = name.split(' ').map(n => n[0]).join('');
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials,
    };
  }

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  const handleSettings = () => {
    setDrawerOpen(false);
    navigate('/ajustes');
  };

  const handleCalculadoraDeAlquileres = () => {
    setDrawerOpen(false);
    navigate('/calculadora-de-alquileres');
  };

  const handleQrCode = () => {
    setDrawerOpen(false);
    navigate('/qr-code');
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        pt: 2,
        height: '100%',
        bgcolor: theme.palette.background.paper,
      }}
      role="presentation"
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar 
          src={usuarioFetch?.logo}
          {...(usuarioFetch?.logo ? {} : stringAvatar((usuarioFetch?.username || '').toUpperCase()))}
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 1,
            ...(usuarioFetch?.logo 
              ? { bgcolor: 'transparent' } 
              : { ...(stringAvatar((user?.username || '').toUpperCase()).sx || {}), bgcolor: theme.palette.primary.main }),
          }}
        />
        <Typography variant="h6">{user?.username}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.authorities?.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleCalculadoraDeAlquileres}>
            <ListItemIcon>
              <CalculateIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Calculadora de Alquileres" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton  onClick={handleOpenQR}>
            <ListItemIcon>
              <QrCode2Icon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Compartir Contacto" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Ajustes" />
          </ListItemButton>
        </ListItem>
       
        <ListItem>
          <ListItemIcon>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText primary="Tema Oscuro" />
          <Switch
            edge="end"
            onChange={toggleTheme}
            checked={darkMode}
          />
        </ListItem>
      </List>


        <Modal
            open={openQR}
            onClose={handleCloseQR}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openQR}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 320,
                bgcolor: 'background.paper',
                borderRadius: '8px',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <Typography variant="h6" color="primary">Compartir Contacto</Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '4px' }}>
                  <QRCode value={qrData} size={256} />
                </Box>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Escanea este código para guardar los datos del martillero.
                </Typography>
              </Box>
            </Fade>
          </Modal>
    </Box>

    
  );

  if (isMobile) {
    return (
      <Box sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 1200,
      }}>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            p: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <Avatar 
            src={usuarioFetch?.logo}
            {...(usuarioFetch?.logo ? {} : stringAvatar((usuarioFetch?.username || '').toUpperCase()))}
            sx={{
              width: 40,
              height: 40,
              ...(usuarioFetch?.logo 
                ? { bgcolor: 'transparent' } 
                : { ...(stringAvatar((usuarioFetch?.username || '').toUpperCase()).sx || {}), bgcolor: theme.palette.primary.main }),
            }}
          />
        </IconButton>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          PaperProps={{
            sx: {
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bgcolor: theme.palette.primary.main,
      color: 'white',
      px: 3,
      py: 1,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 2,
      zIndex: 1100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      <Box sx={{ typography: 'body1' }}>
        {authUser?.username}
      </Box>
      
      <IconButton
        onClick={handleDrawerToggle}
        sx={{ p: 0 }}
      >
       <Avatar 
            src={usuarioFetch?.logo}
            {...(usuarioFetch?.logo ? {} : stringAvatar((usuarioFetch?.username || '').toUpperCase()))}
            sx={{
              width: 40,
              height: 40,
              ...(usuarioFetch?.logo 
                ? { bgcolor: 'transparent' } 
                : { ...(stringAvatar((usuarioFetch?.username || '').toUpperCase()).sx || {}), bgcolor: theme.palette.primary.main }),
            }}
          />
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Header;
