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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Grid2,
  Tooltip,
  Fab,
} from '@mui/material';

import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const InquilinosPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [inquilinos, setInquilinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
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

  const fetchInquilinos = async () => {
    if (!user || !user.name) {
      console.log("Username not available for fetchInquilinos");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/inquilino/${user.name}`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const inquilinosArray = Array.isArray(result.data) ? result.data : 
                              (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        
      
        
        console.log("Inquilinos recibidos:", inquilinosArray);
        setInquilinos(inquilinosArray);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      setError(error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Only fetch when user.name is available
    if (user && user.name) {
      fetchInquilinos();
    }
  }, [user.name]); // Dependency on user.name to refetch when it changes

  const filteredInquilinos = inquilinos && inquilinos.length
  ? inquilinos
      .filter(inquilino => {
        if (inquilino.usuario === null) {
          return false;
        }
        if (user.authorities !== "ROLE_ADMIN" && inquilino.usuario.username !== user.name) {
          return false;
        }
        return true;
      })
      .filter(inquilino => {
        if (!searchTerm) return true;
        
        const nombre = inquilino.nombre || "";
        const apellido = inquilino.apellido || "";
        const email = inquilino.email || "";
        const telefono = inquilino.telefono || "";
        const dni = inquilino.dni || "";
        
        const searchTermLower = searchTerm.toLowerCase();
        
        return nombre.toLowerCase().includes(searchTermLower) ||
               apellido.toLowerCase().includes(searchTermLower) ||
               email.toLowerCase().includes(searchTermLower) ||
               telefono.toLowerCase().includes(searchTermLower) ||
               dni.toLowerCase().includes(searchTermLower);
      })
  : [];

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
              Inquilinos
            </Typography>
          </Box>
          <Tooltip title="Añadir inquilino">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nuevo-inquilino')}
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
            <Typography>Cargando inquilinos...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%' 
          }}>
            <Typography>Error al cargar los inquilinos: {error}</Typography>
          </Box>
        ) : (
          <>
            {filteredInquilinos.length === 0 ? (
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
                  No se encontraron inquilinos con los criterios de búsqueda.
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
                      {filteredInquilinos.map((inquilino) => (
                        <Grid2 item key={inquilino.id}>
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
                              }
                            }}
                          >
                            <CardContent>
                              <Typography variant="h6" sx={{ 
                                color: 'text.primary',
                                fontWeight: 600, 
                                mb: 1,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' }
                              }}>
                                {inquilino.nombre} {inquilino.apellido}
                              </Typography>
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
                                  📱 {inquilino.telefono}
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
                                  ✉️ {inquilino.email}
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
                                  🏠 {inquilino.direccionResidencial || 'No disponible'}
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
                                  👤 {inquilino.usuarioDtoSalida?.username || 'No asignado'}
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
                    <Table aria-label="inquilinos table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>ID</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Nombre</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Apellido</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Teléfono</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Email</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Dirección</TableCell>
                          <TableCell sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.primary.main, 
                            color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
                            fontWeight: 600 
                          }}>Usuario</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredInquilinos.map((inquilino) => (
                          <TableRow
                            key={inquilino.id}
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
                            <TableCell>{inquilino.id}</TableCell>
                            <TableCell>{inquilino.nombre}</TableCell>
                            <TableCell>{inquilino.apellido}</TableCell>
                            <TableCell>{inquilino.telefono}</TableCell>
                            <TableCell>{inquilino.email}</TableCell>
                            <TableCell>{inquilino.direccionResidencial}</TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {inquilino.usuarioDtoSalida?.username || 'No asignado'}
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

export default InquilinosPage;