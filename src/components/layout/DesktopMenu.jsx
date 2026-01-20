import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Badge, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { useAuth } from '../context/GlobalAuth';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';
import CalculateIcon from '@mui/icons-material/Calculate'
import ReceiptIcon from '@mui/icons-material/Receipt';

const sections = [
  {
    name: 'Inicio', url: '/', icon: HomeIcon,
  },
  {
    name: 'Propietarios', icon: PersonIcon,
    subItems: [
      { name: 'Nuevo propietario', url: '/nuevo-propietario' },
      { name: 'Lista de propietarios', url: '/propietarios' },
    ],
  },
  {
    name: 'Inquilinos', icon: PeopleAltIcon,
    subItems: [
      { name: 'Nuevo inquilino', url: '/nuevo-inquilino' },
      { name: 'Lista de inquilinos', url: '/inquilinos' },
    ],
  },
  {
    name: 'Garantes', icon: VerifiedUserIcon,
    subItems: [
      { name: 'Nuevo garante', url: '/nuevo-garante' },
      { name: 'Lista de garantes', url: '/garantes' },
    ],
  },
  {
    name: 'Propiedades', icon: MapsHomeWorkIcon,
    subItems: [
      { name: 'Nueva Propiedad', url: '/nueva-propiedad' },
      { name: 'Lista de propiedades', url: '/propiedades' },
    ],
  },
  {
    name: 'Contratos', icon: TextSnippetIcon,
    subItems: [
      { name: 'Nuevo contrato', url: '/contratos/crear' },
      { name: 'Lista de contratos', url: '/contratos' },
    ],
  },
  {
    name: 'Calendario', url: '/calendario', icon: CalendarMonthIcon,
  },
  {
    name: 'Finanzas', url: '/contabilidad', icon: PaidIcon,
  },
    {
    name: 'Calculadora', url: '/calculadora-de-alquileres', icon: CalculateIcon,
  }
];

