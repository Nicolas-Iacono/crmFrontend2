import { Grid2, Typography, Box, IconButton, Menu, MenuItem } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { showAlert, showError, showInfo } from '../../alertas/showAlert';
export const PlayerCard = ({ id, nombre, direccion, telefono, email, onDelete, onEdit, onCreateProfile, hasAccount, onHasAccount, onOpenDocs }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchorEl(null);

  const handleWhatsAppClick = (phone) => {
    if (!phone) {
      showError('No hay número de teléfono disponible');
      return;
    }
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email) => {
    if (!email) {
      showError('No hay correo electrónico disponible');
      return;
    }
    window.open(`mailto:${email}`, '_blank');
  };

  return (
    <Grid2
      container
      sx={{
        position: "relative", // Needed for absolute positioning of the menu button
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        width: {xs:"19rem",md:"100%"},
        minHeight: {xs:"14rem",md:"11rem"},
        height: 'auto',
        display: "flex",
        alignItems: "stretch",
        flexDirection: "row"
      }}>
      
      <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, display: 'flex', gap: 0.5 }}>
        <IconButton aria-label="open-docs" onClick={(e) => { e.stopPropagation(); if (onOpenDocs) onOpenDocs(id); }} sx={{ color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
          <DescriptionIcon />
        </IconButton>
        {hasAccount ? (
          <IconButton aria-label="has-account" onClick={(e) => { e.stopPropagation(); if (onHasAccount) onHasAccount(id); }} sx={{ color: 'success.main' }}>
            <CheckCircleIcon />
          </IconButton>
        ) : (
          <IconButton aria-label="create-profile" onClick={(e) => { e.stopPropagation(); if (onCreateProfile) onCreateProfile(id); }}>
            <PersonAddAlt1Icon />
          </IconButton>
        )}
        <IconButton aria-label="options" onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCloseMenu();
              if (onEdit) onEdit(id);
            }}
          >
            Editar
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCloseMenu();
              if (onDelete) onDelete(id);
            }}
          >
            Eliminar
          </MenuItem>
        </Menu>
      </Box>

      <Grid2 sx={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", width: {xs:"20%",md:"10%"},
        borderRadius: "10px 0 0 10px", padding: "1rem", display: "flex", flexDirection: "column"
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "start", height: "100%", width: "100%", gap: "1rem", }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconButton
              color="success"
              onClick={() => handleWhatsAppClick(telefono)}
              sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
            >
              <WhatsAppIcon sx={{ color: "green", fontSize: "1.5rem", width: "2rem", height: "2rem" }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconButton
              color="primary"
              onClick={() => handleEmailClick(email)}
              sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}
            >
              <EmailIcon sx={{ color: "white", fontSize: "1.5rem", width: "2rem", height: "2rem" }} />
            </IconButton>
          </Box>
        </Box>
      </Grid2>

      <Grid2 container spacing={2}
        sx={{
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          width: "80%",
          backgroundColor: "white",
          borderRadius: "0 10px 10px 0",
          padding: "1rem",
          minWidth: 0
        }}>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem", width: "100%", backgroundColor: "white", minWidth: 0 }}>
          <PersonIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem", overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {nombre}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem", minWidth: 0 }} >
          <HomeIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".7em", overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {direccion}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem", minWidth: 0 }}>
          <PhoneIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem", overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {telefono}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem", minWidth: 0 }}>
          <AlternateEmailIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem", overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {email}
          </Typography>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default PlayerCard;
