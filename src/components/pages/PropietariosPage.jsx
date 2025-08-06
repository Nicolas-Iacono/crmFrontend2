import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropiedadesApi } from '../api/propiedades';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid2,
  Divider,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  Button,
} from '@mui/material';
import PropietarioApi from '../api/propietarios';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Swal from 'sweetalert2';
import axios from 'axios';
import PlayerCard from '../common/cards/PlayerCard';


const PropietariosPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propietarios, setPropietarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPropietarioId, setSelectedPropietarioId] = useState(null);
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  const filteredPropietarios = propietarios.filter((propietario) => {
    if (propietario.usuario === null) {
      return false;
    }
    if (user.authorities !== "ROLE_ADMIN" && propietario.usuario.username !== user.name) {
      return false;
    }
    return true;
  }).filter((propietario) => {
    if (searchTerm === '') return true;
    
    const nombre = propietario.nombre || "";
    const apellido = propietario.apellido || "";
    const email = propietario.email || "";
    const telefono = propietario.telefono || "";
    const dni = propietario.dni || "";
    
    const termino = searchTerm.toLowerCase();
    
    return nombre.toLowerCase().includes(termino) ||
           apellido.toLowerCase().includes(termino) ||
           email.toLowerCase().includes(termino) ||
           telefono.toLowerCase().includes(termino) ||
           dni.toLowerCase().includes(termino);
  });



  const [paginaActual, setPaginaActual] = useState(1);