const DesktopMenu = ({ orientation = 'horizontal' }) => {
  const { hasCalendarEvents } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState({});

  const handleClick = (event, sectionName) => {
    setAnchorEl({ ...anchorEl, [sectionName]: event.currentTarget });
  };

  const handleClose = (sectionName) => {
    setAnchorEl({ ...anchorEl, [sectionName]: null });
  };

  const handleNavigate = (url, sectionName) => {
    navigate(url);
    handleClose(sectionName);
  };

  // Animación barrido de derecha a izquierda
  const sweepRTL = keyframes`
    0% { transform: scaleX(0); transform-origin: right; }
    100% { transform: scaleX(1); transform-origin: right; }
  `;

  const isActiveSection = (section) => {
    const path = location.pathname;
    const startsWithSeg = (base) => path === base || (base !== '/' && path.startsWith(base + '/'));
    if (section.url) {
      if (section.url === '/') {
        return path === '/';
      }
      return startsWithSeg(section.url);
    }
    if (section.subItems) {
      return section.subItems.some((si) => {
        if (!si.url) return false;
        if (si.url === '/') return path === '/';
        return startsWithSeg(si.url);
      });
    }
    return false;
  };

    if (orientation === 'vertical') {
      return (
        <List sx={{ py: 0, px: 0 }}>
          {sections.map((section) => {
            const active = isActiveSection(section);
            const Icon = section.icon;
            const defaultUrl = section.url || (section.subItems?.find(si => si.name?.toLowerCase().includes('lista'))?.url || section.subItems?.[0]?.url || '/');
            return (
              <ListItemButton
                key={section.name}
                onClick={() => navigate(defaultUrl)}
                sx={{
                  position: 'relative',
                  overflow: 'visible',
                  backgroundColor: active ? 'white' : 'transparent',
                  color: active ? '#7443e7ff' : 'white',
                  borderTopRightRadius: 28,
                  borderBottomRightRadius: 28,
                  my: 0.5,
                  py: 1.2,
                  pr: 1.5,
                  pl: 1.25,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'white',
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'right',
                    transition: active ? 'none' : 'transform 0.25s ease',
                    animation: active ? `${sweepRTL} 420ms ease forwards` : 'none',
                    zIndex: -1,
                    pointerEvents: 'none',
                    borderTopRightRadius: 28,
                    borderBottomRightRadius: 28,
                  },
                 
                  '&:hover': {
                    backgroundColor: active ? 'white' : 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                {Icon && (
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    <Icon />
                  </ListItemIcon>
                )}
                <ListItemText primary={section.name} />
                {section.name === 'Calendario' && (
                  <Badge color="error" variant="dot" invisible={!hasCalendarEvents} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      );
    }

    return (
    <Box sx={{ display: 'flex', gap: orientation === 'vertical' ? 0.5 : 1, flexDirection: orientation === 'vertical' ? 'column' : 'row', alignItems: orientation === 'vertical' ? 'stretch' : 'center', width: orientation === 'vertical' ? '100%' : 'auto' }}>
      {sections.map((section) => {
        const active = isActiveSection(section);
        if (section.subItems) {
          return (
            <div key={section.name}>
              <Button
                aria-controls={`menu-${section.name}`}
                aria-haspopup="true"
                onClick={(e) => handleClick(e, section.name)}
                fullWidth={orientation === 'vertical'}
                sx={{ 
                  position: 'relative',
                  overflow: 'visible',
                  backgroundColor: active ? 'white' : 'transparent', 
                  color: active ? '#3e2fc2' : 'rgb(65, 65, 65)',
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: 500, 
                  textTransform: 'capitalize', 
                  justifyContent: orientation === 'vertical' ? 'flex-start' : 'center', 
                  borderRadius: orientation === 'vertical' ? 2 : 1, 
                  ...(orientation === 'vertical' && {
                    borderTopRightRadius: 28,
                    borderBottomRightRadius: 28,
                    mr: 0.5,
                  }),
                  px: orientation === 'vertical' ? 1.5 : 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'white',
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'right',
                    transition: active ? 'none' : 'transform 0.25s ease',
                    animation: active ? `${sweepRTL} 420ms ease forwards` : 'none',
                    zIndex: -1,
                    pointerEvents: 'none',
                    borderTopRightRadius: 28,
                    borderBottomRightRadius: 28,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -18,
                    top: '50%',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'white',
                    transform: 'translateY(-50%)',
                    opacity: orientation === 'vertical' && active ? 1 : 0,
                    transition: 'opacity 220ms ease',
                    boxShadow: active ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
                    zIndex: 0,
                  },
                  '&:hover': {
                    backgroundColor: active ? 'white' : 'rgba(123, 110, 234, 0.08)'
                  }
                }}
              >
                {section.name}
              </Button>
              <Menu
                id={`menu-${section.name}`}
                anchorEl={anchorEl[section.name]}
                keepMounted
                open={Boolean(anchorEl[section.name])}
                onClose={() => handleClose(section.name)}
              >
                {section.subItems.map((subItem) => (
                  <MenuItem key={subItem.name} onClick={() => handleNavigate(subItem.url, section.name)}>
                    {subItem.name}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          );
        } else if (section.url) {
          return (
            <Button
              key={section.name}
              onClick={() => navigate(section.url)}
              fullWidth={orientation === 'vertical'}
              sx={{ 
                position: 'relative',
                overflow: 'visible',
                backgroundColor: active ? 'white' : 'transparent', 
                color: active ? '#3e2fc2' : 'rgb(65, 65, 65)',
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 500, 
                textTransform: 'capitalize', 
                justifyContent: orientation === 'vertical' ? 'flex-start' : 'center', 
                borderRadius: orientation === 'vertical' ? 2 : 1, 
                ...(orientation === 'vertical' && {
                  borderTopRightRadius: 28,
                  borderBottomRightRadius: 28,
                  mr: 0.5,
                }),
                px: orientation === 'vertical' ? 1.5 : 2,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(180deg, #1d2240 0%, #13162b 100%)'
                    : "linear-gradient(215deg, #8f6bffff 0%, #7244ddff 14%, #a388ffff 28%, #3b1299ff 100%)",
                  color: 'white',
                  height: '100%',
                  width: 240,
                  ml: '0px',
                  borderTopRightRadius: 40,
                  borderBottomRightRadius: 40,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '10px 0 15px -3px rgba(0, 0, 0, 0.25), 4px 0 6px -2px rgba(0, 0, 0, 0.1)'
                    : '10px 0 15px -3px rgba(0, 0, 0, 0.1), 4px 0 6px -2px rgba(0, 0, 0, 0.05)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -18,
                  top: '50%',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'white',
                  transform: 'translateY(-50%)',
                  opacity: orientation === 'vertical' && active ? 1 : 0,
                  transition: 'opacity 220ms ease',
                  boxShadow: active ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
                  zIndex: 0,
                },
                '&:hover': {
                  backgroundColor: active ? 'white' : 'rgba(123, 110, 234, 0.08)'
                }
              }}
            >
              {section.name === 'Calendario' ? (
                <Badge color="error" variant="dot" invisible={!hasCalendarEvents}>
                  {section.name}
                </Badge>
              ) : (
                section.name
              )}
            </Button>
          );
        }
        return null;
      })}
    </Box>
  );
};

export default DesktopMenu;
