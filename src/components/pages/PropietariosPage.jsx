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
  Chip,
  TablePagination,
  Pagination,
  Checkbox,
  Skeleton,
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
import MobilePropietarioCard from '../common/cards/MobilePropietarioCard';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import OwnersTour from '../common/tour/OwnersTour';
import EditarPropietarioModal from '../common/modals/EditarPropietarioModal';
import http from '../api/http';
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import CreateOwnerProfileModal from '../common/modals/CreateOwnerProfileModal.jsx';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DocumentManagerModal from '../common/DocumentManagerModal';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [propietarioToEdit, setPropietarioToEdit] = useState(null);
  const [createOwnerOpen, setCreateOwnerOpen] = useState(false);
  const [propietarioForProfile, setPropietarioForProfile] = useState(null);
  const [ownerHasAccountOpen, setOwnerHasAccountOpen] = useState(false);
  const [ownerHasAccountName, setOwnerHasAccountName] = useState('');
  const [profileCreatedOwnerId, setProfileCreatedOwnerId] = useState(null);
  const [creatingOwnerId, setCreatingOwnerId] = useState(null);
  const [ownerHasAccountId, setOwnerHasAccountId] = useState(null);
  const [ownerHasAccountCreds, setOwnerHasAccountCreds] = useState(null);
  const [ownerHasAccountLoading, setOwnerHasAccountLoading] = useState(false);
  const [ownerHasAccountError, setOwnerHasAccountError] = useState(null);
  const [deletingOwnerUser, setDeletingOwnerUser] = useState(false);
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  // Documentos Propietario
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsOwnerId, setDocsOwnerId] = useState(null);
  const [docsOwnerName, setDocsOwnerName] = useState('');
  const isAdmin = (user.authorities ?? '').includes('ROLE_ADMIN') || (user.authorities ?? '').includes('ROLE_SUPER_ADMIN');

  const filteredPropietarios = propietarios
    // filtro por dueño de datos (solo si no es admin)
    .filter(p => {
      if (!isAdmin) {
        // si no hay username asociado, ocultalo
        if (!p.usuarioUsername) return false;
        return p.usuarioUsername === user.name;
      }
      return true;
    })
    // filtro por búsqueda
    .filter(p => {
      if (!searchTerm) return true;
      const t = searchTerm.toLowerCase();
      return (
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(t) ||
        (p.email ?? '').toLowerCase().includes(t) ||
        (p.telefono ?? '').toLowerCase().includes(t) ||
        (p.dni ?? '').toLowerCase().includes(t)
      );
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
      const result = await http.get(`${import.meta.env.VITE_API_URL}/propietario/me`);
      const arr = Array.isArray(result.data)
        ? result.data
        : (result.data?.data && Array.isArray(result.data.data)) ? result.data.data : [];

      // 👇 normalizamos: NO guardamos password y unificamos username
      const propietariosNorm = arr.map(p => ({
        id: p.id,
        nombre: p.nombre ?? '',
        apellido: p.apellido ?? '',
        email: p.email ?? '',
        telefono: p.telefono ?? '',
        dni: p.dni ?? '',
        cuit:p.cuit ?? '',
        nacionalidad:p.nacionalidad ?? '',
        direccionResidencial: p.direccionResidencial ?? '',

        // fuente priorizada: dto -> embed -> root
        usuarioUsername: p.usuarioDtoSalida?.username ?? p.usuario?.username ?? p.username ?? null,
        usuarioCuentaPropietarioId: p.usuarioCuentaPropietarioId ?? null,
      }));

      setPropietarios(propietariosNorm);
    } catch (e) {
      console.error('Error fetching propietarios:', e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOwnerUser = async () => {
    const propietario = propietarios.find((x) => x.id === ownerHasAccountId);
    const usuarioCuentaPropietarioId = propietario?.usuarioCuentaPropietarioId ?? propietario?.propietarioSalidaDto?.usuarioCuentaPropietarioId;
    if (!usuarioCuentaPropietarioId) return;
    try {
      setDeletingOwnerUser(true);
      const url = `${import.meta.env.VITE_API_URL}/propietario/usuario-propietario/${usuarioCuentaPropietarioId}`;
      await http.delete(url);
      showSuccess('Usuario del propietario eliminado');
      // actualizar lista local
      setPropietarios(prev => prev.map(p => p.id === ownerHasAccountId ? { ...p, usuarioCuentaPropietarioId: null } : p));
      // limpiar credenciales mostradas
      setOwnerHasAccountCreds(null);
    } catch (e) {
      showError('No se pudo eliminar el usuario del propietario');
    } finally {
      setDeletingOwnerUser(false);
    }
  };

  const handleShowOwnerHasAccount = async (propietarioId) => {
    const p = propietarios.find((x) => x.id === propietarioId);
    setOwnerHasAccountName(`${p?.nombre ?? ''} ${p?.apellido ?? ''}`.trim());
    setOwnerHasAccountId(propietarioId);
    setOwnerHasAccountCreds(null);
    setOwnerHasAccountError(null);
    setOwnerHasAccountOpen(true);
    // Solo buscar si tiene cuenta
    const tieneCuenta = (p?.usuarioCuentaPropietarioId != null) || (p?.propietarioSalidaDto?.usuarioCuentaPropietarioId != null);
    if (!tieneCuenta) return;
    try {
      setOwnerHasAccountLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/propietario/credenciales/${propietarioId}`;
      const res = await http.get(url);
      const data = res?.data?.data ?? res?.data ?? null;
      setOwnerHasAccountCreds(data && (data.username || data.password) ? data : null);
    } catch (e) {
      setOwnerHasAccountError('No se pudieron obtener las credenciales.');
    } finally {
      setOwnerHasAccountLoading(false);
    }
  };

  const handleOpenCreateOwnerProfile = (propietarioId) => {
    const p = propietarios.find((x) => x.id === propietarioId);
    if (p) {
      setPropietarioForProfile(p);
      setCreateOwnerOpen(true);
    }
  };

  const handleCloseCreateOwnerProfile = () => {
    setCreateOwnerOpen(false);
    setPropietarioForProfile(null);
  };

  const handleSubmitCreateOwnerProfile = async (payload) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/propietario/register`;
      // marcar en UI que este propietario está en creación
      if (propietarioForProfile?.id != null) {
        setCreatingOwnerId(propietarioForProfile.id);
      }
      await http.post(url, payload);
      showSuccess('Perfil de propietario creado correctamente');
      // marcar propietario como con cuenta sin recargar
      if (propietarioForProfile?.id != null) {
        setProfileCreatedOwnerId(propietarioForProfile.id);
      }
    } catch (e) {
      console.error(e);
      showError('No se pudo crear el perfil de propietario');
    } finally {
      // limpiar spinner de creación
      setCreatingOwnerId(null);
      handleCloseCreateOwnerProfile();
    }
  };

  useEffect(() => {
    // Only fetch when user.name is available
    if (user && user.name) {
      fetchPropietarios();
    }
  }, [user.name]); // Dependency on user.name to refetch when it changes

  // Cuando se crea un perfil de propietario, actualizar el array local para reflejar el tilde
  useEffect(() => {
    if (profileCreatedOwnerId != null) {
      setPropietarios(prev => prev.map(p => (
        p.id === profileCreatedOwnerId ? { ...p, usuarioCuentaPropietarioId: -1 } : p
      )));
      setProfileCreatedOwnerId(null);
    }
  }, [profileCreatedOwnerId]);

  const goPrevPage = () => setPaginaActual((p) => Math.max(1, p - 1));
  const goNextPage = () => setPaginaActual((p) => Math.min(totalPaginas || 1, p + 1));

  // Desktop table: selection and pagination state
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (event, data = []) => {
    if (event.target.checked) {
      const newSelected = data.map((g) => g.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isSelected = (id) => selected.includes(id);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, propietarioId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPropietarioId(propietarioId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPropietarioId(null);
  };

  // Handlers Documentos
  const openOwnerDocs = (propietario) => {
    if (!propietario) return;
    setDocsOwnerId(propietario.id);
    setDocsOwnerName(`${propietario.nombre ?? ''} ${propietario.apellido ?? ''}`.trim());
    setDocsOpen(true);
  };

  const closeOwnerDocs = () => {
    setDocsOpen(false);
    setDocsOwnerId(null);
    setDocsOwnerName('');
  };

  const fetchOwnerDocs = async (ownerId) => {
    const token = localStorage.getItem('token') || '';
    const url = `${import.meta.env.VITE_API_URL}/documentos/propietario/${ownerId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  };

  const uploadOwnerDocs = async (ownerId, files) => {
    const token = localStorage.getItem('token') || '';
    const formData = new FormData();
    // agregar múltiples archivos bajo la clave 'files'
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    // payload JSON bajo la clave 'data' (content-type application/json)
    const payload = {
      propietarioId: ownerId,
      tipo: 'PDF',
      nombreArchivo: files.length === 1 ? files[0].name : 'archivos_propietario'
    };
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    await fetch(`${import.meta.env.VITE_API_URL}/documentos/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  const deleteOwnerDoc = async (docId) => {
    const token = localStorage.getItem('token') || '';
    await fetch(`${import.meta.env.VITE_API_URL}/documentos/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleEdit = (propietarioId = selectedPropietarioId) => {
    // Buscar el propietario por ID
    const propietario = propietarios.find(prop => prop.id === propietarioId);
    if (propietario) {
      setPropietarioToEdit(propietario);
      setEditModalOpen(true);
    }
    if (selectedPropietarioId) {
      handleMenuClose();
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setPropietarioToEdit(null);
  };

  const handlePropietarioUpdated = () => {
    // Recargar la lista de propietarios después de actualizar
    fetchPropietarios();
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
         showSuccess('Propietario eliminado exitosamente');
        } catch (error) {
         showError('No se pudo eliminar el propietario.');
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
          showSuccess('Propietario eliminado exitosamente')
        } catch (error) {
         showError('No se pudo eliminar el propietario.')
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


 

  const renderMobileView = (propietariosFiltrados) => (
    <>
      <Box sx={{ 
        p: { xs: 1, sm: 2 }, 
        width: "100%",
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
              <Box key={propietario.id} sx={{ mb: 1 }}>
                <MobilePropietarioCard
                  propietario={propietario}
                  isExpanded={!!expandedCards[propietario.id]}
                  onToggle={handleToggleCard}
                  onEdit={handleEdit}
                  onDelete={confirmDeletePropietario}
                  onCreateProfile={handleOpenCreateOwnerProfile}
                  hasAccount={propietario?.usuarioCuentaPropietarioId != null || propietario?.propietarioSalidaDto?.usuarioCuentaPropietarioId != null}
                  isCreating={creatingOwnerId === propietario.id}
                  onHasAccount={handleShowOwnerHasAccount}
                  onDocuments={openOwnerDocs}
                />
              </Box>
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

  const renderDesktopView = (propietariosFiltrados) => (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 1, }}>
      <TableContainer>
        <Table size="medium" sx={{width: '100vw', minWidth: 950 }}>
          <TableHead>
            <TableRow>
            
              <TableCell>Usuario</TableCell>
              <TableCell sx={{ width: '3rem', minWidth: '3rem', maxWidth: '3rem' }}>CUIT</TableCell>
              <TableCell sx={{ width: '4rem', minWidth: '4rem', maxWidth: '4rem' }}>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell sx={{ width: '7rem', minWidth: '7rem', maxWidth: '7rem' }}>Dirección</TableCell>
              <TableCell align="right" sx={{ width: 140, minWidth: 140 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {propietariosFiltrados
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p) => {
                const checked = isSelected(p.id);
                const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim();
                const direccion = (p.direccionResidencial || '').trim();
                return (
                  <TableRow hover key={p.id}  sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                  
                    <TableCell sx={{ fontWeight: 400, fontSize: '0.8rem', width:"8rem"}}>{nombreCompleto || '—'}</TableCell>
                    <TableCell sx={{ width:"3rem"}}>{p.cuit || '—'}</TableCell>
                    <TableCell sx={{ width:"2rem"}}>{p.email || '—'}</TableCell>
                    <TableCell sx={{ width:"5rem"}}>{p.telefono || '—'}</TableCell>
                    <TableCell sx={{ width: '7rem', minWidth: '7rem', maxWidth: '7rem' }}>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {direccion || '—'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openOwnerDocs(p)} sx={{ mr: 0.5 }}>
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(p.id)} sx={{ mr: 0.5 }}>
                        <MoreVertIcon sx={{ display: 'none' }} />
                        {/* Usamos directamente editar */}
                        <span style={{ display: 'inline-flex' }}><EditIcon fontSize="small" /></span>
                      </IconButton>
                      <IconButton size="small" onClick={() => confirmDeletePropietario(p.id)} color="error">
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
        count={propietariosFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Mostrar"
      />
    </Paper>
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
      <>
        <OwnersTour />
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
                  data-tour="owners-title"
                  variant="h5"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
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
      </>
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
            <Typography>Cargando propietarios...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            padding: 3, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            color: 'error.main',
            width: '100%', 
          }}>
            <Typography>Error al cargar los propietarios: {error}</Typography>
          </Box>
        ) : (
          renderMobileView(propietariosPaginados)
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

        {/* Modal de edición */}
        <EditarPropietarioModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          propietario={propietarioToEdit}
          onPropietarioUpdated={handlePropietarioUpdated}
        />

        {/* Modal crear perfil de propietario */}
        <CreateOwnerProfileModal
          open={createOwnerOpen}
          onClose={handleCloseCreateOwnerProfile}
          propietario={propietarioForProfile}
          onSubmit={handleSubmitCreateOwnerProfile}
        />

        {/* Modal: propietario ya tiene cuenta */}
        <Dialog open={ownerHasAccountOpen} onClose={() => setOwnerHasAccountOpen(false)} PaperProps={{ sx: { borderRadius: 3, fontFamily: 'Roboto, sans-serif' } }}>
          <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif', position: 'relative', pr: 6 }}>
            Información
            <IconButton
              aria-label="eliminar usuario"
              onClick={handleDeleteOwnerUser}
              disabled={deletingOwnerUser || ownerHasAccountLoading || !propietarios.find(x => x.id === ownerHasAccountId)?.usuarioCuentaPropietarioId}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8,
                color: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' },
                '&.Mui-disabled': { color: 'rgba(0,0,0,0.26)' }
              }}
            >
              {deletingOwnerUser ? <CircularProgress size={20} /> : <DeleteOutlineIcon />}
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ fontFamily: 'Roboto, sans-serif', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ mb: 1 }}>
              El propietario {ownerHasAccountName || ''} ya tiene una cuenta creada.
            </Typography>
            {ownerHasAccountLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography>Cargando credenciales...</Typography>
              </Box>
            ) : ownerHasAccountError ? (
              <Typography color="error">{ownerHasAccountError}</Typography>
            ) : ownerHasAccountCreds ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography><strong>Usuario:</strong> {ownerHasAccountCreds.username ?? '-'}</Typography>
                <Typography><strong>Contraseña:</strong> {ownerHasAccountCreds.password ?? '-'}</Typography>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ fontFamily: 'Roboto, sans-serif' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon sx={{ fontSize: 35 }} />}
              onClick={() => {
                if (!ownerHasAccountCreds) return;
                const p = propietarios.find((x) => x.id === ownerHasAccountId);
                const username = ownerHasAccountCreds?.username ?? '';
                const password = ownerHasAccountCreds?.password ?? '';
                const texto = `\n*Descargate la app Tuinmo*\n\n_Desde Google Play buscá_ *Tuinmo*\n_y accedé con tus credenciales en la sección:_ _*Portal de alquileres*_\n\n\n*Usuario:* _${username}_\n*Contraseña:* _${password}_\n`;
                const phone = (p?.telefono ?? '').replace(/\D/g, '');
                const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
                const url = `${base}?text=${encodeURIComponent(texto.trim())}`;
                window.open(url, '_blank');
              }}
              disabled={!ownerHasAccountCreds || ownerHasAccountLoading}
              sx={{
                textTransform: 'none',
                bgcolor: 'rgb(7, 113, 50)',
                color: 'white',
                border: '1px solid #000',
                borderRadius: '9999px',
                px: 2,
                py: 0.6,
                fontSize: '.95rem',
                boxShadow: 'none',
                '& .MuiButton-startIcon': { mr: 0.75 },
                '&:hover': { bgcolor: '#0f7a3e', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#a7f3d0', color: '#444', borderColor: '#666', opacity: 0.7 }
              }}
            >
              Compartir credenciales
            </Button>
            <Button onClick={() => setOwnerHasAccountOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Documentos Propietario */}
        <DocumentManagerModal
          open={docsOpen}
          onClose={closeOwnerDocs}
          entityType="propietario"
          entityId={docsOwnerId}
          entityName={docsOwnerName}
          fetchList={fetchOwnerDocs}
          uploadFiles={uploadOwnerDocs}
          deleteDoc={deleteOwnerDoc}
        />
      </Box>

    </Box>
    </>
  );
};

export default PropietariosPage;
