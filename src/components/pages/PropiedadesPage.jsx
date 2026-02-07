import React, { useEffect, useState, useMemo, useRef } from 'react';
import ModalPropiedad from '../common/popUps/ModalPropiedad';
import ModalImagenesPropiedad from '../common/popUps/ModalImagenesPropiedad';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Skeleton,
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
  Fab,
  Button,
  CardMedia,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Modal,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { NumericFormat } from 'react-number-format';
import "../styles/garantesPage.css";
import PropertiesTour from '../common/tour/PropertiesTour';
import http from '../api/http';
import { showSuccess, showError, showWarning, showConfirm } from '../alertas/showAlert';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { PropiedadesApi } from '../api/propiedades';
import MobilePropiedadCard from '../common/cards/MobilePropiedadCard';
const PropiedadesPage = () => {
  // Estado para el modal de detalle de propiedad
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPropiedad, setSelectedPropiedad] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedPropId, setSelectedPropId] = useState(null);

  // Modal para visualizar/borrar imágenes
  const [modalImagenesOpen, setModalImagenesOpen] = useState(false);
  const [imagenesPropiedad, setImagenesPropiedad] = useState([]);
  const [propiedadImagenesId, setPropiedadImagenesId] = useState(null);

  // Modal para detalles del prospecto
  const [modalProspectoOpen, setModalProspectoOpen] = useState(false);
  const [selectedProspecto, setSelectedProspecto] = useState(null);

  // Feedback simple (puedes reemplazar por Snackbar)
  const [uploadMsg, setUploadMsg] = useState(null);

  // Handler para click en el botón de agregar imagen
  const handleAddImageClick = (propId) => {
    // Buscar la propiedad y abrir el modal de imágenes
    const prop = propiedades.find(p => p.id === propId);
    setImagenesPropiedad(Array.isArray(prop?.imagenes) ? prop.imagenes : []);
    setPropiedadImagenesId(propId);
    setModalImagenesOpen(true);
  };

  // Handler para la subida
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !selectedPropId) return;
    setUploadingId(selectedPropId);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await http.post(`/api/propiedad/${selectedPropId}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg('Imagen subida correctamente');
      // Recarga las propiedades después de subir
      if (typeof fetchPropiedades === 'function') fetchPropiedades();
    } catch (err) {
      setUploadMsg('Error al subir la imagen');
    } finally {
      setUploadingId(null);
      setSelectedPropId(null);
    }
  };

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [prospectosCompatibles, setProspectosCompatibles] = useState({});
  const [prospectosLoading, setProspectosLoading] = useState({});
  const [prospectosError, setProspectosError] = useState({});
  const [propiedadProspectosActiva, setPropiedadProspectosActiva] = useState(null);
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroBarrio, setFiltroBarrio] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  
  // Número de propiedades por página
  const itemsPerPage = isMobile ? 4 : 6;

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
      // Usar endpoint basado en el usuario autenticado
      const result = await http.get(`${import.meta.env.VITE_API_URL}/propiedad/me`);
      
      // Extraer los datos de la respuesta siguiendo el patrón común de las otras páginas
      let propiedadesData = [];
      if (Array.isArray(result.data)) {
        propiedadesData = result.data;
      } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
        propiedadesData = result.data.data;
      }
      
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

 const handleBuscarProspectos = async (event, propiedadId) => {
    event.stopPropagation();
    setPropiedadProspectosActiva(propiedadId);
    setProspectosLoading((prev) => ({ ...prev, [propiedadId]: true }));
    setProspectosError((prev) => ({ ...prev, [propiedadId]: null }));
    try {
      const response = await PropiedadesApi.listarProspectosCompatibles(propiedadId);
      const data = Array.isArray(response?.data) ? response.data : response?.data?.data;
      setProspectosCompatibles((prev) => ({
        ...prev,
        [propiedadId]: Array.isArray(data) ? data : []
      }));
    } catch (err) {
      setProspectosError((prev) => ({
        ...prev,
        [propiedadId]: err?.message || 'Error al cargar prospectos compatibles.'
      }));
    } finally {
      setProspectosLoading((prev) => ({ ...prev, [propiedadId]: false }));
    }
  };

  const handleOcultarProspectos = (event, propiedadId) => {
    event.stopPropagation();
    setPropiedadProspectosActiva((prev) => (prev === propiedadId ? null : prev));
  };

  const handleOpenProspectoModal = (prospecto) => {
    setSelectedProspecto(prospecto);
    setModalProspectoOpen(true);
  };

  const handleCloseProspectoModal = () => {
    setModalProspectoOpen(false);
    setSelectedProspecto(null);
  };

  const handleWhatsAppContact = (prospecto) => {
    const phoneNumber = prospecto?.telefono?.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    if (phoneNumber) {
      const message = encodeURIComponent(`Hola ${prospecto?.nombre || ''}, te contacto desde la inmobiliaria regarding tu búsqueda de propiedad.`);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      showError('El prospecto no tiene un número de teléfono válido.');
    }
  };

  const eliminarPropiedad = async (id) => {
    const result = await showConfirm({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      confirmText: 'Sí, ¡elimínala!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/propiedad/delete/${id}`);
        await Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Propiedad eliminada',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-smaller-toast',
            backgroundColor:"background.default",
            color:"rgb(99, 14, 173)"
          }
        });

        setPropiedades((prevPropiedades) => 
          prevPropiedades.filter((propiedad) => propiedad.id !== id)
        );
      } catch (error) {
        console.error("Error al eliminar propiedad: ", error.response ? error.response.data : error.message);
          showError('No se pudo eliminar la propiedad.');
      }
    }
  };

  const propiedadesFiltradas = useMemo(() => {
    if (!propiedades || !Array.isArray(propiedades)) {
      return [];
    }

    // Primero, filtra por término de búsqueda para reducir el número de iteraciones
    let filtered = propiedades.filter(propiedad => {
      // Asegurarse de que la propiedad no sea nula
      if (!propiedad) return false;

      if (!searchTerm) return true;

      const searchTermLower = searchTerm.toLowerCase();
      const { direccion = '', tipo = '', localidad = '' } = propiedad;
      
      // Usar `propietarioSalidaDto` que es el que se usa en el modal
      const propietarioNombre = propiedad.propietarioSalidaDto
        ? `${propiedad.propietarioSalidaDto.nombre} ${propiedad.propietarioSalidaDto.apellido}`
        : '';

      return (
        direccion.toLowerCase().includes(searchTermLower) ||
        tipo.toLowerCase().includes(searchTermLower) ||
        localidad.toLowerCase().includes(searchTermLower) ||
        propietarioNombre.toLowerCase().includes(searchTermLower)
      );
    });

    // Aplicar filtros adicionales
    filtered = filtered.filter(propiedad => {
      // Filtro por estado (libre/alquilado)
      if (filtroEstado) {
        const estado = propiedad.disponibilidad ? 'libre' : 'alquilado';
        if (estado !== filtroEstado) return false;
      }

      // Filtro por barrio (localidad)
      if (filtroBarrio) {
        if (!propiedad.localidad || !propiedad.localidad.toLowerCase().includes(filtroBarrio.toLowerCase())) {
          return false;
        }
      }

      // Filtro por precio mínimo
      if (filtroPrecioMin && propiedad.precio) {
        if (propiedad.precio < parseFloat(filtroPrecioMin)) return false;
      }

      // Filtro por precio máximo
      if (filtroPrecioMax && propiedad.precio) {
        if (propiedad.precio > parseFloat(filtroPrecioMax)) return false;
      }

      return true;
    });

    return filtered;

  }, [propiedades, searchTerm, filtroEstado, filtroBarrio, filtroPrecioMin, filtroPrecioMax]);

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroBarrio('');
    setFiltroPrecioMin('');
    setFiltroPrecioMax('');
    setPage(1); // Resetear a la primera página
  };

  // Obtener lista única de barrios para el filtro
  const barriosUnicos = useMemo(() => {
    if (!propiedades || !Array.isArray(propiedades)) return [];
    const barrios = [...new Set(propiedades.map(p => p.localidad).filter(Boolean))];
    return barrios.sort();
  }, [propiedades]);

  // Calcular propiedades paginadas
  const propiedadesPaginadas = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return propiedadesFiltradas.slice(startIndex, endIndex);
  }, [propiedadesFiltradas, page, itemsPerPage]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(propiedadesFiltradas.length / itemsPerPage);
  }, [propiedadesFiltradas, itemsPerPage]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [filtroEstado, filtroBarrio, filtroPrecioMin, filtroPrecioMax]);

  // Manejar el cambio de página
  const goPrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goNextPage = () => {
    setPage((p) => Math.min(totalPages || 1, p + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler para borrar imagen usando la API
  const handleDeleteImagen = async (img, idx) => {
    if (!propiedadImagenesId || !img?.idImage) return;
    const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar esta imagen?');
    if (!confirmDelete) return;
    setUploadingId(propiedadImagenesId + '-delete');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/propiedad/${propiedadImagenesId}/imagenes/${img.idImage}`);
      setImagenesPropiedad(prev => prev.filter((_, i) => i !== idx));
      if (typeof fetchPropiedades === 'function') fetchPropiedades();
    } catch (err) {
      // Manejo de error opcional
    } finally {
      setUploadingId(null);
    }
  };


  // Handler para subir imagen desde el modal
  const handleUploadImagen = async (file) => {
    if (!propiedadImagenesId || !file) return;
    setUploadingId(propiedadImagenesId);
    try {
      const formData = new FormData();
      formData.append('files', file);
      await axios.post(`${import.meta.env.VITE_API_URL}/propiedad/${propiedadImagenesId}/imagenes`, formData);
      // Recargar imágenes de la propiedad
      const prop = propiedades.find(p => p.id === propiedadImagenesId);
      if (prop) {
        // Idealmente deberías recargar desde la API, aquí solo simulo agregando la imagen
        // Si la API responde con la nueva imagen, puedes actualizar el estado aquí
      }
      if (typeof fetchPropiedades === 'function') fetchPropiedades();
    } catch (err) {
      // Manejo de error opcional
    } finally {
      setUploadingId(null);
    }
  };

  // Handler para compartir propiedad
  const handleSharePropiedad = async (propiedad) => {
    try {
      // Crear texto con toda la información de la propiedad
      const propiedadInfo = `🏠 PROPIEDAD DISPONIBLE

📍 Dirección: ${propiedad.direccion}
🌆 Localidad: ${propiedad.localidad}
🗺️ Partido: ${propiedad.partido}, ${propiedad.provincia}
👤 Agente: ${propiedad.usuarioDtoSalida ? propiedad.usuarioDtoSalida.username : 'No asignado'}
🏷️ Tipo: ${propiedad.tipo || propiedad.tipoPropiedad || 'No especificado'}
✅ Estado: ${propiedad.disponibilidad ? 'Disponible' : 'Alquilado'}

${propiedad.inventario ? `📝 Inventario: ${propiedad.inventario}` : ''}`;


      // Preguntar qué quiere compartir
      const result = await Swal.fire({
        title: '¿Cómo quieres compartir?',
        text: propiedad.imagenes && propiedad.imagenes.length > 0 ? 
          `Se encontraron ${propiedad.imagenes.length} imagen(es)` : 
          'No hay imágenes disponibles',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: propiedad.imagenes && propiedad.imagenes.length > 0,
        confirmButtonText: 'Solo texto',
        denyButtonText: 'Texto + Imágenes',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        denyButtonColor: '#007bff',
        cancelButtonColor: '#6c757d'
      });

      if (result.isConfirmed) {
        // Solo texto
        if (navigator.share) {
          await navigator.share({
            title: `Propiedad en ${propiedad.direccion}`,
            text: propiedadInfo
          });
        } else {
          await navigator.clipboard.writeText(propiedadInfo);
          Swal.fire({
            icon: 'success',
            title: '¡Texto copiado!',
            text: 'La información se copió al portapapeles',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else if (result.isDenied) {
        // Texto + Imágenes
        try {
          // Primero compartir solo el texto
          await navigator.share({
            title: `Propiedad en ${propiedad.direccion}`,
            text: propiedadInfo
          });

          // Luego preguntar si quiere compartir las imágenes por separado
          const shareImages = await Swal.fire({
            title: 'Compartir imágenes',
            text: '¿Quieres compartir las imágenes por separado?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, compartir imágenes',
            cancelButtonText: 'No, solo el texto'
          });

          if (shareImages.isConfirmed) {
            const imageFiles = [];
            for (let i = 0; i < propiedad.imagenes.length; i++) { // Compartir todas las imágenes
              const imagen = propiedad.imagenes[i];
              if (imagen?.imageUrl) {
                try {
                  const response = await fetch(imagen.imageUrl);
                  const blob = await response.blob();
                  const file = new File([blob], `propiedad_${i + 1}.jpg`, { type: blob.type });
                  imageFiles.push(file);
                } catch (error) {
                }
              }
            }
            
            if (imageFiles.length > 0) {
              await navigator.share({
                title: `Imágenes - ${propiedad.direccion}`,
                files: imageFiles
              });
            }
          }
        } catch (shareError) {
          // Fallback: copiar texto al portapapeles
          await navigator.clipboard.writeText(propiedadInfo);
            Swal.fire({
            icon: 'info',
            title: 'Texto copiado',
            text: 'No se pudo usar el compartir nativo. El texto se copió al portapapeles.',
            timer: 3000
          });
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir:', error);
        showError('No se pudo compartir la propiedad');
      }
    }
  };
useEffect(() => {
}, [propiedades]);
  return (
    <>
    <PropertiesTour />
<ModalImagenesPropiedad
  open={modalImagenesOpen}
  onClose={() => setModalImagenesOpen(false)}
  imagenes={imagenesPropiedad}
  onDelete={handleDeleteImagen}
  onUpload={handleUploadImagen}
  uploading={uploadingId === propiedadImagenesId}
/>
      {/* Input file oculto global */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {/* Mensaje de feedback */}
      {uploadMsg && (
        <Box sx={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: 2, color: 'text.primary' }}>
          {uploadMsg}
        </Box>
      )}

    <Box sx={{ 
      width: { xs: '100%', md: 'calc(100% - 15rem)' },
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 14, sm: 12 },
      px: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      marginLeft: { md: '15rem' },
      boxSizing: 'border-box',
    }}>
      <Box 
        sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', md: 1200 },
          mt: { xs: '4rem', sm: 0 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 2 }
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
            <Box>
              <Typography 
                data-tour="propiedades-title"
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Propiedades
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                Gestiona tu cartera de propiedades
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Añadir propiedad">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              data-tour="propiedades-add"
              onClick={() => navigate('/nueva-propiedad')}
                sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
          }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          gap: 1.5, 
          width: '100%', 
          mb: 2.5,
          flexWrap: 'wrap',
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              minWidth: { xs: 100, sm: 140 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <BusinessIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {propiedadesFiltradas.length}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, textAlign: 'center', fontSize: '0.7rem' }}>
              Total
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              minWidth: { xs: 100, sm: 140 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {propiedadesFiltradas.filter(p => p.disponibilidad).length}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, textAlign: 'center', fontSize: '0.7rem' }}>
              Disponibles
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              minWidth: { xs: 100, sm: 140 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <HomeIcon sx={{ fontSize: 24, opacity: 0.9 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {propiedadesFiltradas.filter(p => !p.disponibilidad).length}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, textAlign: 'center', fontSize: '0.7rem' }}>
              Alquiladas
            </Typography>
          </Paper>
        </Box>
        
        <TextField
          data-tour="propiedades-search"
          placeholder="Buscar por dirección, tipo, propietario..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 2,
            width: '100%',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
            borderRadius: 6, '& fieldset': { borderRadius: 6 },
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

        {/* Filtros avanzados */}
        <Accordion 
          expanded={showFilters} 
          onChange={() => setShowFilters(!showFilters)}
          sx={{ 
            mb: 3, 
            borderRadius: 4,
            width: '100%',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Filtros avanzados
            </Typography>
            {(filtroEstado || filtroBarrio || filtroPrecioMin || filtroPrecioMax) && (
              <Chip 
                label="Activos" 
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              <Grid2 item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filtroEstado}
                    label="Estado"
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    sx={{borderRadius:"25px", width:{xs:"7rem", sm:"10rem"} }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="libre">Libre</MenuItem>
                    <MenuItem value="alquilado">Alquilado</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
              
              <Grid2 item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Barrio</InputLabel>
                  <Select
                    value={filtroBarrio}
                    label="Barrio"
                    onChange={(e) => setFiltroBarrio(e.target.value)}
                      sx={{borderRadius:"25px", width:{xs:"7rem", sm:"10rem"} }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {barriosUnicos.map((barrio) => (
                      <MenuItem key={barrio} value={barrio}>
                        {barrio}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
                 <Grid2 sx={{display:"flex",  gap:"1rem"}}>
                    <Grid2 item xs={12} sm={6} md={3}>
                      <NumericFormat
                        size="small"
                        label="Precio mínimo"
                        type="text"
                        value={filtroPrecioMin}
                        onValueChange={(values) => {
                          setFiltroPrecioMin(values.value);
                        }}
                        customInput={TextField}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        sx={{
                          width: { xs: "9rem", sm: "13rem" },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Grid2>
              <Grid2 item xs={12} sm={6} md={3}>
                <NumericFormat
                  size="small"
                  label="Precio máximo"
                  type="text"
                  value={filtroPrecioMax}
                  onValueChange={(values) => {
                    setFiltroPrecioMax(values.value);
                  }}
                  customInput={TextField}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  sx={{
                    width: { xs: "9rem", sm: "13rem" },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                    },
                  }}
                />
              </Grid2>
                </Grid2>
              
              <Grid2 item xs={12} sx={{display:"flex", flexDirection:"column", gap:".5rem"}}>
                <Button 
                  variant="contained" 
                  onClick={limpiarFiltros}
                  sx={{ 
                    mr: 2,
                    borderRadius: "25px", 
                    width: {xs: "10rem", sm: "13rem"},
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(27, 25, 95, 0.9)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(175, 26, 26, 0.8)',
                    }
                  }}
                >
                  Limpiar filtros
                </Button>
                <Typography variant="body2" color="text.secondary" component="span" sx={{marginLeft:".4rem"}}>
                  {propiedadesFiltradas.length} propiedades encontradas
                </Typography>
              </Grid2>
            </Grid2>
          </AccordionDetails>
        </Accordion>

        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            {isMobile ? (
              <Box sx={{
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid2
                  container
                  spacing={2}
                  sx={{
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    ml: { xs: 0, sm: -2 }
                  }}
                >
                  {Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <Grid2 item key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card
                        sx={{
                          mb: 2,
                          width: { xs: '19rem', sm: '20rem' },
                          height: { sm: "26rem" },
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '8px',
                            height: '100%',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
                          }}
                        />

                        <Box sx={{ width: '100%', height: 160, position: 'relative' }}>
                          <Skeleton variant="rectangular" width="100%" height="100%" />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, ml: 2 }}>
                          <Skeleton variant="circular" width={24} height={24} />
                          <Skeleton variant="text" width="40%" />
                          <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 999, ml: 2 }} />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, px: 2, pb: 2 }}>
                          {Array.from({ length: 4 }).map((__, lineIdx) => (
                            <Skeleton key={lineIdx} variant="text" width={lineIdx === 0 ? '90%' : '75%'} />
                          ))}
                        </Box>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              </Box>
            ) : (
              <Box sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}>
                  {Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <Box key={idx} sx={{ width: { xs: "100%", sm: "100%", md: "100%" } }}>
                      <Card
                        sx={{
                          mb: 2,
                          width: { xs: "100%", sm: "100%", md: "100%" },
                          height: '23rem',
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '8px',
                            height: '100%',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
                          }}
                        />

                        <Box sx={{ width: '100%', height: 160, position: 'relative' }}>
                          <Skeleton variant="rectangular" width="100%" height="100%" />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, ml: 2 }}>
                          <Skeleton variant="circular" width={22} height={22} />
                          <Skeleton variant="text" width="45%" />
                          <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 999, ml: 2 }} />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, px: 2, pb: 2 }}>
                          {Array.from({ length: 4 }).map((__, lineIdx) => (
                            <Skeleton key={lineIdx} variant="text" width={lineIdx === 0 ? '90%' : '75%'} />
                          ))}
                        </Box>
                      </Card>
                    </Box>
                  ))}
              </Box>
            )}
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
                  <Box sx={{ width: '100%' }}>
                      {propiedadesPaginadas.map((propiedad, index) => {
                        const isCompact = propiedadProspectosActiva === propiedad?.id;
                        const prospectos = prospectosCompatibles[propiedad?.id] || [];
                        const isLoadingProspectos = prospectosLoading[propiedad?.id];
                        const errorProspectos = prospectosError[propiedad?.id];
                        
                        const gradientColors = [
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        ];
                        const gradient = gradientColors[(propiedad?.id || 0) % gradientColors.length];
                        const hasImage = Array.isArray(propiedad.imagenes) && propiedad.imagenes.length > 0 && propiedad.imagenes[0]?.imageUrl;
                        
                        return (
  <Box key={propiedad?.id || `fallback-${Math.random()}`} sx={{ mb: 2 }}>
    <Paper
      data-tour={index === 0 ? 'propiedades-card' : undefined}
      elevation={0}
      onClick={() => {
        setSelectedPropiedad(propiedad);
        setModalOpen(true);
      }}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.3)' 
            : '0 8px 32px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      {/* Status indicator bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 6,
          height: '100%',
          bgcolor: propiedad.disponibilidad ? 'success.main' : 'error.main',
          zIndex: 1,
        }}
      />

      {/* Image section */}
      <Box sx={{ 
        position: 'relative', 
        height: 140,
        background: hasImage ? 'none' : gradient,
      }}>
        {uploadingId === propiedad.id && (
          <Box sx={{ 
            position: 'absolute', 
            inset: 0, 
            bgcolor: 'rgba(255,255,255,0.7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10 
          }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {hasImage ? (
          <img
            src={propiedad.imagenes[0].imageUrl}
            alt={propiedad.direccion}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            <HomeIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)', mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Sin imagen
            </Typography>
          </Box>
        )}

        {/* Action buttons on image */}
        <Box sx={{ position: 'absolute', top: 8, left: 12, display: 'flex', gap: 0.75, zIndex: 2 }}>
          <Tooltip title="Eliminar" arrow>
            <IconButton
              data-tour={index === 0 ? 'propiedades-card-delete' : undefined}
              size="small"
              onClick={(e) => { e.stopPropagation(); eliminarPropiedad(propiedad.id); }}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'error.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease',
              }}
            >
              <DeleteForeverIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); navigate(`/propiedades/editar/${propiedad.id}`); }}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease',
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ position: 'absolute', top: 8, right: 12, display: 'flex', gap: 0.75, zIndex: 2 }}>
          <Tooltip title="Agregar imagen" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleAddImageClick(propiedad.id); }}
              disabled={uploadingId === propiedad.id}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'info.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease',
              }}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Compartir" arrow>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleSharePropiedad(propiedad); }}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'success.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease',
              }}
            >
              <ShareIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Status chip */}
        <Chip
          icon={propiedad.disponibilidad ? <CheckCircleIcon /> : <CancelIcon />}
          label={propiedad.disponibilidad ? 'Disponible' : 'Alquilado'}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 12,
            bgcolor: propiedad.disponibilidad ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            '& .MuiChip-icon': { color: 'white' },
          }}
        />
      </Box>

      {/* Content section */}
      <Box sx={{ p: 2, pl: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
            {propiedad.tipoPropiedad || propiedad.tipo || 'Propiedad'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          {propiedad.direccion}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {propiedad.localidad}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
            <MapIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {propiedad.partido}, {propiedad.provincia}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {propiedad.usuarioDtoSalida?.username || 'Sin propietario'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={(e) => handleBuscarProspectos(e, propiedad.id)}
          sx={{ 
            mt: 1.5, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          Buscar prospectos
        </Button>
      </Box>
    </Paper>
                              <Collapse in={isCompact} timeout="auto" unmountOnExit>
                                <Box sx={{
                                  mt: 1,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                                  boxShadow: theme.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.2)' : '0 6px 12px rgba(0,0,0,0.08)'
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      Prospectos compatibles
                                    </Typography>
                                    <Button size="small" onClick={(e) => handleOcultarProspectos(e, propiedad.id)}>
                                      Ocultar
                                    </Button>
                                  </Box>
                                  {isLoadingProspectos ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                      <CircularProgress size={24} />
                                    </Box>
                                  ) : errorProspectos ? (
                                    <Typography variant="body2" color="error">
                                      {errorProspectos}
                                    </Typography>
                                  ) : prospectos.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {prospectos.map((prospecto) => {
                                        const nombreCompleto = `${prospecto?.nombre || ''} ${prospecto?.apellido || ''}`.trim() || 'Sin nombre';
                                        const zonas = Array.isArray(prospecto?.zonaPreferencia) 
                                          ? prospecto.zonaPreferencia.join(', ') 
                                          : prospecto?.zonaPreferencia || 'Sin zona preferida';
                                        
                                        return (
                                          <Card
                                            key={prospecto?.id || nombreCompleto}
                                            onClick={() => handleOpenProspectoModal(prospecto)}
                                            sx={{
                                              cursor: 'pointer',
                                              transition: 'all 0.2s ease',
                                              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                              '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.palette.mode === 'dark' 
                                                  ? '0 8px 25px rgba(0,0,0,0.3)' 
                                                  : '0 8px 20px rgba(0,0,0,0.12)',
                                                borderColor: 'primary.main',
                                              }
                                            }}
                                          >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                  src={prospecto?.logo}
                                                  sx={{ 
                                                    bgcolor: 'primary.main',
                                                    width: 48,
                                                    height: 48,
                                                    flexShrink: 0
                                                  }}
                                                >
                                                  <PersonIcon />
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {nombreCompleto}
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                    {prospecto?.email && (
                                                      <Chip
                                                        icon={<EmailIcon sx={{ fontSize: 14 }} />}
                                                        label={prospecto.email}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                      />
                                                    )}
                                                    {prospecto?.telefono && (
                                                      <Chip
                                                        icon={<PhoneIcon sx={{ fontSize: 14 }} />}
                                                        label={prospecto.telefono}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                      />
                                                    )}
                                                  </Box>
                                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    <Chip
                                                      icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                                      label={zonas}
                                                      size="small"
                                                      color="primary"
                                                      variant="filled"
                                                      sx={{ fontSize: '0.75rem' }}
                                                    />
                                                    {prospecto?.rangoPrecioMin && (
                                                      <Chip
                                                        icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                                                        label={`$${prospecto.rangoPrecioMin.toLocaleString()}`}
                                                        size="small"
                                                        color="success"
                                                        variant="filled"
                                                        sx={{ fontSize: '0.75rem' }}
                                                      />
                                                    )}
                                                    {prospecto?.cantidadAmbientes && (
                                                      <Chip
                                                        icon={<HomeIcon sx={{ fontSize: 14 }} />}
                                                        label={`${prospecto.cantidadAmbientes} amb`}
                                                        size="small"
                                                        color="info"
                                                        variant="filled"
                                                        sx={{ fontSize: '0.75rem' }}
                                                      />
                                                    )}
                                                  </Box>
                                                </Box>
                                              </Box>
                                            </CardContent>
                                          </Card>
                                        );
                                      })}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No hay prospectos compatibles.
                                    </Typography>
                                  )}
                                </Box>
                              </Collapse>
                            </Box>
                        );
                      })}
                  </Box>
                ) : (
                  <Box sx={{ 
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}>
                      {propiedadesPaginadas.map((propiedad, index) => {
                        const isCompact = propiedadProspectosActiva === propiedad?.id;
                        const prospectos = prospectosCompatibles[propiedad?.id] || [];
                        const isLoadingProspectos = prospectosLoading[propiedad?.id];
                        const errorProspectos = prospectosError[propiedad?.id];
                        return (
                          <Box key={propiedad?.id || `fallback-${Math.random()}` } sx={{ width: {xs:"100%",sm:"100%", md:"100%"}}}>
                            <Card
                              data-tour={index === 0 ? 'propiedades-card' : undefined}
                              sx={{
                                mb: 1,
                                width: {xs:"100%", sm:"100%", md:"100%"},
                                height: isCompact ? '14.5rem' : '26rem',
                                borderRadius: 3,
                                overflow: 'hidden',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                                transition: 'transform 0.2s, box-shadow 0.2s, height 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.3)' : '0 12px 16px rgba(0,0,0,0.1)',
                                },
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                setSelectedPropiedad(propiedad);
                                setModalOpen(true);
                              }}
                            >
                              {/* Barra de estado */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  width: '8px',
                                  height: '100%',
                                  bgcolor: propiedad.disponibilidad ? 'success.main' : 'error.main',
                                }}
                              />
                              {/* Imagen principal */}
                              <Box sx={{ width: '100%', height: 160, bgcolor: '#f8fafc', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {/* Botón eliminar propiedad */}
                                <Tooltip title="Eliminar propiedad">
                                  <span>
                                    <IconButton
                                      data-tour={index === 0 ? 'propiedades-card-delete' : undefined}
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        bgcolor: 'rgba(255,255,255,0.7)',
                                        boxShadow: 1,
                                        zIndex: 2,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarPropiedad(propiedad.id);
                                      }}
                                    >
                                      <DeleteForeverIcon color="error" fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                {/* Botón agregar imagen */}
                                <Tooltip title="Agregar imagen">
                                  <span>
                                    <IconButton
                                      data-tour={index === 0 ? 'propiedades-card-addimg' : undefined}
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(255,255,255,0.7)',
                                        boxShadow: 1,
                                        zIndex: 2,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddImageClick(propiedad.id);
                                      }}
                                      disabled={uploadingId === propiedad.id}
                                    >
                                      <AddPhotoAlternateIcon color="primary" fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                {/* Input file oculto global */}
                                {uploadingId === propiedad.id && (
                                  <Box sx={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', bgcolor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                                    <CircularProgress size={32} />
                                  </Box>
                                )}
                                {Array.isArray(propiedad.imagenes) && propiedad.imagenes.length > 0 && propiedad.imagenes[0]?.imageUrl ? (
                                  <img
                                    src={propiedad.imagenes[0].imageUrl}
                                    alt={propiedad.direccion}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Box sx={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    bgcolor: '#e5e7eb',
                                    color: '#6b7280'
                                  }}>
                                    <HomeIcon sx={{ fontSize: 48, mb: 1, color: '#9ca3af' }} />
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                      Sin imagen
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              {/* Dirección visible en estado compacto */}
                              <Box sx={{ px: 2, pt: 2, pb: 1, height:"2rem"}}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <HomeIcon fontSize="small" />
                                  {propiedad.direccion}
                                </Typography>
                              </Box>
                              <Collapse in={!isCompact} timeout="auto" unmountOnExit>
                                {/* Header con icono y tipo */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 2 }}>
                                  <HomeIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
                                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem',md:".8rem" } }}>
                                    {propiedad.tipoPropiedad || propiedad.tipo}
                                  </Typography>
                                  <Chip
                                    icon={propiedad.disponibilidad ? <CheckCircleIcon /> : <CancelIcon />}
                                    label={propiedad.disponibilidad ? 'libre' : 'Alquilado'}
                                    color={propiedad.disponibilidad ? 'success' : 'warning'}
                                    size="small"
                                    sx={{ fontWeight: 500, ml: 2 }}
                                  />
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                {/* Info organizada con iconos */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, px: 2, pb: 2 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
                                  >
                                    <LocationOnIcon fontSize="small" />
                                    {propiedad.localidad}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
                                  >
                                    <MapIcon fontSize="small" />
                                    {propiedad.partido}, {propiedad.provincia}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
                                  >
                                    <PersonIcon fontSize="small" />
                                    {propiedad.usuarioDtoSalida
                                      ? `${propiedad.usuarioDtoSalida.username}`
                                      : 'No asignado'}
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => handleBuscarProspectos(e, propiedad.id)}
                                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                                  >
                                    Buscar prospectos compatibles
                                  </Button>
                                </Box>
                              </Collapse>
                            </Card>
                            <Collapse in={isCompact} timeout="auto" unmountOnExit>
                              <Box sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                                boxShadow: theme.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.2)' : '0 6px 12px rgba(0,0,0,0.08)'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Prospectos compatibles
                                  </Typography>
                                  <Button size="small" onClick={(e) => handleOcultarProspectos(e, propiedad.id)}>
                                    Ocultar
                                  </Button>
                                </Box>
                                {isLoadingProspectos ? (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                  </Box>
                                ) : errorProspectos ? (
                                  <Typography variant="body2" color="error">
                                    {errorProspectos}
                                  </Typography>
                                ) : prospectos.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {prospectos.map((prospecto) => {
                                      const nombreCompleto = `${prospecto?.nombre || ''} ${prospecto?.apellido || ''}`.trim() || 'Sin nombre';
                                      const zonas = Array.isArray(prospecto?.zonaPreferencia) 
                                        ? prospecto.zonaPreferencia.join(', ') 
                                        : prospecto?.zonaPreferencia || 'Sin zona preferida';
                                      
                                      return (
                                        <Card
                                          key={prospecto?.id || nombreCompleto}
                                          onClick={() => handleOpenProspectoModal(prospecto)}
                                          sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                            '&:hover': {
                                              transform: 'translateY(-2px)',
                                              boxShadow: theme.palette.mode === 'dark' 
                                                ? '0 8px 25px rgba(0,0,0,0.3)' 
                                                : '0 8px 20px rgba(0,0,0,0.12)',
                                              borderColor: 'primary.main',
                                            }
                                          }}
                                        >
                                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <Avatar
                                                src={prospecto?.logo}
                                                sx={{ 
                                                  bgcolor: 'primary.main',
                                                  width: 48,
                                                  height: 48
                                                }}
                                              >
                                                <PersonIcon />
                                              </Avatar>
                                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                  {nombreCompleto}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                  {prospecto?.email && (
                                                    <Chip
                                                      icon={<EmailIcon sx={{ fontSize: 14 }} />}
                                                      label={prospecto.email}
                                                      size="small"
                                                      variant="outlined"
                                                      sx={{ fontSize: '0.75rem' }}
                                                    />
                                                  )}
                                                  {prospecto?.telefono && (
                                                    <Chip
                                                      icon={<PhoneIcon sx={{ fontSize: 14 }} />}
                                                      label={prospecto.telefono}
                                                      size="small"
                                                      variant="outlined"
                                                      sx={{ fontSize: '0.75rem' }}
                                                    />
                                                  )}
                                                </Box>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                  <Chip
                                                    icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                                    label={zonas}
                                                    size="small"
                                                    color="primary"
                                                    variant="filled"
                                                    sx={{ fontSize: '0.75rem' }}
                                                  />
                                                  {prospecto?.rangoPrecioMin && (
                                                    <Chip
                                                      icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                                                      label={`$${prospecto.rangoPrecioMin.toLocaleString()} - $${prospecto.rangoPrecioMax?.toLocaleString() || 'N/A'}`}
                                                      size="small"
                                                      color="success"
                                                      variant="filled"
                                                      sx={{ fontSize: '0.75rem' }}
                                                    />
                                                  )}
                                                  {prospecto?.cantidadAmbientes && (
                                                    <Chip
                                                      icon={<HomeIcon sx={{ fontSize: 14 }} />}
                                                      label={`${prospecto.cantidadAmbientes} amb`}
                                                      size="small"
                                                      color="info"
                                                      variant="filled"
                                                      sx={{ fontSize: '0.75rem' }}
                                                    />
                                                  )}
                                                </Box>
                                              </Box>
                                            </Box>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay prospectos compatibles.
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })}
                  </Box>
                )}
              </>
            )}
            
            {/* Componente de paginación */}
            {propiedadesFiltradas.length > 0 && (
              <Box sx={{ 
                mt: 4,
                mb: 6, 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%'
              }}>
                <Pagination
                  count={totalPages || 1}
                  page={page}
                  onChange={(_, p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  color="primary"
                  siblingCount={0}
                  boundaryCount={0}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    {/* Modal de detalle de propiedad */}
    <ModalPropiedad
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      propiedad={selectedPropiedad}
    />

    {/* Modal de detalles del prospecto */}
    <Modal
      open={modalProspectoOpen}
      onClose={handleCloseProspectoModal}
      aria-labelledby="prospecto-modal-title"
      aria-describedby="prospecto-modal-description"
    >
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 -10px 40px rgba(0,0,0,0.4)' 
          : '0 -10px 30px rgba(0,0,0,0.2)',
        outline: 'none',
        animation: 'slideUp 0.3s ease-out',
        '@keyframes slideUp': {
          from: {
            transform: 'translateY(100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
      }}>
        {/* Barra indicadora de arrastre */}
        <Box sx={{
          width: '40px',
          height: '4px',
          bgcolor: 'text.secondary',
          borderRadius: 2,
          mx: 'auto',
          mt: 1,
          mb: 2,
          opacity: 0.3
        }} />
        
        {selectedProspecto && (
          <>
            {/* Header del modal */}
            <Box sx={{
              p: 3,
              borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.dark}05)`,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={selectedProspecto?.logo}
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 64,
                      height: 64,
                      border: `3px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography id="prospecto-modal-title" variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {`${selectedProspecto?.nombre || ''} ${selectedProspecto?.apellido || ''}`.trim() || 'Sin nombre'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prospecto inmobiliario
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedProspecto?.telefono && (
                    <Tooltip title="Contactar por WhatsApp">
                      <IconButton 
                        onClick={() => handleWhatsAppContact(selectedProspecto)}
                        sx={{ 
                          bgcolor: '#25D366',
                          color: 'white',
                          '&:hover': { 
                            bgcolor: '#128C7E',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton onClick={handleCloseProspectoModal} sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Contenido del modal */}
            <Box sx={{ p: 3 }}>
              {/* Información de contacto */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Información de Contacto
                </Typography>
                <Grid2 container spacing={2}>
                  {selectedProspecto?.email && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <EmailIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedProspecto.email}</Typography>
                        </Box>
                      </Box>
                    </Grid2>
                  )}
                  {selectedProspecto?.telefono && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <PhoneIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedProspecto.telefono}</Typography>
                        </Box>
                      </Box>
                    </Grid2>
                  )}
                </Grid2>
              </Box>

              {/* Preferencias de búsqueda */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon color="primary" />
                  Preferencias de Búsqueda
                </Typography>
                <Grid2 container spacing={2}>
                  {selectedProspecto?.zonaPreferencia && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16 }} />
                          Zonas Preferidas
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.isArray(selectedProspecto.zonaPreferencia) 
                            ? selectedProspecto.zonaPreferencia.map((zona, index) => (
                                <Chip key={index} label={zona} size="small" color="primary" variant="filled" />
                              ))
                            : <Chip label={selectedProspecto.zonaPreferencia} size="small" color="primary" variant="filled" />
                          }
                        </Box>
                      </Box>
                    </Grid2>
                  )}
                  {selectedProspecto?.cantidadAmbientes && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <HomeIcon sx={{ fontSize: 16 }} />
                          Ambientes
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedProspecto.cantidadAmbientes} ambientes
                        </Typography>
                      </Box>
                    </Grid2>
                  )}
                  {selectedProspecto?.rangoPrecioMin && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoneyIcon sx={{ fontSize: 16 }} />
                          Rango de Precio
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ${selectedProspecto.rangoPrecioMin.toLocaleString()} - ${selectedProspecto.rangoPrecioMax?.toLocaleString() || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid2>
                  )}
                  
                  {selectedProspecto?.cantidadPersonas && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Personas
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedProspecto.cantidadPersonas} personas
                        </Typography>
                      </Box>
                    </Grid2>
                  )}
                </Grid2>
              </Box>

              {/* Amenities */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Amenities Preferidos</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProspecto?.cochera && (
                    <Chip label="Cochera" color="success" variant="filled" size="small" />
                  )}
                  {selectedProspecto?.patio && (
                    <Chip label="Patio" color="success" variant="filled" size="small" />
                  )}
                  {selectedProspecto?.jardin && (
                    <Chip label="Jardín" color="success" variant="filled" size="small" />
                  )}
                  {selectedProspecto?.pileta && (
                    <Chip label="Pileta" color="success" variant="filled" size="small" />
                  )}
                  {!selectedProspecto?.cochera && !selectedProspecto?.patio && !selectedProspecto?.jardin && !selectedProspecto?.pileta && (
                    <Typography variant="body2" color="text.secondary">Sin preferencias específicas</Typography>
                  )}
                </Box>
              </Box>

              {/* Información de la inmobiliaria */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  Información de la Inmobiliaria
                </Typography>
                <Grid2 container spacing={2}>
                  {selectedProspecto?.nombreNegocio && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Nombre</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedProspecto.nombreNegocio}</Typography>
                        </Box>
                      </Box>
                    </Grid2>
                  )}
                  {selectedProspecto?.telefonoUsuario && (
                    <Grid2 item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Contacto</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedProspecto.telefonoUsuario}</Typography>
                        </Box>
                      </Box>
                    </Grid2>
                  )}
                </Grid2>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Modal>
    </Box>

   
     </>
  );
};

export default PropiedadesPage;
