import React, { useState, useEffect, useRef } from 'react';
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
  ListItemButton,
  Badge,
  Button,
  Fab,
  Tooltip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/GlobalAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CalculateIcon from '@mui/icons-material/Calculate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import Modal from '@mui/material/Modal';
import QRCode from 'react-qr-code';
import DesktopMenu from './DesktopMenu';
import ChatModal from '../common/Chat/ChatModal';
import useGoogleLink from '../../hooks/useGoogleLink';
import SubscriptionModal from '../common/SubscriptionModal/SubscriptionModal';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SmartToyIcon from '@mui/icons-material/SmartToy';
export const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioFetch, authUser, hasCalendarEvents, logout, logoTimestamp, plan} = useAuth();
  const { isLinked, isLoading, googleProfile, handleLink, handleUnlink } = useGoogleLink();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const hideTimer = useRef(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenChat = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setChatOpen(true);
    }, 300);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleOpenQR = () => setOpenQR(true);
  const handleCloseQR = () => setOpenQR(false);

  const handleOpenSubscriptionModal = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSubscriptionModalOpen(true);
    }, 300);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionModalOpen(false);
  };

  const handleSelectPlan = (plan) => {
    // Aquí puedes agregar la lógica para manejar la selección del plan
    setSubscriptionModalOpen(false);
  };
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) return;

      const currentScrollY = window.scrollY;
      
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setVisible(false);
      } else {
        setVisible(true);
        // No auto-hide on specific pages
        if (location.pathname !== '/contabilidad' && location.pathname !== '/') {
          hideTimer.current = setTimeout(() => {
            setVisible(false);
          }, 4000);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [isMobile]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  const handleNavigate = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name) {
    if (!name) return {};
    const initials = name.split(' ').map(n => n[0]).join('');
    return {
      sx: { bgcolor: stringToColor(name) },
      children: initials,
    };
  }
const authorities = localStorage.getItem('authorities');
  const drawerContent = (
    <Box
      sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.mode === 'dark' ? 'rgb(35, 35, 35)' : '#fff' }}
      role="presentation"
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : googleProfile?.picture || ''}
          {...(!usuarioFetch?.logo && { ...stringAvatar((usuarioFetch?.username || '').toUpperCase()) })}
          sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
        />
        <Typography variant="body1">{usuarioFetch?.nombreNegocio}</Typography>
       
<Typography variant="body2" color="text.secondary">
  {authorities?.includes('ROLE_SUPER_ADMIN')
    ? 'Super Admin'
    : authorities?.includes('ROLE_ADMIN')
    ? 'Administrador'
    : authorities?.includes('ROLE_USER')
    ? 'Usuario'
    : 'Usuario'}
