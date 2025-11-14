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

  return (
    <Box sx={{ 
      width: "100vw", 
      minHeight: "100vh",
      pt: { xs: 3, sm: 4 },
      pb: { xs: 12, sm: 4 },
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
            mb: { xs: 2, sm: 3 },
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
            width: { xs: '100%', sm: '80%' },
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
          isMobile ? (
            <Box sx={{ width: '100%' }}>
              {garantesPaginados.map(garante => (
                <Box key={garante.id} sx={{ mb: 2, position: 'relative' }}>
                  {expandedCards[garante.id] && (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'end',
                      gap: 1,
                      padding: '.4rem .3rem',
                      position: 'relative',
                      zIndex: 2,
                      borderRadius: '10px 10px 0 0',
                      boxShadow: '0px 0px 1px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Chip
                        icon={<DescriptionIcon />}
                        onClick={(e) => { e.stopPropagation(); openGaranteDocs(garante); }}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.35)' : 'rgba(25, 118, 210, 0.2)',
                          color: 'primary.main', padding: 0,
                          '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
                          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.5)' : 'rgba(25, 118, 210, 0.35)', boxShadow: 2 },
                          transition: 'all 0.2s ease', boxShadow: 1
                        }}
                      />
                      <Chip
                        icon={<EditIcon />}
                        onClick={(e) => { e.stopPropagation(); handleEditOpen(garante); }}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(98, 9, 199, 0.59)' : 'rgba(98, 9, 199, 0.2)',
                          color: 'primary.main', padding: 0,
                          '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
                          '&:hover': { bgcolor: 'rgba(98, 9, 199, 0.46)', transform: 'translateY(-1px)', boxShadow: 2 },
                          transition: 'all 0.2s ease', boxShadow: 1
                        }}
                      />
                      <Chip
                        icon={<DeleteIcon />}
                        onClick={(e) => { e.stopPropagation(); eliminarGarante(garante.id); }}
                        sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 50, minWidth: 40,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(243, 29, 197, 0.59)' : 'rgba(244, 67, 54, 0.2)',
                          color: 'error.main', padding: 0,
                          '& .MuiChip-icon': { margin: 0 }, '& .MuiChip-label': { display: 'none' },
                          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(185, 14, 148, 0.59)' : 'rgba(224, 14, 14, 0.39)', transform: 'translateY(-1px)', boxShadow: 2 },
                          transition: 'all 0.2s ease', boxShadow: 1
                        }}
                      />
                    </Box>
                  )}

                  <Paper sx={{ borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 3 }, bgcolor: 'background.paper' }}>
                    <Box
                      sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => handleToggleCard(garante.id)}
                    >
                      <Typography variant="h6">{garante.nombre} {garante.apellido}</Typography>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleToggleCard(garante.id); }}
                        sx={{ transform: expandedCards[garante.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                    <Collapse in={!!expandedCards[garante.id]}>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Typography><strong>DNI:</strong> {garante.dni || 'No disponible'}</Typography>
                        <Typography><strong>Email:</strong> {garante.email || 'No disponible'}</Typography>
                        <Typography><strong>Teléfono:</strong> {garante.telefono || 'No disponible'}</Typography>
                        <Typography><strong>Dirección:</strong> {(garante.direccionResidencial || `${garante.calle || ''} ${garante.numero || ''}`).trim() || 'No disponible'}</Typography>
                      </Box>
                      <Box sx={{ padding: 0, display: 'flex', flexDirection: 'row', height: '4rem', width: '100%' }}>
                        <Box sx={{ borderRadius: '0 0 0 10px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: 'rgb(28, 110, 13)', width: '50%' }}>
                          <IconButton href={`https://wa.me/${garante.telefono}`} target="_blank" sx={{ color: 'white' }}>
                            <WhatsAppIcon sx={{ fontSize: 45 }} />
                          </IconButton>
                        </Box>
                        <Box sx={{ borderRadius: '0 0 10px 0', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: 'rgb(19, 21, 62)', width: '50%' }}>
                          <IconButton href={`mailto:${garante.email}`} sx={{ color: 'white' }}>
                            <EmailIcon sx={{ fontSize: 45 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Collapse>
                  </Paper>
                </Box>
              ))}
              {totalPaginas > 0 && (
                <Box display="flex" justifyContent="center" mt={2} mb={3} sx={{ width: '100%', gap: 1 }}>
                  <Button variant="outlined" onClick={goPrevPage} disabled={paginaActual <= 1} startIcon={<NavigateBeforeIcon />}>Prev</Button>
                  <Chip label={`${paginaActual} / ${totalPaginas}`} sx={{ px: 1 }} />
                  <Button variant="outlined" onClick={goNextPage} disabled={paginaActual >= totalPaginas} endIcon={<NavigateNextIcon />}>Next</Button>
                </Box>
              )}
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 1 }}>
              <TableContainer>
                <Table size="medium" sx={{ minWidth: 950 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < filteredGarantes.length}
                          checked={filteredGarantes.length > 0 && selected.length === filteredGarantes.length}
                          onChange={handleSelectAll}
                          inputProps={{ 'aria-label': 'select all' }}
                        />
                      </TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>DNI</TableCell>
                      <TableCell sx={{ width: 180, minWidth: 180 }}>CUIT</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Dirección</TableCell>
                      <TableCell align="right" sx={{ width: 140, minWidth: 140 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGarantes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((garante) => {
                        const checked = isSelected(garante.id);
                        const nombreCompleto = `${garante.nombre || ''} ${garante.apellido || ''}`.trim();
                        const direccion = (garante.direccionResidencial || `${garante.calle || ''} ${garante.numero || ''}`).trim();
                        const status = statusMap[garante.id] ?? true;
                        return (
                          <TableRow hover key={garante.id} selected={checked} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                            <TableCell padding="checkbox">
                              <Checkbox checked={checked} onChange={() => handleSelectOne(garante.id)} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{nombreCompleto || '—'}</TableCell>
                            <TableCell>{garante.dni || '—'}</TableCell>
                            <TableCell>{garante.cuit || '—'}</TableCell>
                            <TableCell>{garante.email || '—'}</TableCell>
                            <TableCell>{garante.telefono || '—'}</TableCell>
                            <TableCell>{direccion || '—'}</TableCell>
                            
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => openGaranteDocs(garante)} sx={{ mr: 0.5 }}>
                                <DescriptionIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleEditOpen(garante)} sx={{ mr: 0.5 }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => eliminarGarante(garante.id)} color="error">
                                <DeleteIcon fontSize="small" />
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
                count={filteredGarantes.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Mostrar"
              />
            </Paper>
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
