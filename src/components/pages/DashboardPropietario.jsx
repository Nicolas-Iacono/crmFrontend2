import React, { useState, useEffect } from 'react';
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
  Paper,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Backdrop,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import jsPDF from 'jspdf';
import {
  ExitToApp as LogoutIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  Business as PropiedadesIcon,
  Message as MessageIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import ModalNotas from '../common/popUps/ModalNotas';

const DashboardPropietario = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'propiedades', 'recibos', 'comunicaciones'
  
  // Estados generales
  const [recibos, setRecibos] = useState([]);
  
  // Estados para propietarios
  const [propiedadesPropietario, setPropiedadesPropietario] = useState([]);
  const [contratosPropietario, setContratosPropietario] = useState([]);
  const [totalIngresosMensual, setTotalIngresosMensual] = useState(0);
  const [loadingPropietario, setLoadingPropietario] = useState(false);
  
  // Estados para filtros de recibos
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [filteredRecibos, setFilteredRecibos] = useState([]);
  
  // Estados para acordeones
  const [expandedAccordions, setExpandedAccordions] = useState({
    propiedades: false,
    contratos: false
  });

  // Estados para modal de imágenes
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estados para modal de recibo
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [downloadingRecibo, setDownloadingRecibo] = useState(null);

  // Estados para modal de contrato
  const [contratoModalOpen, setContratoModalOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState(null);

  // Reportes / Notas por contrato
  const [selectedContratoReportesId, setSelectedContratoReportesId] = useState('');
  const [notasContrato, setNotasContrato] = useState([]);
  const [loadingNotasContrato, setLoadingNotasContrato] = useState(false);
  const [errorNotasContrato, setErrorNotasContrato] = useState(null);
  const [modalNotaOpen, setModalNotaOpen] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

  // Estados para modal de contenido del contrato PDF
  const [contratoPdfModalOpen, setContratoPdfModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay token y username
    const token = localStorage.getItem('propietario_token');
    const storedUsername = localStorage.getItem('propietario_username');
    const authorities = localStorage.getItem('authorities');
    
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }
    
    // Detectar el rol del usuario
    let role = '';
    if (authorities) {
      if (authorities.includes('ROLE_PROPIETARIO_USER')) {
        role = 'ROLE_PROPIETARIO_USER';
      }
    }
    
    setUserRole(role);
    setUsername(storedUsername || '');
    // Cargar datos para propietarios
    if (role === 'ROLE_PROPIETARIO_USER') {
      fetchDatosPropietario(token);
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedContratoReportesId) return;
    if (!Array.isArray(contratosPropietario) || contratosPropietario.length === 0) return;
    const firstId = contratosPropietario[0]?.id;
    if (firstId) setSelectedContratoReportesId(String(firstId));
  }, [contratosPropietario, selectedContratoReportesId]);

  useEffect(() => {
    const token = localStorage.getItem('propietario_token');
    const idContrato = selectedContratoReportesId;

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
        setErrorNotasContrato('Error al cargar los reportes.');
      } finally {
        setLoadingNotasContrato(false);
      }
    };

    fetchNotasPorContrato();
  }, [API_BASE, activeSection, selectedContratoReportesId]);

  // Efecto para filtrar recibos
  useEffect(() => {
    if (!recibos || recibos.length === 0) {
      setFilteredRecibos([]);
      return;
    }

    let filtered = [...recibos];

    // Filtrar por año
    if (selectedYear) {
      filtered = filtered.filter(recibo => {
        const fechaEmision = new Date(recibo.fechaEmision);
        return fechaEmision.getFullYear().toString() === selectedYear;
      });
    }

    // Filtrar por mes
    if (selectedMonth) {
      filtered = filtered.filter(recibo => {
        const fechaEmision = new Date(recibo.fechaEmision);
        return (fechaEmision.getMonth() + 1).toString() === selectedMonth;
      });
    }

    // Filtrar por propiedad
    if (selectedProperty) {
      filtered = filtered.filter(recibo => {
        return recibo.propiedad?.direccion === selectedProperty;
      });
    }

    // Ordenar por fecha de emisión (más recientes primero)
    filtered.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));

    setFilteredRecibos(filtered);
  }, [recibos, selectedMonth, selectedYear, selectedProperty]);

  const fetchDatosPropietario = async (token) => {
    try {
      setLoadingPropietario(true);
      
      // Obtener contratos completos del propietario con toda la información
      const contratosResponse = await axios.get('https://crminmobiliario-app-production.up.railway.app/api/propietario/contratos/por-propietario', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const contratos = contratosResponse.data || [];
      setContratosPropietario(contratos);
      // Extraer propiedades de los contratos
      const propiedades = contratos.map(contrato => ({
        ...contrato.propiedad,
        contrato: contrato.nombreContrato,
        inquilino: `${contrato.inquilino.nombre} ${contrato.inquilino.apellido}`,
        estado: contrato.activo ? 'Ocupado' : 'Disponible',
        montoAlquiler: contrato.montoAlquiler
      }));
      setPropiedadesPropietario(propiedades);
      
      // Extraer todos los recibos de todos los contratos
      const todosLosRecibos = contratos.reduce((acc, contrato) => {
        const recibosConContrato = contrato.recibos.map(recibo => ({
          ...recibo,
          nombreContrato: contrato.nombreContrato,
          inquilino: contrato.inquilino,
          propiedad: contrato.propiedad
        }));
        return [...acc, ...recibosConContrato];
      }, []);
      setRecibos(todosLosRecibos);
      
      // Calcular total de ingresos mensual
      const totalIngresos = contratos.reduce((total, contrato) => {
        return total + (contrato.montoAlquiler || 0);
      }, 0);
      
      setTotalIngresosMensual(totalIngresos);
      
    } catch (error) {
      console.error('Error fetching datos propietario:', error);
      
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }
      
      setError('Error al cargar la información del propietario.');
    } finally {
      setLoadingPropietario(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('propietario_token');
    localStorage.removeItem('propietario_username');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('authorities');
    localStorage.removeItem('chat_session_id');
    navigate('/login-inquilinos');
  };

  // Función para abrir modal de recibo
  const handleReciboClick = (recibo) => {
    setSelectedRecibo(recibo);
    setReciboModalOpen(true);
  };

  // Función para cerrar modal de recibo
  const handleCloseReciboModal = () => {
    setReciboModalOpen(false);
    setSelectedRecibo(null);
  };

  // Función para abrir modal de contrato
  const handleContratoClick = (contrato) => {
    setSelectedContrato(contrato);
    setContratoModalOpen(true);
  };

  // Función para cerrar modal de contrato
  const handleCloseContratoModal = () => {
    setContratoModalOpen(false);
    setSelectedContrato(null);
  };

  // Función para abrir modal de contenido PDF
  const handleOpenContratoPdf = () => {
    setContratoPdfModalOpen(true);
  };

  // Función para cerrar modal de contenido PDF
  const handleCloseContratoPdf = () => {
    setContratoPdfModalOpen(false);
  };

  // Función para limpiar HTML del contrato PDF
  const cleanContratoPdf = (htmlString) => {
    if (!htmlString) return 'No hay contenido disponible';
    
    // Remover etiquetas HTML pero mantener el formato
    return htmlString
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<b[^>]*>/gi, '')
      .replace(/<\/b>/gi, '')
      .replace(/<em[^>]*>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<i[^>]*>/gi, '')
      .replace(/<\/i>/gi, '')
      .replace(/<u[^>]*>/gi, '')
      .replace(/<\/u>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/<[^>]*>/g, '') // Remover cualquier otra etiqueta HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n') // Limpiar líneas vacías múltiples
      .trim();
  };

  // Función para formatear fecha
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

  // Función para descargar recibo en PDF (igual a DashboardInquilinos)
  const handleDownloadRecibo = async (recibo) => {
    try {
      setDownloadingRecibo(recibo.id);

      // Buscar el contrato completo que contiene este recibo
      const contratoCompleto = contratosPropietario.find(contrato => 
        contrato.recibos && contrato.recibos.some(r => r.id === recibo.id)
      );


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
        contrato: contratoCompleto || {}
      };

      // Los datos ya están disponibles directamente del contrato
      const inquilino = contratoCompleto?.inquilino || {};
      const propiedad = contratoCompleto?.propiedad || {};
      const propietario = contratoCompleto?.propietario || {};
      const empresaInfo = contratoCompleto?.usuarioDtoSalida || {};

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
      const subtitulo = empresaInfo ? `${empresaInfo.nombreNegocio} - COL: ${empresaInfo.matricula}` : 'Portal de Propietarios';
      doc.text(subtitulo, 105, 22, { align: 'center' });

      // Espacio para logo (si existe)
      if (empresaInfo?.logo) {
        try {
          const logoWidth = 30;
          const logoHeight = 30;
          const logoX = 20;
          const logoY = 32;
          
          // Validar que el logo sea una imagen válida
          if (empresaInfo.logo.startsWith('data:image/') || empresaInfo.logo.startsWith('http')) {
            // Detectar formato de imagen
            let format = 'PNG';
            if (empresaInfo.logo.includes('data:image/jpeg') || empresaInfo.logo.includes('.jpg') || empresaInfo.logo.includes('.jpeg')) {
              format = 'JPEG';
            } else if (empresaInfo.logo.includes('data:image/png') || empresaInfo.logo.includes('.png')) {
              format = 'PNG';
            }
            
            doc.addImage(empresaInfo.logo, format, logoX, logoY, logoWidth, logoHeight);
          }
        } catch (logoError) {
          console.warn('Error al cargar logo, continuando sin logo:', logoError);
          // Continuar sin logo si hay error
        }
      }

      // Información de la empresa
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(empresaInfo?.nombreNegocio || 'Inmobiliaria', 55, 45);
      doc.setFont('helvetica', 'normal');
      doc.text(`${empresaInfo?.razonSocial || ''}, ${empresaInfo?.localidad || ''}`, 55, 50);
      doc.text(`${empresaInfo?.partido || ''}, ${empresaInfo?.provincia || ''}`, 55, 55);

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
      
      doc.text(`Inquilino: ${(inquilino?.nombre || '') + ' ' + (inquilino?.apellido || '') || 'N/A'}`, 20, 125);
      doc.text(`DNI: ${inquilino?.dni || 'N/A'}`, 20, 132);
      doc.text(`Propiedad: ${propiedad?.direccion || 'N/A'}`, 20, 139);
      doc.text(`Localidad: ${propiedad?.localidad || 'N/A'}, ${propiedad?.partido || ''}`, 20, 146);

      // Datos del propietario
      doc.text(`Propietario: ${(propietario?.nombre || '') + ' ' + (propietario?.apellido || '') || 'N/A'}`, 130, 125);
      doc.text(`DNI: ${propietario?.dni || 'N/A'}`, 130, 132);

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
      doc.text('Este recibo fue generado automáticamente por el sistema.', 105, 280, { align: 'center' });

      // Descargar el PDF
      doc.save(`Recibo_${reciboNormalizado.numeroRecibo}_${reciboNormalizado.periodo}.pdf`);

      Swal.fire({
        icon: 'success',
        title: '¡Descarga exitosa!',
        text: 'El recibo se ha descargado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF del recibo.',
      });
    } finally {
      setDownloadingRecibo(null);
    }
  };

  // Funciones auxiliares para filtros
  const getAvailableYears = () => {
    if (!recibos || recibos.length === 0) return [];
    
    const years = recibos.map(recibo => {
      const fecha = new Date(recibo.fechaEmision);
      return fecha.getFullYear();
    });
    
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const getAvailableMonths = () => {
    if (!recibos || recibos.length === 0) return [];
    
    let recibosParaMeses = recibos;
    
    if (selectedYear) {
      recibosParaMeses = recibos.filter(recibo => {
        const fecha = new Date(recibo.fechaEmision);
        return fecha.getFullYear().toString() === selectedYear;
      });
    }
    
    const months = recibosParaMeses.map(recibo => {
      const fecha = new Date(recibo.fechaEmision);
      return fecha.getMonth() + 1;
    });
    
    return [...new Set(months)].sort((a, b) => a - b);
  };

  const getAvailableProperties = () => {
    if (!recibos || recibos.length === 0) return [];
    
    const properties = recibos.map(recibo => recibo.propiedad?.direccion).filter(Boolean);
    return [...new Set(properties)].sort();
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedProperty('');
  };

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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  // Funciones para el modal de imágenes
  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedImages.length - 1 ? 0 : prev + 1
    );
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
        ml: { xs: 0, md: '15rem' },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: '30%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, letterSpacing: 0.5 }}>
              Portal de Propietarios
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
              Hola, {username || 'Propietario'}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleLogout}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            size="small"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        pb: { xs: 12, md: 6 },
        pl: { xs: 2, md: '240px' },
        pr: { xs: 2, sm: 3, md: 5 },
      }}>
        {/* Sección Home */}
        {activeSection === 'home' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%' }}>
            {loadingPropietario ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                <CircularProgress sx={{ color: accentColor }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Stat cards row */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[
                    { value: propiedadesPropietario.length, label: 'Propiedades', icon: <PropiedadesIcon sx={{ fontSize: 20 }} />, color: '#22c55e', bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)' },
                    { value: contratosPropietario.length, label: 'Contratos', icon: <ReceiptIcon sx={{ fontSize: 20 }} />, color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)' },
                  ].map((stat) => (
                    <Paper key={stat.label} elevation={0} sx={{
                      flex: 1, p: 2, borderRadius: 3, textAlign: 'center',
                      bgcolor: stat.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                    }}>
                      <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.65rem' }}>{stat.label}</Typography>
                    </Paper>
                  ))}
                </Box>

                {/* Ingresos mensuales */}
                <Paper elevation={0} sx={{
                  p: 2.5, borderRadius: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: 'white', textAlign: 'center',
                }}>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>Ingresos Mensuales</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{formatCurrency(totalIngresosMensual)}</Typography>
                </Paper>

                {/* Mis Propiedades */}
                <Accordion 
                  expanded={expandedAccordions.propiedades} 
                  onChange={handleAccordionChange('propiedades')}
                  elevation={0}
                  sx={{ 
                    borderRadius: '12px !important',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    '&::before': { display: 'none' },
                    '& .MuiAccordionSummary-root': { minHeight: 'auto', py: 1.5, px: 2.5 },
                    '& .MuiAccordionDetails-root': { px: 2.5, pb: 2.5, pt: 0 },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: accentColor }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PropiedadesIcon sx={{ fontSize: 20, color: accentColor }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Mis Propiedades ({propiedadesPropietario.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {propiedadesPropietario.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {propiedadesPropietario.map((propiedad, index) => (
                          <Paper key={index} elevation={0} sx={{
                            p: 2, borderRadius: 2.5,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{propiedad.direccion}</Typography>
                              <Chip label={propiedad.estado || 'Disponible'} size="small" sx={{
                                fontWeight: 700, fontSize: '0.65rem', height: 22,
                                bgcolor: propiedad.estado === 'Ocupado' ? (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)') : (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'),
                                color: propiedad.estado === 'Ocupado' ? '#ef4444' : '#22c55e',
                              }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">{propiedad.localidad}, {propiedad.partido} · {propiedad.tipoPropiedad}</Typography>
                            {propiedad.estado === 'Ocupado' && propiedad.montoAlquiler && (
                              <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: '#22c55e' }}>{formatCurrency(propiedad.montoAlquiler)}/mes</Typography>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No hay propiedades registradas</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Mis Contratos */}
                <Accordion 
                  expanded={expandedAccordions.contratos} 
                  onChange={handleAccordionChange('contratos')}
                  elevation={0}
                  sx={{ 
                    borderRadius: '12px !important',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    '&::before': { display: 'none' },
                    '& .MuiAccordionSummary-root': { minHeight: 'auto', py: 1.5, px: 2.5 },
                    '& .MuiAccordionDetails-root': { px: 2.5, pb: 2.5, pt: 0 },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: accentColor }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon sx={{ fontSize: 20, color: accentColor }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Contratos Activos ({contratosPropietario.length})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {contratosPropietario.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {contratosPropietario.map((contrato, index) => (
                          <Paper key={index} elevation={0} onClick={() => handleContratoClick(contrato)} sx={{
                            borderRadius: 2.5, overflow: 'hidden', cursor: 'pointer',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: accentColor, boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)' },
                          }}>
                            <Box sx={{ height: 3, background: contrato.activo ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{contrato.nombreContrato}</Typography>
                                <Chip label={contrato.activo ? 'Activo' : 'Inactivo'} size="small" sx={{
                                  fontWeight: 700, fontSize: '0.65rem', height: 22,
                                  bgcolor: contrato.activo ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)') : (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)'),
                                  color: contrato.activo ? '#22c55e' : '#f59e0b',
                                }} />
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
                                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                  <Typography variant="caption" color="text.secondary">Inquilino</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{contrato.inquilino.nombre} {contrato.inquilino.apellido}</Typography>
                                  <Typography variant="caption" color="text.secondary">{contrato.inquilino.telefono}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                  <Typography variant="caption" color="text.secondary">Propiedad</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{contrato.propiedad.direccion}</Typography>
                                  <Typography variant="caption" color="text.secondary">{contrato.propiedad.localidad}</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : accentDark }}>{formatCurrency(contrato.montoAlquiler)}/mes</Typography>
                                <Typography variant="caption" color="text.secondary">{Math.floor(contrato.tiempoRestante / 30)}m {contrato.tiempoRestante % 30}d restantes</Typography>
                              </Box>
                              {(contrato.aguaPorcentaje > 0 || contrato.luzPorcentaje > 0 || contrato.gasPorcentaje > 0) && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                                  {contrato.aguaPorcentaje > 0 && <Chip label={`Agua ${contrato.aguaPorcentaje}%`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />}
                                  {contrato.luzPorcentaje > 0 && <Chip label={`Luz ${contrato.luzPorcentaje}%`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />}
                                  {contrato.gasPorcentaje > 0 && <Chip label={`Gas ${contrato.gasPorcentaje}%`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />}
                                  {contrato.municipalPorcentaje > 0 && <Chip label={`Municipal ${contrato.municipalPorcentaje}%`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />}
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No hay contratos activos</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Quick actions */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[
                    { key: 'propiedades', label: 'Propiedades', sub: 'Ver detalle', icon: <PropiedadesIcon sx={{ fontSize: 20 }} />, color: accentColor, bg: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)' },
                    { key: 'recibos', label: 'Recibos', sub: 'Ver pagos', icon: <ReceiptIcon sx={{ fontSize: 20 }} />, color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)' },
                    { key: 'comunicaciones', label: 'Reportes', sub: 'Ver notas', icon: <MessageIcon sx={{ fontSize: 20 }} />, color: '#ec4899', bg: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.08)' },
                  ].map((action) => (
                    <Paper key={action.key} elevation={0} onClick={() => setActiveSection(action.key)} sx={{
                      flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: action.color, transform: 'translateY(-2px)' },
                    }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, mx: 'auto', mb: 1, bgcolor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>{action.icon}</Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{action.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{action.sub}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Sección Propiedades */}
        {activeSection === 'propiedades' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%' }}>
            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              {[
                { value: propiedadesPropietario.filter(p => p.estado === 'Ocupado').length, label: 'Ocupadas', icon: <HomeIcon sx={{ fontSize: 18 }} />, color: '#22c55e', bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)' },
                { value: propiedadesPropietario.filter(p => p.estado === 'Disponible').length, label: 'Disponibles', icon: <PropiedadesIcon sx={{ fontSize: 18 }} />, color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.06)' },
                { value: [...new Set(propiedadesPropietario.map(p => p.tipoPropiedad))].length, label: 'Tipos', icon: <PropiedadesIcon sx={{ fontSize: 18 }} />, color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)' },
              ].map((stat) => (
                <Paper key={stat.label} elevation={0} sx={{
                  flex: 1, p: 1.5, borderRadius: 3, textAlign: 'center',
                  bgcolor: stat.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                }}>
                  <Box sx={{ color: stat.color, mb: 0.25 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>{stat.label}</Typography>
                </Paper>
              ))}
            </Box>

            {/* Property cards */}
            {propiedadesPropietario.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {propiedadesPropietario.map((propiedad, index) => (
                  <Paper key={index} elevation={0} sx={{
                    borderRadius: 3, overflow: 'hidden',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  }}>
                    <Box sx={{ height: 3, background: propiedad.estado === 'Ocupado' ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{propiedad.direccion}</Typography>
                        <Chip label={propiedad.estado || 'Disponible'} size="small" sx={{
                          fontWeight: 700, fontSize: '0.65rem', height: 22,
                          bgcolor: propiedad.estado === 'Ocupado' ? (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)') : (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'),
                          color: propiedad.estado === 'Ocupado' ? '#ef4444' : '#22c55e',
                        }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{propiedad.localidad}, {propiedad.partido} · {propiedad.tipo || propiedad.tipoPropiedad}</Typography>
                      
                      {propiedad.estado === 'Ocupado' && (
                        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                          <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                            <Typography variant="caption" color="text.secondary">Inquilino</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{propiedad.inquilino}</Typography>
                            <Typography variant="caption" color="text.secondary">{propiedad.contrato}</Typography>
                          </Box>
                          {propiedad.montoAlquiler && (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : accentDark }}>{formatCurrency(propiedad.montoAlquiler)}/mes</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {propiedad.imagenes && propiedad.imagenes.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5 }}>
                          {propiedad.imagenes.slice(0, 4).map((imagen, imgIndex) => (
                            <Box key={imgIndex} onClick={() => handleImageClick(propiedad.imagenes, imgIndex)} sx={{
                              width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              transition: 'all 0.2s', '&:hover': { transform: 'scale(1.08)' },
                            }}>
                              <img src={imagen.imageUrl} alt={`Img ${imgIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                          ))}
                          {propiedad.imagenes.length > 4 && (
                            <Box onClick={() => handleImageClick(propiedad.imagenes, 4)} sx={{
                              width: 44, height: 44, borderRadius: 1.5, cursor: 'pointer',
                              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>+{propiedad.imagenes.length - 4}</Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper elevation={0} sx={{ textAlign: 'center', py: 6, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                <PropiedadesIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No hay propiedades registradas</Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Sección Recibos */}
        {activeSection === 'recibos' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%' }}>
            {/* Filter bar */}
            <Paper elevation={0} sx={{
              p: 2, mb: 2, borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <FormControl size="small" sx={{ minWidth: 90, flex: { xs: 1, sm: 'none' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Año</InputLabel>
                <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}>
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {getAvailableYears().map(year => (<MenuItem key={year} value={year.toString()}>{year}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100, flex: { xs: 1, sm: 'none' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Mes</InputLabel>
                <Select value={selectedMonth} label="Mes" onChange={(e) => setSelectedMonth(e.target.value)}>
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {getAvailableMonths().map(month => (<MenuItem key={month} value={month.toString()}>{new Date(2024, month - 1).toLocaleString('es-ES', { month: 'long' })}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120, flex: { xs: 1, sm: 'none' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Propiedad</InputLabel>
                <Select value={selectedProperty} label="Propiedad" onChange={(e) => setSelectedProperty(e.target.value)}>
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {getAvailableProperties().map(property => (<MenuItem key={property} value={property}>{property}</MenuItem>))}
                </Select>
              </FormControl>
              <Chip label={`${filteredRecibos.length}`} size="small" sx={{ fontWeight: 700, bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: accentColor }} />
              {(selectedMonth || selectedYear || selectedProperty) && (
                <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}>Limpiar</Button>
              )}
            </Paper>

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              {[
                { value: filteredRecibos.filter(r => r.estado).length, label: 'Pagados', color: '#22c55e', bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.06)' },
                { value: filteredRecibos.filter(r => !r.estado).length, label: 'Pendientes', color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)' },
              ].map((stat) => (
                <Paper key={stat.label} elevation={0} sx={{
                  flex: 1, p: 1.5, borderRadius: 3, textAlign: 'center',
                  bgcolor: stat.bg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>{stat.label}</Typography>
                </Paper>
              ))}
              <Paper elevation={0} sx={{
                flex: 1.5, p: 1.5, borderRadius: 3, textAlign: 'center',
                bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
              }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: isDark ? '#a78bfa' : accentDark, lineHeight: 1.1, fontSize: '0.85rem' }}>{formatCurrency(filteredRecibos.reduce((total, r) => total + calcularMontoTotal(r), 0))}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>Total</Typography>
              </Paper>
            </Box>

            {/* Receipt cards */}
            {filteredRecibos.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filteredRecibos.map((recibo, index) => (
                  <Paper key={index} elevation={0} onClick={() => handleReciboClick(recibo)} sx={{
                    borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: accentColor, boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)' },
                  }}>
                    <Box sx={{ height: 3, background: recibo.estado ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>Recibo #{recibo.numeroRecibo} — {recibo.periodo}</Typography>
                          <Typography variant="caption" color="text.secondary">{recibo.nombreContrato}</Typography>
                        </Box>
                        <Chip label={getEstadoText(recibo.estado)} size="small" sx={{
                          fontWeight: 700, fontSize: '0.65rem', height: 22,
                          bgcolor: recibo.estado ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)') : (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)'),
                          color: recibo.estado ? '#22c55e' : '#f59e0b',
                        }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                          <Typography variant="caption" color="text.secondary">Inquilino</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{recibo.inquilino?.nombre} {recibo.inquilino?.apellido}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                          <Typography variant="caption" color="text.secondary">Propiedad</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{recibo.propiedad?.direccion}</Typography>
                        </Box>
                      </Box>
                      {recibo.impuestos && recibo.impuestos.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                          {recibo.impuestos.slice(0, 3).map((imp, idx) => (
                            <Chip key={idx} label={imp.tipoImpuesto} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />
                          ))}
                          {recibo.impuestos.length > 3 && <Chip label={`+${recibo.impuestos.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)' }}>
                        <Typography variant="caption" color="text.secondary">Emision: {recibo.fechaEmision} · Vto: {recibo.fechaVencimiento}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: isDark ? '#a78bfa' : accentDark }}>{formatCurrency(calcularMontoTotal(recibo))}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper elevation={0} sx={{ textAlign: 'center', py: 6, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                <ReceiptIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recibos.length === 0 ? 'No hay recibos disponibles.' : 'No hay recibos que coincidan con los filtros.'}
                </Typography>
                {(selectedMonth || selectedYear || selectedProperty) && (
                  <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none', color: accentColor }}>Limpiar filtros</Button>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Sección Comunicaciones */}
        {activeSection === 'comunicaciones' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
            <Grid2 container spacing={2} sx={{display:"flex", flexDirection:"column"}}>
              <Grid2 item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.25, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
                    Contrato
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Seleccionar contrato</InputLabel>
                    <Select
                      value={selectedContratoReportesId}
                      label="Seleccionar contrato"
                      onChange={(e) => setSelectedContratoReportesId(String(e.target.value))}
                    >
                      {contratosPropietario.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.nombreContrato || `Contrato #${c.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.78)' }}>
                    Seleccioná un contrato para ver los reportes enviados por el inquilino.
                  </Typography>
                </Paper>
              </Grid2>

              <Grid2 item xs={12} md={8}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.25, color: isDark ? '#a78bfa' : accentDark, fontSize: '0.9rem' }}>
                    Historial de reportes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {loadingNotasContrato ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={26} />
                    </Box>
                  ) : errorNotasContrato ? (
                    <Alert severity="error">{errorNotasContrato}</Alert>
                  ) : notasContrato.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'rgba(60,60,72,0.72)' }}>
                      No hay reportes para este contrato.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gap: 1.25 }}>
                      {notasContrato.slice(0, 10).map((n) => (
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
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: 'rgba(60,60,72,0.80)', whiteSpace: 'pre-line' }}
                          >
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

            <ModalNotas
              open={modalNotaOpen}
              onClose={() => {
                setModalNotaOpen(false);
                setNotaSeleccionada(null);
              }}
              nota={notaSeleccionada}
              contrato={selectedContratoReportesId}
              contratoInfo={contratosPropietario.find(c => String(c.id) === String(selectedContratoReportesId))}
            />
          </Box>
        )}

        {/* Mensaje si no es propietario */}
        {userRole !== 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Acceso restringido - Solo para propietarios
            </Typography>
            <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
              Volver al login
            </Button>
          </Box>
        )}
      </Box>

      {/* Navigation - Desktop sidebar + Mobile bottom nav */}
      {userRole === 'ROLE_PROPIETARIO_USER' && (
        <>
          {/* Desktop Sidebar */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, width: '210px', height: '100vh',
            bgcolor: isDark ? 'rgba(15,15,23,0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            zIndex: 1000, py: 3, px: 2,
          }}>
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#a78bfa' : accentDark }}>Portal Propietario</Typography>
            </Box>
            {[
              { key: 'home', icon: <HomeIcon />, label: 'Home' },
              { key: 'propiedades', icon: <PropiedadesIcon />, label: 'Propiedades' },
              { key: 'recibos', icon: <ReceiptIcon />, label: 'Recibos' },
              { key: 'comunicaciones', icon: <MessageIcon />, label: 'Reportes' },
            ].map((tab) => {
              const isActive = activeSection === tab.key;
              return (
                <Button key={tab.key} onClick={() => setActiveSection(tab.key)} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  width: '100%', px: 2.5, py: 1.5, mb: 0.5, borderRadius: 2.5,
                  color: isActive ? accentColor : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'),
                  bgcolor: isActive ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)') : 'transparent',
                  textTransform: 'none', transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                  '& .MuiSvgIcon-root': { fontSize: 20, mr: 1.5 },
                }}>
                  {tab.icon}
                  <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.85rem' }}>{tab.label}</Typography>
                </Button>
              );
            })}
          </Box>

          {/* Mobile Bottom Nav */}
          <Box sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed', bottom: 0, left: 0, right: 0,
            bgcolor: isDark ? 'rgba(15,15,23,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            zIndex: 1000, py: 0.75, px: 1,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 500, mx: 'auto' }}>
              {[
                { key: 'home', icon: <HomeIcon />, label: 'Home' },
                { key: 'propiedades', icon: <PropiedadesIcon />, label: 'Props' },
                { key: 'recibos', icon: <ReceiptIcon />, label: 'Recibos' },
                { key: 'comunicaciones', icon: <MessageIcon />, label: 'Reportes' },
              ].map((tab) => {
                const isActive = activeSection === tab.key;
                return (
                  <Button key={tab.key} onClick={() => setActiveSection(tab.key)} sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    minWidth: 'auto', px: 2, py: 0.75, borderRadius: 3,
                    color: isActive ? accentColor : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
                    bgcolor: isActive ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)') : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                    '& .MuiSvgIcon-root': { fontSize: 22, mb: 0.25 },
                  }}>
                    {tab.icon}
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 500, lineHeight: 1, textTransform: 'none' }}>{tab.label}</Typography>
                  </Button>
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Modal para ver imágenes */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
            maxWidth: '800px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            outline: 'none',
            overflow: 'hidden'
          }}>
            {/* Header del modal */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Imagen {currentImageIndex + 1} de {selectedImages.length}
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Contenido del modal */}
            <Box sx={{
              position: 'relative',
              height: { xs: '60vh', sm: '70vh' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000'
            }}>
              {selectedImages.length > 0 && (
                <>
                  {/* Imagen principal */}
                  <img
                    src={selectedImages[currentImageIndex]?.imageUrl}
                    alt={`Imagen ${currentImageIndex + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />

                  {/* Botones de navegación */}
                  {selectedImages.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                      
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)'
                          }
                        }}
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </>
                  )}
                </>
              )}
            </Box>

            {/* Footer con miniaturas */}
            {selectedImages.length > 1 && (
              <Box sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderTop: '1px solid #e0e0e0',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {selectedImages.map((imagen, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: index === currentImageIndex ? '3px solid #1976d2' : '1px solid #ddd',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <img
                        src={imagen.imageUrl}
                        alt={`Miniatura ${index + 1}`}
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
          </Box>
        </Fade>
      </Modal>

      {/* Modal de Recibo */}
      <Dialog
        open={reciboModalOpen}
        onClose={handleCloseReciboModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Recibo #{selectedRecibo?.numeroRecibo}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseReciboModal}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {selectedRecibo && (
            <Box sx={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: 2, 
              p: 3,
              color: 'black'
            }}>
              {/* Información básica */}
              <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📅 Información del Período
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Período:</strong> {selectedRecibo.periodo}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha Emisión:</strong> {selectedRecibo.fechaEmision}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha Vencimiento:</strong> {selectedRecibo.fechaVencimiento}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong> 
                    <Chip 
                      label={selectedRecibo.estado ? 'PAGADO' : 'PENDIENTE'}
                      color={selectedRecibo.estado ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid2>

                <Grid2 item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🏠 Información de la Propiedad
                  </Typography>
                  {(() => {
                    // Buscar el contrato que contiene este recibo
                    const contratoDelRecibo = contratosPropietario.find(contrato => 
                      contrato.recibos && contrato.recibos.some(r => r.id === selectedRecibo.id)
                    );
                    
                    return (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Dirección:</strong> {contratoDelRecibo?.propiedad?.direccion || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Localidad:</strong> {contratoDelRecibo?.propiedad?.localidad || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Inquilino:</strong> {`${contratoDelRecibo?.inquilino?.nombre || ''} ${contratoDelRecibo?.inquilino?.apellido || ''}`.trim() || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>DNI:</strong> {contratoDelRecibo?.inquilino?.dni || 'N/A'}
                        </Typography>
                      </>
                    );
                  })()}
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 2 }} />

              {/* Servicios/Impuestos */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                💰 Detalle de Servicios
              </Typography>

              {/* Alquiler base */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                mb: 1
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Alquiler Base
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ${parseFloat(selectedRecibo.montoTotal || 0).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
              </Box>

              {/* Lista de impuestos/servicios */}
              {selectedRecibo.impuestos && selectedRecibo.impuestos.length > 0 && (
                <List sx={{ py: 0 }}>
                  {selectedRecibo.impuestos.map((impuesto, index) => {
                    const montoOriginal = parseFloat(impuesto.montoAPagar || 0);
                    const porcentaje = parseFloat(impuesto.porcentaje || 100);
                    const montoCalculado = porcentaje === 100 ? montoOriginal : montoOriginal * (porcentaje / 100);

                    return (
                      <ListItem 
                        key={index}
                        sx={{ 
                          px: 2,
                          py: 1,
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent',
                          borderRadius: 1,
                          mb: 0.5
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {impuesto.tipoImpuesto} 
                                {porcentaje !== 100 && ` (${porcentaje}%)`}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                ${montoCalculado.toLocaleString('es-AR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                borderRadius: 2,
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  TOTAL A PAGAR
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${(() => {
                    const montoBase = parseFloat(selectedRecibo.montoTotal || 0);
                    const totalImpuestos = selectedRecibo.impuestos?.reduce((total, impuesto) => {
                      const montoImpuesto = parseFloat(impuesto.montoAPagar || 0);
                      const porcentajeImpuesto = parseFloat(impuesto.porcentaje || 100);
                      const montoCalculado = porcentajeImpuesto === 100 
                        ? montoImpuesto 
                        : montoImpuesto * (porcentajeImpuesto / 100);
                      return total + montoCalculado;
                    }, 0) || 0;
                    return (montoBase + totalImpuestos).toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                  })()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => handleDownloadRecibo(selectedRecibo)}
            disabled={downloadingRecibo === selectedRecibo?.id}
            startIcon={downloadingRecibo === selectedRecibo?.id ? <CircularProgress size={20} /> : <DownloadIcon />}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              }
            }}
          >
            {downloadingRecibo === selectedRecibo?.id ? 'Descargando...' : 'Descargar PDF'}
          </Button>
          
          <Button
            onClick={() => {
              if (navigator.share && selectedRecibo) {
                navigator.share({
                  title: `Recibo #${selectedRecibo.numeroRecibo}`,
                  text: `Recibo de ${selectedRecibo.periodo} - ${selectedRecibo.contrato?.propiedad?.direccion}`,
                });
              } else {
                Swal.fire({
                  icon: 'info',
                  title: 'Compartir',
                  text: 'Función de compartir no disponible en este navegador.',
                });
              }
            }}
            startIcon={<ShareIcon />}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Compartir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Contrato */}
      <Dialog
        open={contratoModalOpen}
        onClose={handleCloseContratoModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: 'white',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Ver Contrato - {selectedContrato?.nombreContrato}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseContratoModal}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {selectedContrato && (
            <Box sx={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: 2, 
              p: 3,
              color: 'black',
              maxHeight: '70vh',
              overflow: 'auto'
            }}>
              {/* Información básica del contrato */}
              <Grid2 container spacing={3} sx={{ mb: 3 }}>
                <Grid2 item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    📋 Información del Contrato
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Nombre:</strong> {selectedContrato.nombreContrato}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Estado:</strong> 
                    <Chip 
                      label={selectedContrato.activo ? 'ACTIVO' : 'INACTIVO'}
                      color={selectedContrato.activo ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha Inicio:</strong> {selectedContrato.fecha_inicio}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha Fin:</strong> {selectedContrato.fecha_fin}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duración:</strong> {selectedContrato.duracion} meses
                  </Typography>
                  <Typography variant="body2">
                    <strong>Destino:</strong> {selectedContrato.destino}
                  </Typography>
                </Grid2>

                <Grid2 item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    💰 Información Financiera
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Monto Alquiler:</strong> ${selectedContrato.montoAlquiler?.toLocaleString('es-AR')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comisión Contrato:</strong> {selectedContrato.comisionContratoPorc}% (${selectedContrato.comisionContratoMonto?.toLocaleString('es-AR')})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Comisión Mensual:</strong> {selectedContrato.comisionMensualPorc}% (${selectedContrato.comisionMensualMonto?.toLocaleString('es-AR')})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Multa por Día:</strong> ${selectedContrato.multaXDia?.toLocaleString('es-AR')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Índice de Ajuste:</strong> {selectedContrato.indiceAjuste?.toUpperCase()}
                  </Typography>
                </Grid2>
              </Grid2>

              {/* Información de servicios */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                🔧 Servicios a Cargo del Inquilino
              </Typography>
              <Grid2 container spacing={2} sx={{ mb: 3 }}>
                <Grid2 item xs={12} sm={4}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>💧 Agua</Typography>
                    <Typography variant="body2">{selectedContrato.aguaEmpresa} ({selectedContrato.aguaPorcentaje}%)</Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={12} sm={4}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>⚡ Luz</Typography>
                    <Typography variant="body2">{selectedContrato.luzEmpresa} ({selectedContrato.luzPorcentaje}%)</Typography>
                  </Box>
                </Grid2>
                <Grid2 item xs={12} sm={4}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>🔥 Gas</Typography>
                    <Typography variant="body2">{selectedContrato.gasEmpresa} ({selectedContrato.gasPorcentaje}%)</Typography>
                  </Box>
                </Grid2>
              </Grid2>

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleOpenContratoPdf}
            startIcon={<VisibilityIcon />}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              }
            }}
          >
            Ver Contrato
          </Button>
          
          <Button
            onClick={handleCloseContratoModal}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Contenido del Contrato PDF */}
      <Dialog
        open={contratoPdfModalOpen}
        onClose={handleCloseContratoPdf}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: 'white',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Contrato - {selectedContrato?.nombreContrato}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseContratoPdf}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {selectedContrato && (
            <Box sx={{ 
              background: 'rgba(255,255,255,0.98)', 
              borderRadius: 2, 
              p: 4,
              color: 'black',
              maxHeight: '75vh',
              overflow: 'auto',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '1rem',
                  textAlign: 'justify',
                  letterSpacing: '0.5px'
                }}
              >
                {cleanContratoPdf(selectedContrato.contratoPdf)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              try {
                const contractContent = cleanContratoPdf(selectedContrato?.contratoPdf || '');
                
                // Crear documento PDF
                const doc = new jsPDF();
                
                // Configuración de fuente y estilo
                doc.setFont('helvetica', 'normal'); // jsPDF usa helvetica como Arial
                doc.setFontSize(11);
                
                // Título del documento
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text('CONTRATO DE LOCACIÓN', 105, 20, { align: 'center' });
                
                // Subtítulo con nombre del contrato
                doc.setFontSize(12);
                doc.text(selectedContrato?.nombreContrato || '', 105, 30, { align: 'center' });
                
                // Configurar texto normal
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                
                // Configuración de página y márgenes
                const pageWidth = 210; // A4 width in mm
                const margins = 20; // 20mm margins
                const maxWidth = pageWidth - (margins * 2);
                const pageHeight = 297; // A4 height in mm
                const bottomMargin = 20;
                
                // Configurar interlineado correcto para 1.6
                const fontSize = 11; // 11pt
                const lineHeightMultiplier = 1.6;
                const lineHeight = (fontSize * 0.352778) * lineHeightMultiplier; // Convertir pt a mm y aplicar 1.6
                
                let yPosition = 45; // Posición inicial después del título
                
                // Dividir el contenido en párrafos
                const paragraphs = contractContent.split('\n\n').filter(p => p.trim());
                
                paragraphs.forEach((paragraph) => {
                  if (paragraph.trim()) {
                    // Dividir cada párrafo en líneas que quepan en el ancho
                    const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
                    
                    lines.forEach((line, lineIndex) => {
                      // Verificar si necesitamos una nueva página
                      if (yPosition > (pageHeight - bottomMargin)) {
                        doc.addPage();
                        yPosition = margins;
                      }
                      
                      // Para justificación manual, necesitamos distribuir las palabras
                      if (lineIndex < lines.length - 1 && line.trim().split(' ').length > 1) {
                        // Justificar líneas que no son la última del párrafo
                        const words = line.trim().split(' ');
                        const totalWordsWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
                        const totalSpaces = words.length - 1;
                        const availableSpace = maxWidth - totalWordsWidth;
                        const spaceWidth = totalSpaces > 0 ? availableSpace / totalSpaces : 0;
                        
                        let xPosition = margins;
                        words.forEach((word, wordIndex) => {
                          doc.text(word, xPosition, yPosition);
                          xPosition += doc.getTextWidth(word);
                          if (wordIndex < words.length - 1) {
                            xPosition += spaceWidth;
                          }
                        });
                      } else {
                        // Última línea del párrafo o línea con una sola palabra - alinear a la izquierda
                        doc.text(line, margins, yPosition);
                      }
                      
                      yPosition += lineHeight;
                    });
                    
                    // Agregar espacio extra entre párrafos
                    yPosition += lineHeight * 0.5;
                  }
                });
                
                // Descargar el PDF
                doc.save(`Contrato_${selectedContrato?.nombreContrato || 'Documento'}.pdf`);
                
                // Mostrar mensaje de éxito
                Swal.fire({
                  icon: 'success',
                  title: '¡PDF generado!',
                  text: 'El contrato se ha descargado correctamente.',
                  timer: 2000,
                  showConfirmButton: false
                });
                
              } catch (error) {
                console.error('Error al generar PDF:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo generar el PDF del contrato.',
                });
              }
            }}
            startIcon={<DownloadIcon />}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              }
            }}
          >
            Guardar como PDF
          </Button>
          
          <Button
            onClick={handleCloseContratoPdf}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPropietario;
