import React, { useEffect, useState } from 'react';
import {
  Paper,
  CircularProgress,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  Collapse,
  Divider,
  Tooltip,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Checkbox
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import Swal from 'sweetalert2';
import PlayerCard from '../common/cards/PlayerCard';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TenantsTour from '../common/tour/TenantsTour';
import http from '../api/http';
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import NamePage from '../common/titulos/NamePage.jsx';
import MobileInquilinoCard from '../common/cards/MobileInquilinoCard.jsx';
import EditarInquilinoModal from '../common/modals/EditarInquilinoModal.jsx';
import CreateTenantProfileModal from '../common/modals/CreateTenantProfileModal.jsx';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// removed view icon import; open preview on row click
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import DocumentManagerModal from '../common/DocumentManagerModal';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const InquilinosPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [inquilinos, setInquilinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInquilinoId, setSelectedInquilinoId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inquilinoToEdit, setInquilinoToEdit] = useState(null);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [inquilinoForProfile, setInquilinoForProfile] = useState(null);
  const [hasAccountOpen, setHasAccountOpen] = useState(false);
  const [hasAccountName, setHasAccountName] = useState('');
  const [hasAccountInquilinoId, setHasAccountInquilinoId] = useState(null);
  const [hasAccountCreds, setHasAccountCreds] = useState(null);
  const [hasAccountLoading, setHasAccountLoading] = useState(false);
  const [hasAccountError, setHasAccountError] = useState(null);
  const [profileCreatedTenantId, setProfileCreatedTenantId] = useState(null);
  const [creatingTenantId, setCreatingTenantId] = useState(null);
  const [deletingTenantUser, setDeletingTenantUser] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsTenant, setDocsTenant] = useState(null);
  const [docsTenantId, setDocsTenantId] = useState(null);
  const [docsTenantName, setDocsTenantName] = useState('');
  // Preview states kept for compatibility with existing handlers
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  // Desktop table: selection and pagination
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await http.get(`${import.meta.env.VITE_API_URL}/inquilino/me`);
      const inquilinosArray = Array.isArray(result.data) ? result.data : 
                            (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
      setInquilinos(inquilinosArray);
      setError(null);
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };


  const getDocDisplayName = (doc) => {
    const name = doc?.nombreArchivo || doc?.nombre || '';
    if (!name) return 'Documento';
    const parts = String(name).split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : name;
  };

  const handleViewDoc = async (doc) => {
    try {
      const url = doc?.urlArchivo || doc?.url;
      if (!url) throw new Error('no-url');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      const blob = await res.blob();
      const mime = blob.type || doc?.contentType || doc?.tipoMime || (String(doc?.nombreArchivo || '').toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      const objectUrl = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(objectUrl);
      setPreviewMime(mime);
      setCurrentPdfTitle(getDocDisplayName(doc));
      setPdfViewerOpen(true);
    } catch (e) {
      showError('No se pudo previsualizar el documento');
    }
  };


  const handleShareDoc = async (doc) => {
    try {
      // Prefer already-previewed object URL
      if (previewUrl) {
        if (navigator.share) { await navigator.share({ title: getDocDisplayName(doc), url: previewUrl }); return; }
        await navigator.clipboard.writeText(previewUrl);
        showSuccess('Enlace copiado al portapapeles');
        return;
      }

      // Build a blob URL similarly to view logic
      const tempDoc = { ...doc };
      const makeMime = () => {
        const name = tempDoc?.nombreArchivo || tempDoc?.nombre || '';
        const ext = name.split('.').pop()?.toLowerCase();
        const byExt = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : undefined;
        return tempDoc?.contentType || tempDoc?.tipoMime || tempDoc?.tipo || byExt || 'application/pdf';
      };
      let blobUrl = null;
      if (tempDoc?.urlArchivo || tempDoc?.url) {
        const res = await fetch(tempDoc.urlArchivo || tempDoc.url, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
        blobUrl = URL.createObjectURL(await res.blob());
      } else if (tempDoc?.base64 || tempDoc?.contenidoBase64 || tempDoc?.dataBase64) {
        const b64 = tempDoc.base64 || tempDoc.contenidoBase64 || tempDoc.dataBase64;
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        blobUrl = URL.createObjectURL(new Blob([new Uint8Array(byteNumbers)], { type: makeMime() }));
      } else if (tempDoc?.path || tempDoc?.storagePath) {
        const pathUrl = tempDoc.path || tempDoc.storagePath;
        const res = await fetch(pathUrl.startsWith('http') ? pathUrl : `${import.meta.env.VITE_API_URL}${pathUrl}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
        blobUrl = URL.createObjectURL(await res.blob());
      }

      if (navigator.share) {
        await navigator.share({ title: getDocDisplayName(doc), url: blobUrl });
      } else {
        await navigator.clipboard.writeText(blobUrl);
        showSuccess('Enlace copiado al portapapeles');
      }
    } catch (e) {
      showError('No se pudo compartir el documento');
    }
  };

  const handleDeleteDoc = async (doc) => {
    try {
      await http.delete(`${import.meta.env.VITE_API_URL}/documentos/${doc?.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      // Refresh list
      if (docsTenant?.id) {
        setDocsList((prev) => prev.filter((d) => d.id !== doc?.id));
      }
      showSuccess('Documento eliminado');
    } catch (e) {
      showError('No se pudo eliminar el documento');
    }
  };

  const handleOpenDocs = (inquilinoId) => {
    const inq = inquilinos.find((i) => i.id === inquilinoId);
    setDocsTenant(inq || null);
    setDocsTenantId(inq?.id ?? null);
    setDocsTenantName(`${inq?.nombre ?? ''} ${inq?.apellido ?? ''}`.trim());
    setDocsOpen(true);
  };

  const handleCloseDocs = () => {
    setDocsOpen(false);
    setDocsTenant(null);
    setDocsTenantId(null);
    setDocsTenantName('');
  };

  // Reusable modal handlers
  const fetchTenantDocs = async (tenantId) => {
    const url = `${import.meta.env.VITE_API_URL}/documentos/inquilino/${tenantId}`;
    const res = await http.get(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
    const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
    return data;
  };

  const uploadTenantDocs = async (tenantId, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    const payload = {
      inquilinoId: tenantId,
      tipo: 'PDF',
      nombreArchivo: files.length === 1 ? files[0].name : 'archivos_inquilino'
    };
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    await http.post(`${import.meta.env.VITE_API_URL}/documentos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
  };

  const deleteTenantDoc = async (docId) => {
    await http.delete(`${import.meta.env.VITE_API_URL}/documentos/${docId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
  };

  const handleUploadDocs = async (event) => {
    const files = event?.target?.files;
    if (!docsTenant || !docsTenant.id || !files || files.length === 0) return;

    const formData = new FormData();
    // Append each file under the key 'files'
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    // Build JSON payload under key 'data' with content-type application/json
    const payload = {
      inquilinoId: docsTenant.id,
      tipo: 'PDF',
      nombreArchivo: files.length === 1 ? files[0].name : 'archivos_inquilino'
    };
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    try {
      const url = `${import.meta.env.VITE_API_URL}/documentos/upload`;
      await http.post(url, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        } 
      });
      showSuccess('Documentos subidos correctamente');
      // limpiar input para permitir misma selección de nuevo
      event.target.value = '';
      // refrescar listado
      if (docsTenant && docsTenant.id) {
        try {
          setDocsLoading(true);
          const listUrl = `${import.meta.env.VITE_API_URL}/documentos/inquilino/${docsTenant.id}`;
          const res = await http.get(listUrl, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
          const data = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
          setDocsList(data);
        } catch (_) {
          // mantener el estado anterior si falla
        } finally {
          setDocsLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
      showError('No se pudieron subir los documentos');
    }
  };

  const handleDeleteTenantUser = async () => {
    const inq = inquilinos.find((i) => i.id === hasAccountInquilinoId);
    const usuarioCuentaId = inq?.usuarioCuentaId ?? inq?.usuarioDtoSalida?.usuarioCuentaId;
    if (!usuarioCuentaId) return;
    try {
      setDeletingTenantUser(true);
      const url = `${import.meta.env.VITE_API_URL}/inquilino/usuario-inquilino/${usuarioCuentaId}`;
      await http.delete(url);
      showSuccess('Usuario del inquilino eliminado');
      // actualizar lista local
      setInquilinos(prev => prev.map(p => p.id === hasAccountInquilinoId ? { ...p, usuarioCuentaId: null } : p));
      setHasAccountCreds(null);
    } catch (e) {
      showError('No se pudo eliminar el usuario del inquilino');
    } finally {
      setDeletingTenantUser(false);
    }
  };

  const handleShowHasAccount = async (inquilinoId) => {
    const inq = inquilinos.find((i) => i.id === inquilinoId);
    setHasAccountName(`${inq?.nombre ?? ''} ${inq?.apellido ?? ''}`.trim());
    setHasAccountInquilinoId(inquilinoId);
    setHasAccountCreds(null);
    setHasAccountError(null);
    setHasAccountOpen(true);
    // Solo buscar credenciales si efectivamente tiene cuenta
    const tieneCuenta = (inq?.usuarioCuentaId != null) || (inq?.usuarioDtoSalida?.usuarioCuentaId != null);
    if (!tieneCuenta) return;
    try {
      setHasAccountLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/inquilino/credenciales/${inquilinoId}`;
      const res = await http.get(url);
      // Respuesta esperada: { username, password }
      const data = res?.data?.data ?? res?.data ?? null;
      setHasAccountCreds(data && (data.username || data.password) ? data : null);
    } catch (e) {
      setHasAccountError('No se pudieron obtener las credenciales.');
    } finally {
      setHasAccountLoading(false);
    }
  };

  const handleShareCredsWhatsApp = () => {
    if (!hasAccountCreds) return;

    const inq = inquilinos.find((i) => i.id === hasAccountInquilinoId);
    const nombreCompleto = `${inq?.nombre ?? ''} ${inq?.apellido ?? ''}`.trim();
    const username = hasAccountCreds?.username ?? '';
    const password = hasAccountCreds?.password ?? '';

    const texto = `\n*Descargate la app Tuinmo*\n\n_Desde Google Play buscá_ *Tuinmo*\n_y accedé con tus credenciales en la sección:_ _*Portal de alquileres*_\n\n\n*Usuario:* _${username}_\n*Contraseña:* _${password}_\n`;

    const phone = (inq?.telefono ?? '').replace(/\D/g, '');
    const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
    const url = `${base}?text=${encodeURIComponent(texto.trim())}`;
    window.open(url, '_blank');
  };
  useEffect(() => {
    if (user && user.name) {
      fetchInquilinos();
    }
  }, [user.name]);

  const handleToggleCard = (inquilinoId) => {
    setExpandedCards(prev => ({ ...prev, [inquilinoId]: !prev[inquilinoId] }));
  };

  // Cuando se crea un perfil, actualiza el item local para reflejar el tilde sin refetch
  useEffect(() => {
    if (profileCreatedTenantId != null) {
      setInquilinos(prev => prev.map(i => (
        i.id === profileCreatedTenantId ? { ...i, usuarioCuentaId: -1 } : i
      )));
      setProfileCreatedTenantId(null);
    }
  }, [profileCreatedTenantId]);

  const handleDeleteInquilino = async (id) => {
    const result = await Swal.fire({
      title: 'Confirmar Eliminación',
      text: `¿Estás seguro de que deseas eliminar este inquilino?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await http.delete(`${import.meta.env.VITE_API_URL}/inquilino/delete/${id}`);
        setInquilinos(prevInquilinos => prevInquilinos.filter(inquilino => inquilino.id !== id));
        showSuccess('Inquilino eliminado exitosamente');
      } catch (err) {
        console.error('Error deleting inquilino:', err);
        showError('No se pudo eliminar el inquilino.');
      }
    }
  };

    const handleMenuClick = (event, inquilinoId) => {
    setAnchorEl(event.currentTarget);
    setSelectedInquilinoId(inquilinoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInquilinoId(null);
  };

  const handleEdit = (inquilinoId = selectedInquilinoId) => {
    // Buscar el inquilino por ID
    const inquilino = inquilinos.find(inq => inq.id === inquilinoId);
    if (inquilino) {
      setInquilinoToEdit(inquilino);
      setEditModalOpen(true);
    }
    if (selectedInquilinoId) {
      handleMenuClose();
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setInquilinoToEdit(null);
  };

  const handleInquilinoUpdated = () => {
    // Recargar la lista de inquilinos después de actualizar
    fetchInquilinos();
  };

  const handleDelete = () => {
    handleDeleteInquilino(selectedInquilinoId);
    handleMenuClose();
  };

  const handleOpenCreateProfile = (inquilinoId) => {
    const inq = inquilinos.find((i) => i.id === inquilinoId);
    if (inq) {
      setInquilinoForProfile(inq);
      setCreateProfileOpen(true);
    }
  };

  const handleCloseCreateProfile = () => {
    setCreateProfileOpen(false);
    setInquilinoForProfile(null);
  };

  const handleSubmitCreateProfile = async (payload) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/inquilino/register`;
      // indicar en UI que este inquilino está en creación
      if (inquilinoForProfile?.id != null) {
        setCreatingTenantId(inquilinoForProfile.id);
      }
      await http.post(url, payload);
      showSuccess('Perfil de inquilino creado correctamente');
      // marca el inquilino como con cuenta sin recargar
      if (inquilinoForProfile?.id != null) {
        setProfileCreatedTenantId(inquilinoForProfile.id);
      }
    } catch (e) {
      console.error(e);
      showError('No se pudo crear el perfil de inquilino');
    } finally {
      // limpiar spinner
      setCreatingTenantId(null);
      handleCloseCreateProfile();
    }
  };

  const filteredInquilinos = inquilinos.filter(inquilino => {
    if (!searchTerm) return true;
    const nombre = inquilino.nombre || "";
    const apellido = inquilino.apellido || "";
    const email = inquilino.email || "";
    const telefono = inquilino.telefono || "";
    const dni = inquilino.dni || "";
    const cuit = inquilino.cuit || "";
    const nacionalidad = inquilino.nacionalidad || "";
    const direccionResidencial = inquilino.direccionResidencial || "";
    const searchTermLower = searchTerm.toLowerCase();
    return nombre.toLowerCase().includes(searchTermLower) ||
           apellido.toLowerCase().includes(searchTermLower) ||
           email.toLowerCase().includes(searchTermLower) ||
           telefono.toLowerCase().includes(searchTermLower) ||
           dni.toLowerCase().includes(searchTermLower);
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const tarjetasPorPagina = 6;
  const indiceInicio = (paginaActual - 1) * tarjetasPorPagina;
  const indiceFin = indiceInicio + tarjetasPorPagina;
  const inquilinosPaginados = filteredInquilinos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filteredInquilinos.length / tarjetasPorPagina);
  const goPrevPage = () => setPaginaActual((p) => Math.max(1, p - 1));
  const goNextPage = () => setPaginaActual((p) => Math.min(totalPaginas || 1, p + 1));

  // Table helpers
  const isSelected = (id) => selected.indexOf(id) !== -1;
  const handleSelectAll = (event, list) => {
    if (event.target.checked) {
      const newSelected = list.map((i) => i.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };
  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderDesktopView = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 1 }}>
      <TableContainer>
        <Table size="medium" sx={{ width: '100vw', minWidth: 950 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredInquilinos.length}
                  checked={filteredInquilinos.length > 0 && selected.length === filteredInquilinos.length}
                  onChange={(e) => handleSelectAll(e, filteredInquilinos)}
                  inputProps={{ 'aria-label': 'select all' }}
                />
              </TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell sx={{ width: '5rem', minWidth: '5rem', maxWidth: '5rem' }}>DNI</TableCell>
              <TableCell sx={{ width: '3rem', minWidth: '3rem', maxWidth: '3rem' }}>CUIT</TableCell>
              <TableCell sx={{ width: '6rem', minWidth: '6rem', maxWidth: '6rem' }}>Email</TableCell>
              <TableCell sx={{ width: '5rem', minWidth: '5rem', maxWidth: '5rem' }}>Teléfono</TableCell>
              <TableCell sx={{ width: '7rem', minWidth: '7rem', maxWidth: '7rem' }}>Dirección</TableCell>
              <TableCell align="right" sx={{ width: 140, minWidth: 140 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInquilinos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p) => {
                const checked = isSelected(p.id);
                const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim();
                const direccion = (p.direccionResidencial || '').trim();
                return (
                  <TableRow hover key={p.id} selected={checked} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={checked} onChange={() => handleSelectOne(p.id)} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 400, fontSize: '0.8rem', width: '8rem' }}>{nombreCompleto || '—'}</TableCell>
                    <TableCell sx={{ width: '5rem', minWidth: '5rem', maxWidth: '5rem' }}>{p.dni || '—'}</TableCell>
                    <TableCell sx={{ width: '3rem' }}>{p.cuit || '—'}</TableCell>
                    <TableCell sx={{ width: '6rem' }}>{p.email || '—'}</TableCell>
                    <TableCell sx={{ width: '5rem' }}>{p.telefono || '—'}</TableCell>
                    <TableCell sx={{ width: '7rem', minWidth: '7rem', maxWidth: '7rem' }}>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {direccion || '—'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleShowHasAccount(p.id)} sx={{ mr: 0.5 }} title="Credenciales">
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDocs(p.id)} sx={{ mr: 0.5 }}>
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(p.id)} sx={{ mr: 0.5 }}>
                        <MoreVertIcon sx={{ display: 'none' }} />
                        <span style={{ display: 'inline-flex' }}><EditIcon fontSize="small" /></span>
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteInquilino(p.id)} color="error">
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
        count={filteredInquilinos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Mostrar"
      />
    </Paper>
  );

  const renderMobileView = () => (
    <Box sx={{ width: '100%' }}>
      {inquilinosPaginados.map(inquilino => (
        <MobileInquilinoCard
          key={inquilino.id}
          inquilino={inquilino}
          isExpanded={!!expandedCards[inquilino.id]}
          onToggle={handleToggleCard}
          onEdit={handleEdit}
          onDelete={(id) => handleDeleteInquilino(id)}
          onCreateProfile={handleOpenCreateProfile}
          hasAccount={(inquilino?.usuarioCuentaId != null) || (inquilino?.usuarioDtoSalida?.usuarioCuentaId != null)}
          isCreating={creatingTenantId === inquilino.id}
          onHasAccount={handleShowHasAccount}
          onOpenDocs={handleOpenDocs}
        />
      ))}
    </Box>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ textAlign: "center", padding: 4, width: '100%', display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress />
          <Typography>Cargando inquilinos...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ padding: 3, bgcolor: 'rgba(255, 87, 87, 0.15)', borderRadius: 2, color: 'error.main', width: '100%' }}>
          <Typography>Error al cargar los inquilinos: {error.message}</Typography>
        </Box>
      );
    }

    if (filteredInquilinos.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 3, mx: 'auto', boxShadow: 1, width: {xs:"80%",md:"100%"} }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No se encontraron inquilinos con los criterios de búsqueda.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? renderMobileView() : renderDesktopView()}
        {isMobile && totalPaginas > 0 && (
          <Box display="flex" justifyContent="center" mt={2} mb={3} sx={{ gap: 1 }}>
            <Button variant="outlined" onClick={goPrevPage} disabled={paginaActual <= 1} startIcon={<NavigateBeforeIcon />}>Prev</Button>
            <Chip label={`${paginaActual} / ${totalPaginas}`} sx={{ px: 1 }} />
            <Button variant="outlined" onClick={goNextPage} disabled={paginaActual >= totalPaginas} endIcon={<NavigateNextIcon />}>Next</Button>
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{marginTop:{xs:"0", md:"2rem"}, width: "100%", minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: { xs: 8, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.default' }}>
      <TenantsTour />
      <Box sx={{ width: { xs: "90%", sm: "80%" }, mt: { xs: '4rem', sm: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton 
              onClick={() => {
                // Intentar ir hacia atrás, si falla navegar al dashboard
                try {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                } catch (error) {
                  navigate('/');
                }
              }} 
              sx={{ bgcolor: 'action.hover' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <NamePage title="Inquilinos" dataTour="tenants-title" mobileSize="1.5rem" tabletSize="2rem" desktopSize="1.5rem"/>
          </Box>
          <Tooltip title="Añadir inquilino">
            <Fab color="primary" aria-label="add" size="small" data-tour="tenants-add" onClick={() => navigate('/nuevo-inquilino')}>
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          data-tour="tenants-search"
          placeholder="Buscar por nombre, apellido, email..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 6, '& fieldset': { borderRadius: 6 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        
        {renderContent()}
        {/* Anchor pagination group for tour */}
        {totalPaginas > 1 && (
          <Box data-tour="tenants-pagination" />
        )}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>Editar</MenuItem>
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>

        {/* Modal de edición */}
        <EditarInquilinoModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          inquilino={inquilinoToEdit}
          onInquilinoUpdated={handleInquilinoUpdated}
        />

        {/* Modal crear perfil de inquilino */}
        <CreateTenantProfileModal
          open={createProfileOpen}
          onClose={handleCloseCreateProfile}
          inquilino={inquilinoForProfile}
          onSubmit={handleSubmitCreateProfile}
        />

        {/* Modal: ya tiene cuenta */}
        <Dialog open={hasAccountOpen} onClose={() => setHasAccountOpen(false)} PaperProps={{ sx: { borderRadius: 3, fontFamily: 'Roboto, sans-serif' } }}>
          <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif', position: 'relative', pr: 6 }}>
            Información
            <IconButton
              aria-label="eliminar usuario"
              onClick={handleDeleteTenantUser}
              disabled={deletingTenantUser || hasAccountLoading || !inquilinos.find(x => x.id === hasAccountInquilinoId)?.usuarioCuentaId}
              sx={{ position: 'absolute', right: 8, top: 8, color: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.08)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.12)' }, '&.Mui-disabled': { color: 'rgba(0,0,0,0.26)' } }}
            >
              {deletingTenantUser ? <CircularProgress size={20} /> : <DeleteOutlineIcon />}
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ fontFamily: 'Roboto, sans-serif', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ mb: 1 }}>
              El inquilino {hasAccountName || ''} ya tiene una cuenta creada.
            </Typography>
            {hasAccountLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography>Cargando credenciales...</Typography>
              </Box>
            ) : hasAccountError ? (
              <Typography color="error">{hasAccountError}</Typography>
            ) : hasAccountCreds ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography><strong>Usuario:</strong> {hasAccountCreds.username ?? '-'}</Typography>
                <Typography><strong>Contraseña:</strong> {hasAccountCreds.password ?? '-'}</Typography>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ fontFamily: 'Roboto, sans-serif' }}>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<WhatsAppIcon sx={{ fontSize: 35 }} />} 
              onClick={handleShareCredsWhatsApp}
              disabled={!hasAccountCreds || hasAccountLoading}
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
          </DialogActions>
        </Dialog>
        {/* Modal de Documentos (reutilizable) */}
        <DocumentManagerModal
          open={docsOpen}
          onClose={handleCloseDocs}
          entityType="inquilino"
          entityId={docsTenantId}
          entityName={docsTenantName}
          fetchList={fetchTenantDocs}
          uploadFiles={uploadTenantDocs}
          deleteDoc={deleteTenantDoc}
        />

        

      </Box>
    </Box>
  );
};

export default InquilinosPage;