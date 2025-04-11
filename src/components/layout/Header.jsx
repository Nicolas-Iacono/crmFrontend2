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

export const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

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
    navigate('/settings');
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
          {...stringAvatar((user.name || '').toUpperCase())}
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 1,
            bgcolor: theme.palette.primary.main,
          }}
        />
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.authorities?.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}
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
            {...stringAvatar((user.name || '').toUpperCase())}
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
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
        {user.name}
      </Box>
      
      <IconButton
        onClick={handleDrawerToggle}
        sx={{ p: 0 }}
      >
        <Avatar 
          {...stringAvatar((user.name || '').toUpperCase())}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'white',
            color: theme.palette.primary.main
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