const tarjetasPorPagina = 6;
const indiceInicio = (paginaActual - 1) * tarjetasPorPagina;
const indiceFin = indiceInicio + tarjetasPorPagina;
const propietariosPaginados = filteredPropietarios.slice(indiceInicio, indiceFin);
const totalPaginas = Math.ceil(filteredPropietarios.length / tarjetasPorPagina);
  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

  const fetchPropietarios = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/propietario/${user.name}`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const propietariosArray = Array.isArray(result.data) ? result.data : 
                             (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        
        console.log("Propietarios recibidos:", propietariosArray);
        setPropietarios(propietariosArray);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching propietarios:', error);
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when user.name is available
    if (user && user.name) {
      fetchPropietarios();
    }
  }, [user.name]); // Dependency on user.name to refetch when it changes

  const handleMenuClick = (event, propietarioId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPropietarioId(propietarioId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPropietarioId(null);
  };

  const confirmDeletePropietario = (propietarioId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await PropietarioApi.deletePropietario(propietarioId);
          setPropietarios(propietarios.filter(p => p.id !== propietarioId));
          Swal.fire(
            '¡Eliminado!',
            'El propietario ha sido eliminado.',
            'success'
          )
        } catch (error) {
          Swal.fire(
            'Error',
            'No se pudo eliminar el propietario.',
            'error'
          )
        }
      }
    });
  };

  const handleDelete = () => {
    handleMenuClose();
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await PropietarioApi.deletePropietario(selectedPropietarioId);
          setPropietarios(propietarios.filter(p => p.id !== selectedPropietarioId));
          Swal.fire(
            '¡Eliminado!',
            'El propietario ha sido eliminado.',
            'success'
          )
        } catch (error) {
          Swal.fire(
            'Error',
            'No se pudo eliminar el propietario.',
            'error'
          )
        }
      }
    });
  };


  const handleToggleCard = (propietarioId) => {
    setExpandedCards(prevExpandedCards => ({
      ...prevExpandedCards,
      [propietarioId]: !prevExpandedCards[propietarioId]
    }));
  };

  console.log(propietarios)

 

  const renderMobileView = (propietariosFiltrados) => (
    <Box sx={{ 
      p: { xs: 1, sm: 2 }, 
      width: "90%",
      display: 'flex',
      justifyContent: 'center'
    }}>
      {propietariosFiltrados.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 2,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
          borderRadius: 3,
          maxWidth: 400,
          mx: 'auto',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            No se encontraron propietarios con los criterios de búsqueda.
          </Typography>
        </Box>
      ) : (
        <Grid2 
          container 
          spacing={{ xs: 2, sm: 3 }} 
          sx={{ 
            maxWidth: { xs: '100%', sm: 600 },
            margin: '0 auto'
          }}
        >
          {propietariosFiltrados.map((propietario) => (
            <Grid2 xs={12} sm={6} key={propietario.id}>
              <Card 
                sx={{
                  height: '100%',
                  width:"20rem",
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                  boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 12px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleToggleCard(propietario.id)}>
                    <Typography variant="h6" sx={{
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                      {propietario.nombre} {propietario.apellido}
                    </Typography>
                    <Box>
                    <IconButton
                      aria-label="settings"
                      onClick={(e) => { 
                        e.stopPropagation(); // Evita que se expanda/colapse la card
                        handleMenuClick(e, propietario.id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleToggleCard(propietario.id)}
                      aria-expanded={expandedCards[propietario.id] || false}
                      aria-label="show more"
                    >
                    </IconButton>
                  </Box>
                  </Box>
                  <Collapse in={expandedCards[propietario.id] || false} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid2
                      container
                      spacing={{ xs: 1.5, sm: 2 }}
                      sx={{ pt: 0.5, display: 'flex', flexDirection: 'column' }}
                    >
                      <Grid2 xs={12}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}
                        >
                          📱 {propietario.telefono}
                        </Typography>
                      </Grid2>
                      <Grid2 xs={12}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}
                        >
                          ✉️ {propietario.email}
                        </Typography>
                      </Grid2>
                      <Grid2 xs={12}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}
                        >
                          🏠 {propietario.direccionResidencial}
                        </Typography>
                      </Grid2>
                      <Grid2 xs={12}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                          }}
                        >
                          👤 {propietario.usuarioDtoSalida.username}
                        </Typography>
                      </Grid2>
                    </Grid2>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Box>
  );

  const renderDesktopView = (propietariosFiltrados) => (
    <Box sx={{ 
      width: '100%', 
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap:"wrap",
      gap:"1rem",
    }}>
      {propietariosFiltrados.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 2,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
          borderRadius: 3,
          maxWidth: "20rem",
          mx: 'auto',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            No se encontraron propietarios con los criterios de búsqueda.
          </Typography>
        </Box>
      ) : (

        <>
        <TableContainer component={Paper} sx={{ 
          width: '100%',
          borderRadius: 2,
          maxWidth:"100%",
          display:"flex",
          flexDirection:"row",
          flexWrap:"wrap",
          gap:"1rem",
          justifyContent:"start",
          alignItems:"center",
          padding:"1rem",
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
          '& .MuiTableCell-root': {
            color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
          },
          backgroundColor:theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgb(250, 254, 254)',
        }}>
          {propietariosPaginados.map((propietario) => (
            <PlayerCard
              key={propietario.id}
              id={propietario.id}
              nombre={`${propietario.nombre} ${propietario.apellido}`}
              direccion={propietario.direccionResidencial}
              telefono={propietario.telefono}
              email={propietario.email}
              onDelete={confirmDeletePropietario}
            />
          ))}
        </TableContainer>
         <Box display="flex" justifyContent="center" mt={2}>
         {Array.from({ length: totalPaginas }, (_, i) => (
           <Button
             key={i + 1}
             variant={paginaActual === i + 1 ? 'contained' : 'outlined'}
             onClick={() => setPaginaActual(i + 1)}
             sx={{ mx: 0.5 }}
           >
             {i + 1}
           </Button>
         ))}
       </Box>
    </>

      )}
    </Box>
  );

  const renderSearchBar = () => (
    <Box sx={{ 
      width: { xs: '90%', md: '80%' },
      mx: 'auto',
      pt: { xs: 3, md: 4 },
      pb: 2
    }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar propietarios..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider'
            }
          }
        }}
      />
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error al cargar los propietarios: {error.message || "Desconocido"}
        </Typography>
      </Box>
    );
  }

  if (!propietarios || propietarios.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        gap: 2
      }}>
        <Typography variant="h6" color="textSecondary">
          No hay propietarios disponibles
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Agregue nuevos propietarios para verlos aquí
        </Typography>
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => navigate('/nuevo-propietario')}
          sx={{ mt: 2 }}
        >
          <AddIcon />
        </Fab>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 8, sm: 4 },
    
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor:'background.default'
    }}>
      <Box 
        sx={{ 
          width: { xs: "90%", sm: "80%" },
          mt: { xs: '4rem', sm: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Propietarios
            </Typography>
          </Box>
          <Tooltip title="Añadir propietario">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nuevo-propietario')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          placeholder="Buscar por nombre, apellido, email..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            width: { xs: '90%', sm: '80%' },
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider'
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Box sx={{ 
            textAlign: "center", 
            padding: 4,
            width: '100%',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2
          }}>
            <CircularProgress />
            <Typography>Cargando propietarios...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%' 
          }}>
            <Typography>Error al cargar los propietarios: {error}</Typography>
          </Box>
        ) : (
          isMobile 
  ? renderMobileView(propietariosPaginados) 
  : renderDesktopView(propietariosPaginados)
        )}
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default PropietariosPage;
