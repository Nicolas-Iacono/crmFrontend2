import React, { useState, useEffect } from 'react';
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

const DashboardPropietario = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
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
    
    // Si es una fecha válida
    if (fecha && !isNaN(Date.parse(fecha))) {
      return new Date(fecha).toLocaleDateString('es-AR');
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
            Portal de Propietarios
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        pb: { xs: 10, md: 4 },
        pl: { xs: 2, md: '270px' }, // Margen izquierdo ajustado para la sidebar de 210px
        pr: { xs: 2, sm: 3, md: 6 }, // Más padding derecho en desktop
        backgroundColor: '#f5f7fa',
        minHeight: '100vh'
      }}>
        {/* Sección Home */}
        {activeSection === 'home' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            width: '100%'
          }}>
            <Typography variant="h4" sx={{ 
              mb: { xs: 2, md: 4 }, 
              fontWeight: 'bold', 
              color: '#1a237e',
              textAlign: { xs: 'left', md: 'left' }
            }}>
              Panel de Propietario
            </Typography>
            
            {loadingPropietario ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {/* Resumen financiero */}
                <Paper sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  mb: 4, 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography variant="h5" sx={{ 
                      mb: 3, 
                      fontWeight: 'bold', 
                      color: 'white',
                      textAlign: { xs: 'center', md: 'left' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📊 Resumen Financiero
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'column', md: 'row' }, 
                      gap: { xs: 2, sm: 3 },
                      alignItems: 'center',
                      justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },

                    }}>
                      {/* Fila superior - Propiedades y Contratos */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 2, sm: 3 }, 
                        width: { xs: '100%', sm: '100%', md: '30%' },
                        justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
                      }}>
                        {/* Propiedades */}
                        <Card sx={{ 
                          width: { xs: '45%', sm: '45%', md: '50%' },
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ 
                            textAlign: 'center', 
                            p: { xs: 1.5, sm: 2.5 },
                            '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                          }}>
                            <Box sx={{ 
                              width: { xs: 40, sm: 50 }, 
                              height: { xs: 40, sm: 50 }, 
                              borderRadius: '50%', 
                              backgroundColor: '#e8f5e8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px auto',
                              fontSize: { xs: '16px', sm: '20px' }
                            }}>
                              🏠
                            </Box>
                            <Typography variant="h3" sx={{ 
                              color: '#4caf50', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              lineHeight: 1
                            }}>
                              {propiedadesPropietario.length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#666',
                              fontWeight: 500,
                              mt: 1,
                              fontSize: { xs: '0.75rem', sm: '0.9rem' }
                            }}>
                              Propiedades
                            </Typography>
                          </CardContent>
                        </Card>

                        {/* Contratos */}
                        <Card sx={{ 
                          width: { xs: '45%', sm: '45%', md: '50%' },
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ 
                            textAlign: 'center', 
                            p: { xs: 1.5, sm: 2.5 },
                            '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                          }}>
                            <Box sx={{ 
                              width: { xs: 40, sm: 50 }, 
                              height: { xs: 40, sm: 50 }, 
                              borderRadius: '50%', 
                              backgroundColor: '#e3f2fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 12px auto',
                              fontSize: { xs: '16px', sm: '20px' }
                            }}>
                              📋
                            </Box>
                            <Typography variant="h3" sx={{ 
                              color: '#2196f3', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              lineHeight: 1
                            }}>
                              {contratosPropietario.length}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#666',
                              fontWeight: 500,
                              mt: 1,
                              fontSize: { xs: '0.75rem', sm: '0.9rem' }
                            }}>
                              Contratos Activos
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>

                      {/* Fila inferior - Ingresos */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        width: { xs: '100%', sm: '100%', md: '50%' }
                      }}>
                        <Card sx={{ 
                          width: { xs: 'calc(90% + 16px)', sm: 'calc(90% + 24px)', md: '100%' },
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ 
                            textAlign: 'center', 
                            p: { xs: 2, sm: 3 },
                            '&:last-child': { pb: { xs: 2, sm: 3 } }
                          }}>
                            <Box sx={{ 
                              width: { xs: 50, sm: 60 }, 
                              height: { xs: 40, sm: 50 },  
                              borderRadius: '50%', 
                              backgroundColor: '#fff3e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px auto',
                              fontSize: { xs: '20px', sm: '24px' }
                            }}>
                              💰
                            </Box>
                            <Typography variant="h4" sx={{ 
                              color: '#ff9800', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word'
                            }}>
                              {formatCurrency(totalIngresosMensual)}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#666',
                              fontWeight: 500,
                              mt: 1,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}>
                              Ingresos Mensuales
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Mis Propiedades */}
                <Accordion 
                  expanded={expandedAccordions.propiedades} 
                  onChange={handleAccordionChange('propiedades')}
                  sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      zIndex: 1
                    },
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: 'transparent',
                      color: 'white',
                      position: 'relative',
                      zIndex: 2
                    },
                    '& .MuiAccordionDetails-root': {
                      backgroundColor: 'transparent',
                      position: 'relative',
                      zIndex: 2
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{ 
                      p: { xs: 2, sm: 3, md: 4 },
                      '& .MuiAccordionSummary-content': {
                        margin: 0
                      }
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      textAlign: { xs: 'center', md: 'left' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      🏠 Mis Propiedades ({propiedadesPropietario.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0 }}>
                    
                    {propiedadesPropietario.length > 0 ? (
                      <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                        {propiedadesPropietario.map((propiedad, index) => (
                          <Grid2 item xs={12} sm={12} md={6} lg={4} key={index} sx={{ width: '100%' }}>
                            <Card sx={{ 
                              height: { xs: '200px', sm: '220px', md: '240px' },
                              minHeight: { xs: '200px', sm: '220px', md: '240px' },
                              background: 'rgba(255,255,255,0.95)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.2)',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                              }
                            }}>
                              <CardContent sx={{ 
                                p: { xs: 2, sm: 2.5 },
                                '&:last-child': { pb: { xs: 2, sm: 2.5 } },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                {/* Contenido superior */}
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 'bold', 
                                      color: '#1a237e',
                                      fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                                      lineHeight: 1.2,
                                      flex: 1,
                                      pr: 1
                                    }}>
                                      {propiedad.direccion}
                                    </Typography>
                                    <Chip 
                                      label={propiedad.estado || 'Disponible'} 
                                      color={propiedad.estado === 'Ocupado' ? 'error' : 'success'}
                                      size="small"
                                    />
                                  </Box>
                                  
                                  <Typography variant="body2" sx={{ 
                                    color: '#666',
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1rem' }
                                  }}>
                                    📍 {propiedad.localidad}, {propiedad.partido}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ 
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1rem' }
                                  }}>
                                    🏢 {propiedad.tipoPropiedad}
                                  </Typography>
                                </Box>
                                
                                {/* Contenido inferior - Monto (si existe) */}
                                {propiedad.estado === 'Ocupado' && propiedad.montoAlquiler && (
                                  <Box sx={{ 
                                    mt: 'auto',
                                    p: 1.5, 
                                    backgroundColor: '#e8f5e8', 
                                    borderRadius: 1,
                                    textAlign: 'center'
                                  }}>
                                    <Typography variant="body2" sx={{ 
                                      color: '#4caf50', 
                                      fontWeight: 'bold',
                                      fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }
                                    }}>
                                      💰 {formatCurrency(propiedad.montoAlquiler)}/mes
                                    </Typography>
                                  </Box>
                                )}
                                
                                {/* Espaciador para propiedades sin monto */}
                                {!(propiedad.estado === 'Ocupado' && propiedad.montoAlquiler) && (
                                  <Box sx={{ mt: 'auto', height: '20px' }} />
                                )}
                              </CardContent>
                            </Card>
                          </Grid2>
                        ))}
                      </Grid2>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#666', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}>
                          🏠 No hay propiedades registradas
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Cuando tengas propiedades, aparecerán aquí con toda su información.
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Mis Contratos */}
                <Accordion 
                  expanded={expandedAccordions.contratos} 
                  onChange={handleAccordionChange('contratos')}
                  sx={{ 
                    mb: 10, 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      zIndex: 1
                    },
                    '& .MuiAccordionSummary-root': {
                      backgroundColor: 'transparent',
                      color: 'white',
                      position: 'relative',
                      zIndex: 2
                    },
                    '& .MuiAccordionDetails-root': {
                      backgroundColor: 'transparent',
                      position: 'relative',
                      zIndex: 2
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{ 
                      p: { xs: 2, sm: 3, md: 4 },
                      '& .MuiAccordionSummary-content': {
                        margin: 0
                      }
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      textAlign: { xs: 'center', md: 'left' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📋 Contratos Activos ({contratosPropietario.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 2, sm: 3, md: 4 }, pt: 0 }}>
                    
                    {contratosPropietario.length > 0 ? (
                      <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                        {contratosPropietario.map((contrato, index) => (
                          <Grid2 item xs={12} sm={12} md={12} lg={6} key={index} sx={{ width: '100%' }}>
                            <Card 
                              onClick={() => handleContratoClick(contrato)}
                              sx={{ 
                                minHeight: { xs: '300px', sm: '320px', md: '340px' },
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                border: contrato.activo ? '2px solid #4caf50' : '2px solid #ff9800',
                                cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                              }
                            }}>
                              <CardContent sx={{ 
                                p: { xs: 2, sm: 2.5, md: 3 },
                                '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                {/* Header del contrato */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                  <Typography variant="h6" sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#1a237e',
                                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                                    lineHeight: 1.2,
                                    flex: 1,
                                    pr: 1
                                  }}>
                                    {contrato.nombreContrato}
                                  </Typography>
                                  <Chip 
                                    label={contrato.activo ? 'Activo' : 'Inactivo'} 
                                    color={contrato.activo ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </Box>
                                
                                {/* Contenido principal */}
                                <Box sx={{ flex: 1 , width: '100%'}}>
                                  <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                                    {/* Información del Inquilino */}
                                    <Grid2 item xs={12} md={6} width="100%">
                                      <Box sx={{ 
                                        p: 2, 
                                        backgroundColor: '#f8f9fa', 
                                        borderRadius: 1,
                                        height: '100%',
                                        border: '1px solid #e0e0e0',
                                         width: '90%'
                                      }}>
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 'bold', 
                                          mb: 1.5,
                                          color: '#1a237e',
                                          fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }}>
                                          👤 Inquilino
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                          fontWeight: 'bold',
                                          mb: 1,
                                          fontSize: { xs: '1rem', sm: '1.1rem' }
                                        }}>
                                          {contrato.inquilino.pronombre} {contrato.inquilino.nombre} {contrato.inquilino.apellido}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          color: '#666',
                                          mb: 0.5,
                                          fontSize: { xs: '0.9rem', sm: '0.95rem' }
                                        }}>
                                          📞 {contrato.inquilino.telefono}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          color: '#666',
                                          fontSize: { xs: '0.9rem', sm: '0.95rem' }
                                        }}>
                                          📧 {contrato.inquilino.email}
                                        </Typography>
                                      </Box>
                                    </Grid2>
                                    
                                    {/* Información de la Propiedad */}
                                    <Grid2 item xs={12} md={6} width="100%" sx={{ mt: 3, mb: 3}}>
                                      <Box sx={{ 
                                        p: 2, 
                                        backgroundColor: '#f0f8ff', 
                                        borderRadius: 1,
                                        height: '100%',
                                        border: '1px solid #e3f2fd',
                                        width: '90%'
                                      }}>
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 'bold', 
                                          mb: 1.5,
                                          color: '#1a237e',
                                          fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }}>
                                          🏠 Propiedad
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                          fontWeight: 'bold',
                                          mb: 1,
                                          fontSize: { xs: '1rem', sm: '1.1rem' }
                                        }}>
                                          {contrato.propiedad.direccion}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          color: '#666',
                                          mb: 0.5,
                                          fontSize: { xs: '0.9rem', sm: '0.95rem' }
                                        }}>
                                          📍 {contrato.propiedad.localidad}, {contrato.propiedad.partido}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                          color: '#666',
                                          fontSize: { xs: '0.9rem', sm: '0.95rem' }
                                        }}>
                                          🏢 {contrato.propiedad.tipo}
                                        </Typography>
                                      </Box>
                                    </Grid2>
                                  </Grid2>
                                </Box>
                                
                                {/* Información Financiera */}
                                <Box sx={{ 
                                  mt: 2, 
                                  p: 2, 
                                  backgroundColor: '#e8f5e8', 
                                  borderRadius: 1,
                                  border: '1px solid #4caf50'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 1,
                                    color: '#2e7d32',
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                  }}>
                                    💰 Información Financiera
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                    <Typography variant="h6" sx={{ 
                                      color: '#4caf50', 
                                      fontWeight: 'bold',
                                      fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' }
                                    }}>
                                      {formatCurrency(contrato.montoAlquiler)}/mes
                                    </Typography>
                                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                                      <Typography variant="body2" sx={{ 
                                        color: '#666',
                                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                      }}>
                                        📅 {new Date(contrato.fecha_inicio).toLocaleDateString('es-AR')} - {new Date(contrato.fecha_fin).toLocaleDateString('es-AR')}
                                      </Typography>
                                      <Typography variant="body2" sx={{ 
                                        color: '#666',
                                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                      }}>
                                        ⏱️ {Math.floor(contrato.tiempoRestante / 30)} meses y {contrato.tiempoRestante % 30} días restantes • 📊 {contrato.indiceAjuste.toUpperCase()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                                
                                {/* Servicios */}
                                <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1, border: '1px solid #ffcc02' }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 1,
                                    color: '#f57c00',
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                  }}>
                                    🔧 Servicios a cargo del inquilino:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {contrato.aguaPorcentaje > 0 && (
                                      <Chip 
                                        label={`💧 ${contrato.aguaEmpresa} (${contrato.aguaPorcentaje}%)`} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    )}
                                    {contrato.luzPorcentaje > 0 && (
                                      <Chip 
                                        label={`⚡ ${contrato.luzEmpresa} (${contrato.luzPorcentaje}%)`} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    )}
                                    {contrato.gasPorcentaje > 0 && (
                                      <Chip 
                                        label={`🔥 ${contrato.gasEmpresa} (${contrato.gasPorcentaje}%)`} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    )}
                                    {contrato.municipalPorcentaje > 0 && (
                                      <Chip 
                                        label={`🏛️ ${contrato.municipalEmpresa} (${contrato.municipalPorcentaje}%)`} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid2>
                        ))}
                      </Grid2>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#666', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}>
                          📋 No hay contratos activos
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Cuando tengas contratos activos, aparecerán aquí con toda su información.
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>

           
              </Box>
            )}
          </Box>
        )}

        {/* Sección Propiedades */}
        {activeSection === 'propiedades' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            width: '100%'
          }}>
            <Typography variant="h4" sx={{ 
              mb: { xs: 2, md: 4 }, 
              fontWeight: 'bold', 
              color: '#1a237e',
              textAlign: { xs: 'left', md: 'left' }
            }}>
              Mis Propiedades ({propiedadesPropietario.length})
            </Typography>
            
            {/* Estadísticas rápidas con estilo moderno */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: 'white',
                  textAlign: { xs: 'center', md: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📊 Estadísticas de Propiedades
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' }, 
                  gap: { xs: 2, sm: 3 },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                }}>
                  {/* Fila superior - Ocupadas y Disponibles */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    width: { xs: '100%', sm: '100%', md: '50%' },
                    justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                  }}>
                    {/* Ocupadas */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          🏠
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#4caf50', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {propiedadesPropietario.filter(p => p.estado === 'Ocupado').length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Ocupadas
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Disponibles */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#fff3e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          🏘️
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#ff9800', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {propiedadesPropietario.filter(p => p.estado === 'Disponible').length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Disponibles
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Fila inferior - Tipos y Localidades */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    width: { xs: '100%', sm: '100%', md: '50%' },
                    justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                  }}>
                    {/* Tipos */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#e3f2fd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          🏢
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#2196f3', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {[...new Set(propiedadesPropietario.map(p => p.tipoPropiedad))].length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Tipos
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Localidades */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#f3e5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          📍
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#9c27b0', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {[...new Set(propiedadesPropietario.map(p => p.localidad))].length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Localidades
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Lista de propiedades con estilo moderno */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: 'white',
                  textAlign: { xs: 'center', md: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🏠 Detalle de Propiedades
                </Typography>
                
                {propiedadesPropietario.length > 0 ? (
                  <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                    {propiedadesPropietario.map((propiedad, index) => (
                      <Grid2 item xs={12} sm={12} md={6} lg={4} key={index} sx={{ width: '100%' }}>
                        <Card sx={{ 
                          height: 'auto',
                          minHeight: { xs: '300px', sm: '320px', md: '350px' },
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 2,
                          border: propiedad.estado === 'Ocupado' ? '2px solid #4caf50' : '2px solid #ff9800',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ 
                            p: { xs: 2, sm: 2.5, md: 3 },
                            '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } },
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                          }}>
                            {/* Header con dirección y estado */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                color: '#1a237e', 
                                flex: 1,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                lineHeight: 1.2
                              }}>
                                {propiedad.direccion}
                              </Typography>
                              <Chip 
                                label={propiedad.estado} 
                                color={propiedad.estado === 'Ocupado' ? 'success' : 'warning'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            
                            {/* Contenido principal */}
                            <Box sx={{ flex: 1  }}>
                              {/* Ubicación */}
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                mb: 1,
                                fontSize: { xs: '0.9rem', sm: '0.95rem' }
                              }}>
                                📍 {propiedad.localidad}, {propiedad.partido}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                mb: 2,
                                fontSize: { xs: '0.9rem', sm: '0.95rem' }
                              }}>
                                🌎 {propiedad.provincia}
                              </Typography>
                              
                              {/* Tipo de propiedad */}
                              <Box sx={{ 
                                p: 1.5, 
                                backgroundColor: '#e3f2fd', 
                                borderRadius: 1,
                                mb: 2,
                                border: '1px solid #2196f3'
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 'bold',
                                  color: '#1976d2',
                                  fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}>
                                  🏠 {propiedad.tipo}
                                </Typography>
                              </Box>
                        
                        {/* Información del contrato si está ocupado */}
                        {propiedad.estado === 'Ocupado' && (
                          <Box sx={{ 
                                  p: 2, 
                                  backgroundColor: '#e8f5e8', 
                                  borderRadius: 1, 
                                  mb: 2,
                                  border: '1px solid #4caf50'
                                }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'bold', 
                              mb: 1, 
                              color: '#2e7d32',
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}>
                              📋 Información del Contrato
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              mb: 1,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' }
                            }}>
                              👤 {propiedad.inquilino}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              mb: 1,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' }
                            }}>
                              📄 {propiedad.contrato}
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              color: '#4caf50', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.1rem', sm: '1.25rem' }
                            }}>
                              💰 {formatCurrency(propiedad.montoAlquiler)}/mes
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Imágenes si las hay */}
                        {propiedad.imagenes && propiedad.imagenes.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'bold', 
                              mb: 1,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}>
                              📸 Imágenes ({propiedad.imagenes.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {propiedad.imagenes.slice(0, 3).map((imagen, imgIndex) => (
                                <Box
                                  key={imgIndex}
                                  onClick={() => handleImageClick(propiedad.imagenes, imgIndex)}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                      zIndex: 1
                                    }
                                  }}
                                >
                                  <img
                                    src={imagen.imageUrl}
                                    alt={`Propiedad ${imgIndex + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </Box>
                              ))}
                              {propiedad.imagenes.length > 3 && (
                                <Box 
                                  onClick={() => handleImageClick(propiedad.imagenes, 3)}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1,
                                    backgroundColor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                      backgroundColor: '#e0e0e0'
                                    }
                                  }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                    +{propiedad.imagenes.length - 3}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                        
                           
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#666', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      🏠 No hay propiedades registradas
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Cuando tengas propiedades, aparecerán aquí con toda su información detallada.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Sección Recibos */}
        {activeSection === 'recibos' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box sx={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            width: '100%'
          }}>
            <Typography variant="h4" sx={{ 
              mb: { xs: 2, md: 4 }, 
              fontWeight: 'bold', 
              color: '#1a237e',
              textAlign: { xs: 'left', md: 'left' }
            }}>
              Recibos de Mis Propiedades ({filteredRecibos.length})
            </Typography>

            {/* Panel de filtros con estilo moderno */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: 'white',
                  textAlign: { xs: 'center', md: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🔍 Filtros de Búsqueda
                </Typography>
              
              {/* Filtros en fila para móvil */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: { xs: 'stretch', md: 'center' }
              }}>
                {/* Primera fila: Filtros */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'row', md: 'row' },
                  gap: { xs: 1, md: 3 },
                  flex: 1,
                  flexWrap: { xs: 'nowrap', md: 'wrap' }
                }}>
                  <FormControl 
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      minWidth: { xs: 'auto', md: '120px' },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        width: { xs: 'auto', md: '6rem' },
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        '&.Mui-focused': {
                          color: '#1976d2',
                        },
                      },
                    }}
                  >
                    <InputLabel>Año</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Año"
                      onChange={(e) => setSelectedYear(e.target.value)}
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
                  
                  <FormControl 
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      minWidth: { xs: 'auto', md: '120px' },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        width: { xs: 'auto', md: '6rem' },
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        '&.Mui-focused': {
                          color: '#1976d2',
                        },
                      },
                    }}
                  >
                    <InputLabel>Mes</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Mes"
                      onChange={(e) => setSelectedMonth(e.target.value)}
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
                  
                  <FormControl 
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      width: { xs: 'auto', md: '8rem' },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        width: { xs: '100%', md: '8rem' },
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      },
                      '& .MuiSelect-select': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        '&.Mui-focused': {
                          color: '#1976d2',
                        },
                      },
                    }}
                  >
                    <InputLabel>Propiedad</InputLabel>
                    <Select
                      value={selectedProperty}
                      label="Propiedad"
                      onChange={(e) => setSelectedProperty(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Todas las propiedades</em>
                      </MenuItem>
                      {getAvailableProperties().map(property => (
                        <MenuItem key={property} value={property}>
                          {property}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                {/* Segunda fila: Botones en fila para móvil */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'row', md: 'column' },
                  gap: { xs: 1, md: 2 },
                  alignItems: { xs: 'center', md: 'stretch' },
                  minWidth: { xs: 'auto', md: '140px' }
                }}>
                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    disabled={!selectedMonth && !selectedYear && !selectedProperty}
                    size="medium"
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      minWidth: { xs: 'auto', md: '100%' },
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      color: '#1976d2',
                      borderRadius: 2,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        color: '#999',
                      }
                    }}
                  >
                    🗑️ Limpiar
                  </Button>
                  <Chip
                    label={`📊 ${filteredRecibos.length} recibos`}
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-label': {
                        fontSize: '0.9rem',
                        px: 2
                      }
                    }}
                  />
                </Box>
              </Box>
              </Box>
            </Paper>

            {/* Estadísticas rápidas con estilo moderno */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: 'white',
                  textAlign: { xs: 'center', md: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📊 Estadísticas de Recibos
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' }, 
                  gap: { xs: 2, sm: 3 },
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                }}>
                  {/* Fila superior - Pagados y Pendientes */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    width: { xs: '100%', sm: '100%', md: '50%' },
                    justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                  }}>
                    {/* Pagados */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          ✅
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#4caf50', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {filteredRecibos.filter(r => r.estado).length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Pagados
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Pendientes */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#ffebee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          ⏳
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#f44336', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {filteredRecibos.filter(r => !r.estado).length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Pendientes
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Fila inferior - Total y Propiedades */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    width: { xs: '100%', sm: '100%', md: '50%' },
                    justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' }
                  }}>
                    {/* Total */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#e3f2fd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          💰
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#2196f3', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          lineHeight: 1
                        }}>
                          {formatCurrency(filteredRecibos.reduce((total, r) => total + calcularMontoTotal(r), 0))}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Total
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Propiedades */}
                    <Card sx={{ 
                      width: { xs: '45%', sm: '45%', md: '50%' },
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }
                      }}>
                        <Box sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: '50%', 
                          backgroundColor: '#fff3e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px auto',
                          fontSize: { xs: '16px', sm: '20px' }
                        }}>
                          🏠
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: '#ff9800', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1
                        }}>
                          {[...new Set(filteredRecibos.map(r => r.propiedad?.direccion))].length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          fontWeight: 500,
                          mt: 1,
                          fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        }}>
                          Propiedades
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Lista de recibos con estilo moderno */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold', 
                  color: 'white',
                  textAlign: { xs: 'center', md: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🧾 Lista de Recibos
                </Typography>
                
                {filteredRecibos.length > 0 ? (
                  <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                    {filteredRecibos.map((recibo, index) => (
                      <Grid2 item xs={12} sm={12} md={6} lg={4} key={index} sx={{ width: '100%' }}>
                        <Card 
                          onClick={() => handleReciboClick(recibo)}
                          sx={{ 
                            height: 'auto',
                            minHeight: { xs: '280px', sm: '300px', md: '320px' },
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            border: recibo.estado ? '2px solid #4caf50' : '2px solid #f44336',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                          }}>
                          <CardContent sx={{ 
                            p: { xs: 2, sm: 2.5, md: 3 },
                            '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {/* Header con número y estado */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 'bold', 
                                color: '#1a237e',
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                              }}>
                                Recibo #{recibo.numeroRecibo}
                              </Typography>
                              <Chip 
                                label={getEstadoText(recibo.estado)} 
                                color={getEstadoColor(recibo.estado)}
                                size="small"
                              />
                            </Box>
                        
                        {/* Información del período */}
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          📅 {recibo.periodo}
                        </Typography>
                        
                        {/* Información del contrato */}
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 1, 
                          mb: 2,
                          border: '1px solid #e0e0e0'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            📋 {recibo.nombreContrato}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            👤 {recibo.inquilino.nombre} {recibo.inquilino.apellido}
                          </Typography>
                          <Typography variant="body2">
                            📍 {recibo.propiedad.direccion}
                          </Typography>
                        </Box>
                        
                        {/* Fechas */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            📅 Emisión: {new Date(recibo.fechaEmision).toLocaleDateString('es-AR')}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ⏰ Vencimiento: {new Date(recibo.fechaVencimiento).toLocaleDateString('es-AR')}
                          </Typography>
                        </Box>
                        
                        {/* Servicios incluidos */}
                        {recibo.impuestos && recibo.impuestos.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              🔧 Servicios incluidos ({recibo.impuestos.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {recibo.impuestos.slice(0, 3).map((impuesto, idx) => (
                                <Chip 
                                  key={idx}
                                  label={impuesto.descripcion || impuesto.tipoImpuesto}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {recibo.impuestos.length > 3 && (
                                <Chip 
                                  label={`+${recibo.impuestos.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {/* Monto total */}
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: recibo.estado ? '#e8f5e8' : '#ffebee', 
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: recibo.estado ? '#4caf50' : '#f44336', 
                            fontWeight: 'bold' 
                          }}>
                            💰 {formatCurrency(calcularMontoTotal(recibo))}
                          </Typography>
                        </Box>
                
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#666', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      🧾 No hay recibos que coincidan con los filtros
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      {recibos.length === 0 
                        ? 'No hay recibos disponibles en este momento.'
                      : 'Intenta ajustar los filtros para ver más resultados.'
                    }
                  </Typography>
                  {(selectedMonth || selectedYear || selectedProperty) && (
                    <Button 
                      variant="outlined" 
                      onClick={clearFilters}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </Box>
                )}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Sección Comunicaciones */}
        {activeSection === 'comunicaciones' && userRole === 'ROLE_PROPIETARIO_USER' && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              Comunicaciones
            </Typography>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                Próximamente
              </Typography>
              <Typography variant="body1" color="textSecondary">
                La sección de comunicaciones estará disponible próximamente. Aquí podrás:
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>• Comunicarte con inquilinos</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>• Recibir reportes de problemas</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>• Gestionar solicitudes de mantenimiento</Typography>
                <Typography variant="body2">• Ver notificaciones importantes</Typography>
              </Box>
            </Paper>
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

      {/* Barra de navegación - Responsive */}
      {userRole === 'ROLE_PROPIETARIO_USER' && (
        <Box sx={{ 
          position: 'fixed',
          // Mobile: bottom navigation
          bottom: { xs: 0, md: 'auto' },
          left: 0,
          right: { xs: 0, md: 'auto' },
          // Desktop: left sidebar
          top: { xs: 'auto', md: 0 },
          width: { xs: '100%', md: '210px' },
          height: { xs: 'auto', md: '100vh' },
          backgroundColor: 'white', 
          borderTop: { xs: '1px solid #e0e0e0', md: 'none' },
          borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
          boxShadow: { 
            xs: '0 -2px 10px rgba(0,0,0,0.1)', 
            md: '2px 0 10px rgba(0,0,0,0.1)' 
          },
          zIndex: 1000,
          py: { xs: 1, md: 3 },
          px: { xs: 0, md: 2 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            // Mobile: horizontal layout
            flexDirection: { xs: 'row', md: 'column' },
            justifyContent: { xs: 'space-around', md: 'flex-start' },
            alignItems: { xs: 'center', md: 'stretch' },
            gap: { xs: 0, md: 2 },
            maxWidth: { xs: '600px', md: 'none' },
            margin: { xs: '0 auto', md: 0 },
            height: { xs: 'auto', md: '100%' }
          }}>
            {/* Logo/Título solo en desktop */}
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              mb: 4,
              pb: 3,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: '#1a237e',
                textAlign: 'center'
              }}>
                🏠 Portal Propietario
              </Typography>
            </Box>
            <Button
              onClick={() => setActiveSection('home')}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                color: activeSection === 'home' ? '#1a237e' : '#666',
                minWidth: { xs: 'auto', md: '100%' },
                width: { xs: 'auto', md: '100%' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 2 },
                borderRadius: { xs: 0, md: 2 },
                backgroundColor: activeSection === 'home' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.1)'
                }
              }}
            >
              <HomeIcon sx={{ 
                fontSize: { xs: 24, md: 24 },
                mb: { xs: 0.5, md: 0 },
                mr: { xs: 0, md: 2 },
                color: activeSection === 'home' ? '#1a237e' : '#666'
              }} />
              <Typography variant="caption" sx={{ 
                fontSize: { xs: '0.7rem', md: '0.9rem' },
                fontWeight: activeSection === 'home' ? 'bold' : 'normal',
                textTransform: 'none'
              }}>
                Home
              </Typography>
            </Button>

            <Button
              onClick={() => setActiveSection('propiedades')}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                color: activeSection === 'propiedades' ? '#1a237e' : '#666',
                minWidth: { xs: 'auto', md: '100%' },
                width: { xs: 'auto', md: '100%' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 2 },
                borderRadius: { xs: 0, md: 2 },
                backgroundColor: activeSection === 'propiedades' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.1)'
                }
              }}
            >
              <PropiedadesIcon sx={{ 
                fontSize: { xs: 24, md: 24 },
                mb: { xs: 0.5, md: 0 },
                mr: { xs: 0, md: 2 },
                color: activeSection === 'propiedades' ? '#1a237e' : '#666'
              }} />
              <Typography variant="caption" sx={{ 
                fontSize: { xs: '0.7rem', md: '0.9rem' },
                fontWeight: activeSection === 'propiedades' ? 'bold' : 'normal',
                textTransform: 'none'
              }}>
                Propiedades
              </Typography>
            </Button>

            <Button
              onClick={() => setActiveSection('recibos')}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                color: activeSection === 'recibos' ? '#1a237e' : '#666',
                minWidth: { xs: 'auto', md: '100%' },
                width: { xs: 'auto', md: '100%' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 2 },
                borderRadius: { xs: 0, md: 2 },
                backgroundColor: activeSection === 'recibos' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.1)'
                }
              }}
            >
              <ReceiptIcon sx={{ 
                fontSize: { xs: 24, md: 24 },
                mb: { xs: 0.5, md: 0 },
                mr: { xs: 0, md: 2 },
                color: activeSection === 'recibos' ? '#1a237e' : '#666'
              }} />
              <Typography variant="caption" sx={{ 
                fontSize: { xs: '0.7rem', md: '0.9rem' },
                fontWeight: activeSection === 'recibos' ? 'bold' : 'normal',
                textTransform: 'none'
              }}>
                Recibos
              </Typography>
            </Button>

            <Button
              onClick={() => setActiveSection('comunicaciones')}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                color: activeSection === 'comunicaciones' ? '#1a237e' : '#666',
                minWidth: { xs: 'auto', md: '100%' },
                width: { xs: 'auto', md: '100%' },
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 2 },
                borderRadius: { xs: 0, md: 2 },
                backgroundColor: activeSection === 'comunicaciones' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.1)'
                }
              }}
            >
              <MessageIcon sx={{ 
                fontSize: { xs: 24, md: 24 },
                mb: { xs: 0.5, md: 0 },
                mr: { xs: 0, md: 2 },
                color: activeSection === 'comunicaciones' ? '#1a237e' : '#666'
              }} />
              <Typography variant="caption" sx={{ 
                fontSize: { xs: '0.7rem', md: '0.9rem' },
                fontWeight: activeSection === 'comunicaciones' ? 'bold' : 'normal',
                textTransform: 'none'
              }}>
                Mensajes
              </Typography>
            </Button>
          </Box>
        </Box>
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    <strong>Fecha Emisión:</strong> {formatFecha(selectedRecibo.fechaEmision)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha Vencimiento:</strong> {formatFecha(selectedRecibo.fechaVencimiento)}
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
                backgroundColor: '#1976d2',
                borderRadius: 1,
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
