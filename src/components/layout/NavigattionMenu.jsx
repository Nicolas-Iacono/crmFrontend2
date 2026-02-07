import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  IconButton,
  useTheme,
  Typography,
  Badge,
  Slide,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../context/GlobalAuth';

export default function NavigationMenu() {
  const { hasCalendarEvents } = useAuth();
  const [showPersonsMenu, setShowPersonsMenu] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === 'dark';

  const currentPath = location.pathname;

  const getActiveTab = () => {
    if (currentPath === '/' || currentPath.startsWith('/contrato')) return 'contratos';
    if (currentPath.startsWith('/propiedades') || currentPath.startsWith('/propiedad')) return 'propiedades';
    if (currentPath.startsWith('/calendario')) return 'calendario';
    if (currentPath.startsWith('/inquilinos') || currentPath.startsWith('/propietarios') || currentPath.startsWith('/garantes')) return 'personas';
    return '';
  };

  const activeTab = getActiveTab();

  const handleNavClick = (tab) => {
    if (tab === 'personas') {
      setShowPersonsMenu(prev => !prev);
    } else {
      setShowPersonsMenu(false);
      if (tab === 'contratos') navigate('/');
      if (tab === 'propiedades') navigate('/propiedades');
      if (tab === 'calendario') navigate('/calendario');
    }
  };

  const personItems = [
    { title: 'Inquilinos', icon: <PersonIcon />, path: '/inquilinos', color: '#3b82f6' },
    { title: 'Propietarios', icon: <HomeIcon />, path: '/propietarios', color: '#8b5cf6' },
    { title: 'Garantes', icon: <SecurityIcon />, path: '/garantes', color: '#f59e0b' },
  ];

  const navItems = [
    { key: 'contratos', label: 'Inicio', icon: <ArticleIcon />, tour: 'nav-inicio' },
    { key: 'personas', label: 'Personas', icon: <GroupIcon />, tour: 'nav-personas' },
    { key: 'propiedades', label: 'Propiedades', icon: <MapsHomeWorkIcon />, tour: 'nav-propiedades' },
    { key: 'calendario', label: 'Calendario', icon: <CalendarMonthIcon />, tour: 'nav-calendario', badge: hasCalendarEvents },
  ];

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Overlay */}
      {showPersonsMenu && (
        <Box
          onClick={() => setShowPersonsMenu(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1298,
            bgcolor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Persons slide-up sheet */}
      <Slide direction="up" in={showPersonsMenu} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 72,
            left: 12,
            right: 12,
            zIndex: 1299,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: isDark ? 'rgba(30,30,40,0.97)' : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: isDark
              ? '0 -8px 40px rgba(0,0,0,0.5)'
              : '0 -8px 40px rgba(0,0,0,0.12)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2, pb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontSize: '0.65rem' }}>
              Personas
            </Typography>
            <IconButton size="small" onClick={() => setShowPersonsMenu(false)} sx={{ color: 'text.secondary' }}>
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, px: 2, pb: 2.5 }}>
            {personItems.map((item) => {
              const isActive = currentPath.startsWith(item.path);
              return (
                <Box
                  key={item.title}
                  onClick={() => {
                    navigate(item.path);
                    setShowPersonsMenu(false);
                  }}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.75,
                    py: 1.5,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: isActive
                      ? (isDark ? `rgba(139,92,246,0.15)` : `rgba(139,92,246,0.08)`)
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    border: `1.5px solid ${isActive ? (isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)') : 'transparent'}`,
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive
                      ? item.color
                      : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                    color: isActive ? '#fff' : 'text.secondary',
                    transition: 'all 0.2s ease',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="caption" sx={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.7rem',
                    color: isActive ? (isDark ? '#a78bfa' : '#7c3aed') : 'text.secondary',
                  }}>
                    {item.title}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Slide>

      {/* Bottom Navigation Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: 1,
          bgcolor: isDark
            ? 'rgba(18, 18, 24, 0.96)'
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: isDark
            ? '0 -4px 24px rgba(0,0,0,0.4)'
            : '0 -4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.key || (item.key === 'personas' && showPersonsMenu);
          return (
            <Box
              key={item.key}
              data-tour={item.tour}
              onClick={() => handleNavClick(item.key)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
                flex: 1,
                py: 1,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:active': { transform: 'scale(0.92)' },
              }}
            >
              {/* Active pill indicator */}
              {isActive && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  width: 20,
                  height: 3,
                  borderRadius: '0 0 4px 4px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                }} />
              )}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                bgcolor: isActive
                  ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)')
                  : 'transparent',
                color: isActive
                  ? (isDark ? '#a78bfa' : '#7c3aed')
                  : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
                '& .MuiSvgIcon-root': {
                  fontSize: 22,
                  transition: 'all 0.2s ease',
                },
              }}>
                {item.badge ? (
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!item.badge}
                    sx={{
                      '& .MuiBadge-badge': {
                        top: 2,
                        right: 2,
                        width: 7,
                        height: 7,
                        minWidth: 7,
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)',
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : item.icon}
              </Box>
              <Typography sx={{
                fontSize: '0.6rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? (isDark ? '#a78bfa' : '#7c3aed')
                  : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                lineHeight: 1,
                transition: 'all 0.2s ease',
              }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
