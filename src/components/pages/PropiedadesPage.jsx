import React, { useEffect, useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Fab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import "../styles/garantesPage.css";

const PropiedadesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

  const fetchPropiedades = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching propiedades for user:", user.name);
      // Corrigiendo URL para usar /all como en las otras páginas
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/propiedad/all`);
      console.log("Raw API response:", result);
      
      // Extraer los datos de la respuesta siguiendo el patrón común de las otras páginas
      let propiedadesData = [];
      if (Array.isArray(result.data)) {
        propiedadesData = result.data;
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        propiedadesData = result.data.data;
      }
      
      console.log("Propiedades procesadas:", propiedadesData);
      setPropiedades(propiedadesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching propiedades:', error);
      setError(error.message || "Error al cargar propiedades");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.name) {
      fetchPropiedades();
    }
  }, [user.name]);

  const eliminarPropiedad = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/propiedad/delete/${id}`);
      await Swal.fire({
        title: 'Propiedad Eliminada!',
        text: 'La propiedad fue eliminada correctamente',
        icon: 'success',
      });

      setPropiedades((prevPropiedades) => 
        prevPropiedades.filter((propiedad) => propiedad.id !== id)
      );
    } catch (error) {
      console.error("Error al eliminar propiedad: ", error.response ? error.response.data : error.message);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la propiedad.',
        icon: 'error',
      });
    }
  };

  const propiedadesFiltradas = useMemo(() => {
    console.log("Estado actual de propiedades:", propiedades);
    
    if (!propiedades || !Array.isArray(propiedades) || propiedades.length === 0) {
      console.log("No hay propiedades para filtrar");
      return [];
    }
    
    const filteredByUser = propiedades.filter(propiedad => {
      if (!propiedad) {
        console.log("Propiedad undefined o null");
        return false;
      }
      
      // Modificación: verificamos propietarioContratoDtoSalida en lugar de propietarioNombre
      if (propiedad.propietarioContratoDtoSalida) {
        // Para admins, mostramos todas; para usuarios normales solo las suyas
        return user.authorities === "ROLE_ADMIN" || 
               (propiedad.propietarioContratoDtoSalida.nombre && 
                propiedad.propietarioContratoDtoSalida.nombre === user.name);
      }
      
      // Si no hay propietarioContratoDtoSalida, mostramos la propiedad
      return true;
    });
    
    console.log("Después de filtrar por usuario:", filteredByUser);
    
    // Luego filtramos por término de búsqueda
    const filteredBySearch = filteredByUser.filter(propiedad => {
      if (!searchTerm) return true;
      
      const direccion = propiedad.direccion || "";
      const tipoPropiedad = propiedad.tipoPropiedad || "";
      const propietarioNombre = propiedad.propietarioContratoDtoSalida ? 
                               `${propiedad.propietarioContratoDtoSalida.nombre} ${propiedad.propietarioContratoDtoSalida.apellido}` : "";
      const localidad = propiedad.localidad || "";
      
      const searchTermLower = searchTerm.toLowerCase();
      
      return direccion.toLowerCase().includes(searchTermLower) ||
             tipoPropiedad.toLowerCase().includes(searchTermLower) ||
             propietarioNombre.toLowerCase().includes(searchTermLower) ||
             localidad.toLowerCase().includes(searchTermLower);
    });
    
    console.log("Resultado final filtrado:", filteredBySearch);
    return filteredBySearch;
  }, [propiedades, searchTerm, user.authorities, user.name]);

  return (
    <Box sx={{ 
      width: "100%", 
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 8, sm: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.default'
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
              Propiedades
            </Typography>
          </Box>
          <Tooltip title="Añadir propiedad">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nueva-propiedad')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          placeholder="Buscar por dirección, tipo, propietario..."
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
            <Typography>Cargando propiedades...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%' 
          }}>
            <Typography>Error al cargar las propiedades: {error}</Typography>
          </Box>
        ) : (
          <>
            {propiedadesFiltradas.length === 0 ? (
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
                  No se encontraron propiedades con los criterios de búsqueda.
                </Typography>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Box sx={{ 
                    width: "100%", 
                    display: 'flex', 
                    justifyContent: 'center' 
                  }}>
                    <Grid2 
                      container 
                      spacing={2} 
                      sx={{ 
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        ml: { xs: -1, sm: -2 }
                      }}
                    >
                      {propiedadesFiltradas.map((propiedad) => (
                        <Grid2 item key={propiedad.id}>
                          <Card 
                            sx={{ 
                              mb: 2, 
                              width: { xs: '19rem', sm: '20rem' },
                              borderRadius: 3,
                              overflow: 'hidden',
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                              boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 12px 16px rgba(0,0,0,0.1)',
                              },
                              position: 'relative'
                            }}
                          >
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                left: 0, 
                                top: 0, 
                                width: '8px', 
                                height: '100%', 
                                bgcolor: propiedad.disponible ? 'success.main' : 'error.main' 
                              }} 
                            />
                            <CardContent sx={{ pl: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 600, 
                                  mb: 1,
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}>
                                  {propiedad.tipoPropiedad}
                                </Typography>
                                <Chip 
                                  label={propiedad.disponible ? "Disponible" : "No disponible"} 
                                  color={propiedad.disponible ? "error" : "success"}
                                  size="small"
                                  sx={{ 
                                    fontWeight: 500,
                                    ml: 1
                                  }}
                                />
                              </Box>
                              <Divider sx={{ my: 1.5 }} />
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                                  <LocationOnIcon fontSize="small" />
                                  {propiedad.direccion}, {propiedad.ciudad}
                                </Typography>
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
                                  <PersonIcon fontSize="small" />
                                  {propiedad.propietarioContratoDtoSalida ? 
                                   `${propiedad.propietarioContratoDtoSalida.nombre} ${propiedad.propietarioContratoDtoSalida.apellido}` : 'No asignado'}
                                </Typography>
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
                                  <HomeIcon fontSize="small" />
                                  {propiedad.cantHabitaciones} hab, {propiedad.cantBaños} baños
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid2>
                      ))}
                    </Grid2>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ 
                    width: '100%',
                    overflowX: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                    '& .MuiTableCell-root': {
                      color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
                    }
                  }}>
                    <Table aria-label="propiedades table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Tipo</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Dirección</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Propietario</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Habitaciones</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Baños</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {propiedadesFiltradas.map((propiedad) => (
                          <TableRow
                            key={propiedad.id}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.01)',
                                transition: 'all 0.2s ease-in-out'
                              },
                              '&:nth-of-type(odd)': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
                              }
                            }}
                          >
                            <TableCell>{propiedad.tipoPropiedad}</TableCell>
                            <TableCell>{propiedad.direccion}, {propiedad.ciudad}</TableCell>
                            <TableCell>{propiedad.propietarioContratoDtoSalida ? 
                                          `${propiedad.propietarioContratoDtoSalida.nombre} ${propiedad.propietarioContratoDtoSalida.apellido}` : ''}</TableCell>
                            <TableCell>{propiedad.cantHabitaciones}</TableCell>
                            <TableCell>{propiedad.cantBaños}</TableCell>
                            <TableCell>
                              <Chip 
                                label={propiedad.disponible ? "Disponible" : "No disponible"} 
                                color={propiedad.disponible ? "success" : "error"}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default PropiedadesPage;
