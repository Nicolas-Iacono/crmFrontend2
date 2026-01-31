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
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  Chip,
  Skeleton,
  Pagination,
  TablePagination,
  Avatar,
  Grid2,
  Modal,
  CardMedia,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../alertas/showAlert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PlaceIcon from '@mui/icons-material/Place';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BusinessIcon from '@mui/icons-material/Business';
import ProspectosApi from '../api/prospectos';

const ProspectosPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // Desktop table: selection and pagination state
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para propiedades compatibles
  const [propiedadesCompatibles, setPropiedadesCompatibles] = useState({});
  const [propiedadesLoading, setPropiedadesLoading] = useState({});
  const [propiedadesError, setPropiedadesError] = useState({});
  const [expandedPropiedades, setExpandedPropiedades] = useState({});

  // Estado para modal de propiedad
  const [modalPropiedadOpen, setModalPropiedadOpen] = useState(false);
  const [selectedPropiedad, setSelectedPropiedad] = useState(null);

  // Estado para visor de imágenes
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProspectos = prospectos.filter(p => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(t) ||
      (p.email ?? '').toLowerCase().includes(t) ||
      (p.telefono ?? '').toLowerCase().includes(t) ||
      (p.zonaPreferencia ?? '').toLowerCase().includes(t)
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
      const result = await ProspectosApi.listarMisProspectos();
      if (result.error) {
        throw new Error(result.error);
      }
      const arr = Array.isArray(result.data)
        ? result.data
        : (result.data?.data && Array.isArray(result.data.data)) ? result.data.data : [];
      const prospectosNorm = arr.map(p => ({
        id: p.id,
        nombre: p.nombre ?? '',
        apellido: p.apellido ?? '',
        telefono: p.telefono ?? '',
        email: p.email ?? '',
        rangoPrecioMin: p.rangoPrecioMin ?? 0,
        rangoPrecioMax: p.rangoPrecioMax ?? 0,
        cantidadPersonas: p.cantidadPersonas ?? 0,
        zonaPreferencia: p.zonaPreferencia ?? '',
        cantidadAmbientes: p.cantidadAmbientes ?? 0,
        cochera: p.cochera ?? false,
        patio: p.patio ?? false,
        jardin: p.jardin ?? false,
        pileta: p.pileta ?? false,
        ownerTel: p.telefonoUsuario,
        ownerName:p.nombreNegocio,
        ownerLogo:p.logo
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
    console.log('handleMenuClick called with prospectoId:', prospectoId);
    setAnchorEl(event.currentTarget);
    setSelectedProspectoId(prospectoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProspectoId(null);
  };

  const handleEdit = (prospectoId = selectedProspectoId) => {
    console.log('handleEdit called with prospectoId:', prospectoId);
    const prospecto = prospectos.find(prop => prop.id === prospectoId);
    console.log('Found prospecto:', prospecto);
    if (prospecto) {
      console.log('Navigating to:', `/editar-prospecto/${prospectoId}`);
      navigate(`/editar-prospecto/${prospectoId}`, { state: { prospecto } });
    } else {
      console.error('Prospecto not found with ID:', prospectoId);
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
          await ProspectosApi.eliminarProspecto(prospectoId);
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

  // Funciones para propiedades compatibles
  const fetchPropiedadesCompatibles = async (prospectoId) => {
    setPropiedadesLoading(prev => ({ ...prev, [prospectoId]: true }));
    setPropiedadesError(prev => ({ ...prev, [prospectoId]: null }));
    
    try {
      const result = await ProspectosApi.listarPropiedadesCompatibles(prospectoId);
      const data = Array.isArray(result?.data) ? result.data : result?.data?.data || [];
      setPropiedadesCompatibles(prev => ({
        ...prev,
        [prospectoId]: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error('Error fetching propiedades compatibles:', error);
      setPropiedadesError(prev => ({
        ...prev,
        [prospectoId]: 'Error al cargar propiedades compatibles'
      }));
    } finally {
      setPropiedadesLoading(prev => ({ ...prev, [prospectoId]: false }));
    }
  };

  const togglePropiedadesCompatibles = (prospectoId) => {
    setExpandedPropiedades(prev => ({
      ...prev,
      [prospectoId]: !prev[prospectoId]
    }));
    
    // Si se está expandiendo y no hay datos cargados, fetchear
    if (!expandedPropiedades[prospectoId] && !propiedadesCompatibles[prospectoId]) {
      fetchPropiedadesCompatibles(prospectoId);
    }
  };

  // Funciones para modal de propiedad
  const openPropiedadModal = (propiedad) => {
    setSelectedPropiedad(propiedad);
    setModalPropiedadOpen(true);
  };

  const closePropiedadModal = () => {
    setModalPropiedadOpen(false);
    setSelectedPropiedad(null);
  };

  // Función para WhatsApp
  const handleWhatsAppPropiedad = (prospecto, propiedad) => {
    const phoneNumber = prospecto?.telefono?.replace(/\D/g, '');
    if (phoneNumber) {
      const message = encodeURIComponent(
        `Hola ${prospecto?.nombre || ''}, te contacto desde la inmobiliaria con una propiedad que coincide con tu búsqueda:\n\n` +
        `🏠 ${propiedad?.direccion || 'Sin dirección'}\n` +
        `📍 ${propiedad?.localidad || ''}, ${propiedad?.partido || ''}\n` +
        `💰 $${propiedad?.precio?.toLocaleString() || 'N/A'}\n` +
        `🏠 ${propiedad?.cantidadAmbientes || 'N/A'} ambientes\n\n` +
        `¿Te interesa conocer más detalles?`
      );
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      showError('El prospecto no tiene un número de teléfono válido.');
    }
  };

  // Funciones para visor de imágenes
  const openImageViewer = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImage(null);
    setSelectedImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (!selectedPropiedad?.imagenes) return;
    
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % selectedPropiedad.imagenes.length
      : (selectedImageIndex - 1 + selectedPropiedad.imagenes.length) % selectedPropiedad.imagenes.length;
    
    setSelectedImageIndex(newIndex);
    setSelectedImage(selectedPropiedad.imagenes[newIndex].imageUrl);
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      
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
                    {prospecto.zonaPreferencia && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Zona:</strong>{' '}
                        {prospecto.zonaPreferencia && Array.isArray(prospecto.zonaPreferencia) && prospecto.zonaPreferencia.length > 0 ? (
                        prospecto.zonaPreferencia.map((zona, index) => (
                          <Chip
                            key={index}
                            label={zona}
                            color="primary"
                            size="small"
                            sx={{ margin: '2px' }}
                          />
                        ))
                      ) : (
                        <Chip
                          label={prospecto.zonaPreferencia || 'Sin zona'}
                          color="primary"
                          size="small"
                        />
                      )}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {prospecto.rangoPrecioMin || prospecto.rangoPrecioMax
                        ? `Presupuesto: ${prospecto.rangoPrecioMin || 0} - ${prospecto.rangoPrecioMax || '∞'}`
                        : 'Sin presupuesto'}
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
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Personas:</strong> {prospecto.cantidadPersonas || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Ambientes:</strong> {prospecto.cantidadAmbientes || '—'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Amenities:</strong>{' '}
                        {[prospecto.cochera && 'Cochera', prospecto.patio && 'Patio', prospecto.jardin && 'Jardín', prospecto.pileta && 'Pileta']
                          .filter(Boolean)
                          .join(', ') || 'Sin preferencias'}
                      </Typography>
                    </Box>
                  </Collapse>

                  {/* Carrusel de Propiedades Compatibles */}
                  <Box sx={{ mt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, pt: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        mb: 1
                      }}
                      onClick={() => togglePropiedadesCompatibles(prospecto.id)}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon sx={{ fontSize: 16 }} />
                        Propiedades Compatibles
                      </Typography>
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: expandedPropiedades[prospecto.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </Box>

                    <Collapse in={expandedPropiedades[prospecto.id]} timeout="auto" unmountOnExit>
                      {propiedadesLoading[prospecto.id] ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : propiedadesError[prospecto.id] ? (
                        <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 2 }}>
                          {propiedadesError[prospecto.id]}
                        </Typography>
                      ) : propiedadesCompatibles[prospecto.id]?.length > 0 ? (
                        <Box sx={{ position: 'relative' }}>
                          {/* Carrusel */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            overflowX: 'auto', 
                            pb: 1,
                            scrollBehavior: 'smooth',
                            '&::-webkit-scrollbar': {
                              height: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                              bgcolor: 'background.default',
                              borderRadius: '2px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              bgcolor: 'primary.main',
                              borderRadius: '2px',
                            },
                          }}>
                            {propiedadesCompatibles[prospecto.id].map((propiedad) => (
                              <Box 
                                key={propiedad.id} 
                                sx={{ 
                                  minWidth: 280,
                                  flexShrink: 0
                                }}
                              >
                                <Card 
                                  sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: theme.palette.mode === 'dark' 
                                        ? '0 8px 25px rgba(0,0,0,0.3)' 
                                        : '0 8px 20px rgba(0,0,0,0.12)',
                                    }
                                  }}
                                  onClick={() => openPropiedadModal(propiedad)}
                                >
                                  {propiedad.imagenes?.length > 0 && propiedad.imagenes[0]?.imageUrl ? (
                                    <CardMedia
                                      component="img"
                                      height="120"
                                      image={propiedad.imagenes[0].imageUrl}
                                      alt={propiedad.direccion}
                                      sx={{ objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <Box 
                                      sx={{ 
                                        height: 120, 
                                        bgcolor: 'grey.200', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                      }}
                                    >
                                      <HomeIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                                    </Box>
                                  )}
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                                      {propiedad.direccion || 'Sin dirección'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                      {propiedad.localidad || ''}, {propiedad.partido || ''}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        ${propiedad.precio?.toLocaleString() || 'N/A'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {propiedad.cantidadAmbientes || 'N/A'} amb
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                      <Tooltip title="Ver detalles">
                                        <IconButton 
                                          size="small" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openPropiedadModal(propiedad);
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Enviar por WhatsApp">
                                        <IconButton 
                                          size="small" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsAppPropiedad(prospecto, propiedad);
                                          }}
                                          sx={{ color: '#25D366' }}
                                        >
                                          <WhatsAppIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No hay propiedades compatibles
                        </Typography>
                      )}
                    </Collapse>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </>
  );

  const renderDesktopView = (prospectosFiltrados) => (
    <Box sx={{ width: '100%' }}>
      {prospectosFiltrados
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((prospecto) => {
          const nombreCompleto = `${prospecto.nombre || ''} ${prospecto.apellido || ''}`.trim();
          const zonas = Array.isArray(prospecto.zonaPreferencia) 
            ? prospecto.zonaPreferencia.join(', ') 
            : prospecto.zonaPreferencia || '—';
          const presupuesto = prospecto.rangoPrecioMin || prospecto.rangoPrecioMax
            ? `$${prospecto.rangoPrecioMin || 0} - $${prospecto.rangoPrecioMax || '∞'}`
            : '—';
          
          return (
            <Card 
              key={prospecto.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 3, 
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 12px 16px rgba(0,0,0,0.1)',
                },
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {/* Información principal */}
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Avatar */}
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    
                    {/* Nombre y contacto básico */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {nombreCompleto || 'Sin nombre'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {prospecto.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {prospecto.email}
                            </Typography>
                          </Box>
                        )}
                        {prospecto.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {prospecto.telefono}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(prospecto.id)} 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => confirmDeleteProspecto(prospecto.id)} 
                      color="error"
                      sx={{ 
                        bgcolor: 'error.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Información detallada en grid */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 2,
                  mb: 2
                }}>
                  {/* Zona preferida */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <PlaceIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Zona preferida
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {zonas}
                    </Typography>
                  </Box>

                  {/* Presupuesto */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <AttachMoneyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Presupuesto
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {presupuesto}
                    </Typography>
                  </Box>

                  {/* Ambientes */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <HomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Ambientes
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {prospecto.cantidadAmbientes || '—'}
                    </Typography>
                  </Box>

                  {/* Tipo de propiedad */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <ApartmentIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Tipo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {prospecto.tipoPropiedad || '—'}
                    </Typography>
                  </Box>
                </Box>

                {/* Amenities */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Amenities:
                  </Typography>
                  {[
                    prospecto.cochera && 'Cochera', 
                    prospecto.patio && 'Patio', 
                    prospecto.jardin && 'Jardín', 
                    prospecto.pileta && 'Pileta'
                  ]
                    .filter(Boolean)
                    .map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )) || (
                    <Typography variant="body2" color="text.secondary">
                      Sin preferencias
                    </Typography>
                  )}
                </Box>

                {/* Información del propietario (si existe) */}
                {(prospecto.ownerName || prospecto.ownerTel) && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Información de contacto adicional:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {prospecto.ownerName && (
                        <Typography variant="body2">
                          <strong>Nombre:</strong> {prospecto.ownerName}
                        </Typography>
                      )}
                      {prospecto.ownerTel && (
                        <Typography variant="body2">
                          <strong>Tel:</strong> {prospecto.ownerTel}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Carrusel de Propiedades Compatibles */}
                <Box sx={{ mt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, pt: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      mb: 1
                    }}
                    onClick={() => togglePropiedadesCompatibles(prospecto.id)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon sx={{ fontSize: 16 }} />
                      Propiedades Compatibles
                    </Typography>
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: expandedPropiedades[prospecto.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  </Box>

                  <Collapse in={expandedPropiedades[prospecto.id]} timeout="auto" unmountOnExit>
                    {propiedadesLoading[prospecto.id] ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : propiedadesError[prospecto.id] ? (
                      <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 2 }}>
                        {propiedadesError[prospecto.id]}
                      </Typography>
                    ) : propiedadesCompatibles[prospecto.id]?.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        {/* Carrusel */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 2, 
                          overflowX: 'auto', 
                          pb: 1,
                          scrollBehavior: 'smooth',
                          '&::-webkit-scrollbar': {
                            height: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            bgcolor: 'background.default',
                            borderRadius: '2px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'primary.main',
                            borderRadius: '2px',
                          },
                        }}>
                          {propiedadesCompatibles[prospecto.id].map((propiedad) => (
                            <Box 
                              key={propiedad.id} 
                              sx={{ 
                                minWidth: 280,
                                flexShrink: 0
                              }}
                            >
                              <Card 
                                sx={{ 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark' 
                                      ? '0 8px 25px rgba(0,0,0,0.3)' 
                                      : '0 8px 20px rgba(0,0,0,0.12)',
                                  }
                                }}
                                onClick={() => openPropiedadModal(propiedad)}
                              >
                                {propiedad.imagenes?.length > 0 && propiedad.imagenes[0]?.imageUrl ? (
                                  <CardMedia
                                    component="img"
                                    height="120"
                                    image={propiedad.imagenes[0].imageUrl}
                                    alt={propiedad.direccion}
                                    sx={{ objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Box 
                                    sx={{ 
                                      height: 120, 
                                      bgcolor: 'grey.200', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center' 
                                    }}
                                  >
                                    <HomeIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                                  </Box>
                                )}
                                <CardContent sx={{ p: 1.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                                    {propiedad.direccion || 'Sin dirección'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                    {propiedad.localidad || ''}, {propiedad.partido || ''}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      ${propiedad.precio?.toLocaleString() || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {propiedad.cantidadAmbientes || 'N/A'} amb
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                    <Tooltip title="Ver detalles">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openPropiedadModal(propiedad);
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Enviar por WhatsApp">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleWhatsAppPropiedad(prospecto, propiedad);
                                        }}
                                        sx={{ color: '#25D366' }}
                                      >
                                        <WhatsAppIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No hay propiedades compatibles
                      </Typography>
                    )}
                  </Collapse>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      
      {/* Paginación */}
      <TablePagination
        component="div"
        count={prospectosFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          '.MuiTablePagination-toolbar': {
            justifyContent: 'center'
          }
        }}
      />
    </Box>
  );

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
          placeholder="Buscar por nombre, apellido, email o zona..."
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
          placeholder="Buscar por nombre, apellido, email, zona..."
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
          isMobile ? renderMobileView(prospectosPaginados) : renderDesktopView(filteredProspectos)
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

        {/* Modal de Propiedad */}
        <Modal
          open={modalPropiedadOpen}
          onClose={closePropiedadModal}
          aria-labelledby="propiedad-modal-title"
          aria-describedby="propiedad-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px', md: '700px' },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 60px rgba(0,0,0,0.5)' 
              : '0 20px 40px rgba(0,0,0,0.15)',
            outline: 'none',
          }}>
            {selectedPropiedad && (
              <>
                {/* Header del modal */}
                <Box sx={{
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.dark}05)`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography id="propiedad-modal-title" variant="h5" sx={{ fontWeight: 700 }}>
                      Detalles de la Propiedad
                    </Typography>
                    <IconButton onClick={closePropiedadModal} sx={{ color: 'text.secondary' }}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Contenido del modal */}
                <Box sx={{ p: 3 }}>
                  {/* Galería de imágenes */}
                  {selectedPropiedad.imagenes?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Galería de Imágenes
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        overflowX: 'auto', 
                        pb: 1,
                        '&::-webkit-scrollbar': {
                          height: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          bgcolor: 'background.default',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          bgcolor: 'primary.main',
                          borderRadius: '3px',
                        },
                      }}>
                        {selectedPropiedad.imagenes.map((imagen, index) => (
                          <Box 
                            key={imagen.idImage || index} 
                            sx={{ 
                              minWidth: 200, 
                              height: 150, 
                              flexShrink: 0,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                            onClick={() => openImageViewer(imagen.imageUrl, index)}
                          >
                            <img
                              src={imagen.imageUrl}
                              alt={`Imagen ${index + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Información principal */}
                  <Grid2 container spacing={2}>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Dirección
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPropiedad.direccion || 'Sin dirección'}
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Ubicación Completa
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPropiedad.localidad || ''}, {selectedPropiedad.partido || ''}, {selectedPropiedad.provincia || ''}
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Tipo de Propiedad
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPropiedad.tipo || 'Sin especificar'}
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Precio
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1.1rem' }}>
                          ${selectedPropiedad.precio?.toLocaleString('es-AR') || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Ambientes
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedPropiedad.cantidadAmbientes || 'N/A'} ambientes
                        </Typography>
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Disponibilidad
                        </Typography>
                        <Chip 
                          label={selectedPropiedad.disponibilidad ? 'Disponible' : 'No disponible'} 
                          color={selectedPropiedad.disponibilidad ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Tipo de Propiedad
                        </Typography>
                        <Chip 
                          label={selectedPropiedad.propia ? 'Propia' : 'Alquiler'} 
                          color={selectedPropiedad.propia ? 'primary' : 'info'}
                          size="small"
                        />
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Visibilidad
                        </Typography>
                        <Chip 
                          label={selectedPropiedad.visibleAOtros ? 'Visible para otros' : 'Solo para mi'} 
                          color={selectedPropiedad.visibleAOtros ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Grid2>
                    <Grid2 item xs={12}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Amenities y Características
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedPropiedad.cochera && (
                            <Chip label="Cochera" size="small" color="success" variant="filled" />
                          )}
                          {selectedPropiedad.patio && (
                            <Chip label="Patio" size="small" color="success" variant="filled" />
                          )}
                          {selectedPropiedad.jardin && (
                            <Chip label="Jardín" size="small" color="success" variant="filled" />
                          )}
                          {selectedPropiedad.pileta && (
                            <Chip label="Pileta" size="small" color="success" variant="filled" />
                          )}
                          {!selectedPropiedad.cochera && !selectedPropiedad.patio && !selectedPropiedad.jardin && !selectedPropiedad.pileta && (
                            <Typography variant="body2" color="text.secondary">
                              Sin amenities específicos
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid2>
                    {selectedPropiedad.inventario && (
                      <Grid2 item xs={12}>
                        <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Descripción Completa
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 500, 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6,
                            fontSize: '0.9rem'
                          }}>
                            {selectedPropiedad.inventario}
                          </Typography>
                        </Box>
                      </Grid2>
                    )}
                  </Grid2>

             
                  {/* Información de la Inmobiliaria */}
                  {selectedPropiedad.usuarioDtoSalida && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" />
                        Información de la Inmobiliaria
                      </Typography>
                      <Grid2 container spacing={2}>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Nombre de Negocio
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedPropiedad.usuarioDtoSalida.nombreNegocio}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Teléfono
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedPropiedad.usuarioDtoSalida.telefono}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedPropiedad.usuarioDtoSalida.email}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Matrícula
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedPropiedad.usuarioDtoSalida.matricula}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Razón Social
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedPropiedad.usuarioDtoSalida.razonSocial}
                          </Typography>
                        </Grid2>
                      </Grid2>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Modal Visor de Imágenes */}
        <Modal
          open={imageViewerOpen}
          onClose={closeImageViewer}
          aria-labelledby="image-viewer-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'transparent',
            outline: 'none',
          }}>
            {/* Botón cerrar */}
            <IconButton
              onClick={closeImageViewer}
              sx={{
                position: 'absolute',
                top: -40,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Contenedor principal */}
            <Box sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Imagen principal */}
              <Box
                component="img"
                src={selectedImage}
                alt={`Imagen ${selectedImageIndex + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 20px 60px rgba(0,0,0,0.8)' 
                    : '0 20px 40px rgba(0,0,0,0.3)',
                }}
              />

              {/* Controles de navegación */}
              {selectedPropiedad?.imagenes && selectedPropiedad.imagenes.length > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mt: 2 
                }}>
                  {/* Botón anterior */}
                  <IconButton
                    onClick={() => navigateImage('prev')}
                    disabled={selectedPropiedad.imagenes.length <= 1}
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>

                  {/* Indicador de imágenes */}
                  <Typography variant="body2" sx={{ color: 'white', minWidth: '60px', textAlign: 'center' }}>
                    {selectedImageIndex + 1} / {selectedPropiedad.imagenes.length}
                  </Typography>

                  {/* Botón siguiente */}
                  <IconButton
                    onClick={() => navigateImage('next')}
                    disabled={selectedPropiedad.imagenes.length <= 1}
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              )}

              {/* Miniaturas */}
              {selectedPropiedad?.imagenes && selectedPropiedad.imagenes.length > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mt: 2, 
                  maxWidth: '80vw',
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '2px',
                  },
                }}>
                  {selectedPropiedad.imagenes.map((imagen, index) => (
                    <Box
                      key={imagen.idImage || index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setSelectedImage(imagen.imageUrl);
                      }}
                      sx={{
                        minWidth: 60,
                        height: 40,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImageIndex === index 
                          ? '2px solid white' 
                          : '1px solid rgba(255, 255, 255, 0.3)',
                        opacity: selectedImageIndex === index ? 1 : 0.7,
                        '&:hover': {
                          opacity: 1,
                          border: '1px solid white',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img
                        src={imagen.imageUrl}
                        alt={`Miniatura ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Modal>

        {/* Menú contextual para mobile */}
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleEdit(selectedProspectoId)}>Editar</MenuItem>
          <MenuItem onClick={() => handleDelete(selectedProspectoId)}>Eliminar</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ProspectosPage;
