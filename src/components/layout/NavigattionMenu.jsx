import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
  Zoom,
  useTheme,
  Tooltip,
  Typography
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';

export default function NavigationMenu() {
  const [value, setValue] = React.useState('recents');
  const [showPersonsMenu, setShowPersonsMenu] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    if (newValue === 'personas') {
      setShowPersonsMenu(prev => !prev);
    } else {
      setValue(newValue);
      if (newValue === 'contratos') navigate('/');
      if (newValue === 'propiedades') navigate('/propiedades');
      setShowPersonsMenu(false);
    }
  };

  // Calculate positions for the semi-circular menu items
  const getMenuItemStyle = (index) => {
    const radius = 120;
    const totalItems = 3;
    const angle = (Math.PI / (totalItems + 1)) * (index + 1);
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius;

    return {
      position: 'absolute',
      transform: `translate(${x}px, ${y}px)`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const menuItems = [
    {
      title: 'Propietarios',
      icon: <PersonIcon />,
      path: '/propietarios',
      color: theme.palette.primary.main,
      hoverColor: theme.palette.primary.dark,
      delay: '0ms'
    },
    {
      title: 'Inquilinos',
      icon: <HomeIcon />,
      path: '/inquilinos',
      color: theme.palette.secondary.main,
      hoverColor: theme.palette.secondary.dark,
      delay: '100ms'
    },
    {
      title: 'Garantes',
      icon: <GroupIcon />,
      path: '/garantes',
      color: theme.palette.success.main,
      hoverColor: theme.palette.success.dark,
      delay: '200ms'
    }
  ];

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Semi-circular menu */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 35,
          left: '43%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          height: 150,
          pointerEvents: showPersonsMenu ? 'auto' : 'none',
          zIndex: 999,
        }}
      >
        {menuItems.map((item, index) => (
          <Zoom key={item.title} in={showPersonsMenu} style={{ transitionDelay: item.delay }}>
            <Box sx={{ position: 'absolute' }}>
              <Tooltip title={item.title} placement="top">
                <IconButton
                  onClick={() => {
                    navigate(item.path);
                    setShowPersonsMenu(false);
                  }}
                  sx={{
                    ...getMenuItemStyle(index),
                    width: '48px',
                    height: '48px',
                    backgroundColor: item.color,
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: item.hoverColor,
                      transform: `translate(${getMenuItemStyle(index).transform.split('(')[1].split('px')[0]}px, ${parseFloat(getMenuItemStyle(index).transform.split(',')[1]) - 10}px)`,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '4px',
                  color: 'text.secondary',
                  opacity: 0.8,
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {item.title}
              </Typography>
            </Box>
          </Zoom>
        ))}
      </Box>

      {/* Overlay for closing menu when clicking outside */}
      {showPersonsMenu && (
        <Box
          onClick={() => setShowPersonsMenu(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 56,
            zIndex: 998,
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: '0px -2px 10px rgba(0,0,0,0.15)',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          height: '60px',
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500
          }
        }}
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          label="Contratos"
          value="contratos"
          icon={<ArticleIcon />}
          sx={{
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
        <BottomNavigationAction
          label="Personas"
          value="personas"
          icon={<AccountBoxIcon />}
          sx={{
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
            '&.Mui-selected': {
              color: showPersonsMenu ? theme.palette.primary.main : 'inherit',
            },
          }}
        />
        <BottomNavigationAction
          label="Propiedades"
          value="propiedades"
          icon={<MapsHomeWorkIcon />}
          sx={{
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          }}
        />
      </BottomNavigation>
    </Box>
  );
}
