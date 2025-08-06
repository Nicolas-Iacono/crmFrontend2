import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Avatar, Paper, Button, CircularProgress, Divider, Icon } from '@mui/material';
import { Phone, Email, LocationOn, Business, SaveAlt } from '@mui/icons-material';

const PublicProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      axios.get(`${import.meta.env.VITE_API_URL}/usuario/id/${userId}`)
        .then(res => {
          setUserData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          setError('No se pudo cargar el perfil. Por favor, intente de nuevo más tarde.');
          setLoading(false);
        });
    }
  }, [userId]);

  const handleSaveVCard = () => {
    if (!userData) return;

    const { nombreNegocio, razonSocial, telefono, localidad, provincia, codigoPostal, pais, email, cuit, matricula } = userData;

    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${nombreNegocio}
ORG:${razonSocial || ''}
TEL;TYPE=WORK,VOICE:${telefono || ''}
ADR;TYPE=WORK:;;${razonSocial || ''};${localidad || ''};${provincia || ''}.
EMAIL:${email}
NOTE:Matricula: ${matricula} / CUIT: ${cuit || ''}
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nombreNegocio}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Typography color="error">{error}</Typography></Box>;
  }

  if (!userData) {
    return null;
  }

  const { nombreNegocio, logo, telefono, email: userEmail, direccion, localidad, partido, provincia } = userData;
  const fullAddress = `${direccion}, ${localidad}, ${partido}, ${provincia}`;

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'rgb(235, 235, 240)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 2,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      <Paper elevation={8} sx={{
        width: '100%',
        maxWidth: '400px',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Box sx={{
          height: '150px',
          bgcolor: 'rgb(39, 47, 98)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <Avatar
            src={logo}
            alt={nombreNegocio}
            sx={{ 
              width: 120, 
              height: 120, 
              border: '5px solid white', 
              mb: -8, 
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </Box>
        <Box sx={{ p: 3, pt: 10, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="rgb(39, 47, 98)">{nombreNegocio}</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>{userData.razonSocial || 'Martillero Público'}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Phone color="primary" />
              <Typography variant="body1">{telefono || 'No disponible'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Email color="primary" />
              <Typography variant="body1">{userEmail || 'No disponible'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOn color="primary" />
              <Typography variant="body1">{fullAddress}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<SaveAlt />} 
            onClick={handleSaveVCard}
            sx={{
              bgcolor: 'rgb(41, 29, 110)',
              '&:hover': {
                bgcolor: 'rgb(39, 47, 98)'
              }
            }}
          >
            Guardar Contacto
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PublicProfile;
