import React, { useEffect, useState } from 'react';
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
  Card,
  CardContent,
  TextField,
  InputAdornment,
  useTheme,
  Grid2,
  IconButton,
  Tooltip,
  Fab,
  Divider,
} from '@mui/material';
import GarantesApi from '../api/garanteApi';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useMediaQuery } from '@mui/material';
import "../styles/garantesPage.css";

const GarantesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [garantes, setGarantes] = useState({ data: [] });
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

  const fetchGarantes = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/garante/${user.name}`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const garantesArray = Array.isArray(result.data) ? result.data : 
        (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        console.log("Garantes recibidos:", garantesArray);
        setGarantes({ data: garantesArray });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching garantes:', error);
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.name) {
      fetchGarantes();
    }
  }, [user]); // Ejecutar cuando el usuario cambie

  const eliminarGarante = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/garante/delete/${id}`);
      await Swal.fire({
        title: 'Garante Eliminado!',
        text: 'El garante fue eliminado correctamente',
        icon: 'success',
      });
      
      // Update state instead of reloading
      setGarantes(prevData => ({
        ...prevData,
        data: prevData.data.filter(garante => garante.id !== id)
      }));
    } catch (error) {
      console.error("Error al eliminar garante: ", error.response ? error.response.data : error.message);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el garante.',
        icon: 'error',
      });
    }
  };

  const filteredGarantes = garantes.data
    .filter((garante) => {
      // Filtrar por usuario primero
      if (!user.name) return true;
      
      if (!garante.usuarioDtoSalida) {
        console.log("Garante sin usuario asociado:", garante);
        return true; 
      }
      
      return garante.usuarioDtoSalida.username === user.name;
    })
    .filter((garante) => 
      searchTerm === '' ||
      (garante.nombre && garante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.apellido && garante.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.email && garante.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.telefono && garante.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.dni && garante.dni.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
              Garantes
            </Typography>
          </Box>
          <Tooltip title="Añadir garante">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nuevo-garante')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          placeholder="Buscar por nombre, apellido, email, teléfono o DNI..."
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
            <Typography>Cargando garantes...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%' 
          }}>
            <Typography>Error al cargar los garantes: {error}</Typography>
          </Box>
        ) : (
          <>
            {filteredGarantes.length === 0 ? (
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
                  No se encontraron garantes con los criterios de búsqueda.
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
                      {filteredGarantes.map((garante) => (
                        <Grid2 item key={garante.id}>
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
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 600, 
                                  mb: 1,
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}>
                                  {garante.nombre} {garante.apellido}
                                </Typography>
                                <IconButton 
                                  onClick={() => eliminarGarante(garante.id)}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 87, 87, 0.1)' 
                                        : 'rgba(211, 47, 47, 0.1)'
                                    }
                                  }}
                                >
                                  <DeleteForeverIcon />
                                </IconButton>
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
                                  <EmailIcon fontSize="small" />
                                  {garante.email || 'Email no disponible'}
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
                                  <PhoneIcon fontSize="small" />
                                  {garante.telefono || 'Teléfono no disponible'}
                                </Typography>
                                {garante.dni && (
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
                                    <BadgeIcon fontSize="small" />
                                    {garante.dni}
                                  </Typography>
                                )}
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
                                  {garante.calle ? `${garante.calle} ${garante.numero || ''}` : 'Dirección no disponible'}
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
                    <Table aria-label="garantes table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Nombre y Apellido</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Email</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Teléfono</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>DNI</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Dirección</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredGarantes.map((garante, index) => (
                          <TableRow
                            key={garante.id}
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
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography sx={{ fontWeight: 500 }}>
                                  {garante.nombre} {garante.apellido}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{garante.email || '-'}</TableCell>
                            <TableCell>{garante.telefono || '-'}</TableCell>
                            <TableCell>{garante.dni || '-'}</TableCell>
                            <TableCell>
                              {garante.calle ? `${garante.calle} ${garante.numero || ''}` : '-'}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                onClick={() => eliminarGarante(garante.id)}
                                size="small"
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' 
                                      ? 'rgba(255, 87, 87, 0.1)' 
                                      : 'rgba(211, 47, 47, 0.1)'
                                  }
                                }}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
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

export default GarantesPage;
