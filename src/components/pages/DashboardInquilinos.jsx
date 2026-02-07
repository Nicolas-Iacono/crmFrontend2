import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import logoInmo from '../../assets/logoInmo.png';
import themeBreakPoints from '../../utils/themeBreakPoints';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Chip,
  Button,
  // AppBar,
  // Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Collapse,
  Modal,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  Water as WaterIcon,
  LocalFireDepartment as GasIcon,
  Bolt as ElectricIcon,
  AccountBalance as MunicipalIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Message as MessageIcon,
  ReportProblem as ReportProblemIcon,
  Notifications as NotificationsIcon,
  Send as SendIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  CloudDownload as CloudDownloadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ModalNotas from '../common/popUps/ModalNotas';

const DashboardInquilinos = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;
  const apiRoot = `${API_BASE}${String(API_BASE || '').includes('/api') ? '' : '/api'}`;
  
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [expandedRecibos, setExpandedRecibos] = useState(new Set());
  const [activeSection, setActiveSection] = useState('recibos'); // 'recibos', 'home', 'comunicaciones'
  const [contratoInfo, setContratoInfo] = useState(null);
  const [notasContrato, setNotasContrato] = useState([]);
  const [loadingNotasContrato, setLoadingNotasContrato] = useState(false);
  const [errorNotasContrato, setErrorNotasContrato] = useState(null);
  const [modalNotaOpen, setModalNotaOpen] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  const [loadingContrato, setLoadingContrato] = useState(false);
  const [openContractModal, setOpenContractModal] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const [downloadingRecibo, setDownloadingRecibo] = useState(null);
  const [payingReciboId, setPayingReciboId] = useState(null);
  const [nombreInmoContrato, setNombreInmoContrato] = useState('');
  const [contratoCompleto, setContratoCompleto] = useState(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedReciboToPay, setSelectedReciboToPay] = useState(null);
  const [transferenciaInfo, setTransferenciaInfo] = useState(null);
  const [loadingTransferenciaInfo, setLoadingTransferenciaInfo] = useState(false);
  const [notifyingPayment, setNotifyingPayment] = useState(false);
  const [yaPagueModalOpen, setYaPagueModalOpen] = useState(false);
  const [yaPagueAmount, setYaPagueAmount] = useState('');
  const [yaPagueReference, setYaPagueReference] = useState('');

  const [commTab, setCommTab] = useState(0); // 0: mensajes, 1: reportes, 2: notificaciones
  const [selectedThreadId, setSelectedThreadId] = useState('inmo');
  const [messageDraft, setMessageDraft] = useState('');
  const [reportForm, setReportForm] = useState({
    tipo: 'problema',
    asunto: '',
    descripcion: '',
    urgencia: 'media',
  });
  const [reportPhotos, setReportPhotos] = useState([]);
  const [reportSent, setReportSent] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Recordatorio de pago',
      body: 'Tenés un recibo próximo a vencer. Revisá la sección “Recibos”.',
      date: 'Hoy',
      severity: 'info',
      icon: <ScheduleIcon fontSize="small" />,
    },
    {
      id: 'n2',
      title: 'Actualización de estado',
      body: 'Tu reporte de mantenimiento fue recibido y está en revisión.',
      date: 'Ayer',
      severity: 'success',
      icon: <CheckCircleIcon fontSize="small" />,
    },
  ]);

  // Estados para filtro de fecha
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredRecibos, setFilteredRecibos] = useState([]);

  const commThreads = [
    {
      id: 'inmo',
      title: nombreInmoContrato || 'Tu inmobiliaria',
      subtitle: 'Atención y consultas',
      unread: 1,
      avatarIcon: <MessageIcon fontSize="small" />,
    },
    {
      id: 'mantenimiento',
      title: 'Mantenimiento',
      subtitle: 'Reparaciones y soporte',
      unread: 0,
      avatarIcon: <BuildIcon fontSize="small" />,
    },
  ];

  const commMessagesByThread = {
    inmo: [
      {
        id: 'm1',
        from: 'inmo',
        text: 'Hola, ¿en qué podemos ayudarte?',
        time: '09:20',
      },
      {
        id: 'm2',
        from: 'me',
        text: 'Necesito confirmar el horario para retirar las llaves.',
        time: '09:23',
      },
    ],
    mantenimiento: [
      {
        id: 'm3',
        from: 'inmo',
        text: 'Podés cargar un reporte y te respondemos por acá.',
        time: 'Ayer',
      },
    ],
  };

  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar(successMessage, 'success');
    } catch (e) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSnackbar(successMessage, 'success');
      } catch {
        showSnackbar('No se pudo copiar al portapapeles', 'error');
      }
    }
  };

  const handleOpenYaPagueModal = () => {
    if (!selectedReciboToPay) {
      showSnackbar('No se encontró el recibo asociado.', 'warning');
      return;
    }

    const amount = Number(calcularMontoTotal(selectedReciboToPay)).toFixed(2);
    setYaPagueAmount(amount);
    setYaPagueReference('');
    setYaPagueModalOpen(true);
  };

  const handleCloseYaPagueModal = () => {
    setYaPagueModalOpen(false);
  };

  const handleSubmitYaPague = async () => {
    const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }

    setNotifyingPayment(true);
    try {
      const reciboId = selectedReciboToPay?.id;
      if (!reciboId) {
        showSnackbar('No se encontró el recibo asociado.', 'warning');
        return;
      }

      const amountNumber = Number(calcularMontoTotal(selectedReciboToPay));
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        showSnackbar('No se pudo determinar el monto total del recibo.', 'warning');
        return;
      }

      const payload = {
        amount: amountNumber,
        reference: yaPagueReference?.trim() || null,
      };

      const url = `${apiRoot}/recibo/${reciboId}/pagar/transferencia/notificar`;
      console.log('[DashboardInquilinos][YaPague] POST', url, payload);

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000,
      });

      console.log('[DashboardInquilinos][YaPague] OK', res?.status, res?.data);

      handleCloseYaPagueModal();
      handleClosePayModal();

      await Swal.fire({
        icon: 'success',
        title: '¡Gracias!',
        text: 'Recibimos tu aviso de pago. La inmobiliaria lo verificará a la brevedad.',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      console.error('Error notificando pago por transferencia:', error);

      const isTimeout =
        error?.code === 'ECONNABORTED' ||
        String(error?.message || '').toLowerCase().includes('timeout');

      const msg =
        (isTimeout ? 'La solicitud tardó demasiado. Probá nuevamente en unos segundos o revisá tu conexión.' : null) ||
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo avisar el pago.';

      Swal.fire({
        icon: 'error',
        title: 'No se pudo avisar el pago',
        text: msg,
      });
    } finally {
      setNotifyingPayment(false);
    }
  };

  const handleCopyAlias = async () => {
    const alias = transferenciaInfo?.alias?.trim();
    if (!alias) {
      showSnackbar('No hay alias para copiar', 'warning');
      return;
    }
    await copyToClipboard(alias, 'Alias copiado');
  };

  const handleCopyMonto = async () => {
    if (!selectedReciboToPay) {
      showSnackbar('No hay monto para copiar', 'warning');
      return;
    }

    const monto = Number(calcularMontoTotal(selectedReciboToPay)).toFixed(2);
    await copyToClipboard(monto, 'Monto copiado');
  };

  const normalizeTransferenciaInfo = (raw) => {
    const data = raw?.data ?? raw?.transferencia ?? raw ?? {};
    return {
      alias: data.alias ?? raw?.alias ?? '',
      cbu: data.cbu ?? raw?.cbu ?? '',
      titular: data.titular ?? raw?.titular ?? '',
      cuit: data.cuit ?? raw?.cuit ?? '',
      banco: data.banco ?? raw?.banco ?? '',
      nombreNegocio: data.nombreNegocio ?? raw?.nombreNegocio ?? '',
    };
  };

  const activeThread = commThreads.find(t => t.id === selectedThreadId) || commThreads[0];
  const activeMessages = commMessagesByThread[selectedThreadId] || [];

  const handleAddReportPhotos = (e) => {
    const files = Array.from(e?.target?.files || []);
    if (!files.length) return;

    const mapped = files
      .filter(f => (f?.type || '').startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      }));

    setReportPhotos(prev => {
      const next = [...prev, ...mapped].slice(0, 6);
      const overflow = [...prev, ...mapped].slice(6);
      overflow.forEach(p => {
        try { URL.revokeObjectURL(p.url); } catch (_) {}
      });
      return next;
    });

    e.target.value = '';
  };

  const handleRemoveReportPhoto = (photoId) => {
    setReportPhotos(prev => {
      const found = prev.find(p => p.id === photoId);
      if (found?.url) {
        try { URL.revokeObjectURL(found.url); } catch (_) {}
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const submitReporte = async () => {
    const token = localStorage.getItem('inquilino_token');
    const idContrato = contratoInfo?.id;

    if (!token) {
      navigate('/login-inquilinos');
      return;
    }

    if (!idContrato) {
      Swal.fire({
        icon: 'warning',
        title: 'No se pudo enviar el reporte',
        text: 'No se encontró el contrato asociado.',
      });
      return;
    }

    const prioridadMap = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
    };

    const tipoMap = {
      reparacion: 'reparacion',
      problema: 'otro',
    };

    const notaPayload = {
      idContrato,
      contenido: reportForm.descripcion,
      motivo: reportForm.asunto,
      estado: 'EN_PROCESO',
      prioridad: prioridadMap[reportForm.urgencia] || 'Media',
      tipo: tipoMap[reportForm.tipo] || 'reparacion',
      observaciones: '',
      visibilidad: 'PUBLICA',
    };

    const apiRoot = `${API_BASE}${String(API_BASE || '').includes('/api') ? '' : '/api'}`;
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(notaPayload)], { type: 'application/json' }));
    (reportPhotos || []).forEach((p) => {
      if (p?.file) formData.append('imagenes', p.file);
    });

    setSendingReport(true);
    try {
      const res = await fetch(`${apiRoot}/notas/crear-con-imagenes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        let detail = null;
        try {
          detail = await res.json();
        } catch (_) {
          try {
            detail = await res.text();
          } catch (_) {}
        }
        const msg = (detail && (detail.message || detail.error)) || 'Error al enviar el reporte.';
        throw new Error(msg);
      }

      let createdNote = null;
      try {
        const payload = await res.json();
        createdNote = Array.isArray(payload) ? payload[0] : (payload?.data || payload);
      } catch (_) {}

      if (createdNote && createdNote.idContrato === idContrato) {
        setNotasContrato((prev) => {
          const next = [createdNote, ...(prev || [])];
          next.sort((a, b) => {
            if (a?.id && b?.id) return b.id - a.id;
            const ta = new Date(a?.fechaCreacion || 0).getTime();
            const tb = new Date(b?.fechaCreacion || 0).getTime();
            return tb - ta;
          });
          return next;
        });
      }

      setReportSent(true);
      setReportForm({ tipo: 'problema', asunto: '', descripcion: '', urgencia: 'media' });
      setReportPhotos(prev => {
        prev.forEach(p => {
          try { URL.revokeObjectURL(p.url); } catch (_) {}
        });
        return [];
      });

      try {
        window.dispatchEvent(new CustomEvent('nota-creada', { detail: createdNote || {
          ...notaPayload,
          fechaCreacion: new Date().toISOString(),
        }}));
      } catch (_) {}

      Swal.fire({
        icon: 'success',
        title: 'Reporte enviado',
        text: 'Quedó registrado para que la inmobiliaria lo gestione.',
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar el reporte',
        text: e?.message || 'Ocurrió un error',
      });
    } finally {
      setSendingReport(false);
    }
  };

  useEffect(() => {
    // Verificar si hay token y username
    const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
    const storedUsername = localStorage.getItem('inquilino_username') || localStorage.getItem('propietario_username');
    
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }
    
    setUsername(storedUsername || '');
    fetchRecibos(token);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('inquilino_token');
    const idContrato = contratoInfo?.id;

    if (activeSection !== 'comunicaciones') return;
    if (!token || !idContrato) return;

    const fetchNotasPorContrato = async () => {
      try {
        setLoadingNotasContrato(true);
        setErrorNotasContrato(null);

        const url = `${API_BASE}${String(API_BASE || '').includes('/api') ? '' : '/api'}/notas/por-contrato/${idContrato}`;
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = res?.data;
        const data = Array.isArray(payload)
          ? payload
          : (payload?.data && Array.isArray(payload.data) ? payload.data : []);
        setNotasContrato(data);
      } catch (e) {
        if (e?.response?.status === 401) {
          handleLogout();
          return;
        }
        setErrorNotasContrato('Error al cargar las notas.');
      } finally {
        setLoadingNotasContrato(false);
      }
    };

    fetchNotasPorContrato();
  }, [API_BASE, activeSection, contratoInfo?.id]);

  // Efecto para cargar información del contrato cuando se accede a la sección home
  useEffect(() => {
    if (activeSection === 'home') {
      const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
      if (token && !contratoInfo) {
        fetchContratoInfo(token);
      }
    }
  }, [activeSection, contratoInfo]);

  const fetchRecibos = async (token) => {
    try {
      setLoading(true);

      // Obtener contratoId desde estado o API si no está
      let contratoId = contratoInfo?.id;
      if (!contratoId) {
        try {
          const resContrato = await axios.get(`${API_BASE}/inquilino/contrato/mi-contrato`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          contratoId = resContrato.data?.id;
          // Seteamos contratoInfo y nombre para futuros usos
          setContratoInfo(resContrato.data);
          if (resContrato.data?.nombreContrato) {
            setNombreInmoContrato(resContrato.data.nombreContrato);
          }
        } catch (e) {
          console.warn('No se pudo obtener contrato del inquilino para traer recibos');
        }
      }

      if (!contratoId) {
        console.warn('No hay contratoId disponible, no se pueden cargar recibos');
        setRecibos([]);
        return;
      }

      // Llamar al endpoint por contrato (como en ReciboForm)
      const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
      let recibosData = [];
      try {
        const resByContrato = await axios.get(`${API_BASE}/recibo/por-contrato/${contratoId}`, authHeaders);
        recibosData = Array.isArray(resByContrato.data)
          ? resByContrato.data
          : (resByContrato.data && Array.isArray(resByContrato.data.data))
            ? resByContrato.data.data
            : [];
      } catch (e) {
        // Fallback: si falla, dejar vacío (o podríamos intentar otro endpoint si existiera)
        console.warn('Fallo endpoint por contrato, sin fallback en DashboardInquilinos');
        recibosData = [];
      }

      // Normalización básica como en ReciboForm
      const recibosNormalizados = recibosData.map((recibo) => ({
        id: recibo.id || 0,
        numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
        fechaEmision: Array.isArray(recibo.fechaEmision)
          ? new Date(recibo.fechaEmision[0], (recibo.fechaEmision[1] || 1) - 1, recibo.fechaEmision[2] || 1).toISOString()
          : recibo.fechaEmision,
        fechaVencimiento: Array.isArray(recibo.fechaVencimiento)
          ? new Date(recibo.fechaVencimiento[0], (recibo.fechaVencimiento[1] || 1) - 1, recibo.fechaVencimiento[2] || 1).toISOString()
          : recibo.fechaVencimiento,
        periodo: recibo.periodo || 'N/A',
        concepto: recibo.concepto || 'Alquiler mensual',
        montoTotal: recibo.montoTotal ?? 0,
        estado: recibo.estado ?? false,
        impuestos: Array.isArray(recibo.impuestos) ? recibo.impuestos : [],
        contrato: recibo.contrato || {},
      }));

      setRecibos(recibosNormalizados);
      console.log('[DashboardInquilinos] Recibos normalizados:', recibosNormalizados);

      // Si tenemos nombreContrato en contratoInfo, usarlo para buscar contrato completo
      if (!nombreInmoContrato && (contratoInfo?.nombreContrato)) {
        setNombreInmoContrato(contratoInfo.nombreContrato);
      }
    } catch (error) {
      console.error('Error fetching recibos:', error);
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }
      setError('Error al cargar los recibos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  const fetchContratoInfo = async (token) => {
    try {
      setLoadingContrato(true);
      const response = await axios.get(`${API_BASE}/inquilino/contrato/mi-contrato`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setContratoInfo(response.data);
      if (response.data?.nombreContrato) {
        setNombreInmoContrato(response.data.nombreContrato);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching contrato info:', error);
      
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }
      
      // No mostrar error si no hay contrato, es normal
      if (error.response?.status !== 404) {
        setError('Error al cargar la información del contrato.');
      }
    } finally {
      setLoadingContrato(false);
    }
  };

  const handleOpenPayModal = async (recibo) => {
    const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }

    setPayingReciboId(recibo.id);
    setSelectedReciboToPay(recibo);
    setPayModalOpen(true);

    try {
      setLoadingTransferenciaInfo(true);
      setTransferenciaInfo(null);

      let contrato = contratoInfo;
      if (!contrato?.usuarioDtoSalida?.id) {
        contrato = await fetchContratoInfo(token);
      }

      const usuarioId = contrato?.usuarioDtoSalida?.id;

      if (!usuarioId) {
        throw new Error('No se pudo obtener el usuario de la inmobiliaria.');
      }

      const resp = await axios.get(`${apiRoot}/usuario/cobro/${usuarioId}/transferencia`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransferenciaInfo(normalizeTransferenciaInfo(resp?.data));
    } catch (error) {
      console.error('Error obteniendo datos de transferencia:', error);
      const msg =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo cargar la información de pago.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
      });
    } finally {
      setLoadingTransferenciaInfo(false);
      setPayingReciboId(null);
    }
  };

  const handleClosePayModal = () => {
    setPayModalOpen(false);
    setSelectedReciboToPay(null);
    setTransferenciaInfo(null);
    setPayingReciboId(null);
    setYaPagueModalOpen(false);
  };

  const handleOpenMercadoPago = () => {
    const mpUrl = 'https://www.mercadopago.com.ar/';

    // mejor que location.href en PWA, pero con fallback si el popup está bloqueado
    const w = window.open(mpUrl, '_blank', 'noopener,noreferrer');
    if (!w) {
      window.location.href = mpUrl;
    }
  };


  // Efecto para obtener el contrato completo cuando se tiene el nombre
  useEffect(() => {
    const fetchContratoCompleto = async () => {
      if (!nombreInmoContrato) {
        return;
      }
      
      try {
        const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
        if (!token) {
          console.error('No hay token disponible');
          return;
        }

   
        
        // Construir la URL completa para debugging
        const baseUrl = `${import.meta.env.VITE_API_URL}/contrato/buscar-por-nombre`;
        const fullUrl = `${baseUrl}?nombre=${encodeURIComponent(nombreInmoContrato)}`;
        
        const contratoResponse = await axios.get(baseUrl, {
          params: { nombre: nombreInmoContrato },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        

        setContratoCompleto(contratoResponse.data);
        
      } catch (error) {
        console.error('❌ Error obteniendo contrato completo:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      }
    };

    fetchContratoCompleto();
  }, [nombreInmoContrato]);

  // Efecto para filtrar recibos por mes y año
  useEffect(() => {
    if (!recibos || recibos.length === 0) {
      setFilteredRecibos([]);
      return;
    }

    let filtered = [...recibos];

    // Filtrar por año si está seleccionado
    if (selectedYear) {
      filtered = filtered.filter(recibo => {
        const fechaEmision = new Date(recibo.fechaEmision);
        return fechaEmision.getFullYear().toString() === selectedYear;
      });
    }

    // Filtrar por mes si está seleccionado
    if (selectedMonth) {
      filtered = filtered.filter(recibo => {
        const fechaEmision = new Date(recibo.fechaEmision);
        return (fechaEmision.getMonth() + 1).toString() === selectedMonth;
      });
    }

    setFilteredRecibos(filtered);
  }, [recibos, selectedMonth, selectedYear]);

  // Función para obtener años únicos de los recibos
  const getAvailableYears = () => {
    if (!recibos || recibos.length === 0) return [];
    
    const years = recibos.map(recibo => {
      const fecha = new Date(recibo.fechaEmision);
      return fecha.getFullYear();
    });
    
    return [...new Set(years)].sort((a, b) => b - a); // Ordenar descendente
  };

  // Función para obtener meses únicos de los recibos (del año seleccionado)
  const getAvailableMonths = () => {
    if (!recibos || recibos.length === 0) return [];
    
    let recibosParaMeses = recibos;
    
    // Si hay año seleccionado, filtrar por ese año
    if (selectedYear) {
      recibosParaMeses = recibos.filter(recibo => {
        const fecha = new Date(recibo.fechaEmision);
        return fecha.getFullYear().toString() === selectedYear;
      });
    }
    
    const months = recibosParaMeses.map(recibo => {
      const fecha = new Date(recibo.fechaEmision);
      return fecha.getMonth() + 1; // +1 porque getMonth() devuelve 0-11
    });
    
    return [...new Set(months)].sort((a, b) => a - b); // Ordenar ascendente
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
  };

  
  const handleLogout = () => {
    localStorage.removeItem('inquilino_token') ;
    localStorage.removeItem('inquilino_username') ;
    localStorage.removeItem('chat_session_id');
    localStorage.removeItem('username');
    localStorage.removeItem('authorities');
    navigate('/login-inquilinos');
  };

  const handleOpenPdfViewer = (pdfUrl, title) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentPdfTitle(title);
    setPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setCurrentPdfUrl('');
    setCurrentPdfTitle('');
  };

  const showSnackbar = (message, severity) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: severity,
      title: message, 
      showConfirmButton: false,
      timer: 2000,
      background: "rgb(86, 23, 164)",
      color: 'white'
    });
  };
let mesesTotales = 0;
let mesesTranscurridos = 0;
let mesesRestantes = 0;

if (contratoInfo) {
  const fechaInicio = new Date(contratoInfo.fechaInicio);
  const fechaFin = new Date(contratoInfo.fechaFin);
  const hoy = new Date();

  mesesTotales = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth());
  mesesTranscurridos = (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 + (hoy.getMonth() - fechaInicio.getMonth());
  mesesRestantes = Math.max(0, mesesTotales - mesesTranscurridos);
}
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const calcularMontoTotal = (recibo) => {
    const montoAlquiler = Number(recibo?.montoTotal ?? 0) || 0;
    const montoImpuestos = Array.isArray(recibo?.impuestos)
      ? recibo.impuestos.reduce((total, impuesto) => {
          const monto = Number(impuesto?.montoAPagar ?? 0) || 0;
          const porcentaje = Number(impuesto?.porcentaje ?? 100);
          const porcentajeValido = Number.isFinite(porcentaje) ? porcentaje : 100;
          const montoCalculado = porcentajeValido === 100 ? monto : monto * (porcentajeValido / 100);
          return total + montoCalculado;
        }, 0)
      : 0;

    return montoAlquiler + montoImpuestos;
  };

  const getEstadoColor = (estado) => {
    return estado ? 'success' : 'error';
  };

  const getEstadoText = (estado) => {
    return estado ? 'Pagado' : 'Pendiente';
  };

  const getImpuestoIcon = (tipo) => {
    switch (tipo) {
      case 'AGUA':
        return <WaterIcon sx={{ color: '#2196f3' }} />;
      case 'GAS':
        return <GasIcon sx={{ color: '#ff9800' }} />;
      case 'LUZ':
        return <ElectricIcon sx={{ color: '#ffc107' }} />;
      case 'MUNICIPAL':
        return <MunicipalIcon sx={{ color: '#4caf50' }} />;
      default:
        return <ReceiptIcon />;
    }
  };

  const formatFecha = (fecha) => {
    // Si es un array, formatearlo como dd/mm/yyyy
    if (Array.isArray(fecha) && fecha.length >= 3) {
      return `${String(fecha[2]).padStart(2, '0')}/${String(fecha[1]).padStart(2, '0')}/${fecha[0]}`;
    }

    if (typeof fecha === 'string') {
      const trimmed = fecha.trim();

      // Evitar corrimientos por timezone cuando viene como YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [yyyy, mm, dd] = trimmed.split('-');
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    
    // Si es una fecha válida
    if (fecha && !isNaN(Date.parse(fecha))) {
      return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    }
    
    return 'N/A';
  };

  const handleDownloadRecibo = async (recibo) => {
    try {
      setDownloadingRecibo(recibo.id);
      

      // Usar el contrato completo que ya está disponible en el estado

      // Normalizar datos del recibo con información del contrato completo
      const reciboNormalizado = {
        id: recibo.id,
        numeroRecibo: recibo.numeroRecibo || 'N/A',
        fechaEmision: recibo.fechaEmision,
        fechaVencimiento: recibo.fechaVencimiento,
        periodo: recibo.periodo || 'N/A',
        concepto: recibo.concepto || 'Alquiler mensual',
        montoTotal: parseFloat(recibo.montoTotal || 0),
        estado: recibo.estado,
        impuestos: Array.isArray(recibo.impuestos) ? recibo.impuestos.map(imp => ({
          id: imp.id || 0,
          tipoImpuesto: imp.tipoImpuesto || 'Otro',
          montoAPagar: parseFloat(imp.montoAPagar || 0),
          estadoPago: imp.estadoPago === undefined ? false : imp.estadoPago,
          porcentaje: parseFloat(imp.porcentaje || 100)
        })) : [],
        contrato: contratoCompleto || recibo.contrato || {}
      };
console.log(reciboNormalizado)
      // Asegurar que el contrato tenga todas las propiedades necesarias
      if (reciboNormalizado.contrato) {
        reciboNormalizado.contrato.inquilino = reciboNormalizado.contrato.inquilino || {};
        reciboNormalizado.contrato.propiedad = reciboNormalizado.contrato.propiedad || {};
        reciboNormalizado.contrato.propietario = reciboNormalizado.contrato.propietario || {};
      }

      // Crear un documento PDF usando jsPDF
      const doc = new jsPDF();

      // Configuración de colores
      const primaryRgb = { r: 26, g: 35, b: 126 }; // #1a237e
      const secondaryRgb = { r: 100, g: 100, b: 100 };

      // Cabecera con diseño moderno
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, 210, 30, 'F');

      // Título del recibo
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('RECIBO DE PAGO', 105, 15, { align: 'center' });

      // Subtítulo
      doc.setFontSize(12);
      const subtitulo = contratoInfo ? `${contratoInfo.usuarioDtoSalida.nombreNegocio || ''} - COL: ${contratoInfo.usuarioDtoSalida.matricula || ''}`.trim() || 'Portal de Inquilinos' : 'Portal de Inquilinos';
      doc.text(subtitulo, 105, 22, { align: 'center' });

      // Espacio para logo
      const logoWidth = 30;
      const logoHeight = 30;
      const logoX = 20;
      const logoY = 32;
      // Agregar la imagen al PDF si existe logo válido
      if (contratoInfo && contratoInfo.usuarioDtoSalida.logo) {
        try {
          doc.addImage(contratoInfo.usuarioDtoSalida.logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
          // Si el logo no es compatible/valido, continuar sin imagen
          // console.warn('Logo inválido, se omite en el PDF:', e);
        }
      }

      // Información de la empresa
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(contratoInfo?.usuarioDtoSalida?.nombreNegocio || 'Inmobiliaria', 55, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(`${contratoInfo?.usuarioDtoSalida?.razonSocial || ''}, ${contratoInfo?.usuarioDtoSalida?.localidad || ''}`, 55, 50);
      doc.text(`${contratoInfo?.usuarioDtoSalida?.partido || ''}, ${contratoInfo?.usuarioDtoSalida?.provincia || ''}`, 55, 55);

      // Línea separadora
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      // Datos principales del recibo (sección destacada)
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, 70, 170, 30, 2, 2, 'F');

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Recibo N°: ${reciboNormalizado.numeroRecibo}`, 25, 80);
      doc.text(`Fecha de Emisión: ${formatFecha(reciboNormalizado.fechaEmision)}`, 25, 90);

      // Estado del pago con colores
      doc.text('Estado:', 130, 80);
      if (reciboNormalizado.estado) {
        doc.setTextColor(0, 128, 0);
        doc.text('PAGADO', 155, 80);
      } else {
        doc.setTextColor(255, 0, 0);
        doc.text('PENDIENTE', 155, 80);
      }

      doc.setTextColor(0, 0, 0);
      doc.text(`Vencimiento: ${formatFecha(reciboNormalizado.fechaVencimiento)}`, 130, 90);

      // Información del inquilino/propiedad
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL INQUILINO', 20, 110);

      doc.setLineWidth(0.2);
      doc.line(20, 117, 100, 117);

      doc.setFont('helvetica', 'normal');

      // Construir textos con fallback seguro
      const inqNombre = [
        contratoInfo?.inquilino?.nombre,
        contratoInfo?.inquilino?.apellido
      ].filter(Boolean).join(' ').trim();
      const inqDisplay = inqNombre || 'N/A';
      const inqDni = (contratoInfo?.inquilino?.dni ?? '').toString() || 'N/A';

      const propDir =  contratoInfo?.direccionPropiedad || 'N/A';
      const propLoc = contratoInfo?.localidad || '';
      const propPart = contratoInfo?.partido || '';
      const propLinea = [propLoc, propPart].filter(Boolean).join(', ') || 'N/A';

      const duenoNombre = [
        contratoInfo?.propietario?.nombre,
        contratoInfo?.propietario?.apellido
      ].filter(Boolean).join(' ').trim();
      const duenoDisplay = duenoNombre || 'N/A';
      const duenoDni = (contratoInfo?.propietario?.dni ?? '').toString() || 'N/A';

      doc.text(`Inquilino: ${inqDisplay}`, 20, 125);
      doc.text(`DNI: ${inqDni}`, 20, 132);
      doc.text(`Propiedad: ${propDir}`, 20, 139);

      // Datos del propietario
      doc.text(`Propietario: ${duenoDisplay}`, 130, 125);
      doc.text(`DNI: ${duenoDni}`, 130, 132);

      // Detalles del pago
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DEL PAGO', 20, 160);
      doc.setLineWidth(0.2);
      doc.line(20, 162, 80, 162);

      doc.setFont('helvetica', 'normal');
      doc.text(`${reciboNormalizado.periodo}`, 20, 170);
      doc.text(`${reciboNormalizado.concepto}`, 20, 177, {
        maxWidth: 165,
        align: 'left'
      });

      // Tabla de importes
      let y = 190;

      // Cabecera de la tabla
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Concepto', 25, y+5, {
        align: 'left'
      });
      doc.text('Importe', 160, y+5, {align: 'right'});

      y += 12;
      doc.setFont('helvetica', 'normal');

      // Alquiler base
      const montoAlquilerBase = reciboNormalizado.montoTotal || 0;
      
      doc.text('Alquiler base', 25, y);
      doc.text(`$${montoAlquilerBase.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 160, y, {align: 'right'});

      // Impuestos
      let totalImpuestosCalculados = 0;
      if (reciboNormalizado.impuestos && reciboNormalizado.impuestos.length > 0) {
        reciboNormalizado.impuestos.forEach(impuesto => {
          y += 8;
          doc.text(`${impuesto.tipoImpuesto} ${impuesto.porcentaje && impuesto.porcentaje !== 100 ? `(${impuesto.porcentaje}%)` : ''}`, 25, y, {
            maxWidth: 80,
            align: 'left'
          });

          // Calcular el monto aplicando el porcentaje
          const montoOriginal = parseFloat(impuesto.montoAPagar) || 0;
          const porcentaje = parseFloat(impuesto.porcentaje) || 100;
          const montoCalculado = porcentaje === 100 ? montoOriginal : montoOriginal * (porcentaje / 100);
          totalImpuestosCalculados += montoCalculado;

          // Mostrar el monto calculado según el porcentaje
          doc.text(`$${montoCalculado.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`, 160, y, {align: 'right'});
        });
      }

      // Total
      y += 12;
      const totalAPagar = reciboNormalizado.impuestos.reduce((total, impuesto) => {
        const montoImpuesto = parseFloat(impuesto.montoAPagar || 0);
        const porcentajeImpuesto = parseFloat(impuesto.porcentaje || 100);
        const montoCalculado = porcentajeImpuesto === 100 
          ? montoImpuesto 
          : montoImpuesto * (porcentajeImpuesto / 100);
        return total + montoCalculado;
      }, parseFloat(reciboNormalizado.montoTotal || 0));

      doc.setDrawColor(200, 200, 200);
      doc.line(110, y-4, 170, y-4);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL A PAGAR', 110, y);
      doc.text(`$${totalAPagar.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 160, y, {align: 'right'});

      // Pie de página
      doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Este recibo fue generado digitalmente y no requiere firma física.', 105, 280, {align: 'center'});
      doc.text(`Fecha de impresión: ${new Date().toLocaleDateString()}`, 105, 285, {align: 'center'});

      // Descargar el PDF
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo_${reciboNormalizado.numeroRecibo}_${reciboNormalizado.periodo.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSnackbar('Recibo descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error generando PDF:', error);
      showSnackbar('Error: No se pudo generar el PDF.', 'error');
    } finally {
      setDownloadingRecibo(null);
    }
  };

  const handlePayRecibo = async (recibo) => {
    const token = localStorage.getItem('inquilino_token') || localStorage.getItem('propietario_token');
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }

    setPayingReciboId(recibo.id);
    try {
      const response = await axios.post(
        `${apiRoot}/recibo/${recibo.id}/pagar/mp`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const initPoint = response?.data?.initPoint;
      if (!initPoint) {
        throw new Error('No se pudo iniciar el pago.');
      }

      window.location.href = initPoint;
    } catch (error) {
      console.error('Error iniciando pago:', error);
   const backendMessage =
  error?.response?.data?.detalle ||   
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  'No se pudo iniciar el pago.';
  console.log("BACKEND DATA:", error?.response?.data);
      const normalizedMessage = backendMessage?.toLowerCase?.() || '';
      const mpNotConnected = normalizedMessage.includes('mercado pago') && normalizedMessage.includes('conect');
      const msg = mpNotConnected
        ? 'La inmobiliaria aún no conectó Mercado Pago. Pedile que lo conecte desde Configuración.'
        : backendMessage;
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar el pago',
        text: msg,
      });
    } finally {
      setPayingReciboId(null);
    }
  };

  const toggleExpandRecibo = (reciboId) => {
    setExpandedRecibos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reciboId)) {
        newSet.delete(reciboId);
      } else {
        newSet.add(reciboId);
      }
      return newSet;
    });
  };

  const formatContractText = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Convertir HTML a texto pero manteniendo estructura
    let text = htmlContent
      // Reemplazar divs y párrafos con saltos de línea
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br[^>]*>/gi, '\n')
      // Remover todas las demás etiquetas HTML
      .replace(/<[^>]*>/g, '')
      // Decodificar entidades HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Limpiar espacios múltiples y saltos de línea excesivos
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
    
    return text;
  };

  const accentColor = '#8b5cf6';
  const accentDark = '#7c3aed';
  const accentDarker = '#6d28d9';

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: isDark ? '#0f0f17' : '#f8f7fc',
        gap: 2,
      }}>
        <CircularProgress size={48} sx={{ color: accentColor }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Cargando tu portal...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0f0f17' : '#f8f7fc' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        color: 'white',
        px: { xs: 2, md: 3 },
        pt: { xs: 2.5, md: 3 },
        pb: { xs: 3, md: 3.5 },
        borderBottomLeftRadius: { xs: 20, md: 24 },
        borderBottomRightRadius: { xs: 20, md: 24 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: '30%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, letterSpacing: 0.5 }}>
              Portal de Inquilinos
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
              Hola, {username || 'Inquilino'}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleLogout}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
            size="small"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 12, md: 14 } }}>
        <Modal
          open={payModalOpen}
          onClose={handleClosePayModal}
          closeAfterTransition
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Slide in={payModalOpen} direction="up">
            <Paper
              sx={{
                width: '100%',
                maxWidth: 520,
                maxHeight: '90vh',
                height: '90vh',
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                overflow: 'hidden',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Pagar
                </Typography>
                <IconButton onClick={handleClosePayModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider />

              <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Mercado Pago
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Transferencia a la inmobiliaria
                </Typography>

                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 181, 226, 0.06)',
                  border: '1px solid rgba(0, 181, 226, 0.2)',
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    ¿Cómo pagar?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1) Copiá el monto y el alias.
                    <br />
                    2) Abrí Mercado Pago.
                    <br />
                    3) Elegí la opción “Transferir”.
                    <br />
                    4) Pegá el alias y el monto para completar el pago.
                    <br />
                    5) Una vez realizado el pago, hacé click en “Ya pagué” para que sepamos de tu pago.
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Inmobiliaria
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {contratoInfo?.usuarioDtoSalida?.nombreNegocio || nombreInmoContrato || transferenciaInfo?.nombreNegocio || '—'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monto
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {selectedReciboToPay
                        ? `$${calcularMontoTotal(selectedReciboToPay).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '—'}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCopyMonto}
                      disabled={loadingTransferenciaInfo || !selectedReciboToPay}
                      startIcon={<ContentCopyIcon fontSize="small" />}
                      sx={{ textTransform: 'none' }}
                    >
                      Copiar monto
                    </Button>
                  </Box>
                </Box>

                {loadingTransferenciaInfo ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Alias
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {transferenciaInfo?.alias || '—'}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleCopyAlias}
                          disabled={loadingTransferenciaInfo || !transferenciaInfo?.alias}
                          startIcon={<ContentCopyIcon fontSize="small" />}
                          sx={{ textTransform: 'none' }}
                        >
                          Copiar alias
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      {transferenciaInfo?.titular && (
                        <Typography variant="body2" color="text.secondary">
                          Titular: <span style={{ color: 'inherit', fontWeight: 600 }}>{transferenciaInfo.titular}</span>
                        </Typography>
                      )}
                      {transferenciaInfo?.banco && (
                        <Typography variant="body2" color="text.secondary">
                          Banco: <span style={{ color: 'inherit', fontWeight: 600 }}>{transferenciaInfo.banco}</span>
                        </Typography>
                      )}
                      {transferenciaInfo?.cbu && (
                        <Typography variant="body2" color="text.secondary">
                          CBU: <span style={{ color: 'inherit', fontWeight: 600 }}>{transferenciaInfo.cbu}</span>
                        </Typography>
                      )}
                      {transferenciaInfo?.cuit && (
                        <Typography variant="body2" color="text.secondary">
                          CUIT: <span style={{ color: 'inherit', fontWeight: 600 }}>{transferenciaInfo.cuit}</span>
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderTop: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: 'background.paper',
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenMercadoPago}
                  disabled={loadingTransferenciaInfo}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.4,
                    borderRadius: 2,
                    backgroundColor: '#00B5E2',
                    '&:hover': { backgroundColor: '#0099CC' },
                  }}
                >
                  Abrir Mercado Pago
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5, textAlign: 'center' }}
                >
                  o abona desde tu app bancaria
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleOpenYaPagueModal}
                  disabled={loadingTransferenciaInfo || notifyingPayment}
                  sx={{
                    mt: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {notifyingPayment ? 'Enviando...' : 'Ya pagué'}
                </Button>
              </Box>
            </Paper>
          </Slide>
        </Modal>

        <Dialog open={yaPagueModalOpen} onClose={handleCloseYaPagueModal} fullWidth maxWidth="sm">
          <DialogTitle>Notificar pago por transferencia</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>


              <TextField
                label="Referencia"
                value={yaPagueReference}
                onChange={(e) => setYaPagueReference(e.target.value)}
                fullWidth
                disabled={notifyingPayment}
                placeholder="Ej: apellido / febrero 26"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseYaPagueModal} disabled={notifyingPayment} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitYaPague}
              disabled={notifyingPayment}
              sx={{ textTransform: 'none', fontWeight: 800 }}
            >
              {notifyingPayment ? 'Enviando...' : 'Enviar aviso'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Contenido según la sección activa */}
        {activeSection === 'home' && (
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {loadingContrato ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                <CircularProgress sx={{ color: accentColor }} />
              </Box>
            ) : contratoInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Info card */}
                <Paper elevation={0} sx={{
                  p: 2.5, borderRadius: 3,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#a78bfa' : accentDark }}>
                    Información General
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { label: 'Titular', value: `${contratoInfo.nombreInquilino || ''} ${contratoInfo.apellidoInquilino || ''}`.trim() || 'N/A' },
                      { label: 'Contrato', value: contratoInfo.nombreContrato },
                      { label: 'Dirección', value: contratoInfo.direccionPropiedad },
                    ].map((item) => (
                      <Box key={item.label}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Inicio</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatFecha(contratoInfo.fechaInicio)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Fin</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatFecha(contratoInfo.fechaFin)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Duration stats */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[
                    { value: mesesTotales, label: 'Totales', color: isDark ? '#a78bfa' : accentDark, bg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)' },
                    { value: Math.max(0, mesesTranscurridos), label: 'Transcurridos', color: '#22c55e', bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)' },
                    { value: mesesRestantes, label: 'Restantes', color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.06)' },
                  ].map((stat) => (
                    <Paper key={stat.label} elevation={0} sx={{
                      flex: 1, p: 2, borderRadius: 3, textAlign: 'center',
                      bgcolor: stat.bg,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.65rem' }}>
                        {stat.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                {/* Quick actions */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Paper elevation={0} onClick={() => setActiveSection('recibos')} sx={{
                    flex: 1, p: 2, borderRadius: 3, cursor: 'pointer',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1.5,
                    '&:hover': { borderColor: accentColor, transform: 'translateY(-2px)', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)' },
                  }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReceiptIcon sx={{ fontSize: 20, color: accentColor }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Recibos</Typography>
                      <Typography variant="caption" color="text.secondary">Ver mis pagos</Typography>
                    </Box>
                  </Paper>
                  <Paper elevation={0} onClick={() => setActiveSection('comunicaciones')} sx={{
                    flex: 1, p: 2, borderRadius: 3, cursor: 'pointer',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1.5,
                    '&:hover': { borderColor: accentColor, transform: 'translateY(-2px)', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)' },
                  }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: isDark ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReportProblemIcon sx={{ fontSize: 20, color: '#ec4899' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Reportes</Typography>
                      <Typography variant="caption" color="text.secondary">Reparaciones</Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Contract PDF preview */}
                {contratoInfo?.contratoPdf && (
                  <Paper elevation={0} sx={{
                    borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: accentColor, boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)' },
                  }} onClick={() => setOpenContractModal(true)}>
                    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PdfIcon sx={{ fontSize: 24, color: '#ef4444' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Contrato de Alquiler</Typography>
                        <Typography variant="caption" color="text.secondary">Toca para ver el contrato completo</Typography>
                      </Box>
                      <ViewIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </Box>
                    <Box sx={{
                      mx: 2.5, mb: 2, p: 2, borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8f7fc',
                      maxHeight: 70, overflow: 'hidden', position: 'relative',
                    }}>
                      <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'text.secondary' }}>
                        {formatContractText(contratoInfo.contratoPdf).substring(0, 180)}...
                      </Typography>
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: isDark ? 'linear-gradient(transparent, #1e1e2e)' : 'linear-gradient(transparent, #f8f7fc)' }} />
                    </Box>
                  </Paper>
                )}
              </Box>
            ) : (
              <Paper elevation={0} sx={{
                p: 5, textAlign: 'center', borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2, bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HomeIcon sx={{ fontSize: 28, color: accentColor }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Sin información de contrato
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No hay información de contrato disponible para tu usuario.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<ReceiptIcon />} onClick={() => setActiveSection('recibos')}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}>
                    Ver Recibos
                  </Button>
                  <Button variant="outlined" startIcon={<MessageIcon />} onClick={() => setActiveSection('comunicaciones')}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}>
                    Reportes
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {activeSection === 'comunicaciones' && (
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Paper elevation={0} sx={{
              borderRadius: 3, overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <Box sx={{ px: 2, pt: 1.5, bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.03)' }}>
                <Tabs
                  value={commTab}
                  onChange={(_, v) => {
                    setCommTab(v);
                    setReportSent(false);
                  }}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : false}
                  sx={{
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' },
                    '& .Mui-selected': { color: `${accentColor} !important` },
                    '& .MuiTabs-indicator': { bgcolor: accentColor },
                  }}
                >
                  <Tab icon={<ReportProblemIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Reportar / Reparaciones" />
                </Tabs>
              </Box>

              <Divider />

              

              {commTab === 0 && (
                <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Grid2 container spacing={2}>
                    <Grid2 item xs={12} md={7}>
                      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ReportProblemIcon sx={{ color: 'rgb(86, 23, 164)' }} />
                          <Typography sx={{ fontWeight: 900, color: 'rgba(30, 27, 36, 0.92)' }}>
                            Crear reporte
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.72)', mb: 2 }}>
                          Completá el formulario para informar un problema o solicitar una reparación.
                        </Typography>

                        <Grid2 container spacing={2} sx={{display:"flex",
                          flexDirection:"column"
                        }}>
                          <Grid2 item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Tipo</InputLabel>
                              <Select
                                value={reportForm.tipo}
                                label="Tipo"
                                onChange={(e) => setReportForm((p) => ({ ...p, tipo: e.target.value }))}
                              >
                                <MenuItem value="problema">Problema</MenuItem>
                                <MenuItem value="reparacion">Reparación</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid2>
                          <Grid2 item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Urgencia</InputLabel>
                              <Select
                                value={reportForm.urgencia}
                                label="Urgencia"
                                onChange={(e) => setReportForm((p) => ({ ...p, urgencia: e.target.value }))}
                              >
                                <MenuItem value="baja">Baja</MenuItem>
                                <MenuItem value="media">Media</MenuItem>
                                <MenuItem value="alta">Alta</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid2>
                          <Grid2 item xs={12}>
                            <TextField
                              size="small"
                              fullWidth
                              label="Asunto"
                              value={reportForm.asunto}
                              onChange={(e) => setReportForm((p) => ({ ...p, asunto: e.target.value }))}
                            />
                          </Grid2>
                          <Grid2 item xs={12}>
                            <TextField
                              fullWidth
                              label="Descripción"
                              multiline
                              minRows={4}
                              value={reportForm.descripcion}
                              onChange={(e) => setReportForm((p) => ({ ...p, descripcion: e.target.value }))}
                            />
                          </Grid2>

                          <Grid2 item xs={12}>
                            <Box
                              sx={{
                                border: '1px dashed rgba(15, 23, 42, 0.18)',
                                borderRadius: 3,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.25,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                <Box>
                                  <Typography sx={{ fontWeight: 900, color: 'rgba(30, 27, 36, 0.92)' }}>
                                    Fotos (opcional)
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.72)' }}>
                                    Podés adjuntar hasta 6 imágenes.
                                  </Typography>
                                </Box>

                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<PhotoCameraIcon />}
                                  sx={{ borderRadius: 999, textTransform: 'none' }}
                                >
                                  Agregar fotos
                                  <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddReportPhotos}
                                  />
                                </Button>
                              </Box>

                              {reportPhotos.length > 0 && (
                                <Grid2 container spacing={1}>
                                  {reportPhotos.map((p) => (
                                    <Grid2 item xs={4} sm={3} key={p.id}>
                                      <Box
                                        sx={{
                                          position: 'relative',
                                          width: '100%',
                                          paddingTop: '100%',
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                          border: '1px solid rgba(15, 23, 42, 0.10)',
                                          bgcolor: 'rgba(15, 23, 42, 0.04)',
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={p.url}
                                          alt={p.file?.name || 'foto'}
                                          sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                          }}
                                        />
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveReportPhoto(p.id)}
                                          sx={{
                                            position: 'absolute',
                                            top: 6,
                                            right: 6,
                                            bgcolor: 'rgba(255,255,255,0.92)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Grid2>
                                  ))}
                                </Grid2>
                              )}
                            </Box>
                          </Grid2>
                        </Grid2>

                        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            disabled={!reportForm.asunto.trim() || !reportForm.descripcion.trim()}
                            onClick={() => {
                              submitReporte();
                            }}
                            sx={{ borderRadius: 999, textTransform: 'none' }}
                          >
                            Enviar reporte
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setReportForm({ tipo: 'problema', asunto: '', descripcion: '', urgencia: 'media' });
                              setReportPhotos(prev => {
                                prev.forEach(p => {
                                  try { URL.revokeObjectURL(p.url); } catch (_) {}
                                });
                                return [];
                              });
                              setReportSent(false);
                            }}
                            sx={{ borderRadius: 999, textTransform: 'none' }}
                          >
                            Limpiar
                          </Button>
                          {reportSent && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Enviado"
                              color="success"
                              variant="outlined"
                              sx={{ borderRadius: 999 }}
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid2>
                         
                    {/* <Grid2 item xs={12} md={5}>
                      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <BuildIcon sx={{ color: 'rgb(86, 23, 164)' }} />
                          <Typography sx={{ fontWeight: 900, color: 'rgba(30, 27, 36, 0.92)' }}>
                            Tips para un buen reporte
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'grid', gap: 1.25 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.80)' }}>
                            - Contá qué pasó y desde cuándo.
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.80)' }}>
                            - Indicá si afecta servicios (agua/luz/gas).
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.80)' }}>
                            - Si podés, agregá fotos cuando lo conectemos al backend.
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(60,60,72,0.72)' }}>
                          Próximo paso: adjuntos, tracking de estado y chat asociado al reporte.
                        </Typography>
                      </Paper>
                    </Grid2> */}

                     <Grid2 item xs={12} md={5}>
                            <Paper sx={{ p: { xs: 2, md: 3 }, width:"78vw", borderRadius: 4, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography sx={{ fontWeight: 900, color: 'rgba(30, 27, 36, 0.92)' }}>
                                 Historial de reportes
                                </Typography>
                              </Box>
                              <Divider sx={{ my: 1.5 }} />

                              {loadingNotasContrato ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                  <CircularProgress size={26} />
                                </Box>
                              ) : errorNotasContrato ? (
                                <Alert severity="error">{errorNotasContrato}</Alert>
                              ) : notasContrato.length === 0 ? (
                                <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.72)' }}>
                                  No hay notas para este contrato.
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'grid', gap: 1.25, }}>
                                  {notasContrato.slice(0, 6).map((n) => (
                                    <Paper
                                      key={n.id || `${n.motivo}-${n.fechaCreacion}`}
                                      variant="outlined"
                                      onClick={() => {
                                        setNotaSeleccionada(n);
                                        setModalNotaOpen(true);
                                      }}
                                      sx={{
                                        p: 1.25,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.2s, transform 0.2s',
                                        '&:hover': {
                                          boxShadow: 3,
                                          transform: 'translateY(-1px)',
                                        },
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                                        {n.motivo || 'Sin título'}
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(60,60,72,0.80)', whiteSpace: 'pre-line' }}>
                                        {n.contenido || ''}
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                                        {n.estado ? <Chip size="small" label={n.estado} /> : null}
                                        {n.prioridad ? <Chip size="small" variant="outlined" label={n.prioridad} /> : null}
                                        {n.tipo ? <Chip size="small" variant="outlined" label={n.tipo} /> : null}
                                      </Box>
                                    </Paper>
                                  ))}
                                </Box>
                              )}
                            </Paper>
                          </Grid2>
                  </Grid2>
                  
                </Box>
              )}

              <ModalNotas
                open={modalNotaOpen}
                onClose={() => {
                  setModalNotaOpen(false);
                  setNotaSeleccionada(null);
                }}
                nota={notaSeleccionada}
                contrato={contratoInfo?.id}
                contratoInfo={contratoInfo}
              />

             
            </Paper>
          </Box>
        )}

        {activeSection === 'recibos' && (
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            {/* Filtros de fecha */}
            <Paper elevation={0} sx={{
              mb: 2.5, borderRadius: 3, p: 2,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filtrar</Typography>
                <Chip label={`${filteredRecibos.length}`} size="small"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)', color: isDark ? '#a78bfa' : accentDark }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Año</InputLabel>
                  <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}
                    sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {getAvailableYears().map(year => (
                      <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Mes</InputLabel>
                  <Select value={selectedMonth} label="Mes" onChange={(e) => setSelectedMonth(e.target.value)}
                    disabled={!selectedYear && recibos.length > 12}
                    sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {getAvailableMonths().map(month => (
                      <MenuItem key={month} value={month.toString()}>
                        {new Date(2024, month - 1).toLocaleString('es-ES', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {(selectedMonth || selectedYear) && (
                  <Button size="small" onClick={clearFilters}
                    sx={{ textTransform: 'none', fontWeight: 600, color: accentColor, fontSize: '0.8rem' }}>
                    Limpiar
                  </Button>
                )}
              </Box>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>{error}</Alert>
            )}

            {!Array.isArray(filteredRecibos) || filteredRecibos.length === 0 ? (
              <Paper elevation={0} sx={{
                p: 5, textAlign: 'center', borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2, bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 28, color: accentColor }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {!Array.isArray(recibos) || recibos.length === 0 ? 'No hay recibos disponibles' : 'Sin resultados'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {!Array.isArray(recibos) || recibos.length === 0 ? 'Aún no tenés recibos emitidos' : 'Probá con otros filtros'}
                </Typography>
                {(selectedMonth || selectedYear) && (
                  <Button variant="outlined" onClick={clearFilters} sx={{ mt: 2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: accentColor, color: accentColor }}>
                    Limpiar filtros
                  </Button>
                )}
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredRecibos.map((recibo) => (
                  <Paper key={recibo.id} elevation={0} sx={{
                    borderRadius: 3, overflow: 'hidden',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  }}>
                    {/* Status accent bar */}
                    <Box sx={{ height: 3, background: recibo.estado ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />

                    <Box sx={{ p: 2.5 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Recibo #{recibo.numeroRecibo} — {recibo.periodo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{recibo.concepto}</Typography>
                        </Box>
                        <Chip
                          label={getEstadoText(recibo.estado)}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: '0.7rem', height: 24,
                            bgcolor: recibo.estado ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)') : (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)'),
                            color: recibo.estado ? '#22c55e' : '#f59e0b',
                          }}
                        />
                      </Box>

                      {/* Dates row */}
                      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Emisión</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatFecha(recibo.fechaEmision)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Vencimiento</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatFecha(recibo.fechaVencimiento)}</Typography>
                        </Box>
                      </Box>

                      {/* Monto Alquiler */}
                      <Box sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        p: 2, borderRadius: 2.5, mb: 2,
                        bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Alquiler</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#a78bfa' : accentDark }}>
                          {formatCurrency(recibo.montoTotal)}
                        </Typography>
                      </Box>

                      {/* Actions row */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {!recibo.estado && (
                          <Button size="small" variant="contained"
                            disabled={payingReciboId === recibo.id}
                            onClick={() => handleOpenPayModal(recibo)}
                            sx={{
                              textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.8rem',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: 'none',
                              '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
                            }}>
                            {payingReciboId === recibo.id ? 'Cargando...' : 'Pagar'}
                          </Button>
                        )}
                        <Button size="small" variant="outlined"
                          disabled={downloadingRecibo === recibo.id}
                          startIcon={downloadingRecibo === recibo.id ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleDownloadRecibo(recibo)}
                          sx={{
                            textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.8rem',
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                            color: 'text.primary',
                          }}>
                          {downloadingRecibo === recibo.id ? 'Descargando...' : 'PDF'}
                        </Button>
                        <Button size="small"
                          onClick={() => toggleExpandRecibo(recibo.id)}
                          endIcon={expandedRecibos.has(recibo.id) ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                          sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: accentColor }}>
                          {expandedRecibos.has(recibo.id) ? 'Menos' : 'Detalle'}
                        </Button>
                      </Box>

                    {/* Contenido expandible */}
                    <Collapse in={expandedRecibos.has(recibo.id)} timeout={300}>
                      <Box>
                        {/* Impuestos */}
                        {Array.isArray(recibo.impuestos) && recibo.impuestos.length > 0 && (
                          <Box sx={{ width: '100%', height: "100%" }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                              Detalle de Servicios
                            </Typography>
                            <Grid2 container spacing={4} sx={{ width: '90%' }}>
                              {recibo.impuestos.map((impuesto) => (
                                <Grid2 item xs={12} sm={6} md={6} key={impuesto.id} sx={{
                                  width: '100%',
                                }}>
                                  <Card variant="outlined" sx={{ p: 2, height: '100%', width: '100%' }}>
                                    <Box sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      mb: 2,
                                      width: '100%',
                                    }}>
                                      <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                      }}>
                                        {getImpuestoIcon(impuesto.tipoImpuesto)}
                                        <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold' }}>
                                          {impuesto.descripcion}
                                        </Typography>
                                      </Box>
                                      <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                                        {formatCurrency(impuesto.montoAPagar)}
                                      </Typography>
                                    </Box>
                                    
                                    {/* Información adicional */}
                                    <Box sx={{ mb: 2 }}>
                                      {impuesto.fechaFactura && (
                                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                          Fecha: {formatFecha(impuesto.fechaFactura)}
                                        </Typography>
                                      )}
                                      {impuesto.empresa && (
                                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                          Empresa: {impuesto.empresa}
                                        </Typography>
                                      )}
                                    </Box>

                                    {/* Preview de factura PDF */}
                                    {impuesto.urlFactura ? (
                                      <Box sx={{ 
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        p: 1,
                                        backgroundColor: '#f8f9fa',
                                        mb: 2
                                      }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PdfIcon sx={{ color: '#d32f2f', fontSize: 16, mr: 0.5 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                              Factura PDF
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                if (impuesto.urlFactura instanceof File) {
                                                  const url = URL.createObjectURL(impuesto.urlFactura);
                                                  handleOpenPdfViewer(url, `${impuesto.tipoImpuesto} - ${impuesto.descripcion}`);
                                                } else if (typeof impuesto.urlFactura === 'string') {
                                                  handleOpenPdfViewer(impuesto.urlFactura, `${impuesto.tipoImpuesto} - ${impuesto.descripcion}`);
                                                }
                                              }}
                                              sx={{ 
                                                backgroundColor: '#1a237e',
                                                color: 'white',
                                                '&:hover': {
                                                  backgroundColor: '#0d47a1',
                                                  transform: 'scale(1.1)'
                                                },
                                                width: 24,
                                                height: 24
                                              }}
                                            >
                                              <ViewIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              disabled={downloadingPdf === impuesto.id}
                                              onClick={async () => {
                                                try {
                                                  setDownloadingPdf(impuesto.id);
                                                  
                                                  if (impuesto.urlFactura instanceof File) {
                                                    const url = URL.createObjectURL(impuesto.urlFactura);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${impuesto.tipoImpuesto}_factura.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                    showSnackbar('Archivo descargado exitosamente', 'success');
                                                  } else if (typeof impuesto.urlFactura === 'string') {
                                                    const response = await fetch(impuesto.urlFactura, {
                                                      mode: 'cors',
                                                      headers: { 'Accept': 'application/pdf' }
                                                    });
                                                    const blob = await response.blob();
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `${impuesto.tipoImpuesto}_factura.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                    showSnackbar('Archivo descargado exitosamente', 'success');
                                                  }
                                                } catch (error) {
                                                  console.error('Error descargando:', error);
                                                  showSnackbar('Error al descargar archivo', 'error');
                                                } finally {
                                                  setDownloadingPdf(null);
                                                }
                                              }}
                                              sx={{ 
                                                backgroundColor: '#4caf50',
                                                color: 'white',
                                                '&:hover': {
                                                  backgroundColor: '#388e3c',
                                                  transform: 'scale(1.1)'
                                                },
                                                width: 24,
                                                height: 24
                                              }}
                                            >
                                              {downloadingPdf === impuesto.id ? (
                                                <CircularProgress size={12} color="inherit" />
                                              ) : (
                                                <CloudDownloadIcon sx={{ fontSize: 14 }} />
                                              )}
                                            </IconButton>
                                          </Box>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Haz clic en los botones para ver o descargar la factura
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box sx={{ 
                                        border: `1px dashed ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        p: 1,
                                        backgroundColor: '#fafafa',
                                        mb: 2,
                                        textAlign: 'center'
                                      }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Sin factura PDF adjunta
                                        </Typography>
                                      </Box>
                                    )}
                                  </Card>
                                </Grid2>
                              ))}
                            </Grid2>
                          </Box>
                        )}

                        {/* Monto Total (Alquiler + Servicios) */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 2,
                          p: 2,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          color: 'white',
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            Total
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {formatCurrency(calcularMontoTotal(recibo))}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Bottom Navigation */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: isDark ? 'rgba(15,15,23,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        zIndex: 1000,
        py: 0.75,
        px: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 400, mx: 'auto' }}>
          {[
            { key: 'home', icon: <HomeIcon />, label: 'Home' },
            { key: 'recibos', icon: <ReceiptIcon />, label: 'Recibos' },
            { key: 'comunicaciones', icon: <ReportProblemIcon />, label: 'Reportes' },
          ].map((tab) => {
            const isActive = activeSection === tab.key;
            return (
              <Button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 'auto',
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 3,
                  color: isActive ? accentColor : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
                  bgcolor: isActive ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)') : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                  '& .MuiSvgIcon-root': { fontSize: 22, mb: 0.25 },
                }}
              >
                {tab.icon}
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, lineHeight: 1 }}>
                  {tab.label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Modal del Contrato */}
      <Dialog
        open={openContractModal}
        onClose={() => setOpenContractModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: '90vh',
            width: '100%',
            margin: '0 auto',
            position:"absolute",
            bottom:0,
            left:0,
            right:0,
            borderRadius:"15px 15px 0 0"
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: 'white',
          py: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PdfIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Contrato — {contratoInfo?.nombreContrato}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setOpenContractModal(false)}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 2,
            height: '100%',
            overflow: 'auto',
            bgcolor: isDark ? '#1a1a2e' : '#fafafa',
          }}>
            <Paper elevation={0} sx={{ p: 4, minHeight: '100%', maxWidth: 700, mx: 'auto', borderRadius: 3 }}>
              <Typography 
                component="pre"
                sx={{ 
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: '#333',
                  textAlign: 'justify'
                }}
              >
                {contratoInfo?.contratoPdf ? formatContractText(contratoInfo.contratoPdf) : 'No hay contenido disponible'}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        
       
      </Dialog>

      {/* Modal visor de PDF integrado */}
      <Dialog
        open={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '800px',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PdfIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentPdfTitle}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClosePdfViewer}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: isDark ? '#1a1a2e' : '#f5f5f5' }}>
          {currentPdfUrl && (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentPdfUrl)}&embedded=true`}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                backgroundColor: 'white',
                minHeight: '600px'
              }}
              title={currentPdfTitle}
              sandbox="allow-scripts allow-same-origin"
            />
          )}
          
          {/* Botón de descarga flotante */}
          <IconButton
            onClick={async () => {
              try {
                setDownloadingPdf('viewer');
                
                if (currentPdfUrl.startsWith('blob:')) {
                  const a = document.createElement('a');
                  a.href = currentPdfUrl;
                  a.download = `${currentPdfTitle.replace(/[^a-z0-9\s]/gi, '_')}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } else {
                  const response = await fetch(currentPdfUrl, {
                    mode: 'cors',
                    headers: { 'Accept': 'application/pdf' }
                  });
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${currentPdfTitle.replace(/[^a-z0-9\s]/gi, '_')}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
                
                showSnackbar('Archivo descargado exitosamente', 'success');
              } catch (error) {
                console.error('Error descargando:', error);
                showSnackbar('Error al descargar archivo', 'error');
              } finally {
                setDownloadingPdf(null);
              }
            }}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                transform: 'scale(1.1)'
              },
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
              transition: 'all 0.2s ease',
              zIndex: 1000
            }}
          >
            {downloadingPdf === 'viewer' ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <CloudDownloadIcon />
            )}
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardInquilinos;
