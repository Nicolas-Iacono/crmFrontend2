import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Grid,
  Divider,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../context/GlobalAuth';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Swal from 'sweetalert2';
import axios from 'axios';
import http from '../api/http';
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const ProspectosPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { usuarioFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prospectos, setProspectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProspectoId, setSelectedProspectoId] = useState(null);
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  const filteredProspectos = prospectos.filter(p => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(t) ||
      (p.email ?? '').toLowerCase().includes(t) ||
      (p.telefono ?? '').toLowerCase().includes(t) ||
      (p.dni ?? '').toLowerCase().includes(t) ||
      (p.origen ?? '').toLowerCase().includes(t)
    );
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const tarjetasPorPagina = 6;
  const indiceInicio = (paginaActual - 1) * tarjetasPorPagina;
  const indiceFin = indiceInicio + tarjetasPorPagina;
  const prospectosPaginados = filteredProspectos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filteredProspectos.length / tarjetasPorPagina);

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

  const fetchProspectos = async () => {
    try {
      setIsLoading(true);
      // Obtener el userId del usuario actual desde el contexto de autenticación
      const userId = usuarioFetch?.id;
      
      if (!userId) {
        console.error('No se encontró el userId del usuario');
        setError(new Error('Usuario no identificado'));
        return;
      }
      
      const result = await http.get(`${import.meta.env.VITE_API_URL}/prospectos/me`);
      const arr = Array.isArray(result.data)
        ? result.data
        : (result.data?.data && Array.isArray(result.data.data)) ? result.data.data : [];

      const prospectosNorm = arr.map(p => ({
        id: p.id,
        nombreUsuario: p.nombreUsuario ?? '',
        rangoPrecioMin: p.rangoPrecioMin ?? 0,
        rangoPrecioMax: p.rangoPrecioMax ?? 0,
        cantidadPersonas: p.cantidadPersonas ?? 0,
        zonaPreferencia: p.zonaPreferencia ?? '',
        cantidadAmbientes: p.cantidadAmbientes ?? 0,
        cochera: p.cochera ?? false,
        patio: p.patio ?? false,
        jardin: p.jardin ?? false,
        pileta: p.pileta ?? false,
        // Campos adicionales para compatibilidad con la UI existente
       
      }));

      setProspectos(prospectosNorm);
    } catch (e) {
      console.error('Error fetching prospectos:', e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.name) {
      fetchProspectos();
    }
  }, [user.name]);

  const handleMenuClick = (event, prospectoId) => {
    setAnchorEl(event.currentTarget);
    setSelectedProspectoId(prospectoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProspectoId(null);
  };

  const handleEdit = (prospectoId = selectedProspectoId) => {
    const prospecto = prospectos.find(prop => prop.id === prospectoId);
    if (prospecto) {
      navigate(`/editar-prospecto/${prospectoId}`);
    }
    if (selectedProspectoId) {
      handleMenuClose();
    }
  };

  const confirmDeleteProspecto = (prospectoId) => {
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
          await http.delete(`${import.meta.env.VITE_API_URL}/prospectos/${prospectoId}`);
          setProspectos(prospectos.filter(p => p.id !== prospectoId));
          showSuccess('Prospecto eliminado exitosamente');
        } catch (error) {
          showError('No se pudo eliminar el prospecto.');
        }
      }
    });
  };

  const handleDelete = () => {
    handleMenuClose();
    confirmDeleteProspecto(selectedProspectoId);
  };

  const handleToggleCard = (prospectoId) => {
    setExpandedCards(prevExpandedCards => ({
      ...prevExpandedCards,
      [prospectoId]: !prevExpandedCards[prospectoId]
    }));
  };

  const goPrevPage = () => setPaginaActual((p) => Math.max(1, p - 1));
  const goNextPage = () => setPaginaActual((p) => Math.min(totalPaginas || 1, p + 1));

  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'NUEVO':
        return 'success';
      case 'CONTACTADO':
        return 'info';
      case 'INTERESADO':
        return 'warning';
      case 'NO INTERESADO':
        return 'error';
      case 'CONVERTIDO':
        return 'primary';
      default:
        return 'default';
    }
  };

  const renderMobileView = (prospectosFiltrados) => (
    <>
      <Box sx={{ 
        p: { xs: 1, sm: 2 }, 
        width: "100%",
        display: 'flex',
        justifyContent: 'center'
      }}>
        {prospectosFiltrados.length === 0 ? (
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
              No se encontraron prospectos con los criterios de búsqueda.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            {prospectosFiltrados.map(prospecto => (
              <Card key={prospecto.id} sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {`${prospecto.nombre} ${prospecto.apellido}`.trim() || 'Sin nombre'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={prospecto.estado || 'NUEVO'} 
                        color={getEstadoColor(prospecto.estado)}
                        size="small"
                      />
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, prospecto.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {prospecto.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {prospecto.email}
                        </Typography>
                      </Box>
                    )}
                    {prospecto.telefono && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {prospecto.telefono}
                        </Typography>
                      </Box>
                    )}
                    {prospecto.origen && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Origen:</strong> {prospecto.origen}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(prospecto.fechaContacto).toLocaleDateString()}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleCard(prospecto.id)}
                      sx={{ transform: expandedCards[prospecto.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCards[prospecto.id]} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      {prospecto.notas && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Notas:</strong> {prospecto.notas}
                        </Typography>
                      )}
                      {prospecto.interesEn && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Interesado en:</strong> {prospecto.interesEn}
                        </Typography>
                      )}
                      {prospecto.presupuesto && (
                        <Typography variant="body2">
                          <strong>Presupuesto:</strong> ${prospecto.presupuesto}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      {totalPaginas > 0 && (
        <Box display="flex" justifyContent="center" mt={2} mb={3} sx={{ width: '100%' }}>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(_, p) => setPaginaActual(p)}
            color="primary"
            siblingCount={0}
            boundaryCount={0}
          />
        </Box>
      )}
    </>
  );

  const renderDesktopView = (prospectosFiltrados) => (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 1 }}>
      <TableContainer>
        <Table size="medium" sx={{width: '100vw', minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Contacto</TableCell>
              <TableCell align="right" sx={{ width: 140, minWidth: 140 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prospectosFiltrados
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p) => {
                const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim();
                return (
                  <TableRow hover key={p.id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                    <TableCell sx={{ fontWeight: 500, width: "12rem" }}>
                      {nombreCompleto || '—'}
                    </TableCell>
                    <TableCell sx={{ width: "10rem" }}>{p.email || '—'}</TableCell>
                    <TableCell sx={{ width: "8rem" }}>{p.telefono || '—'}</TableCell>
                    <TableCell sx={{ width: "8rem" }}>{p.origen || '—'}</TableCell>
                    <TableCell sx={{ width: "6rem" }}>
                      <Chip 
                        label={p.estado || 'NUEVO'} 
                        color={getEstadoColor(p.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ width: "8rem" }}>
                      {new Date(p.fechaContacto).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(p.id)} sx={{ mr: 0.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => confirmDeleteProspecto(p.id)} color="error">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={prospectosFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Mostrar"
      />
    </Paper>
  );

  // Desktop table: selection and pagination state
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{
        width: { xs: '100%', sm: '100%', md: '90vw' },
        minHeight: '100vh',
        pt: { xs: 3, sm: 4 },
        pb: { xs: 12, sm: 4 },
        pl: { xs: 0, sm: 5 },
        pr: { xs: 0, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', md: 'flex-start' },
        bgcolor: 'background.default',
        marginLeft: { md: '15rem' }
      }}>
        <Box sx={{
          width: { xs: '90%', sm: '80%' },
          mt: { xs: '4rem', sm: 0 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: { xs: 0, md: '2rem' },
              mb: { xs: 2, sm: 3 },
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
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                Prospectos
              </Typography>
            </Box>
            <Tooltip title="Añadir prospecto">
              <Fab
                color="primary"
                aria-label="add"
                size="small"
                onClick={() => navigate('/nuevo-prospecto')}
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
              width: { xs: '100%', sm: '100%' },
              borderRadius: 6, '& fieldset': { borderRadius: 6 },
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
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

          <Box sx={{ width: '100%' }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <Paper key={idx} sx={{ mb: 1.2, p: 2, borderRadius: 3, boxShadow: 1 }}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="45%" />
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                  <Skeleton variant="rounded" width={72} height={28} />
                  <Skeleton variant="rounded" width={72} height={28} />
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error al cargar los prospectos: {error.message || "Desconocido"}
        </Typography>
      </Box>
    );
  }

  if (!prospectos || prospectos.length === 0) {
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
          No hay prospectos disponibles
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Agregue nuevos prospectos para verlos aquí
        </Typography>
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => navigate('/nuevo-prospecto')}
          sx={{ mt: 2 }}
        >
          <AddIcon />
        </Fab>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: { xs: '100%', sm: '100%', md: '90vw' }, 
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 12, sm: 4 },
      pl: { xs: 0, sm: 5 },
      pr: { xs: 0, sm: 2 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: { xs: 'center', md: 'flex-start' },
      bgcolor: 'background.default',
      marginLeft: { md: '15rem' }
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
            mb: { xs: 2, sm: 3 },
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
              Prospectos
            </Typography>
          </Box>
          <Tooltip title="Añadir prospecto">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nuevo-prospecto')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          placeholder="Buscar por nombre, apellido, email, origen..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            width: { xs: '100%', sm: '100%' },
            borderRadius: 6, '& fieldset': { borderRadius: 6 },
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
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
            gap: 2,
          }}>
            <CircularProgress />
            <Typography>Cargando prospectos...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%', 
          }}>
            <Typography>Error al cargar los prospectos: {error}</Typography>
          </Box>
        ) : (
          renderMobileView(prospectosPaginados)
        )}
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>Editar</MenuItem>
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ProspectosPage;
