import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/GlobalAuth';
import { Box, Typography, Avatar, Paper, IconButton, Fab, Modal, Backdrop, Fade, TextField, Button, Divider } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import QRCode from 'react-qr-code';
import Iframe from 'react-iframe';
import EditIcon from '@mui/icons-material/Edit';


const UserSettings = () => {
  const { user, isLogged, updateUserProfile } = useAuth();
  const [usuarioFetch, setUsuarioFetch] = useState(null);
  const [openQR, setOpenQR] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenQR = () => setOpenQR(true);
  const handleCloseQR = () => setOpenQR(false);

  const handleOpenEditModal = () => {
    setFormData({
      cuit: usuarioFetch?.cuit || '',
      email: usuarioFetch?.email || '',
      localidad: usuarioFetch?.localidad || '',
      matricula: usuarioFetch?.matricula || '',
      nombreNegocio: usuarioFetch?.nombreNegocio || '',
      partido: usuarioFetch?.partido || '',
      provincia: usuarioFetch?.provincia || '',
      razonSocial: usuarioFetch?.razonSocial || '',
      telefono: usuarioFetch?.telefono || '',
      username: usuarioFetch?.username || '',
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioFetch?.id) return;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/usuario/${usuarioFetch.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setUsuarioFetch(response.data); // Update local state
      updateUserProfile(response.data); // Update global state
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating user data:', error.response?.data || error.message);
      // You can add a user-facing error message here
    }
  };
  
  useEffect(() => {
    if (user?.username) {
      axios.get(`${import.meta.env.VITE_API_URL}/usuario/username/${user.username}`)
        .then(res => setUsuarioFetch(res.data))
        .catch(err => {
          console.error('Error fetching usuario:', err);
          setUsuarioFetch(null);
        });
    }
  }, [user?.username]);

  const subirLogo = async (idUsuario, archivo) => {
    const formData = new FormData();
    formData.append('file', archivo);
    console.log(formData)
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/usuario/${idUsuario}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` // ← acá está la magia
          },
        }
      );
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al subir el logo:', error.response?.data || error.message);
      throw error;
    }
  };
console.log(usuarioFetch)
  // Placeholders en caso de que no existan los datos
  const nombreNegocio = usuarioFetch?.nombreNegocio || 'Nombre de usuario';
  const email = usuarioFetch?.email || 'usuario@email.com';
  const usuario = usuarioFetch?.username || 'Ciudad, País';
  const profilePic = usuarioFetch?.logo || 'logo'; // Cambia por tu lógica
  const razonSocial = usuarioFetch?.razonSocial || 'Ciudad, País';
  const cuit = usuarioFetch?.cuit || 'Ciudad, País';
  const telefono = usuarioFetch?.telefono || 'Ciudad, País';
  const direccion = usuarioFetch?.direccion || 'Ciudad, País';
  const localidad = usuarioFetch?.localidad || 'Ciudad, País';
  const partido = usuarioFetch?.partido || 'Ciudad, País';
  const provincia = usuarioFetch?.provincia || 'Ciudad, País';
  const codigoPostal = usuarioFetch?.codigoPostal || 'Ciudad, País';
  const pais = usuarioFetch?.pais || 'Ciudad, País';
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

  const direccionCompleta = `${razonSocial}, ${localidad}, ${partido}, ${provincia}`;
  console.log(direccionCompleta)
  if (!isLogged) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <Typography variant="h6" color="error">Debes iniciar sesión para ver esta página.</Typography>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ 
      bgcolor:"rgb(255, 255, 255)", 
      display:"flex", 
      justifyContent:"start", 
      alignItems:"flex-start", 
      pt:"6",
      height:"100vh",
    flexDirection:"column"}}>
      <Paper elevation={4} sx={{ bgcolor: 'rgb(39, 47, 98)',
         borderRadius: "0 0 20px 20px",
          width:"100%",
          height:"30%",
          overflow: 'hidden',
         
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            pt:4,
            pb:4,
            gap:"2rem"
            }}>
        {/* Header azul y foto de perfil */}
 <Typography variant="h6" color="white">Cuenta</Typography>
   
        <Box position="relative" display="flex" justifyContent="center" alignItems="center">
  <Avatar
    src={profilePic}
    alt={nombreNegocio}
    sx={{ width: 90, height: 90, border: '4px solid #fff', position: 'relative', backgroundSize:"contain", backgroundPosition:"center center", backgroundRepeat:"no-repeat" }}
  />
  
  <label htmlFor="upload-logo">
    <input
      id="upload-logo"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          subirLogo(usuarioFetch.id, file)
            .then(updatedUserData => {
              setUsuarioFetch(updatedUserData);
              updateUserProfile(updatedUserData); // Update global user state
            })
            .catch(error => {
              console.error('Error after uploading logo:', error);
              // Optionally, handle the error in the UI, e.g., show a notification
            });
        }
      }}
    />
    <IconButton
      component="span"
      color="primary"
      sx={{
        bgcolor: '#fff',
        boxShadow: 3,
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    >
      <AddPhotoAlternateIcon sx={{ fontSize: 24   , color: 'rgb(41, 29, 110)' }} />
    </IconButton>
  </label>
  
</Box>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="white">{nombreNegocio}</Typography>
       
        </Box>

          </Paper>
        {/* Datos del usuario */}
        

        <Box px={3} pt={5} sx={{
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1, // importante: ocupa el resto del espacio disponible
    overflowY: "auto", // habilita el scroll
    paddingBottom: "100px", // espacio para el botón fijo
    width:"80%",
    justifyContent:"space-between",
    alignItems:"flex-start"
  }}
>

          <Typography variant="overline" color="rgb(39, 47, 98)" >EMAIL</Typography>
          <Box  sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" >{email}</Typography>
          </Box>

          <Typography variant="overline" color="rgb(39, 47, 98)">USUARIO</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" >{usuario}</Typography>
          </Box>

          <Typography variant="overline" color="rgb(39, 47, 98)">razon social</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" sx={{fontSize:".9rem"}} >{`${razonSocial}, ${partido}, ${provincia}`}</Typography>
          </Box>

          <Typography variant="overline" color="rgb(39, 47, 98)">Matricula</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" >{`${matricula}`}</Typography>
          </Box>

          <Typography variant="overline" color="rgb(39, 47, 98)">Telefono</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" >{`${telefono}`}</Typography>
          </Box>

          <Typography variant="overline" color="rgb(39, 47, 98)">CUIT</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{backgroundColor:"rgba(255, 255, 255, 0.32)", borderRadius: "5px", 
            display:"flex", alignItems:"end", justifyContent:"start",padding:"0 .5rem",
            width:"90%",borderBottom:"3px solid rgb(41, 29, 110)", height:"40px"
          }}>
          <Typography variant="subtitle1" color="rgb(0, 0, 0)" >{`${cuit}`}</Typography>
          </Box>
            <Box sx={{width:"100%", height:"300px", display:"flex",
              alignItems:"center", justifyContent:"center", marginTop:"2rem"
            }}>
              <Iframe
                url={`https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`}
                width="100%"
                height="100%"
                frameBorder="1"
                style={{ border: 10 , marginTop:"4rem"}}
                allowFullScreen
              />
            </Box>

        </Box>
       
      {/* Botón para agregar imagen en la esquina inferior derecha */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1301 }}>
       
      </Box>
      
   
    </Box>

    <Fab
      color="primary"
      aria-label="share"
      onClick={handleOpenEditModal}
      sx={{
        width: 45,
        height: 45,
        position: 'fixed',
        top: 15,
        right: 20,
        bgcolor: 'rgb(229, 229, 229)',
        '&:hover': {
          bgcolor: 'rgb(155, 155, 155)',
        },
      }}
    >

      <EditIcon sx={{ color: 'rgb(41, 29, 110)' }} />
    </Fab>

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

    <Modal
      open={editModalOpen}
      onClose={handleCloseEditModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={editModalOpen}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <Typography variant="h6" color="primary" gutterBottom>Editar Información</Typography>
          <form onSubmit={handleFormSubmit}>
            <TextField name="nombreNegocio" label="Nombre del Negocio" value={formData.nombreNegocio || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="razonSocial" label="Razón Social / Dirección" value={formData.razonSocial || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="cuit" label="CUIT" value={formData.cuit || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="matricula" label="Matrícula" value={formData.matricula || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="telefono" label="Teléfono" value={formData.telefono || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="email" label="Email" value={formData.email || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="localidad" label="Localidad" value={formData.localidad || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="partido" label="Partido" value={formData.partido || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="provincia" label="Provincia" value={formData.provincia || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseEditModal} color="secondary">Cancelar</Button>
              <Button type="submit" variant="contained">Guardar Cambios</Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
    </>
  );
};

export default UserSettings;
