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
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import OwnersTour from '../common/tour/OwnersTour';


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
          width:"100%",
          textAlign: 'center', 
          mt: 2,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
          borderRadius: 3,
          maxWidth: {xs:400, md:"100vw"},
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
        <Box sx={{ width: '100%' }}>
      {propietariosFiltrados.map(propietario => (
        <Paper 
          key={propietario.id} 
          sx={{ mb: 2, borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 3 }, bgcolor: 'background.paper' }}
        >
          <Box 
            sx={{ p: 2,display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => handleToggleCard(propietario.id) }
          >
            <Typography variant="h6">{propietario.nombre} {propietario.apellido}</Typography>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handleToggleCard(propietario.id); }}
              sx={{
                transform: expandedCards[propietario.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Collapse in={!!expandedCards[propietario.id]}>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{p:2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography><strong>DNI:</strong> {propietario.dni || 'No disponible'}</Typography>
              <Typography><strong>Email:</strong> {propietario.email || 'No disponible'}</Typography>
              <Typography><strong>Teléfono:</strong> {propietario.telefono || 'No disponible'}</Typography>
              <Typography><strong>Dirección:</strong> {propietario.direccionResidencial || 'No disponible'}</Typography>
              <Typography><strong>Usuario:</strong> {propietario.usuarioDtoSalida?.username || 'No asignado'}</Typography>
            </Box>
            <Box sx={{padding: 0, display: 'flex', flexDirection: 'row' ,height: '4rem',width:"100%"}}>
            <Box sx={{ borderRadius: "0 0 0 10px",display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5 , backgroundColor: 'rgb(28, 110, 13)',width:"50%"}}>
              <IconButton href={`https://wa.me/${propietario.telefono}`} target="_blank" sx={{ color: 'white' }}>
                <WhatsAppIcon   sx={{ fontSize: 45 }}/>
              </IconButton>
            </Box>
            <Box sx={{ borderRadius: "0 0 10px 0",display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: 'rgb(19, 21, 62)',width:"50%"}}>
              <IconButton href={`mailto:${propietario.email}`} sx={{ color: 'white' }}>
                <EmailIcon sx={{ fontSize: 45 }}/>
              </IconButton>
            </Box>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
      )}
    </Box>
  );

  const renderDesktopView = (propietariosFiltrados) => (
    <Box sx={{ 
      width: '100vw', 
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap:"wrap",
      gap:"1rem",
      height:"70vh",
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
    
    }}>
      {propietariosFiltrados.length === 0 ? (
        <Box sx={{ 
          
          textAlign: 'center', 
          mt: 2,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
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
        <TableContainer component={Box} sx={{ 
          width: '100%',
          borderRadius: 2,
          maxWidth:"100%",
          display:"flex",
          flexDirection:"column",
          flexWrap:"wrap",
          gap:"1rem",
          justifyContent:"start",
          alignItems:"center",
          padding:"1rem",
         
          backgroundColor:theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
          
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
         <Box display="flex" justifyContent="center" mt={2} sx={{width:"100%",height:"2.5rem", marginTop:"-3rem"}} data-tour="owners-pagination">
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
      pb: 2,
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
    <>
    <OwnersTour />
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
            marginTop:{xs:0,md:"2rem"},
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
              data-tour="owners-title"
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
              data-tour="owners-add"
              onClick={() => navigate('/nuevo-propietario')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          data-tour="owners-search"
          placeholder="Buscar por nombre, apellido, email..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            width: { xs: '90%', sm: '80%', md: '100%' },
            
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
    </>
  );
};

export default PropietariosPage;