</Typography>
      {authorities?.includes('ROLE_SUPER_ADMIN') ? (
  // 🟡 Plan ilimitado para Super Admin
  <Box
    sx={{
      background: "linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF69B4 50%, #FFB6C1 75%, #8B0000 100%)",
      boxShadow: "0 4px 15px rgba(243, 153, 171, 0.29), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(250, 250, 250)", fontWeight: "bold" }}>
      Unlimited Version
    </Typography>
  </Box>
) : plan?.status === "ACTIVE" && 
   (plan?.planName === "pro+" || plan?.planName === "Pro" || plan?.planName === "Superior") ? (
  // 🟡 Plan Pro o Superior activo
  <Box
    sx={{
      background: "linear-gradient(135deg, #B8860B 0%, #FFD700 15%, #FFF8DC 30%, #FFD700 45%, #DAA520 60%, #FFF8DC 75%, #FFD700 90%, #B8860B 100%)",
      boxShadow: "inset 0 2px 8px rgba(255, 215, 0, 0.3), inset 0 -2px 8px rgba(184, 134, 11, 0.4), 0 4px 12px rgba(255, 215, 0, 0.2)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(49,49,49)" }}>
      {plan?.planName}
    </Typography>
  </Box>
) : (
  // 🟣 Plan Free
  <Box
    sx={{
      background: "linear-gradient(135deg, #4B0082 0%, #8A2BE2 15%, #DDA0DD 30%, #9370DB 45%, #6A5ACD 60%, #E6E6FA 75%, #8A2BE2 90%, #4B0082 100%)",
      boxShadow: "inset 0 2px 8px rgba(138, 43, 226, 0.3), inset 0 -2px 8px rgba(75, 0, 130, 0.4), 0 4px 12px rgba(138, 43, 226, 0.2)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(255,255,254)" }}>
      Plan Free
    </Typography>
  </Box>
)}

         
      </Box>
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-calculadora" onClick={() => handleNavigate('/calculadora-de-alquileres')}>
            <ListItemIcon><CalculateIcon /></ListItemIcon>
            <ListItemText primary="Calculadora" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-calendario" onClick={() => handleNavigate('/calendario')}>
            <ListItemIcon>
              <Badge color="error" variant="dot" invisible={!hasCalendarEvents}>
                <CalendarMonthIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Calendario" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-presupuestos" onClick={() => handleNavigate('/presupuestos')}>
            <ListItemIcon><ReceiptIcon /></ListItemIcon>
            <ListItemText primary="Presupuestos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/contabilidad')}>
            <ListItemIcon><PaidIcon /></ListItemIcon>
            <ListItemText primary="Ingresos" />
          </ListItemButton>
        </ListItem>
      
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-compartir" onClick={() => { setDrawerOpen(false); handleOpenQR(); }}>
            <ListItemIcon><QrCode2Icon  /></ListItemIcon>
            <ListItemText primary="Compartir Contacto" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-suscripcion" onClick={handleOpenSubscriptionModal}>
            <ListItemIcon><WorkspacePremiumIcon sx={{ color: '#FF9800' }} /></ListItemIcon>
            <ListItemText primary="Planes Premium" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-ajustes" onClick={() => handleNavigate('/ajustes')}>
            <ListItemIcon><SettingsIcon  /></ListItemIcon>
            <ListItemText primary="Ajustes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/contacto')}>
            <ListItemIcon><ContactMailIcon /></ListItemIcon>
            <ListItemText primary="Contacto" />
          </ListItemButton>
        </ListItem>
        {isMobile && (
          <ListItem>
            <ListItemIcon>{darkMode ? <DarkModeIcon /> : <LightModeIcon />}</ListItemIcon>
            <ListItemText primary="Tema Oscuro" />
            <Switch edge="end" data-tour="toggle-tema" onChange={toggleTheme} checked={darkMode} />
          </ListItem>
        )}
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
        {/* <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          data-tour="open-chat"
          variant="contained"
          fullWidth
          startIcon={<AutoAwesomeIcon />}
          onClick={handleOpenChat}
          sx={{
            color: 'white',
            backgroundColor: '#6e42ca',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            py: 1.5,
            transition: 'background 0.3s ease, transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.03)',
              background: 'linear-gradient(45deg, #F871B8 0%, #6E42CA 50%, #3B82F6 100%)',
            },
          }}
        >
          tuinmoIA
        </Button>
        </Box> */}
       
      </List>
    </Box>
  );

  const qrModal = (
    <Modal open={openQR} onClose={handleCloseQR}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, color: theme.palette.mode === 'dark' ? 'white' : 'black'}}>
        <Typography variant="h6" component="h2" textAlign="center" mb={2}>Compartir Contacto</Typography>
        <QRCode value={usuarioFetch ? `BEGIN:VCARD\nVERSION:3.0\nFN:${usuarioFetch.nombreNegocio || ''}\nTEL;TYPE=WORK,VOICE:${usuarioFetch.telefono || ''}\nEMAIL:${usuarioFetch.email || ''}\nEND:VCARD` : ''} />
      </Box>
    </Modal>
  );

  return (
    <>
      {isMobile ? (
                <Box data-tour="open-drawer" sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          transition: 'transform 0.3s ease-in-out',
                    transform: (visible || location.pathname === '/ajustes' || location.pathname === '/calendario' || location.pathname === '/') ? 'translateX(0)' : 'translateX(-100px)',
        }}>
          <IconButton onClick={handleDrawerToggle} sx={{ p: 0, boxShadow: 3, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}>
            <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} />
          </IconButton>
          <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>{drawerContent}</Drawer>
        </Box>
      ) : (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', color: 'black', px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1100, boxShadow: 1, height: '20px' }}>
          <DesktopMenu />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">{authUser?.username}</Typography>
            <IconButton data-tour="open-drawer" onClick={handleDrawerToggle} sx={{ p: 0 }}>
              <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} />
            </IconButton>
          </Box>
          <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>{drawerContent}</Drawer>
        </Box>
      )}
     <Tooltip title="Abrir Chat IA">
        <Box
          component={motion.div}
          onClick={handleOpenChat}
          whileTap={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
              sx={{
      position: 'fixed',
      width: 50,
      height: 50,
      bottom: 80,
      right: 10,
      zIndex: 1200,
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #F871B8 0%, #6E42CA 50%, #3B82F6 100%)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 0 12px rgba(111,51,241,0.5)',
      '&:hover': {
        transform: 'scale(1.12)',
        transition: '0.2s ease-in-out',
      },
    }}
  >
          <AutoAwesomeIcon  sx={{ fontSize: 20 }} />

  </Box>
</Tooltip>
      {qrModal}
      <AnimatePresence>
        {isChatOpen && <ChatModal open={isChatOpen} onClose={handleCloseChat} />}
      </AnimatePresence>
      {/* Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        onClose={handleCloseSubscriptionModal}
        onSelectPlan={handleSelectPlan}
      />
    </>
  );
};

export default Header;
