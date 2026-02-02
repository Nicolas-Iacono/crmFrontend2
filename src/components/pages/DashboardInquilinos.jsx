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
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Collapse,
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
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ModalNotas from '../common/popUps/ModalNotas';

const DashboardInquilinos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;
  
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
    const montoAlquiler = recibo.montoTotal || 0;
    const montoImpuestos = Array.isArray(recibo.impuestos) 
      ? recibo.impuestos.reduce((total, impuesto) => total + (impuesto.montoAPagar || 0), 0)
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
        `${API_BASE}/recibo/${recibo.id}/pagar`,
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
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo iniciar el pago.';
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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'rgb(86, 23, 164)' }}>
        <Toolbar>
        
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Portal de Inquilinos
          </Typography>
        
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 12 } }}>
        {/* Contenido según la sección activa */}
        {activeSection === 'home' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              Mi Información de Contrato
            </Typography>
            
            {loadingContrato ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : contratoInfo ? (
              <Box>
                {/* Información básica del contrato */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
                    Información General
                  </Typography>
                  <Grid2 container spacing={3}>

                    <Box sx={{ display: 'flex',flexDirection: 'column', justifyContent: 'space-between', alignItems: 'start' }}>

                      
                    <Grid2 item xs={12} md={6}>

                    <Grid2 item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Titular alquiler
                      </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 ,color:"black"}}>
                   {`${contratoInfo.nombreInquilino || ''} ${contratoInfo.apellidoInquilino || ''}`}
                    </Typography>
                    </Grid2>


                      <Typography variant="body2" color="textSecondary">
                        Nombre del Contrato
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {contratoInfo.nombreContrato}
                      </Typography>
                    </Grid2>
                    
                    <Grid2 item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Dirección de la Propiedad
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {contratoInfo.direccionPropiedad}
                      </Typography>
                    </Grid2>

                    </Box>
                    <Box sx={{ display: 'flex',flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', gap: 3 }}>
                    <Grid2 item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Fecha de Inicio
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {formatFecha(contratoInfo.fechaInicio)}
                      </Typography>
                    </Grid2>
                    <Grid2 item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Fecha de Fin
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {formatFecha(contratoInfo.fechaFin)}
                      </Typography>
                    </Grid2>
                    </Box>
                  </Grid2>
                </Paper>

                {/* Estado del contrato */}
              

                {/* Duración del contrato */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
                    Duración del Contrato
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                     <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                      {mesesTotales}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Meses totales
                    </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                     <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {Math.max(0, mesesTranscurridos)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Meses transcurridos
                    </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                   <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                      {mesesRestantes}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Meses restantes
                    </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Accesos rápidos */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
                    Accesos Rápidos
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setActiveSection('recibos')}
                      sx={{ color: '#1a237e', borderColor: '#1a237e' }}
                    >
                      Ver Recibos
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={() => setActiveSection('comunicaciones')}
                      sx={{ color: '#1a237e', borderColor: '#1a237e' }}
                    >
                      Comunicaciones
                    </Button>
                  </Box>
                </Paper>

                {/* Miniatura del Contrato */}
                {contratoInfo?.contratoPdf && (
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
                      Mi Contrato
                    </Typography>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => setOpenContractModal(true)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PdfIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              Contrato de Alquiler
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Haz clic para ver el contrato completo
                            </Typography>
                          </Box>
                          <Box sx={{ ml: 'auto' }}>
                            <ViewIcon sx={{ color: '#1a237e' }} />
                          </Box>
                        </Box>
                        
                        {/* Vista previa del contenido */}
                        <Box sx={{ 
                          backgroundColor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          maxHeight: 100,
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8rem',
                              lineHeight: 1.4,
                              color: '#666'
                            }}
                          >
                            {formatContractText(contratoInfo.contratoPdf).substring(0, 200)}...
                          </Typography>
                          <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 30,
                            background: 'linear-gradient(transparent, #f8f9fa)'
                          }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Paper>
                )}
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <HomeIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                  No se encontró información del contrato
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  No hay información de contrato disponible para tu usuario.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => setActiveSection('recibos')}
                    sx={{ color: '#1a237e', borderColor: '#1a237e' }}
                  >
                    Ver Recibos
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={() => setActiveSection('comunicaciones')}
                    sx={{ color: '#1a237e', borderColor: '#1a237e' }}
                  >
                    Comunicaciones
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {activeSection === 'comunicaciones' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              Comunicaciones
            </Typography>

            

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ px: 2, pt: 1.5, bgcolor: 'rgba(243, 240, 248, 0.41)' }}>
                <Tabs
                  value={commTab}
                  onChange={(_, v) => {
                    setCommTab(v);
                    setReportSent(false);
                  }}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : false}
                  sx={{
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 800 },
                  }}
                >
                  <Tab icon={<ReportProblemIcon />} iconPosition="start" label="Reportar / Reparaciones" />
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
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              Mis Recibos
            </Typography>

            {/* Filtros de fecha */}
            <Paper sx={{  mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', padding:"1rem 1rem 0rem 1rem"}}>
                Filtrar por fecha
              </Typography>
              <Grid2 container spacing={2} alignItems="center" sx={{ backgroundColor:"rgba(243, 240, 248, 0.41)",
                borderRadius: "0 0 10px 10px",
                p: 2,
                
              }}>
                <Grid2 item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Año</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Año"
                      onChange={(e) => setSelectedYear(e.target.value)}
                      sx={{
                          width:"7rem"
                      }}
                    >
                      <MenuItem value="">
                        <em>Todos los años</em>
                      </MenuItem>
                      {getAvailableYears().map(year => (
                        <MenuItem key={year} value={year.toString()}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                
                <Grid2 item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Mes</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Mes"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      disabled={!selectedYear && recibos.length > 12} // Deshabilitar si hay muchos recibos y no hay año
                      sx={{
                          width:"7rem"
                      }}
                    >
                      <MenuItem value="">
                        <em>Todos los meses</em>
                      </MenuItem>
                      {getAvailableMonths().map(month => (
                        <MenuItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString('es-ES', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                
                <Grid2 item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      disabled={!selectedMonth && !selectedYear}
                      size="small"
                    >
                      Limpiar filtros
                    </Button>
                    <Chip
                      label={`${filteredRecibos.length} recibos`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Grid2>
              </Grid2>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {!Array.isArray(filteredRecibos) || filteredRecibos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              {!Array.isArray(recibos) || recibos.length === 0 
                ? 'No hay recibos disponibles' 
                : 'No hay recibos que coincidan con los filtros seleccionados'}
            </Typography>
            {(selectedMonth || selectedYear) && (
              <Button 
                variant="outlined" 
                onClick={clearFilters} 
                sx={{ mt: 2 }}
              >
                Limpiar filtros
              </Button>
            )}
          </Paper>
        ) : (
          <Grid2 container spacing={3}  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            {filteredRecibos.map((recibo) => (
              <Grid2 item xs={12} key={recibo.id}  sx={{ width:{xs: "100%", sm: "100%", md: "80%", lg: "80%", xl: "80%"}}}>
                <Card elevation={3} sx={{ borderRadius: 5 ,paddingBottom:4}}>
                  <CardContent>
                    {/* Header del recibo */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2, sm: 0 }
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                          {recibo.nombreContrato}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Recibo #{recibo.numeroRecibo} - {recibo.periodo} 
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={getEstadoText(recibo.estado)}
                          color={getEstadoColor(recibo.estado)}
                          variant="filled"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          disabled={recibo.estado || payingReciboId === recibo.id}
                          onClick={() => handlePayRecibo(recibo)}
                          sx={{
                            textTransform: 'none',
                            backgroundColor: '#1a237e',
                            '&:hover': {
                              backgroundColor: '#0d47a1'
                            }
                          }}
                        >
                          {payingReciboId === recibo.id ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={downloadingRecibo === recibo.id}
                          startIcon={downloadingRecibo === recibo.id ? <CircularProgress size={16} /> : <DownloadIcon />}
                          onClick={() => handleDownloadRecibo(recibo)}
                          sx={{
                            '&:disabled': {
                              opacity: 0.7
                            }
                          }}
                        >
                          {downloadingRecibo === recibo.id ? 'Descargando...' : 'Descargar'}
                        </Button>
                      </Box>
                    </Box>

                    {/* Información del recibo */}
                    <Grid2 container spacing={2} sx={{ mb: 2 }}>
                      <Grid2 item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Fecha de Emisión
                        </Typography>
                        <Typography variant="body1">
                          {formatFecha(recibo.fechaEmision)}
                        </Typography>
                      </Grid2>
                      <Grid2 item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Fecha de Vencimiento
                        </Typography>
                        <Typography variant="body1">
                          {formatFecha(recibo.fechaVencimiento)}
                        </Typography>
                      </Grid2>
                    </Grid2>

                    {/* Concepto */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Concepto
                      </Typography>
                      <Typography variant="body1">
                        {recibo.concepto}
                      </Typography>
                    </Box>

                    {/* Monto Alquiler */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Monto Alquiler
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        {formatCurrency(recibo.montoTotal)}
                      </Typography>
                    </Box>

                    {/* Botón Expandir */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 2 
                    }}>
                      <Button
                        onClick={() => toggleExpandRecibo(recibo.id)}
                        startIcon={expandedRecibos.has(recibo.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                          color: '#1a237e',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: 'rgba(26, 35, 126, 0.1)'
                          }
                        }}
                      >
                        {expandedRecibos.has(recibo.id) ? 'Ver menos detalles' : 'Ver más detalles'}
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
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          width: '90%',
                          margin: "0 auto",
                          mt: 3,
                          height: "3rem",
                        }}>
                       
                        </Box>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                          p: 2,
                          backgroundColor:"rgba(93, 93, 94, 0.05)",
                          borderRadius: 4,
                          width: '90%',
                          margin: "0 auto",
                          height: "3rem",
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'rgb(45, 46, 45)' }}>
                            Total
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: ' #1a237e' }}>
                            {formatCurrency(calcularMontoTotal(recibo))}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
            )}
          </Box>
        )}
      </Box>

      {/* Barra de navegación inferior fija */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white', 
        borderTop: '1px solid #e0e0e0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        py: 1
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <Button
            onClick={() => setActiveSection('home')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeSection === 'home' ? '#1a237e' : '#666',
              minWidth: 'auto',
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <HomeIcon sx={{ 
              fontSize: { xs: 24, md: 28 },
              mb: 0.5,
              color: activeSection === 'home' ? '#1a237e' : '#666'
            }} />
            <Typography variant="caption" sx={{ 
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: activeSection === 'home' ? 'bold' : 'normal'
            }}>
              Home
            </Typography>
          </Button>

          <Button
            onClick={() => setActiveSection('recibos')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeSection === 'recibos' ? '#1a237e' : '#666',
              minWidth: 'auto',
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <ReceiptIcon sx={{ 
              fontSize: { xs: 24, md: 28 },
              mb: 0.5,
              color: activeSection === 'recibos' ? '#1a237e' : '#666'
            }} />
            <Typography variant="caption" sx={{ 
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: activeSection === 'recibos' ? 'bold' : 'normal'
            }}>
              Recibos
            </Typography>
          </Button>

          <Button
            onClick={() => setActiveSection('comunicaciones')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeSection === 'comunicaciones' ? '#1a237e' : '#666',
              minWidth: 'auto',
              px: 2,
              py: 1,
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.1)'
              }
            }}
          >
            <MessageIcon sx={{ 
              fontSize: { xs: 24, md: 28 },
              mb: 0.5,
              color: activeSection === 'comunicaciones' ? '#1a237e' : '#666'
            }} />
            <Typography variant="caption" sx={{ 
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: activeSection === 'comunicaciones' ? 'bold' : 'normal'
            }}>
              Reportes
            </Typography>
          </Button>
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
          backgroundColor: 'rgb(61, 26, 126)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PdfIcon />
            <Typography variant="body1">
              Contrato de Alquiler - {contratoInfo?.nombreContrato}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setOpenContractModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 2,
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#fafafa',
            width: '80%'
          }}>
            <Paper sx={{ p: 4, minHeight: '100%', width: '90%', margin: '0 auto' }}>
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
          bgcolor: '#1a237e', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PdfIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentPdfTitle}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClosePdfViewer}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: '#f5f5f5' }}>
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
              backgroundColor: '#1a237e',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0d47a1',
                transform: 'scale(1.1)'
              },
              boxShadow: 4,
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
