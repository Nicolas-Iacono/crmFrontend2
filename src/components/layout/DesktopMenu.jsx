import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalAuth';

const sections = [
  {
    name: 'Inicio', url: '/',
  },
  {
    name: 'Propietarios',
    subItems: [
      { name: 'Nuevo propietario', url: '/nuevo-propietario' },
      { name: 'Lista de propietarios', url: '/propietarios' },
    ],
  },
  {
    name: 'Inquilinos',
    subItems: [
      { name: 'Nuevo inquilino', url: '/nuevo-inquilino' },
      { name: 'Lista de inquilinos', url: '/inquilinos' },
    ],
  },
  {
    name: 'Garantes',
    subItems: [
      { name: 'Nuevo garante', url: '/nuevo-garante' },
      { name: 'Lista de garantes', url: '/garantes' },
    ],
  },
  {
    name: 'Propiedades',
    subItems: [
      { name: 'Nueva Propiedad', url: '/nueva-propiedad' },
      { name: 'Lista de propiedades', url: '/propiedades' },
    ],
  },
  {
    name: 'Contratos',
    subItems: [
      { name: 'Nuevo contrato', url: '/contratos/crear' },
      { name: 'Lista de contratos', url: '/contratos' },
    ],
  },
  {
    name: 'Calendario', url: '/calendario',
  },
  {
    name: 'Contacto', url: '/contacto',
  },
  
];

const DesktopMenu = () => {
  const { hasCalendarEvents } = useAuth();
  const navigate = useNavigate();
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

    return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {sections.map((section) => {
        if (section.subItems) {
          return (
            <div key={section.name}>
              <Button
                aria-controls={`menu-${section.name}`}
                aria-haspopup="true"
                onClick={(e) => handleClick(e, section.name)}
                sx={{ color: 'rgb(65, 65, 65)', fontFamily: 'Poppins, sans-serif', fontWeight: 400, textTransform: 'capitalize' }}
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
              sx={{ color: 'rgb(65, 65, 65)', fontFamily: 'Poppins, sans-serif', fontWeight: 400, textTransform: 'capitalize' }}
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
