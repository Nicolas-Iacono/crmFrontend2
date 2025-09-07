import { Grid2, Typography, Box, IconButton } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React from 'react';
import Swal from 'sweetalert2';

export const PlayerCard = ({ id, nombre, direccion, telefono, email, onDelete }) => {

  const handleWhatsAppClick = (phone) => {
    if (!phone) {
      Swal.fire({
        title: 'Error',
        text: 'No hay número de teléfono disponible',
        icon: 'error'
      });
      return;
    }
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email) => {
    if (!email) {
      Swal.fire({
        title: 'Error',
        text: 'No hay correo electrónico disponible',
        icon: 'error'
      });
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
        width: {xs:"19rem",md:"80%"},
        height: {xs:"14rem",md:"11rem"},
        display: "flex",
        alignItems: "start",
        flexDirection: "row"
      }}>
      
      <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
        <IconButton
          aria-label="options"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) {
              onDelete(id);
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Grid2 sx={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", height: "100%", width: {xs:"20%",md:"10%"},
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
          height: "100%",
          backgroundColor: "white",
          borderRadius: "0 10px 10px 0",
          padding: "1rem"
        }}>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem", width: "100%", backgroundColor: "white" }}>
          <PersonIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem" }}>
            {nombre}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem" }} >
          <HomeIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".7em" }}>
            {direccion}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem" }}>
          <PhoneIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem" }}>
            {telefono}
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "1rem" }}>
          <AlternateEmailIcon sx={{ color: "rgb(25, 26, 71)", fontSize: "1.5rem", width: "1.5rem", height: "1.5rem" }} />
          <Typography sx={{ fontSize: ".8rem" }}>
            {email}
          </Typography>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default PlayerCard;
