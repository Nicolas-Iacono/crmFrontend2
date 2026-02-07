import React, { useEffect, useState } from 'react';
import Slide from '@mui/material/Slide';
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
  Collapse,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Checkbox,
  Switch,
  Pagination,
  Skeleton,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useMediaQuery } from '@mui/material';
import "../styles/garantesPage.css";
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import PlayerCard from '../common/cards/PlayerCard';
import { useAuth } from "../context/GlobalAuth";
import DocumentManagerModal from '../common/DocumentManagerModal';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import MobileGaranteCard from '../common/cards/MobileGaranteCard';

const GarantesPage = () => {
  const { usuarioFetch} = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [garantes, setGarantes] = useState({ data: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  // Documentos Garante
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsGaranteId, setDocsGaranteId] = useState(null);
  const [docsGaranteName, setDocsGaranteName] = useState('');
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    dni: '',
    cuit: '',
    direccionResidencial: '',
  });

  useEffect(() => {
    if (usuarioFetch) {
      setUser({
        name: usuarioFetch.username,
        authorities: usuarioFetch.authorities,
      });
    }
  }, [usuarioFetch]);

  const fetchGarantes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/garante/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (result && result.data) {
        // Handle both array response and nested data object
        const garantesArray = Array.isArray(result.data) ? result.data : 
        (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
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
    if (usuarioFetch && usuarioFetch.id) {
      fetchGarantes();
    }
  }, [usuarioFetch?.id]); // Ejecutar cuando el id del usuario esté disponible

  const handleToggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handlers Documentos
  const openGaranteDocs = (garante) => {
    if (!garante) return;
    setDocsGaranteId(garante.id);
    setDocsGaranteName(`${garante.nombre ?? ''} ${garante.apellido ?? ''}`.trim());
    setDocsOpen(true);
  };

  const closeGaranteDocs = () => {
    setDocsOpen(false);
    setDocsGaranteId(null);
    setDocsGaranteName('');
  };

  const fetchGaranteDocs = async (garanteId) => {
    const token = localStorage.getItem('token') || '';
    // Endpoint indicado por el usuario (garamte)
    const url = `${import.meta.env.VITE_API_URL}/documentos/garamte/${garanteId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  };

  const uploadGaranteDocs = async (garanteId, files) => {
    const token = localStorage.getItem('token') || '';
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('garanteId', garanteId);
      fd.append('tipo', 'PDF');
      fd.append('nombreArchivo', file.name || 'nuevo archivo');
      await fetch(`${import.meta.env.VITE_API_URL}/documentos/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
    }
  };

  const deleteGaranteDoc = async (docId) => {
    const token = localStorage.getItem('token') || '';
    await fetch(`${import.meta.env.VITE_API_URL}/documentos/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const eliminarGarante = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/garante/delete/${id}`);
      await showSuccess('Garante eliminado exitosamente');
      
      // Update state instead of reloading
      setGarantes(prevData => ({
        ...prevData,
        data: prevData.data.filter(garante => garante.id !== id)
      }));
    } catch (error) {
      console.error("Error al eliminar garante: ", error.response ? error.response.data : error.message);
      showError('No se pudo eliminar el garante.');
    }
  };

  const filteredGarantes = garantes.data
    .filter((garante) => 
      searchTerm === '' ||
      (garante.nombre && garante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.apellido && garante.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.email && garante.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.telefono && garante.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (garante.dni && garante.dni.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Paginación similar a Propietarios/Inquilinos
  const [paginaActual, setPaginaActual] = useState(1);
  const tarjetasPorPagina = 6;
  const indiceInicio = (paginaActual - 1) * tarjetasPorPagina;
  const indiceFin = indiceInicio + tarjetasPorPagina;
  const garantesPaginados = filteredGarantes.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filteredGarantes.length / tarjetasPorPagina);

  // Reset/clamp page on filter changes
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm]);
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [totalPaginas]);

  const goPrevPage = () => setPaginaActual((p) => Math.max(1, p - 1));
  const goNextPage = () => setPaginaActual((p) => Math.min(totalPaginas || 1, p + 1));

  // Desktop table pagination/selection state
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusMap, setStatusMap] = useState({});

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredGarantes.map((g) => g.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selected.includes(id);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (garante) => {
    if (!garante) return;
    setEditData({
      id: garante.id,
      nombre: garante.nombre || '',
      apellido: garante.apellido || '',
      telefono: garante.telefono || '',
      email: garante.email || '',
      dni: garante.dni || '',
      cuit: garante.cuit || '',
      direccionResidencial: garante.direccionResidencial || `${garante.calle || ''} ${garante.numero || ''}`.trim(),
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'dni') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      next = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else if (name === 'cuit') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      const a = digits.slice(0, 2);
      const b = digits.slice(2, 10);
      const c = digits.slice(10, 11);
      next = [a, b, c]
        .map((seg, idx) => (idx === 0 ? seg : seg ? '-' + seg : ''))
        .join('')
        .replace(/^-/, '');
    }
    setEditData((prev) => ({ ...prev, [name]: next }));
  };

  const handleEditSave = async () => {
    try {
      setSavingEdit(true);
      const token = localStorage.getItem('token') || '';
      // Endpoint de actualización; ajusta si tu backend usa otra ruta
      const url = `${import.meta.env.VITE_API_URL}/garante/update`;
      const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
      const processed = {
        ...editData,
        dni: editData.dni ? parseInt(onlyDigits(editData.dni), 10) : editData.dni,
        cuit: editData.cuit ? parseInt(onlyDigits(editData.cuit), 10) : editData.cuit,
        telefono: editData.telefono ? parseInt(onlyDigits(editData.telefono), 10) : editData.telefono,
      };
      await axios.put(url, processed, { headers: { Authorization: `Bearer ${token}` } });
      // Actualizar localmente
      setGarantes((prev) => ({
        ...prev,
        data: prev.data.map((g) => (g.id === editData.id ? { ...g, ...processed } : g)),
      }));
      showSuccess('Garante actualizado correctamente');
      setEditOpen(false);
    } catch (err) {
      console.error('Error actualizando garante', err);
      showError('No se pudo actualizar el garante');
    } finally {
      setSavingEdit(false);
    }
  };

  const totalGarantes = filteredGarantes.length;

  const StatCard = ({ icon, value, label, gradient }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        background: gradient,
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
      {icon}
     <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9, textAlign: 'center', fontSize: '0.7rem' }}>
        {label}
      </Typography>
       
    </Paper>
  );

  return (
    <Box sx={{ 
      width: '100vw',
      minHeight: "100vh",
      pt: { xs: 0, sm: 4, md: 2 },
      pb: { xs: 14, sm: 12 },
      pl: { xs: 2, sm: 3, md: '16rem' },
      pr: { xs: 2, sm: 4, md: 3 },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      boxSizing: 'border-box',
    }}>
      <Box 
        sx={{ 
          width: '100%',
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
            mb: { xs: 2, sm: 2 },
            marginTop:{xs:"0rem", md:"2rem"}
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
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Garantes
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                Gestiona los garantes de tus contratos
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Añadir garante">
            <Fab 
              color="primary" 
              aria-label="add" 
              size="small"
              onClick={() => navigate('/nuevo-garante')}
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
     <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          gap: 1.5, 
          width: '100%', 
          mb: 2.5,
          flexWrap: 'wrap',
        }}>
          <StatCard 
            icon={<SecurityIcon sx={{ fontSize: 24, opacity: 0.9 }} />}
            value={totalGarantes}
            label="Total garantes"
            gradient="linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
          />
        </Box>
        
        <TextField
          placeholder="Buscar por nombre, apellido, email, teléfono o DNI..."
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
          (
            <Box sx={{ width: '100%' }}>
              {garantesPaginados.map(garante => (
                <MobileGaranteCard
                  key={garante.id}
                  garante={garante}
                  isExpanded={!!expandedCards[garante.id]}
                  onToggle={handleToggleCard}
                  onEdit={handleEditOpen}
                  onDelete={eliminarGarante}
                  onDocuments={openGaranteDocs}
                />
              ))}
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
            </Box>
          )
        )
      }
      </Box>
      <DocumentManagerModal
        open={docsOpen}
        onClose={closeGaranteDocs}
        entityType="garante"
        entityId={docsGaranteId}
        entityName={docsGaranteName}
        fetchList={fetchGaranteDocs}
        uploadFiles={uploadGaranteDocs}
        deleteDoc={deleteGaranteDoc}
      />

      {/* Edit Garante Modal */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose} 
        fullWidth 
        maxWidth="sm"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-end',
          },
        }}
        PaperProps={{
          sx: {
            m: 0,
            width: '100%',
            position: 'relative',
            borderRadius: '25px 25px 0 0',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Editar Garante
          <IconButton aria-label="close" onClick={handleEditClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{
          '& .MuiOutlinedInput-root': { borderRadius: 25 },
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: 25 }
        }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField label="Nombre" name="nombre" value={editData.nombre} onChange={handleEditChange} fullWidth />
            <TextField label="Apellido" name="apellido" value={editData.apellido} onChange={handleEditChange} fullWidth />
            <TextField label="Teléfono" name="telefono" value={editData.telefono} onChange={handleEditChange} fullWidth />
            <TextField label="Email" name="email" value={editData.email} onChange={handleEditChange} fullWidth />
            <TextField label="DNI" name="dni" value={editData.dni} onChange={handleEditChange} fullWidth />
            <TextField label="CUIT" name="cuit" value={editData.cuit} onChange={handleEditChange} fullWidth />
            <TextField label="Dirección" name="direccionResidencial" value={editData.direccionResidencial} onChange={handleEditChange} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={savingEdit}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={savingEdit}>
            {savingEdit ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
   
  );
};

export default GarantesPage;
