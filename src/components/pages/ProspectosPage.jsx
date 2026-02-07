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
import { showSuccess, showError, showConfirm } from '../alertas/showAlert';
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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ProspectosApi from '../api/prospectos';

const ProspectosPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
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
      (Array.isArray(p.zonaPreferencia) ? p.zonaPreferencia.join(' ') : (p.zonaPreferencia ?? '')).toLowerCase().includes(t)
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
    showConfirm({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      confirmText: 'Sí, eliminar',
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
      <Box sx={{ width: '100%' }}>
        {prospectosFiltrados.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 48, color: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No se encontraron prospectos
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {prospectosFiltrados.map(prospecto => (
              <Paper 
                key={prospecto.id} 
                elevation={0}
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ p: 2 }}>
                  {/* Header: Avatar + Name + Menu */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar sx={{ 
                        width: 40, height: 40, 
                        bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                        color: '#8b5cf6',
                      }}>
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                          {`${prospecto.nombre} ${prospecto.apellido}`.trim() || 'Sin nombre'}
                        </Typography>
                        {prospecto.telefono && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 12 }} />
                            {prospecto.telefono}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, prospecto.id)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Contact Info */}
                  {prospecto.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {prospecto.email}
                      </Typography>
                    </Box>
                  )}

                  {/* Chips Row */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {prospecto.zonaPreferencia && (
                      Array.isArray(prospecto.zonaPreferencia) && prospecto.zonaPreferencia.length > 0 ? (
                        prospecto.zonaPreferencia.map((zona, index) => (
                          <Chip
                            key={index}
                            label={zona}
                            size="small"
                            sx={{ 
                              height: 22, fontSize: '0.7rem',
                              bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                              color: isDark ? '#a78bfa' : '#7c3aed',
                            }}
                          />
                        ))
                      ) : (
                        <Chip
                          label={prospecto.zonaPreferencia || 'Sin zona'}
                          size="small"
                          sx={{ 
                            height: 22, fontSize: '0.7rem',
                            bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                            color: isDark ? '#a78bfa' : '#7c3aed',
                          }}
                        />
                      )
                    )}
                    {(prospecto.rangoPrecioMin || prospecto.rangoPrecioMax) && (
                      <Chip
                        icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />}
                        label={`${prospecto.rangoPrecioMin || 0} - ${prospecto.rangoPrecioMax || '∞'}`}
                        size="small"
                        sx={{ 
                          height: 22, fontSize: '0.7rem',
                          bgcolor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
                          color: isDark ? '#86efac' : '#16a34a',
                        }}
                      />
                    )}
                    {prospecto.cantidadAmbientes > 0 && (
                      <Chip
                        label={`${prospecto.cantidadAmbientes} amb`}
                        size="small"
                        sx={{ 
                          height: 22, fontSize: '0.7rem',
                          bgcolor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                          color: isDark ? '#93c5fd' : '#2563eb',
                        }}
                      />
                    )}
                  </Box>

                  {/* Expand/Collapse */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {[prospecto.cochera && 'Cochera', prospecto.patio && 'Patio', prospecto.jardin && 'Jardín', prospecto.pileta && 'Pileta']
                        .filter(Boolean)
                        .map((amenity, index) => (
                          <Chip key={index} label={amenity} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ))
                      }
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleCard(prospecto.id)}
                      sx={{ 
                        transform: expandedCards[prospecto.id] ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s',
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCards[prospecto.id]} timeout="auto" unmountOnExit>
                    <Box sx={{ 
                      mt: 1.5, pt: 1.5, 
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                      display: 'flex', flexDirection: 'column', gap: 0.5,
                    }}>
                      <Typography variant="caption"><strong>Personas:</strong> {prospecto.cantidadPersonas || '—'}</Typography>
                      <Typography variant="caption"><strong>Ambientes:</strong> {prospecto.cantidadAmbientes || '—'}</Typography>
                      <Typography variant="caption">
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
                </Box>
              </Paper>
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
            ? prospecto.zonaPreferencia 
            : prospecto.zonaPreferencia ? [prospecto.zonaPreferencia] : [];
          const presupuesto = prospecto.rangoPrecioMin || prospecto.rangoPrecioMax
            ? `$${prospecto.rangoPrecioMin || 0} - $${prospecto.rangoPrecioMax || '∞'}`
            : '—';
          
          return (
            <Paper 
              key={prospecto.id} 
              elevation={0}
              sx={{ 
                mb: 2, 
                borderRadius: 3, 
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)',
                  boxShadow: isDark ? '0 4px 20px rgba(139,92,246,0.1)' : '0 4px 20px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Box sx={{ p: 2.5 }}>
                {/* Row 1: Avatar + Name + Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Avatar sx={{ 
                      width: 48, height: 48, 
                      bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                      color: '#8b5cf6',
                    }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                        {nombreCompleto || 'Sin nombre'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                        {prospecto.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {prospecto.email}
                            </Typography>
                          </Box>
                        )}
                        {prospecto.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {prospecto.telefono}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(prospecto.id)} 
                        sx={{ 
                          bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
                          color: '#8b5cf6',
                          '&:hover': { bgcolor: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.2)' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small" 
                        onClick={() => confirmDeleteProspecto(prospecto.id)} 
                        sx={{ 
                          bgcolor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                          color: '#ef4444',
                          '&:hover': { bgcolor: isDark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)' },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Row 2: Chips */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {zonas.map((zona, index) => (
                    <Chip
                      key={index}
                      icon={<PlaceIcon sx={{ fontSize: '14px !important' }} />}
                      label={zona}
                      size="small"
                      sx={{ 
                        height: 26, fontSize: '0.75rem',
                        bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                        color: isDark ? '#a78bfa' : '#7c3aed',
                      }}
                    />
                  ))}
                  {presupuesto !== '—' && (
                    <Chip
                      icon={<AttachMoneyIcon sx={{ fontSize: '14px !important' }} />}
                      label={presupuesto}
                      size="small"
                      sx={{ 
                        height: 26, fontSize: '0.75rem',
                        bgcolor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
                        color: isDark ? '#86efac' : '#16a34a',
                      }}
                    />
                  )}
                  {prospecto.cantidadAmbientes > 0 && (
                    <Chip
                      icon={<HomeIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${prospecto.cantidadAmbientes} ambientes`}
                      size="small"
                      sx={{ 
                        height: 26, fontSize: '0.75rem',
                        bgcolor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                        color: isDark ? '#93c5fd' : '#2563eb',
                      }}
                    />
                  )}
                  {prospecto.cantidadPersonas > 0 && (
                    <Chip
                      icon={<PeopleAltIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${prospecto.cantidadPersonas} personas`}
                      size="small"
                      sx={{ 
                        height: 26, fontSize: '0.75rem',
                        bgcolor: isDark ? 'rgba(251,146,60,0.2)' : 'rgba(251,146,60,0.1)',
                        color: isDark ? '#fdba74' : '#ea580c',
                      }}
                    />
                  )}
                  {[prospecto.cochera && 'Cochera', prospecto.patio && 'Patio', prospecto.jardin && 'Jardín', prospecto.pileta && 'Pileta']
                    .filter(Boolean)
                    .map((amenity, index) => (
                      <Chip 
                        key={`a-${index}`} 
                        label={amenity} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 26, fontSize: '0.75rem' }}
                      />
                    ))
                  }
                </Box>

                {/* Owner info */}
                {(prospecto.ownerName || prospecto.ownerTel) && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    pt: 1.5, 
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}>
                    <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {prospecto.ownerName && (
                      <Typography variant="caption" color="text.secondary">
                        {prospecto.ownerName}
                      </Typography>
                    )}
                    {prospecto.ownerTel && (
                      <Typography variant="caption" color="text.secondary">
                        {prospecto.ownerTel}
                      </Typography>
                    )}
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
              </Box>
            </Paper>
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

  // Reusable header component
  const renderHeader = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 3,
      gap: 1,
       pt: { xs: 2, sm: 3, md: 2 },
        pl: { xs: 2, sm: 3, md: '2rem' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          size="small"
          sx={{ 
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            <PeopleAltIcon sx={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: { xs: 20, sm: 24 } }} />
            Prospectos
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Gestiona tus prospectos y encuentra propiedades compatibles
          </Typography>
        </Box>
      </Box>
      <Tooltip title="Nuevo prospecto">
        <IconButton 
          onClick={() => navigate('/nuevo-prospecto')}
          sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Reusable search bar component
  const renderSearchBar = () => (
    <TextField
      placeholder="Buscar por nombre, email, zona..."
      variant="outlined"
      fullWidth
      size="small"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ 
        mb: 3,
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          '& fieldset': { border: 'none' },
          '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          },
          '&.Mui-focused': {
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
            border: `1px solid ${isDark ? '#8b5cf6' : '#7c3aed'}`,
          },
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
    />
  );

  // Main layout wrapper
  const pageContainer = {
    width: '100vw',
    minHeight: '100vh',
    pt: { xs: 2, sm: 3, md: 2 },
    pb: { xs: 14, sm: 12 },
    pl: { xs: 2, sm: 3, md: '16rem' },
    pr: { xs: 2, sm: 4, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.default',
    boxSizing: 'border-box',
  };

  if (isLoading) {
    return (
      <Box sx={pageContainer}>
        <Box sx={{ mt: { xs: '4rem', sm: 0 } }}>
          {renderHeader()}
          {renderSearchBar()}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Paper 
                key={idx} 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={18} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" width={100} height={26} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rounded" width={70} height={26} sx={{ borderRadius: 2 }} />
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
      <Box sx={pageContainer}>
        <Box sx={{ mt: { xs: '4rem', sm: 0 } }}>
          {renderHeader()}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              textAlign: 'center',
              border: `1px solid ${isDark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.2)'}`,
              bgcolor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)',
            }}
          >
            <Typography color="error" sx={{ fontWeight: 600 }}>
              Error al cargar los prospectos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {error.message || "Error desconocido"}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  if (!prospectos || prospectos.length === 0) {
    return (
      <Box sx={pageContainer}>
        <Box sx={{ mt: { xs: '4rem', sm: 0 } }}>
          {renderHeader()}
          <Paper 
            elevation={0}
            sx={{ 
              p: 6, 
              borderRadius: 4, 
              textAlign: 'center',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 64, color: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No hay prospectos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Agregá nuevos prospectos para comenzar a gestionar
            </Typography>
            <IconButton
              onClick={() => navigate('/nuevo-prospecto')}
              sx={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                width: 56,
                height: 56,
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
              }}
            >
              <AddIcon />
            </IconButton>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={pageContainer}>
      <Box sx={{ mt: { xs: '4rem', sm: 0 } }}>
        {renderHeader()}

        {/* Stats Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          flexWrap: 'wrap',
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              px: 2.5, 
              py: 1.5, 
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: '1 1 auto',
              minWidth: 140,
            }}
          >
            <Box sx={{ 
              width: 40, height: 40, borderRadius: 2, 
              bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PeopleAltIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {prospectos.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </Box>
          </Paper>
          <Paper 
            elevation={0}
            sx={{ 
              px: 2.5, 
              py: 1.5, 
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: '1 1 auto',
              minWidth: 140,
            }}
          >
            <Box sx={{ 
              width: 40, height: 40, borderRadius: 2, 
              bgcolor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SearchIcon sx={{ color: '#22c55e', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {filteredProspectos.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Filtrados</Typography>
            </Box>
          </Paper>
        </Box>

        {renderSearchBar()}

        {isMobile ? renderMobileView(prospectosPaginados) : renderDesktopView(filteredProspectos)}

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
