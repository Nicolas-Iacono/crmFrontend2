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
  CardMedia
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
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import "../styles/garantesPage.css";
import PropertiesTour from '../common/tour/PropertiesTour';
import http from '../api/http';
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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

  const eliminarPropiedad = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡elimínala!',
      cancelButtonText: 'Cancelar'
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
    const filteredBySearch = propiedades.filter(propiedad => {
      // Asegurarse de que la propiedad no sea nula
      if (!propiedad) return false;

      if (!searchTerm) return true;

      const searchTermLower = searchTerm.toLowerCase();
      const { direccion = '', tipoPropiedad = '', localidad = '' } = propiedad;
      
      // Usar `propietarioSalidaDto` que es el que se usa en el modal
      const propietarioNombre = propiedad.propietarioSalidaDto
        ? `${propiedad.propietarioSalidaDto.nombre} ${propiedad.propietarioSalidaDto.apellido}`
        : '';

      return (
        direccion.toLowerCase().includes(searchTermLower) ||
        tipoPropiedad.toLowerCase().includes(searchTermLower) ||
        localidad.toLowerCase().includes(searchTermLower) ||
        propietarioNombre.toLowerCase().includes(searchTermLower)
      );
    });

    return filteredBySearch;

  }, [propiedades, searchTerm, user.name, user.authorities]);

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
      width: "100vw", 
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 8, sm: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: 'background.default',
      marginTop:{ xs: '0', sm: "0", md: "2rem" },
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
              data-tour="propiedades-title"
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
              data-tour="propiedades-add"
              onClick={() => navigate('/nueva-propiedad')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          data-tour="propiedades-search"
          placeholder="Buscar por dirección, tipo, propietario..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            width: { xs: '100%', sm: '100%' },
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
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Grid2 
                      container 
                      spacing={2} 
                      sx={{ 
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        ml: { xs: -1, sm: -2 }
                      }}
                    >
                      {propiedadesPaginadas.map((propiedad, index) => (
  <Grid2 item key={propiedad?.id || `fallback-${Math.random()}`}>  
    <Card
      data-tour={index === 0 ? 'propiedades-card' : undefined}
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

        {/* Botón compartir propiedad */}
        <Tooltip title="Compartir propiedad">
          <span>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.7)',
                boxShadow: 1,
                zIndex: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSharePropiedad(propiedad);
              }}
            >
              <ShareIcon color="success" fontSize="small" />
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
      {/* Header con icono y tipo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, ml: 2 }}>
        <HomeIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
          <HomeIcon fontSize="small" />
          {propiedad.direccion}
        </Typography>
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
       
      </Box>
    </Card>
  </Grid2>
))}
                    </Grid2>
                  </Box>
                ) : (
                  <TableContainer component={Box} sx={{ 
                    width: '120%',
                    overflowX: 'auto',
                    borderRadius: 2,
                    padding:"1rem 2rem",
                    display:"flex",
                    flexDirection:"row",
                    alignItems:"start",
                    justifyContent:"flex-start",
                    flexWrap:"wrap",
                    gap:"1rem",
                      
                    backgroundColor:'background.default'
                  }}>
                    <Box sx={{ 
                    width: "100%", 
                    display: 'flex', 
                    justifyContent: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft:"2rem",

                  }}>
                    <Grid2 
                      container 
                      spacing={2} 
                      sx={{
                        width:"100%",
                        display:"flex",
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        flewWrap:"wrap",
                        ml: { xs: -1, sm: -2 },
                        gap: '1rem 4rem',
                        height: 'auto',
                      }}
                    >
                      {propiedadesPaginadas.map((propiedad, index) => (
                        <Grid2 item key={propiedad?.id || `fallback-${Math.random()}` } sx={{ width: '30%', display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          flexDirection:"column",
                          maxWidth:"40rem"
                          
                        }}>
                          <Card
                            data-tour={index === 0 ? 'propiedades-card' : undefined}
                            sx={{
                              mb: 2,
                              width: '68%',
                              minWidth: '20rem',
                              height: '23rem',
                              borderRadius: 3,
                              overflow: 'hidden',
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                              boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
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
                            {/* Header con icono y tipo */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, ml: 2 }}>
                              <HomeIcon color="primary" sx={{ fontSize: 24, mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
                                <HomeIcon fontSize="small" />
                                {propiedad.direccion}
                              </Typography>
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
                            </Box>
                          </Card>
                        </Grid2>
                      ))}
                    </Grid2>
                  </Box>
                </TableContainer>
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
                <Box sx={{ justifyContent: 'center', width: '100%', display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={goPrevPage} disabled={page <= 1} startIcon={<NavigateBeforeIcon />}>Prev</Button>
                  <Chip label={`${page} / ${totalPages || 1}`} sx={{ px: 1 }} />
                  <Button variant="outlined" onClick={goNextPage} disabled={page >= (totalPages || 1)} endIcon={<NavigateNextIcon />}>Next</Button>
                </Box>
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
    </Box>

   
     </>
  );
};

export default PropiedadesPage;
