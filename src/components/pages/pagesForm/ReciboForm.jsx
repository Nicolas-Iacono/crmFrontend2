import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import logoInmo from '../../../assets/logoInmo.png';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Input,
  FormGroup,
  Switch,
  FormControlLabel,
  CircularProgress,
  Modal,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WaterIcon from '@mui/icons-material/Water';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import SaveIcon from '@mui/icons-material/Save';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import PaymentsIcon from '@mui/icons-material/Payments';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

const ReciboForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID del contrato de los parámetros de URL
  
  // Estados para manejar el contrato y la carga
  const [contrato, setContrato] = useState(location.state?.contrato || null);
  const [loadingContrato, setLoadingContrato] = useState(!contrato && !!id);
  const formValues = location.state?.formValues || {};
  
  // Estados para la gestión de recibos, carga y errores
  const [recibos, setRecibos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);


  useEffect(() => {
    if (contrato) {
      setRecibos(contrato.recibos);
    }
  }, [contrato]);

  // Función para mostrar mensajes en el Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Forzar la actualización del contrato si cambia la URL o el estado
  useEffect(() => {
    // Si recibimos el contrato vía location.state
    if (location.state?.contrato) {
      console.log("Contrato recibido vía estado:", location.state.contrato);
      setContrato(location.state.contrato);
    }
    // Si tenemos un ID pero no contrato, necesitamos buscarlo 
    else if (id && !contrato) {
      console.log("Obteniendo contrato por ID:", id);
      const fetchContract = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/buscar/${id}`);
          const data = response.data.data || response.data;
          console.log("Contrato obtenido por API:", data);
          setContrato(data);
        } catch (error) {
          console.error("Error obteniendo contrato:", error);
          showSnackbar("Error al obtener el contrato", "error");
        }
      };
      fetchContract();
    }
  }, [location.state, id]);

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    numeroRecibo: formValues?.numeroRecibo || 0,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 10);
      return date.toISOString().split('T')[0];
    })(),
    periodo: formValues?.periodo || '',
    concepto: formValues?.concepto || 'Alquiler',
    montoTotal: contrato?.montoAlquiler || contrato?.monto || 0,
    idContrato: contrato?.id || 0,
    impuestos: {
      agua: {
        descripcion: 'Agua',
        empresa: contrato?.aguaEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: contrato?.aguaPorcentaje || 0
      },
      luz: {
        descripcion: 'Luz',
        empresa: contrato?.luzEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: contrato?.luzPorcentaje || 0
      },
      gas: {
        descripcion: 'Gas',
        empresa: contrato?.gasEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: contrato?.gasPorcentaje || 0
      },
      municipal: {
        descripcion: 'Municipal',
        empresa: contrato?.municipalEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: contrato?.municipalPorcentaje || 0
      },
      deudasPendientes: {
        descripcion: 'Deudas Pendientes',
        empresa: contrato?.deudasPendientesEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: 100
      },
      expensasOrdinarias: {
        descripcion: 'Expensas Ordinarias',
        empresa: contrato?.expensasOrdinariasEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: 100
      },
      expensasExtraordinarias: {
        descripcion: 'Expensas Extraordinarias',
        empresa: contrato?.expensasExtraordinariasEmpresa || '',
        montoAPagar: 0,
        fechaFactura: new Date().toISOString().split('T')[0],
        estadoPago: false,
        incluir: false,
        porcentaje: 100
      }
    },
    metodoPago: '',
  });

  // Update formData when contract changes
  useEffect(() => {
    if (contrato) {
      setFormData(prevState => ({
        ...prevState,
        montoTotal: contrato?.montoAlquiler || contrato?.monto || 0,
        idContrato: contrato.id || 0,
        impuestos: {
          agua: {
            ...prevState.impuestos.agua,
            empresa: contrato.aguaEmpresa || '',
            porcentaje: contrato.aguaPorcentaje || 0
          },
          luz: {
            ...prevState.impuestos.luz,
            empresa: contrato.luzEmpresa || '',
            porcentaje: contrato.luzPorcentaje || 0
          },
          gas: {
            ...prevState.impuestos.gas,
            empresa: contrato.gasEmpresa || '',
            porcentaje: contrato.gasPorcentaje || 0
          },
          municipal: {
            ...prevState.impuestos.municipal,
            empresa: contrato.municipalEmpresa || '',
            porcentaje: contrato.municipalPorcentaje || 0
          },
          deudasPendientes: {
            ...prevState.impuestos.deudasPendientes,
            empresa: contrato.deudasPendientesEmpresa || '',
            porcentaje: 100
          },
          expensasOrdinarias: {
            ...prevState.impuestos.expensasOrdinarias,
            empresa: contrato.expensasOrdinariasEmpresa || '',
            porcentaje: 100
          },
          expensasExtraordinarias: {
            ...prevState.impuestos.expensasExtraordinarias,
            empresa: contrato.expensasExtraordinariasEmpresa || '',
            porcentaje: 100
          }
        }
      }));
    }
  }, [contrato]);

  // Obtener recibos cuando el contrato esté disponible
  useEffect(() => {
    const fetchRecibos = async () => {
      // Verificar que tengamos un contrato para filtrar recibos
      if (!contrato || !contrato.id) {
        console.log("No hay contrato o ID de contrato para obtener recibos");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Obteniendo recibos para contrato ID:', contrato.id);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/recibo/all`);
        
        // Procesamiento uniforme de la respuesta (patrón común)
        const recibosData = Array.isArray(response.data) 
          ? response.data 
          : (response.data && response.data.data && Array.isArray(response.data.data)) 
            ? response.data.data 
            : [];
        
        console.log('Recibos obtenidos (sin filtrar):', recibosData);
        
        // Normalizar los datos para prevenir valores undefined
        const recibosNormalizados = recibosData.map(recibo => ({
          id: recibo.id || 0,
          numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
          // Convertir fechas de array a string si es necesario
          fechaEmision: Array.isArray(recibo.fechaEmision) 
            ? `${recibo.fechaEmision[0]}-${String(recibo.fechaEmision[1]).padStart(2, '0')}-${String(recibo.fechaEmision[2]).padStart(2, '0')}` 
            : recibo.fechaEmision || new Date().toISOString(),
          fechaVencimiento: Array.isArray(recibo.fechaVencimiento) 
            ? `${recibo.fechaVencimiento[0]}-${String(recibo.fechaVencimiento[1]).padStart(2, '0')}-${String(recibo.fechaVencimiento[2]).padStart(2, '0')}` 
            : recibo.fechaVencimiento || new Date().toISOString(),
          periodo: recibo.periodo || 'No especificado',
          concepto: recibo.concepto || 'No especificado',
          montoTotal: parseFloat(recibo.montoTotal || 0),
          estado: recibo.estado === undefined ? false : recibo.estado,
          impuestos: Array.isArray(recibo.impuestos) ? recibo.impuestos.map(imp => ({
            id: imp.id || 0,
            tipoImpuesto: imp.tipoImpuesto || 'Otro',
            montoAPagar: parseFloat(imp.montoAPagar || 0),
            estadoPago: imp.estadoPago === undefined ? false : imp.estadoPago,
            porcentaje: parseFloat(imp.porcentaje || 0)
          })) : [],
          contrato: recibo.contrato || {},
          idContrato: recibo.idContrato || recibo.contrato?.id || 0
        }));
        
        // Filtrar recibos por contrato
        const filteredRecibos = recibosNormalizados.filter(rec => 
          (rec.contrato && rec.contrato.id === contrato.id) || 
          (rec.idContrato && rec.idContrato === contrato.id)
        );
        
        console.log('Recibos filtrados para contrato ID', contrato.id, ':', filteredRecibos);
        setRecibos(filteredRecibos);
      } catch (error) {
        console.error('Error obteniendo recibos:', error);
        setError(`Error al cargar los recibos: ${error.message || 'Error desconocido'}`);
        showSnackbar('Error al cargar los recibos. Por favor, intente nuevamente.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    // Solo ejecutamos el fetch si tenemos un contrato y no estamos cargándolo
    if (contrato && contrato.id && !loadingContrato) {
      fetchRecibos();
    }
  }, [contrato, loadingContrato]); // Dependencias correctas

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImpuestoChange = (impuesto, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      impuestos: {
        ...prevState.impuestos,
        [impuesto]: {
          ...prevState.impuestos[impuesto],
          [field]: value
        }
      }
    }));
  };

  const getImpuestoIcon = (tipo) => {
    switch (tipo) {
      case 'agua':
        return <WaterIcon />;
      case 'gas':
        return <LocalFireDepartmentIcon />;
      case 'luz':
        return <BoltIcon />;
      case 'municipal':
        return <AccountBalanceIcon />;
      case 'DEUDA_PENDIENTE':
        return <MoneyOffIcon />;
      case 'EXP_ORD':
        return <PaymentsIcon />;
      case 'EXP_EXT_ORD':
        return <PriceChangeIcon />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Transformar el formato de impuestos para que coincida con lo que espera el backend
      const impuestosTransformados = [];

      // Solo incluimos impuestos seleccionados (incluir=true)
      Object.entries(formData.impuestos)
        .filter(([_, impuesto]) => impuesto.incluir)
        .forEach(([tipo, impuesto]) => {
          // Asignar el tipo de impuesto correcto para los casos especiales
          let tipoImpuestoEnviado;
          switch(tipo) {
            case 'expensasOrdinarias':
              tipoImpuestoEnviado = 'EXP_ORD';
              break;
            case 'expensasExtraordinarias':
              tipoImpuestoEnviado = 'EXP_EXT_ORD';
              break;
            case 'deudasPendientes':
              tipoImpuestoEnviado = 'DEUDA_PENDIENTE';
              break;
            default:
              tipoImpuestoEnviado = tipo.toUpperCase();
          }
          
          impuestosTransformados.push({
            tipoImpuesto: tipoImpuestoEnviado,
            descripcion: impuesto.descripcion,
            Empresa: impuesto.empresa, 
            porcentaje: impuesto.porcentaje,
            numeroCliente: impuesto.numeroCliente || "",
            numeroMedidor: impuesto.numeroMedidor || "",
            montoAPagar: parseFloat(impuesto.montoAPagar),
            fechaFactura: impuesto.fechaFactura, 
            estadoPago: impuesto.estadoPago
          });
        });

      // Verificar que tenemos un contrato válido
      if (!contrato || !contrato.id) {
        alert('No hay un contrato seleccionado. Por favor, seleccione un contrato antes de crear un recibo.');
        setIsLoading(false);
        return;
      }

      const reciboData = {
        idContrato: contrato.id,
        numeroRecibo: parseInt(formData.numeroRecibo) || 0,
        fechaEmision: formData.fechaEmision || new Date().toISOString(),
        fechaVencimiento: formData.fechaVencimiento || new Date().toISOString(),
        periodo: formData.periodo || '',
        concepto: formData.concepto || '',
        montoTotal: contrato?.montoAlquiler || contrato?.monto || 0,
        impuestos: impuestosTransformados
      };

      console.log('Datos enviados al servidor:', reciboData);

      // Corregir la URL para evitar el duplicado de /api
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/recibo/create`, reciboData);

      console.log('Respuesta del servidor:', response.data);
      const newRecibo = response.data.data || response.data;
      const reciboNormalizado = {
        id: newRecibo.id || 0,
        numeroRecibo: newRecibo.numeroRecibo || newRecibo.id || 0,
        fechaEmision: newRecibo.fechaEmision || new Date().toISOString(),
        fechaVencimiento: newRecibo.fechaVencimiento || new Date().toISOString(),
        periodo: newRecibo.periodo || 'No especificado',
        concepto: newRecibo.concepto || 'No especificado',
        montoTotal: parseFloat(newRecibo.montoTotal || 0),
        estado: newRecibo.estado || false,
        impuestos: Array.isArray(newRecibo.impuestos) ? newRecibo.impuestos.map(imp => ({
          id: imp.id || 0,
          tipoImpuesto: imp.tipoImpuesto || 'Otro',
          montoAPagar: parseFloat(imp.montoAPagar || 0),
          estadoPago: imp.estadoPago || false,
          porcentaje: parseFloat(imp.porcentaje || 0)
        })) : [],
        contrato: newRecibo.contrato ? {
          id: newRecibo.contrato.id || 0,
          inquilino: newRecibo.contrato.inquilino ? {
            id: newRecibo.contrato.inquilino.id || 0,
            nombre: newRecibo.contrato.inquilino.nombre || '',
            apellido: newRecibo.contrato.inquilino.apellido || '',
            dni: newRecibo.contrato.inquilino.dni || 'N/A'
          } : {},
          propiedad: newRecibo.contrato.propiedad ? {
            id: newRecibo.contrato.propiedad.id || 0,
            direccion: newRecibo.contrato.propiedad.direccion || 'N/A',
            localidad: newRecibo.contrato.propiedad.localidad || 'N/A',
            partido: newRecibo.contrato.propiedad.partido || ''
          } : {},
          propietario: newRecibo.contrato.propietario ? {
            id: newRecibo.contrato.propietario.id || 0,
            nombre: newRecibo.contrato.propietario.nombre || '',
            apellido: newRecibo.contrato.propietario.apellido || '',
            dni: newRecibo.contrato.propietario.dni || 'N/A'
          } : {}
        } : contrato
      };

      setRecibos(prev => [...prev, reciboNormalizado]);

      // Mostrar mensaje de éxito
      alert('Recibo creado con éxito');

    } catch (error) {
      console.error('Error creating recibo:', error);

      // Mostrar información detallada del error
      if (error.response) {
        // La respuesta fue hecha y el servidor respondió con un código de estado
        // que cae fuera del rango de 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('Error request:', error.request);
        alert('No se recibió respuesta del servidor');
      } else {
        // Algo ocurrió al preparar la petición que lanzó un error
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEstado = async (recibo) => {
    try {
      const nuevoEstado = !recibo.estado;

      console.log(`Actualizando recibo ${recibo.id} a estado: ${nuevoEstado ? 'Pagado' : 'Pendiente'}`);

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/recibo/estado`, 
        { 
          id: recibo.id,
          estado: nuevoEstado 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);

      // Actualizar el estado local
      setRecibos(prev => prev.map(r => 
        r.id === recibo.id ? { ...r, estado: nuevoEstado } : r
      ));

    } catch (error) {
      console.error('Error actualizando estado del recibo:', error);

      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        alert(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('No se recibió respuesta del servidor');
      } else {
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleDownloadPDF = async (recibo, event) => {
    // Si el clic fue en el chip de estado, no descargar el PDF
    if (event.target.closest('.estado-chip')) {
      return;
    }

    try {
      console.log(`Generando PDF del recibo ${recibo.id}`);

      // Normalizar el recibo para evitar valores undefined
      const reciboNormalizado = {
        id: recibo.id || 0,
        numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
        // Convertir fechas de array a string si es necesario
        fechaEmision: Array.isArray(recibo.fechaEmision) 
          ? `${recibo.fechaEmision[0]}-${String(recibo.fechaEmision[1]).padStart(2, '0')}-${String(recibo.fechaEmision[2]).padStart(2, '0')}` 
          : recibo.fechaEmision || new Date().toISOString(),
        fechaVencimiento: Array.isArray(recibo.fechaVencimiento) 
          ? `${recibo.fechaVencimiento[0]}-${String(recibo.fechaVencimiento[1]).padStart(2, '0')}-${String(recibo.fechaVencimiento[2]).padStart(2, '0')}` 
          : recibo.fechaVencimiento || new Date().toISOString(),
        periodo: recibo.periodo || 'No especificado',
        concepto: recibo.concepto || 'No especificado',
        montoTotal: parseFloat(recibo.montoTotal || 0),
        estado: recibo.estado === undefined ? false : recibo.estado,
        impuestos: Array.isArray(recibo.impuestos) ? recibo.impuestos.map(imp => ({
          id: imp.id || 0,
          tipoImpuesto: imp.tipoImpuesto || 'Otro',
          montoAPagar: parseFloat(imp.montoAPagar || 0),
          estadoPago: imp.estadoPago === undefined ? false : imp.estadoPago,
          porcentaje: parseFloat(imp.porcentaje || 0)
        })) : [],
        contrato: recibo.contrato || contrato || {}
      };

      // Asegurar que el contrato tenga todas las propiedades necesarias
      if (reciboNormalizado.contrato) {
        reciboNormalizado.contrato.inquilino = reciboNormalizado.contrato.inquilino || {};
        reciboNormalizado.contrato.propiedad = reciboNormalizado.contrato.propiedad || {};
        reciboNormalizado.contrato.propietario = reciboNormalizado.contrato.propietario || {};
      }

      // Crear un documento PDF usando jsPDF
      const doc = new jsPDF();

      // Configuración de colores y estilos
      const primaryColor = theme.palette.primary.main;
      const secondaryColor = theme.palette.text.secondary;
      const backgroundColor = theme.palette.background.default;

      // Convertir los colores hexadecimales a valores RGB para jsPDF
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
      };

      const primaryRgb = hexToRgb(primaryColor);
      const secondaryRgb = hexToRgb(secondaryColor);

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
      doc.text('IACONO TROFA NICOLAS - COL:1179', 105, 22, { align: 'center' });

      // Espacio para logo
      const logoWidth = 30;
      const logoHeight = 30;
      const logoX = 20;
      const logoY = 32;

      // Agregar la imagen al PDF
      doc.addImage(logoInmo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Información de la empresa
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('IACONO TROFA PROPIEDADES', 55, 45);
      doc.setFont('helvetica', 'normal');
      doc.text('Corrientes N°321, Quilmes Oeste', 55, 50);
      doc.text('Partido de Quilmes, Buenos Aires', 55, 55);

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
      // Obtenemos la información del contrato

      doc.text(`Inquilino: ${reciboNormalizado.contrato?.inquilino?.nombre + ' ' + reciboNormalizado.contrato?.inquilino?.apellido || 'N/A'}`, 20, 125);
      doc.text(`DNI: ${reciboNormalizado.contrato?.inquilino?.dni || 'N/A'}`, 20, 132);
      doc.text(`Propiedad: ${reciboNormalizado.contrato?.propiedad?.direccion || 'N/A'}`, 20, 139);
      doc.text(`Localidad: ${reciboNormalizado.contrato?.propiedad?.localidad || 'N/A'}, ${reciboNormalizado.contrato?.propiedad?.partido || ''}`, 20, 146);

      // Datos del propietario
      doc.text(`Propietario: ${reciboNormalizado.contrato?.propietario?.nombre + ' ' + reciboNormalizado.contrato?.propietario?.apellido || ''}`,130, 125);
      doc.text(`DNI: ${reciboNormalizado.contrato?.propietario?.dni || 'N/A'}`, 130, 132);

      // Detalles del pago
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DEL PAGO', 20, 160);
      doc.setLineWidth(0.2);
      doc.line(20, 162, 80, 162);

      doc.setFont('helvetica', 'normal');
      doc.text(`${reciboNormalizado.periodo || 'N/A'}`, 20, 170);
      doc.text(`${reciboNormalizado.concepto || 'N/A'}`, 20, 177, {
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
          doc.text(`${impuesto.tipoImpuesto} ${impuesto.porcentaje ? `(${impuesto.porcentaje}%)` : ''}`, 25, y, {
            maxWidth: 80,
            align: 'left'
          });

          // Calcular el monto aplicando el porcentaje
          const montoOriginal = parseFloat(impuesto.montoAPagar) || 0;
          const porcentaje = parseFloat(impuesto.porcentaje) || 0;
          // Si el porcentaje es 100 o está vacío, usar el monto original
          // de lo contrario, aplicar el porcentaje
          const montoCalculado = porcentaje === 0 || porcentaje === 100 ? montoOriginal : montoOriginal * (porcentaje / 100);
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
        const porcentajeImpuesto = parseFloat(impuesto.porcentaje || 0);
        const montoCalculado = porcentajeImpuesto === 0 || porcentajeImpuesto === 100 
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

      // Verificar si estamos en un entorno móvil o en un iframe
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const isInIframe = window !== window.top;
      
      // En lugar de alert, usamos diferentes métodos según el entorno
      if (isMobile || isInIframe) {
        try {
          // En dispositivos móviles o iframes, intentamos abrir en una nueva pestaña
          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Mostrar mensaje no intrusivo
          showSnackbar('Abriendo PDF en nueva pestaña...', 'info');
          
          // Intentar abrir en nueva pestaña (puede requerir permitir popups)
          window.open(pdfUrl, '_blank');
        } catch (error) {
          console.error('Error al abrir PDF en nueva pestaña:', error);
          showSnackbar('No se pudo abrir el PDF. Intente desde un navegador de escritorio.', 'warning');
        }
      } else {
        // En navegadores de escritorio, usamos descarga normal
        doc.save(`Recibo_${reciboNormalizado.id}_${reciboNormalizado.periodo || 'Sin_Periodo'}.pdf`);
        showSnackbar('PDF descargado exitosamente', 'success');
      }

      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      showSnackbar('Error: No se pudo generar el PDF.', 'error');
    }
  };

  const formatFecha = (fecha) => {
    // Si es un array, formatearlo como dd/mm/yyyy
    if (Array.isArray(fecha) && fecha.length >= 3) {
      return `${String(fecha[2]).padStart(2, '0')}/${String(fecha[1]).padStart(2, '0')}/${fecha[0]}`;
    }
    
    // Si es un string en formato ISO o similar (yyyy-mm-dd)
    if (typeof fecha === 'string' && fecha.includes('-')) {
      try {
        const partes = fecha.split('-');
        if (partes.length >= 3) {
          // La fecha viene en formato yyyy-mm-dd
          const anio = partes[0];
          const mes = partes[1];
          const dia = partes[2].substring(0, 2); // por si tiene formato con horas
          return `${dia}/${mes}/${anio}`;
        }
      } catch (error) {
        console.error('Error al formatear fecha string:', error);
      }
    }
    
    // Si es un string en otro formato, intentar convertirlo con Date
    if (typeof fecha === 'string' && fecha !== 'N/A') {
      try {
        const fechaObj = new Date(fecha);
        if (!isNaN(fechaObj.getTime())) {
          const dia = String(fechaObj.getDate()).padStart(2, '0');
          const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const anio = fechaObj.getFullYear();
          return `${dia}/${mes}/${anio}`;
        }
      } catch (error) {
        console.error('Error al parsear fecha con Date:', error);
      }
    }
    
    // En cualquier otro caso o si hay un error
    return 'N/A';
  };

  const getTipoImpuestoIcon = (tipo) => {
    switch (tipo) {
      case 'AGUA':
        return <WaterIcon />;
      case 'GAS':
        return <LocalFireDepartmentIcon />;
      case 'LUZ':
        return <BoltIcon />;
      case 'MUNICIPAL':
        return <AccountBalanceIcon />;
      case 'DEUDAS PENDIENTES':
        return <MoneyOffIcon />;
      case 'EXPENSAS ORDINARIAS':
        return <PaymentsIcon />;
      case 'EXPENSAS EXTRAORDINARIAS':
        return <PriceChangeIcon />;
      default:
        return null;
    }
  };

  const handleOpenReciboModal = (recibo) => {
    const reciboNormalizado = {
      id: recibo.id || 0,
      numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
      fechaEmision: recibo.fechaEmision || new Date().toISOString(),
      fechaVencimiento: recibo.fechaVencimiento || new Date().toISOString(),
      periodo: recibo.periodo || 'No especificado',
      concepto: recibo.concepto || 'No especificado',
      montoTotal: parseFloat(recibo.montoTotal || 0),
      estado: recibo.estado || false,
      impuestos: Array.isArray(recibo.impuestos) ? recibo.impuestos.map(imp => ({
        id: imp.id || 0,
        tipoImpuesto: imp.tipoImpuesto || 'Otro',
        descripcion: imp.descripcion || imp.tipoImpuesto || 'Otro',
        montoAPagar: parseFloat(imp.montoAPagar || 0),
        estadoPago: imp.estadoPago || false,
        porcentaje: parseFloat(imp.porcentaje || 0)
      })) : [],
      contrato: recibo.contrato || contrato || {}
    };

    // Asegurar que el contrato tenga todas las propiedades necesarias
    if (reciboNormalizado.contrato) {
      reciboNormalizado.contrato.inquilino = reciboNormalizado.contrato.inquilino || {};
      reciboNormalizado.contrato.propiedad = reciboNormalizado.contrato.propiedad || {};
      reciboNormalizado.contrato.propietario = reciboNormalizado.contrato.propietario || {};
    }

    setSelectedRecibo(reciboNormalizado);
    setOpenModal(true);
  };

  const handleCloseReciboModal = () => {
    setOpenModal(false);
    setSelectedRecibo(null);
  };

  return (
    <>
    <Box 
      sx={{ 
        width: isMobile ? "100%" : "80%",
        margin: "0 auto",
        pt: isMobile ? 0 : 4,
        pb: 4,
        backgroundColor: theme.palette.mode === 'dark' ? "#232323" : "white",
        minHeight: '100vh'
      }}
    >
     

      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' ? "#232323" : "white",
          transition: 'all 0.3s ease',
          marginTop:0,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        }}
      >

        <CardContent sx={{ p: 3, backgroundColor: theme.palette.mode === 'dark' ? "#111111" : "white" }}>
          <Box>
          <IconButton 
        onClick={() => navigate(-1)}
        sx={{ 
          marginTop:10,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }
        }}
      >
        <ArrowBackIcon />
      </IconButton> 
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, marginTop:"1rem" }}>
            <ReceiptIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Generar Recibo
            </Typography>
          </Box>
          </Box>
          <Box sx={{ 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f8fafc',
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            mb: 3
          }}>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.primary.main
              }}
            >
              <DescriptionIcon sx={{ mr: 1 }} />
              Datos del Contrato
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HomeIcon color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Propiedad: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      {contrato?.propiedad?.direccion || 'No disponible'}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon color="secondary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Inquilino: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      {contrato?.inquilino ? `${contrato.inquilino.nombre} ${contrato.inquilino.apellido}` : 'No disponible'}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupIcon color="info" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Propietario: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      {contrato?.propietario ? `${contrato.propietario.nombre} ${contrato.propietario.apellido}` : 'No disponible'}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'green' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Monto Alquiler: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      ${parseFloat(contrato?.montoAlquiler || contrato?.monto || 0).toLocaleString()}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Fecha Inicio: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      {contrato?.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString() : 'No disponible'}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon color="secondary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500 }}>
                    Fecha Fin: 
                    <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                      {contrato?.fecha_fin ? new Date(contrato.fecha_fin).toLocaleDateString() : 'No disponible'}
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Card 
            sx={{ 
              mb: 4, 
              p: 2,
              backgroundColor: theme.palette.mode === 'dark' ? "#232323" : "white",
              boxShadow: 'none',
              border: theme.palette.mode === 'dark' ? "1px solid #232323" : "1px solid #E0E0E0",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1"  color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500}}>
                  Locatario: 
                  <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                    {contrato?.inquilino?.nombre + ' ' + contrato?.inquilino?.apellido || ''}
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500}}>
                  Locador: 
                  <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                    {contrato?.propietario?.nombre + ' ' + contrato?.propietario?.apellido || ''}
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1"  color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ fontWeight: 500, }}>
                  Propiedad: 
                  <Typography component="span" color={theme.palette.mode === 'dark' ? "white" : "#2A2C31"} sx={{ ml: 1 }}>
                    {contrato?.propiedad?.direccion || ''}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Card>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Número de Recibo"
                  name="numeroRecibo"
                  value={formData.numeroRecibo}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Fecha Emisión"
                  name="fechaEmision"
                  value={formData.fechaEmision}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Fecha Vencimiento"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Monto Total"
                  name="montoTotal"
                  value={contrato?.montoAlquiler || contrato?.monto || 0}
                  disabled
                  InputProps={{
                    startAdornment: <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Periodo"
                  name="periodo"
                  value={formData.periodo}
                  onChange={handleChange}
                  placeholder="ej: Enero 2024"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Concepto"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleChange}
                    label="Método de Pago"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Impuestos Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon color="primary" />
                  Impuestos
                </Typography>
                {Object.entries(formData.impuestos).map(([tipo, impuesto]) => (
                  <Accordion 
                    key={tipo}
                    sx={{ 
                      mb: 1.5,
                      '&:before': { display: 'none' },
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderRadius: '8px !important',
                      '& .MuiAccordionSummary-root': {
                        borderRadius: '8px !important',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                        '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200] },
                        borderRadius: '8px',
                        '& .MuiSvgIcon-root': {
                          color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {getImpuestoIcon(tipo)}
                        <Typography sx={{ 
                          flex: 1, 
                          fontWeight: 500,
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }}>
                          {impuesto.descripcion || tipo.charAt(0).toUpperCase() + tipo.slice(1)} ({impuesto.empresa})
                        </Typography>
                        <Chip 
                          label={`${impuesto.porcentaje}%`} 
                          size="small" 
                          color="primary" 
                          sx={{ 
                            mr: 1,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? theme.palette.primary.dark
                              : theme.palette.primary.light,
                            color: theme.palette.mode === 'dark'
                              ? theme.palette.primary.contrastText
                              : "white"
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={impuesto.incluir}
                              onChange={(e) => handleImpuestoChange(tipo, 'incluir', e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500,
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }}>
                              Incluir
                            </Typography>
                          }
                          sx={{ mr: 0 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ 
                      pt: 3, 
                      pb: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'inherit'
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Monto"
                            type="number"
                            value={impuesto.montoAPagar}
                            onChange={(e) => handleImpuestoChange(tipo, 'montoAPagar', e.target.value)}
                            disabled={!impuesto.incluir}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: 2,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                              },
                              '& .MuiInputLabel-root': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                              },
                              '& .MuiOutlinedInput-input': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Fecha Factura"
                            value={impuesto.fechaFactura}
                            onChange={(e) => handleImpuestoChange(tipo, 'fechaFactura', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={!impuesto.incluir}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: 2,
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                              },
                              '& .MuiInputLabel-root': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                              },
                              '& .MuiOutlinedInput-input': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ 
                    mt: 2,
                    height: '48px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <SaveIcon sx={{ mr: 1 }} />
                      Guardar Recibo
                    </>
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 3
              }}
            >
              <ReceiptIcon color="primary" />
              Recibos Generados
            </Typography>

            {isLoading || !contrato ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress color="primary" />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                      Cargando información del contrato...
                    </Typography>
                  </>
                ) : (
                  <>
                    <InfoIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" align="center" gutterBottom>
                      No se pudo cargar la información del contrato
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => navigate('/contratos')}
                      startIcon={<ArrowBackIcon />}
                      sx={{ mt: 2 }}
                    >
                      Volver a contratos
                    </Button>
                  </>
                )}
              </Box>
            ) : error ? (
              <Box sx={{ 
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.dark,
                p: 2,
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography>{error}</Typography>
              </Box>
            ) : recibos.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center',
                py: 4,
                color: theme.palette.text.secondary
              }}>
                <Typography>No hay recibos generados</Typography>
              </Box>
            ) : isMobile ? (
              // Vista móvil con tarjetas
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recibos.map((recibo, index) => (
                  <Card 
                    key={recibo.id || index}
                    elevation={2}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => handleOpenReciboModal(recibo)}
                  >
                    <Box 
                      sx={{ 
                        backgroundColor: theme.palette.primary.main, 
                        py: 1.5, 
                        px: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                        #{recibo.numeroRecibo || recibo.id || 'N/A'}
                      </Typography>
                      <Chip 
                        icon={recibo.estado ? <CheckCircleIcon /> : <CancelIcon />}
                        label={recibo.estado ? "Pagado" : "Pendiente"}
                        color={recibo.estado ? "success" : "warning"}
                        size="small"
                        className="estado-chip"
                        sx={{ 
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            fontSize: 16
                          },
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateEstado(recibo);
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Periodo:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {recibo.periodo || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha:
                        </Typography>
                        <Typography variant="body1">
                          {formatFecha(recibo.fechaEmision) || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Concepto:
                        </Typography>
                        <Typography variant="body1">
                          {recibo.concepto || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Monto:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#273D97" }}>
                          ${recibo.montoTotal ? recibo.montoTotal.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) : '0'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Vista desktop con tabla
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  bgcolor: theme.palette.background.paper,
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] }}>
                    <TableRow sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                      '& th': { 
                        color: theme.palette.mode === 'dark' ? 'white' : 'black',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '16px',
                      }
                    }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha Emisión</TableCell>
                      <TableCell>Fecha Vencimiento</TableCell>
                      <TableCell>Periodo</TableCell>
                      <TableCell>Concepto</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Impuestos</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recibos.map((recibo, index) => (
                      <TableRow 
                        key={recibo.id || index}
                        sx={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : theme.palette.grey[50],
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            transition: 'background-color 0.3s ease',
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => handleOpenReciboModal(recibo)}
                      >
                        <TableCell sx={{ padding: '16px' }}>{recibo.id || 'N/A'}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>{formatFecha(recibo.fechaEmision)}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>{formatFecha(recibo.fechaVencimiento)}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>{recibo.periodo || 'N/A'}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>{recibo.concepto || 'N/A'}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>${recibo.montoTotal ? recibo.montoTotal.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) : '0'}</TableCell>
                        <TableCell sx={{ padding: '16px' }}>
                          {recibo.impuestos && recibo.impuestos.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {recibo.impuestos.map(impuesto => (
                                <Chip
                                  key={impuesto.id}
                                  icon={getTipoImpuestoIcon(impuesto.tipoImpuesto)}
                                  label={`${impuesto.tipoImpuesto} - $${impuesto.montoAPagar.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ 
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                      fontSize: 16
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">Sin impuestos</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ padding: '16px' }}>
                          <Chip 
                            icon={recibo.estado ? <CheckCircleIcon /> : <CancelIcon />}
                            label={recibo.estado ? "Pagado" : "Pendiente"}
                            color={recibo.estado ? "success" : "warning"}
                            size="small"
                            className="estado-chip"
                            sx={{ 
                              fontWeight: 500,
                              minWidth: '100px',
                              '& .MuiChip-icon': {
                                fontSize: 16
                              },
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que se propague al onClick de la fila
                              handleUpdateEstado(recibo);
                            }}
                            title="Haz clic para cambiar el estado"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>

    {/* Modal para mostrar el recibo digital */}
    <Modal
      open={openModal}
      onClose={handleCloseReciboModal}
      aria-labelledby="recibo-digital-modal"
      aria-describedby="visualización-digital-del-recibo"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '95%' : '80%',
        maxWidth: '800px',
        maxHeight: '90vh',
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 24,
        p: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedRecibo && (
          <>
            <Box sx={{ 
              bgcolor: theme.palette.primary.main, 
              py: 2, 
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Recibo #{selectedRecibo.numeroRecibo || selectedRecibo.id}
              </Typography>
              <IconButton 
                onClick={handleCloseReciboModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ 
              flex: 1,
              px: 3, 
              py: 3, 
              overflowY: 'auto',
              bgcolor: theme.palette.background.default
            }}>
              {/* Cabecera del recibo */}
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Datos del Recibo
                    </Typography>
                    <Typography variant="body1">
                      <strong>Fecha emisión:</strong> {formatFecha(selectedRecibo.fechaEmision)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Vencimiento:</strong> {formatFecha(selectedRecibo.fechaVencimiento)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Periodo:</strong> {selectedRecibo.periodo}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: isMobile ? 'flex-start' : 'center',
                    gap: 1
                  }}>
                    <Chip 
                      icon={selectedRecibo.estado ? <CheckCircleIcon /> : <CancelIcon />}
                      label={selectedRecibo.estado ? "PAGADO" : "PENDIENTE"}
                      color={selectedRecibo.estado ? "success" : "warning"}
                      sx={{ 
                        fontWeight: 600,
                        py: 0.5,
                        px: 1
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Información de inquilino y propiedad */}
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.primary.main, verticalAlign: 'text-bottom' }} />
                      Inquilino
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {selectedRecibo.contrato?.inquilino?.nombre || ''} {selectedRecibo.contrato?.inquilino?.apellido || ''}
                    </Typography>
                    <Typography variant="body2">
                      <strong>DNI:</strong> {selectedRecibo.contrato?.inquilino?.dni || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      <HomeIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.primary.main, verticalAlign: 'text-bottom' }} />
                      Propiedad
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dirección:</strong> {selectedRecibo.contrato?.propiedad?.direccion || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Localidad:</strong> {selectedRecibo.contrato?.propiedad?.localidad || 'N/A'}, {selectedRecibo.contrato?.propiedad?.partido || ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Concepto */}
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.primary.main, verticalAlign: 'text-bottom' }} />
                  Concepto
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedRecibo.concepto}
                </Typography>
              </Paper>

              {/* Detalles de montos */}
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  <ReceiptIcon sx={{ fontSize: 18, mr: 0.5, color: theme.palette.primary.main, verticalAlign: 'text-bottom' }} />
                  Detalle de importes
                </Typography>

                <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Alquiler base</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ${parseFloat((selectedRecibo.montoTotal || 0)).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                  </Box>

                  {selectedRecibo.impuestos && selectedRecibo.impuestos.length > 0 && (
                    selectedRecibo.impuestos.map((impuesto, idx) => (
                      <Box key={impuesto.id || idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {impuesto.tipoImpuesto} {impuesto.porcentaje ? `(${impuesto.porcentaje}%)` : ''}
                        </Typography>
                        <Typography variant="body2">
                          ${(parseFloat(impuesto.porcentaje || 0) === 0 || parseFloat(impuesto.porcentaje || 0) === 100 
                            ? parseFloat(impuesto.montoAPagar || 0)
                            : parseFloat(impuesto.montoAPagar || 0) * (parseFloat(impuesto.porcentaje || 0) / 100)).toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#273D97" }}>
                    ${(() => {
                      // Calculate the total as the sum of base rent plus all impuestos
                      const baseRent = parseFloat(selectedRecibo.montoTotal || 0);
                      const impuestosTotal = selectedRecibo.impuestos && selectedRecibo.impuestos.length > 0 
                        ? selectedRecibo.impuestos.reduce((total, imp) => {
                            const montoImp = parseFloat(imp.montoAPagar || 0);
                            const porcentajeImp = parseFloat(imp.porcentaje || 0);
                            // Si el porcentaje es 100 o está vacío, usar el monto original
                            // de lo contrario, aplicar el porcentaje
                            const montoCalculado = porcentajeImp === 0 || porcentajeImp === 100 
                              ? montoImp 
                              : montoImp * (porcentajeImp / 100);
                            return total + montoCalculado;
                          }, 0)
                        : 0;
                      return (baseRent + impuestosTotal).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                    })()}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Botón de descarga */}
            <Box sx={{ 
              p: 2, 
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={(e) => handleDownloadPDF(selectedRecibo, e)}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600
                }}
              >
                Descargar PDF
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>

    {/* Agregar Snackbar para notificaciones no intrusivas */}
    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={() => setOpenSnackbar(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default ReciboForm;