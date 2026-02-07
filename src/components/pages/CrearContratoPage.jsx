import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PropietarioForm from '../common/PropietarioForm';
import InquilinoForm from '../common/InquilinoForm';
import PropiedadesForm from '../common/PropiedadesForm';
import GaranteForm from '../common/GaranteForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import contratoApi from '../api/contratoApi';
import PropietarioApi from '../api/propietarios';
import InquilinosApi from '../api/inquilinosApi';
import PropiedadApi from '../api/propiedades';
import GaranteApi from '../api/garanteApi';
import Swal from 'sweetalert2';
import { useAuth } from '../context/GlobalAuth';
import CreateContractTour from '../common/tour/CreateContractTour';
import { showSuccess, showError, showWarning } from '../alertas/showAlert';
import logoInmo from '../../assets/logoInmo512.png';
// Slide transition for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CrearContratoPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuth(); // Usar el contexto de autenticación para obtener el usuario
  
  // User state
  const [userState, setUserState] = useState({
    name: '',
    authorities: '',
  });

  useEffect(() => {
    if (user) {
      setUserState({
        name: user.username,
        authorities: user.authorities,
      });
    }
  }, [user]);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Seleccionar Propietario',
    'Seleccionar Inquilino',
    'Seleccionar Propiedad',
    'Agregar Garantes',
    'Detalles del Contrato'
  ];

  // Dialog states for creating new entities
  const [openPropietarioDialog, setOpenPropietarioDialog] = useState(false);
  const [openInquilinoDialog, setOpenInquilinoDialog] = useState(false);
  const [openPropiedadDialog, setOpenPropiedadDialog] = useState(false);
  const [openGaranteDialog, setOpenGaranteDialog] = useState(false);

  // Loading states
  const [loading, setLoading] = useState({
    propietarios: false,
    inquilinos: false,
    propiedades: false,
    garantes: false
  });

  // Error states
  const [error, setError] = useState({
    propietarios: null,
    inquilinos: null,
    propiedades: null,
    garantes: null
  });

  // Data states
  const [propietarios, setPropietarios] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [garantes, setGarantes] = useState([]);

  // Search states
  const [search, setSearch] = useState({
    propietario: '',
    inquilino: '',
    propiedad: '',
    garante: ''
  });

  // Estado y constantes para paginación
  const ITEMS_PER_PAGE = 4;
  
  const [pagination, setPagination] = useState({
    propietarios: 0,
    inquilinos: 0,
    propiedades: 0,
    garantes: 0
  });
  
  const handleNextPage = (type) => {
    setPagination(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  // Genera y descarga un PDF unificado para broker (caución)
  const downloadBrokerPdf = async () => {
    setDownloadingBroker(true);
    try {
      const { PDFDocument, StandardFonts } = await import('https://cdn.skypack.dev/pdf-lib');

      // 1) Crear PDF base con datos del contrato
      const infoPdf = await PDFDocument.create();
      const PAGE_W = 595.28;
      const PAGE_H = 841.89;
      const page = infoPdf.addPage([PAGE_W, PAGE_H]); // A4
      const marginX = 50;
      let cursorY = PAGE_H - 60;
      const drawText = async (text, size = 12, gap = 18, bold = false) => {
        const font = await infoPdf.embedFont(StandardFonts.Helvetica);
        const fontBold = await infoPdf.embedFont(StandardFonts.HelveticaBold);
        page.drawText(String(text || ''), { x: marginX, y: cursorY, size, font: bold ? fontBold : font });
        cursorY -= gap;
      };

      // Ensure rgb is available for colors
      const { rgb } = await import('https://cdn.skypack.dev/pdf-lib');

const COLOR_MAIN = rgb(0.55, 0.18, 0.9); // Tuinmo violeta
const COLOR_ACCENT = rgb(0.93, 0.65, 0.28); // Naranja Tuinmo
const COLOR_TEXT = rgb(0.1, 0.1, 0.1);
const COLOR_LABEL = rgb(0.35, 0.35, 0.35);
const COLOR_DIVIDER = rgb(0.85, 0.85, 0.85);
const COLOR_BG_SECTION = rgb(0.96, 0.96, 0.96);

// Fonts
const font = await infoPdf.embedFont(StandardFonts.Helvetica);
const fontBold = await infoPdf.embedFont(StandardFonts.HelveticaBold);

// 🔹 Helpers
const drawDivider = (y) => {
  page.drawRectangle({ x: 40, y, width: PAGE_W - 80, height: 0.8, color: COLOR_DIVIDER });
};

const drawSectionBox = (y, height) => {
  page.drawRectangle({ x: 40, y: y - height, width: PAGE_W - 100, height, color: COLOR_BG_SECTION });
};

const drawSectionTitle = (title, y) => {
  page.drawText(title, { x: 50, y, size: 13, font: fontBold, color: COLOR_MAIN });
  drawDivider(y - 4);
  return y - 30;
};

const drawKeyValue = (x, y, label, value, minGap = 5) => {
  const labelWidth = fontBold.widthOfTextAtSize(label, 10);
  const valueX = x + labelWidth + minGap;
  page.drawText(label, { x, y, size: 10, font: fontBold, color: COLOR_LABEL });
  page.drawText(String(value ?? '-'), { x: valueX, y, size: 10, font, color: COLOR_TEXT });
  return y - 16;
};

// 🎨 HEADER con degradado
const gradHeight = 50;
for (let i = 0; i < gradHeight; i++) {
  const intensity = 0.18 + i / 250;
  page.drawRectangle({
    x: 0,
    y: PAGE_H - gradHeight + i,
    width: PAGE_W,
    height: 1,
    color: rgb(0.55, intensity, 0.9),
  });
}

page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, {
  x: 50,
  y: PAGE_H - 30,
  size: 10,
  font,
  color: rgb(1, 1, 1),
});

const title = 'Solicitud de Seguro de Caución';
const tWidth = fontBold.widthOfTextAtSize(title, 19);
page.drawText(title, {
  x: (PAGE_W - tWidth) / 2,
  y: PAGE_H - 70,
  size: 19,
  font: fontBold,
  color: COLOR_MAIN,
});

cursorY = PAGE_H - 120;

// Datos Inquilino / Propietario
cursorY = drawSectionTitle('Datos del Inquilino / Propietario', cursorY);
drawSectionBox(cursorY + 20, 90);

let leftY = cursorY;
leftY = drawKeyValue(55, leftY, 'Nombre:', `${selectedInquilino?.nombre || ''} ${selectedInquilino?.apellido || ''}`);
leftY = drawKeyValue(55, leftY, 'DNI:', selectedInquilino?.dni);
leftY = drawKeyValue(55, leftY, 'CUIT:', selectedInquilino?.cuit);
leftY = drawKeyValue(55, leftY, 'Email:', selectedInquilino?.email);

let rightY = cursorY;
rightY = drawKeyValue(320, rightY, 'Nombre:', `${selectedPropietario?.nombre || ''} ${selectedPropietario?.apellido || ''}`);
rightY = drawKeyValue(320, rightY, 'DNI:', selectedPropietario?.dni);
rightY = drawKeyValue(320, rightY, 'CUIT:', selectedPropietario?.cuit);
rightY = drawKeyValue(320, rightY, 'Email:', selectedPropietario?.email);

cursorY = Math.min(leftY, rightY) - 25;

// Propiedad
cursorY = drawSectionTitle('Datos de la Propiedad', cursorY);
drawSectionBox(cursorY + 20, 80);
cursorY = drawKeyValue(55, cursorY, 'Dirección:', selectedPropiedad?.direccion || selectedPropiedad?.direccionCompleta);
cursorY = drawKeyValue(55, cursorY, 'Localidad:', selectedPropiedad?.localidad);
cursorY = drawKeyValue(55, cursorY, 'Provincia:', selectedPropiedad?.provincia);
cursorY = drawKeyValue(55, cursorY, 'Tipo:', selectedPropiedad?.tipo);
cursorY -= 15;

// Contrato
cursorY = drawSectionTitle('Datos del Contrato', cursorY);
drawSectionBox(cursorY + 20, 140);
cursorY = drawKeyValue(55, cursorY, 'Nombre:', contratoForm?.nombreContrato);
cursorY = drawKeyValue(55, cursorY, 'Monto Alquiler:', `$${contratoForm?.montoAlquiler}`);
cursorY = drawKeyValue(55, cursorY, 'Duración:', `${contratoForm?.duracion} meses`);
cursorY = drawKeyValue(55, cursorY, 'Actualización:', `Cada ${contratoForm?.actualizacion} meses`);
cursorY = drawKeyValue(55, cursorY, 'Índice ajuste:', contratoForm?.indiceAjuste);
cursorY = drawKeyValue(55, cursorY, 'Inicio:', contratoForm?.fecha_inicio);
cursorY = drawKeyValue(55, cursorY, 'Fin:', contratoForm?.fecha_fin);
cursorY = drawKeyValue(55, cursorY, 'Destino:', contratoForm?.destino);
cursorY -= 20;



// Footer
page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 40, color: COLOR_MAIN });
try {
  const logoResp = await fetch(logoInmo);
  const logoBuf = await logoResp.arrayBuffer();
  const logoPng = await infoPdf.embedPng(logoBuf);

  // 🔹 Aumentamos el tamaño y movemos hacia la derecha
  const desiredHeight = 30; // más grande (antes era 26)
  const scale = desiredHeight / logoPng.height;
  const dims = {
    width: logoPng.width * scale,
    height: logoPng.height * scale
  };

  const marginRight = 25; // distancia desde el borde derecho
  const x = PAGE_W - dims.width - marginRight;
  const y = (40 - dims.height) / 2; // centrado verticalmente en el footer

  page.drawImage(logoPng, { x, y, width: dims.width, height: dims.height });
} catch {
  // fallback si no se carga la imagen
  page.drawText('Tuinmo', {
    x: PAGE_W - 90,
    y: 12,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
}

      const infoPdfBytes = await infoPdf.save();

      // 2) Obtener documentos PDF de inquilino y propietario
      const token = localStorage.getItem('token') || '';
      const baseUrl = import.meta.env.VITE_API_URL;

      const getDocsList = async (entity, id) => {
        const res = await fetch(`${baseUrl}/documentos/${entity}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        return list;
      };

      const getPdfBlobFromDoc = async (doc) => {
        try {
          const url = doc?.urlArchivo || doc?.url || doc?.path || doc?.storagePath;
          if (url) {
            const absoluteUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
            const res = await fetch(absoluteUrl, { headers: { Authorization: `Bearer ${token}` } });
            const blob = await res.blob();
            if ((blob?.type || '').includes('pdf') || (doc?.nombreArchivo || '').toLowerCase().endsWith('.pdf')) {
              return blob;
            }
          }
          // base64 fallback
          const b64 = doc?.base64 || doc?.contenidoBase64 || doc?.dataBase64;
          if (b64) {
            const byteChars = atob(b64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            return new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
          }
        } catch (_) {}
        return null;
      };

      const inqList = selectedInquilino?.id ? await getDocsList('inquilino', selectedInquilino.id) : [];
      const propList = selectedPropietario?.id ? await getDocsList('propietario', selectedPropietario.id) : [];
      const docBlobs = [];
      for (const d of [...inqList, ...propList]) {
        const blob = await getPdfBlobFromDoc(d);
        if (blob) docBlobs.push(blob);
      }

      // 3) Unir todo en un único PDF
      const merged = await PDFDocument.create();

      const appendPdfBytes = async (bytes) => {
        const src = await PDFDocument.load(bytes);
        const copiedPages = await merged.copyPages(src, src.getPageIndices());
        copiedPages.forEach((p) => merged.addPage(p));
      };

      await appendPdfBytes(infoPdfBytes);
      for (const blob of docBlobs) {
        const b = await blob.arrayBuffer();
        await appendPdfBytes(b);
      }

      const mergedBytes = await merged.save();
      const finalBlob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caucion_${selectedInquilino?.apellido || 'inquilino'}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error generando PDF para broker', e);
      showError('No se pudo generar el PDF para broker');
    } finally {
      setDownloadingBroker(false);
    }
  };
  
  const handlePrevPage = (type) => {
    setPagination(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  // Form state for contract creation
  const [contratoForm, setContratoForm] = useState({
    nombreContrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_propietario: '',
    id_inquilino: '',
    id_propiedad: '',
    garantesIds: [],
    montoAlquiler: '',
    montoAlquilerLetras: '',
    duracion: '',
    multaXDia: '',
    actualizacion: '',
    indiceAjuste: '',
    destino: '',
    tipoGarantia: '',
    aguaEmpresa: '',
    aguaPorcentaje: 100,
    gasEmpresa: '',
    gasPorcentaje: 100,
    luzEmpresa: '',
    luzPorcentaje: 100,
    municipalEmpresa: '',
    municipalPorcentaje: 100,
    comisionContratoPorc:0,
    comisionMensualPorc:0,
    activo: true,
    nombreUsuario: userState.name
  });

  // Selected entities
  const [selectedPropietario, setSelectedPropietario] = useState(null);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [selectedPropiedad, setSelectedPropiedad] = useState(null);
  const [selectedGarantes, setSelectedGarantes] = useState([]);

  // Fetch data functions
  const fetchPropietarios = async () => {
    setLoading(prev => ({ ...prev, propietarios: true }));
    setError(prev => ({ ...prev, propietarios: null }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/propietario/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setPropietarios(list);
    } catch (err) {
      console.error('Error fetching propietarios:', err);
      setError(prev => ({ ...prev, propietarios: err.message }));
      setPropietarios([]);
    } finally {
      setLoading(prev => ({ ...prev, propietarios: false }));
    }
  };
  const fetchInquilinos = async () => {
    setLoading(prev => ({ ...prev, inquilinos: true }));
    setError(prev => ({ ...prev, inquilinos: null }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/inquilino/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setInquilinos(list);
    } catch (err) {
      console.error('Error fetching inquilinos:', err);
      setError(prev => ({ ...prev, inquilinos: err.message }));
      setInquilinos([]);
    } finally {
      setLoading(prev => ({ ...prev, inquilinos: false }));
    }
  };

  const fetchPropiedades = async () => {
    setLoading(prev => ({ ...prev, propiedades: true }));
    setError(prev => ({ ...prev, propiedades: null }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/propiedad/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setPropiedades(list);
    } catch (err) {
      console.error('Error fetching propiedades:', err);
      setError(prev => ({ ...prev, propiedades: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, propiedades: false }));
    }
  };

  const fetchGarantes = async () => {
    setLoading(prev => ({ ...prev, garantes: true }));
    setError(prev => ({ ...prev, garantes: null }));
    try {
      const token = localStorage.getItem('token');
      // Si existe endpoint /garante/me utilizarlo, de lo contrario mantener compatibilidad
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/garante/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setGarantes(list);
    } catch (err) {
      console.error('Error fetching garantes:', err);
      setError(prev => ({ ...prev, garantes: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, garantes: false }));
    }
  };

  // Load initial data
  useEffect(() => {
    if (userState.name) {
      fetchPropietarios();
      fetchInquilinos();
      fetchPropiedades();
      fetchGarantes();
    }
  }, [userState.name]);

  // Dialog handlers
  const handleClosePropietarioDialog = () => {
    setOpenPropietarioDialog(false);
    fetchPropietarios(); // Refresh the list after creating a new propietario
  };

  const handleCloseInquilinoDialog = () => {
    setOpenInquilinoDialog(false);
    fetchInquilinos(); // Refresh the list after creating a new inquilino
  };

  const handleClosePropiedadDialog = () => {
    setOpenPropiedadDialog(false);
    fetchPropiedades(); // Refresh the list after creating a new propiedad
  };

  const handleCloseGaranteDialog = () => {
    setOpenGaranteDialog(false);
    fetchGarantes(); // Refresh the list after creating a new garante
  };

  // Step handlers
  const handleNext = () => {
    // Validation before proceeding to next step
    if (activeStep === 0 && !selectedPropietario) {
      showWarning('Debe seleccionar un propietario para continuar');
      return;
    }
    
    if (activeStep === 1 && !selectedInquilino) {
      showWarning('Debe seleccionar un inquilino para continuar');
      return;
    }
    
    if (activeStep === 2 && !selectedPropiedad) {
      showWarning('Debe seleccionar una propiedad para continuar');
      return;
    }
    
    if (activeStep === 3 && selectedGarantes.length === 0) {
      // Permitir continuar si es Seguro de caución (no requiere garantes)
      if ((contratoForm.tipoGarantia || '') !== 'SEGURO_CAUCION') {
        showWarning('Debe seleccionar al menos un garante para continuar');
        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedPropietario(null);
    setSelectedInquilino(null);
    setSelectedPropiedad(null);
    setSelectedGarantes([]);
    setContratoForm({
      nombreContrato: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_propietario: '',
      id_inquilino: '',
      id_propiedad: '',
      garantesIds: [],
      montoAlquiler: '',
      montoAlquilerLetras: '',
      duracion: '',
      multaXDia: '',
      actualizacion: '',
      indiceAjuste: '',
      destino: '',
      tipoGarantia: '',
      aguaEmpresa: '',
      aguaPorcentaje: 100,
      gasEmpresa: '',
      gasPorcentaje: 100,
      luzEmpresa: '',
      luzPorcentaje: 100,
      municipalEmpresa: '',
      municipalPorcentaje: 100,
      activo: true,
      nombreUsuario: userState.name
    });
  };

  // Selection handlers
  const handleSelectPropietario = (propietario) => {
    setSelectedPropietario(propietario);
    setContratoForm(prev => ({
      ...prev,
      id_propietario: propietario.id
    }));
  };

  const handleSelectInquilino = (inquilino) => {
    setSelectedInquilino(inquilino);
    setContratoForm(prev => ({
      ...prev,
      id_inquilino: inquilino.id
    }));
  };

  const handleSelectPropiedad = (propiedad) => {
    setSelectedPropiedad(propiedad);
    setContratoForm(prev => ({
      ...prev,
      id_propiedad: propiedad.id
    }));
  };

  const handleSelectGarante = (garante) => {
    const isSelected = selectedGarantes.some(g => g.id === garante.id);
    
    if (isSelected) {
      // Remove garante if already selected
      setSelectedGarantes(prev => prev.filter(g => g.id !== garante.id));
      setContratoForm(prev => ({
        ...prev,
        garantesIds: prev.garantesIds.filter(id => id !== garante.id)
      }));
    } else {
      // Add garante if not already selected
      setSelectedGarantes(prev => [...prev, garante]);
      setContratoForm(prev => ({
        ...prev,
        garantesIds: [...prev.garantesIds, garante.id]
      }));
    }
  };

  // Función para formatear números con separadores de miles
  const formatNumber = (value) => {
    if (!value) return '';
    // Remover caracteres no numéricos excepto puntos y comas
    const numericValue = value.toString().replace(/[^\d]/g, '');
    // Formatear con separadores de miles
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para obtener el valor numérico sin formato
  const getNumericValue = (formattedValue) => {
    return formattedValue.toString().replace(/\./g, '');
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Campos que necesitan formateo de números
    const moneyFields = ['montoAlquiler', 'multaXDia'];
    
    if (moneyFields.includes(name)) {
      // Para campos de dinero, formatear con separadores de miles
      const numericValue = getNumericValue(value);
      const formattedValue = formatNumber(numericValue);
      
      setContratoForm(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setContratoForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Loading state for submit
  const [submitting, setSubmitting] = useState(false);
  // Loading state for broker PDF generation
  const [downloadingBroker, setDownloadingBroker] = useState(false);
const clearContractsCache = async () => {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  if (!registration.active && !navigator.serviceWorker.controller) return;

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      // event.data debería ser { ok: true } desde el SW
      resolve(event.data);
    };

    // Usamos el controller actual (el SW que está manejando la página)
    (navigator.serviceWorker.controller || registration.active).postMessage(
      { type: "CLEAR_CONTRACTS_CACHE" },
      [channel.port2]
    );
  });
};
  // Submit handler
 // Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    // Validar campos requeridos
    const requiredFields = [
      'nombreContrato', 
      'fecha_inicio', 
      'fecha_fin', 
      'montoAlquiler',
      'montoAlquilerLetras', 
      'duracion',
      'id_propietario',
      'id_propiedad',
      'id_inquilino'
    ];
    
    const missingFields = requiredFields.filter(field => !contratoForm[field]);
    
    if (missingFields.length > 0) {
      showWarning(`Por favor complete los siguientes campos: ${missingFields.join(', ')}`);
      setSubmitting(false);
      return;
    }

    // Sanitizar datos antes de enviar
    const formData = { ...contratoForm };

    formData.nombreUsuario = userState.name;

    // Valores por defecto
    const defaultValues = {
      activo: true,
      destino: formData.destino || "Habitacional como vivienda única",
      indiceAjuste: formData.indiceAjuste || "ipc"
    };
    Object.entries(defaultValues).forEach(([key, value]) => {
      if (!formData[key]) formData[key] = value;
    });

  formData.fecha_inicio = contratoForm.fecha_inicio;
  formData.fecha_fin = contratoForm.fecha_fin;

    // Campos numéricos - convertir valores formateados a números
    ['actualizacion', 'duracion'].forEach(field => {
      formData[field] = formData[field] ? Math.abs(parseFloat(formData[field])) || 0 : 0;
    });
    
    // Campos de dinero - remover formato antes de convertir
    ['multaXDia', 'montoAlquiler'].forEach(field => {
      const numericValue = getNumericValue(formData[field] || '');
      formData[field] = numericValue ? Math.abs(parseFloat(numericValue)) || 0 : 0;
    });

    // Porcentajes
    ['aguaPorcentaje', 'gasPorcentaje', 'luzPorcentaje', 'municipalPorcentaje'].forEach(field => {
      const value = parseFloat(formData[field]);
      formData[field] = isNaN(value) ? "" : String(Math.abs(value));
    });

    // IDs
    ['id_propietario', 'id_propiedad', 'id_inquilino'].forEach(field => {
      if (formData[field]) formData[field] = parseInt(formData[field], 10);
    });

    // Strings vacíos
    ['aguaEmpresa', 'gasEmpresa', 'luzEmpresa', 'municipalEmpresa', 'nombreUsuario'].forEach(field => {
      formData[field] = formData[field] || '';
    });

    // Garantes
    formData.garantesIds = Array.isArray(formData.garantesIds)
      ? formData.garantesIds.map(id => parseInt(id, 10))
      : [];

    // Crear contrato
    const response = await contratoApi.crearContrato(formData);

    // Auto-descarga PDF para broker si corresponde antes de navegar
    if ((contratoForm.tipoGarantia || '') === 'SEGURO_CAUCION') {
      downloadBrokerPdf();
    }

    await showSuccess("Contrato creado exitosamente ✅");

     try {
      await clearContractsCache();
    } catch (err) {
      console.warn("No se pudo limpiar el cache de contratos:", err);
    }
    
    navigate("/contratos");

  } catch (error) {
    console.error("❌ Error creando contrato:", error);

    let errorMessage = "Ocurrió un error al crear el contrato.";

    if (error.response) {
      const { status, data } = error.response;

      if (typeof data === "string") {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      }

      if (status === 500) {
        if (String(errorMessage).toLowerCase().includes("rollback")) {
          errorMessage = "Ocurrió un error interno al crear el contrato. Intenta nuevamente.";
        } else {
          errorMessage = "El servidor encontró un error interno. Vuelve a intentarlo más tarde.";
        }
      }

      if (status === 403 || status === 409) {
        errorMessage = errorMessage || "Haz alcanzado el límite de contratos de tu plan actual.";
      }

      if (status === 400) {
        errorMessage = errorMessage || "Datos inválidos. Revisa los campos del contrato.";
      }
    } else if (error.request) {
      errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    } else {
      errorMessage = error.message || "Error inesperado en el cliente.";
    }

    showError(errorMessage);

  } finally {
    setSubmitting(false);
  }
};


  // Filtered data
  const filteredPropietarios = propietarios.filter(p => 
    p.nombre.toLowerCase().includes(search.propietario.toLowerCase()) ||
    p.apellido.toLowerCase().includes(search.propietario.toLowerCase()) ||
    p.email.toLowerCase().includes(search.propietario.toLowerCase())
  );

  const filteredInquilinos = Array.isArray(inquilinos)
  ? inquilinos.filter(i =>
      i.nombre.toLowerCase().includes(search.inquilino.toLowerCase()) ||
      i.apellido.toLowerCase().includes(search.inquilino.toLowerCase()) ||
      i.email.toLowerCase().includes(search.inquilino.toLowerCase())
    )
  : [];


  const filteredPropiedades = propiedades.filter(p => 
    p.direccion.toLowerCase().includes(search.propiedad.toLowerCase()) ||
    p.tipo.toLowerCase().includes(search.propiedad.toLowerCase()) ||
    p.barrio.toLowerCase().includes(search.propiedad.toLowerCase())
  );

  const filteredGarantes = garantes.filter(g => {
    const matchesText = (
      g.nombre.toLowerCase().includes(search.garante.toLowerCase()) ||
      g.apellido.toLowerCase().includes(search.garante.toLowerCase()) ||
      g.email.toLowerCase().includes(search.garante.toLowerCase())
    );
    const selectedTipo = (contratoForm.tipoGarantia || '').toLowerCase();
    if (selectedTipo === 'SEGURO_CAUCION') {
      // No mostrar garantes cuando es Seguro de caución
      return false;
    }
    const matchesTipo = !selectedTipo || (String(g.tipoGarantia || '').toLowerCase() === selectedTipo);
    return matchesText && matchesTipo;
  });
  // Paginación
  const paginatedPropietarios = filteredPropietarios.slice(pagination.propietarios * ITEMS_PER_PAGE, (pagination.propietarios + 1) * ITEMS_PER_PAGE);
  const paginatedInquilinos = filteredInquilinos.slice(pagination.inquilinos * ITEMS_PER_PAGE, (pagination.inquilinos + 1) * ITEMS_PER_PAGE);
  const paginatedPropiedades = filteredPropiedades.slice(pagination.propiedades * ITEMS_PER_PAGE, (pagination.propiedades + 1) * ITEMS_PER_PAGE);
  const paginatedGarantes = filteredGarantes.slice(pagination.garantes * ITEMS_PER_PAGE, (pagination.garantes + 1) * ITEMS_PER_PAGE);
  // Destino options
  const destinos = [
    { value: 'Habitacional como vivienda unica', label: 'Habitacional' },
    { value: 'Comercial', label: 'Comercial' }
  ];

  return (
    <Box sx={{ 
      width: '100vw',
      minHeight: '100vh',
      pt: { xs: 2, sm: 3, md: 2 },
      pb: { xs: 14, sm: 12 },
      pl: { xs: 2, sm: 8, md: '16rem' },
      pr: { xs: 2, sm: 4, md: 3 },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      boxSizing: 'border-box',
      // Mantener comportamiento fijo/scroll sólo en mobile/tablet
      position: { xs: 'fixed', md: 'static' },
      top: { xs: 0, md: 'auto' },
      left: { xs: 0, md: 'auto' },
      right: { xs: 0, md: 'auto' },
      bottom: { xs: 0, md: 'auto' },
      overflowY: { xs: 'auto', md: 'visible' },
      overflowX: 'hidden',
    }}>
      <CreateContractTour />
      <Box sx={{ mt: { xs: '4rem', sm: 0 }, maxWidth: 900, width: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        gap: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} data-tour="crearcontrato-title">
              <DescriptionIcon sx={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: { xs: 20, sm: 24 } }} />
              Crear Nuevo Contrato
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Completa los pasos para crear un nuevo contrato
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          overflow: 'hidden',
        }}
      >
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{ 
            py: 2.5,
            px: 1,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.65rem', sm: '0.8rem' },
              fontWeight: 500,
              mt: '6px !important',
            },
            '& .MuiStepLabel-label.Mui-active': {
              fontWeight: 700,
              color: isDark ? '#a78bfa' : '#7c3aed',
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: '#22c55e',
            },
            '& .MuiStepIcon-root': {
              color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              fontSize: { xs: 24, sm: 28 },
              '&.Mui-active': {
                color: '#8b5cf6',
              },
              '&.Mui-completed': {
                color: '#22c55e',
              }
            },
            '& .MuiStepConnector-line': {
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          }}
          data-tour="crearcontrato-stepper"
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 },
          mb: 3, 
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        {activeStep === steps.length ? (
          // Final step - show summary and submit button
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DescriptionIcon sx={{ fontSize: 18, color: '#22c55e' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Resumen del Contrato
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Revisa la información antes de crear
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2, 
              mb: 3 
            }}>
              {[
                { label: 'Contrato', value: contratoForm.nombreContrato },
                { label: 'Propietario', value: `${selectedPropietario?.nombre || ''} ${selectedPropietario?.apellido || ''}` },
                { label: 'Inquilino', value: `${selectedInquilino?.nombre || ''} ${selectedInquilino?.apellido || ''}` },
                { label: 'Propiedad', value: selectedPropiedad?.direccion },
                { label: 'Alquiler', value: `$${contratoForm.montoAlquiler}` },
                { label: 'Duración', value: `${contratoForm.duracion} meses` },
                { label: 'Inicio', value: contratoForm.fecha_inicio },
                { label: 'Fin', value: contratoForm.fecha_fin },
              ].map((item, i) => (
                <Box key={i} sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.value || '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'stretch', sm: 'flex-end' }, 
              flexWrap: 'wrap',
              gap: 1.5,
              mb: { xs: 8, md: 0 },
            }}>
              <Button 
                onClick={handleReset} 
                sx={{ 
                  borderRadius: 2.5,
                  color: 'text.secondary',
                  flex: { xs: '1 1 100%', sm: '0 0 auto' },
                }}
              >
                Comenzar de Nuevo
              </Button>
              {(contratoForm.tipoGarantia || '') === 'SEGURO_CAUCION' && (
                <Button
                  variant="outlined"
                  onClick={downloadBrokerPdf}
                  disabled={downloadingBroker}
                  sx={{
                    borderRadius: 2.5,
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: 'text.primary',
                    flex: { xs: '1 1 100%', sm: '0 0 auto' },
                  }}
                >
                  {downloadingBroker ? (
                    <>
                      <CircularProgress size={18} sx={{ mr: 1 }} /> Generando PDF...
                    </>
                  ) : (
                    'Descargar PDF para broker'
                  )}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                data-tour="crearcontrato-submit"
                sx={{
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: 'none',
                  fontWeight: 600,
                  minHeight: 44,
                  flex: { xs: '1 1 100%', sm: '0 0 auto' },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                  },
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} />
                    Creando...
                  </>
                ) : (
                  'Crear Contrato'
                )}
              </Button>
            </Box>
          </Box>
        ) : (
          // Steps 0-4
          <Box sx={{ width: "100%"}}>
            {activeStep === 0 && (
              // Step 1: Select Propietario
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Seleccionar Propietario</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenPropietarioDialog(true)}
                    data-tour="crearcontrato-new-propietario"
                    sx={{
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
                    }}
                  >
                    Nuevo
                  </Button>
                </Box>
                
                <TextField
                  fullWidth size="small"
                  placeholder="Buscar propietario..."
                  value={search.propietario}
                  onChange={(e) => setSearch({ ...search, propietario: e.target.value })}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                      '& fieldset': { border: 'none' },
                    }
                  }}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                />
                  
                {loading.propietarios ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#8b5cf6' }} />
                  </Box>
                ) : error.propietarios ? (
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', border: `1px solid ${isDark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.2)'}`, bgcolor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)' }}>
                    <Typography variant="body2" color="error">Error: {error.propietarios}</Typography>
                  </Paper>
                ) : paginatedPropietarios.length === 0 ? (
                  <Paper elevation={0} sx={{ textAlign: 'center', py: 4, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                    <Typography variant="body2" color="text.secondary">No se encontraron propietarios</Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                    {paginatedPropietarios.map((propietario) => {
                      const isSelected = selectedPropietario?.id === propietario.id;
                      return (
                        <Paper 
                          key={propietario.id}
                          elevation={0}
                          onClick={() => handleSelectPropietario(propietario)}
                          sx={{
                            p: 2, cursor: 'pointer', borderRadius: 2.5, transition: 'all 0.2s ease',
                            border: `2px solid ${isSelected ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                            bgcolor: isSelected ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)') : 'transparent',
                            '&:hover': { borderColor: isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)' },
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {propietario.nombre} {propietario.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{propietario.email}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{propietario.telefono || '—'}</Typography>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
                  <IconButton size="small" disabled={pagination.propietarios === 0} onClick={() => handlePrevPage('propietarios')}>
                    <NavigateBeforeIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {pagination.propietarios + 1} / {Math.ceil(filteredPropietarios.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton size="small" disabled={filteredPropietarios.length <= (pagination.propietarios + 1) * ITEMS_PER_PAGE} onClick={() => handleNextPage('propietarios')}>
                    <NavigateNextIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              // Step 2: Select Inquilino
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Seleccionar Inquilino</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenInquilinoDialog(true)}
                    sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', fontWeight: 600, boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' } }}>
                    Nuevo
                  </Button>
                </Box>
                <TextField fullWidth size="small" placeholder="Buscar inquilino..." value={search.inquilino}
                  onChange={(e) => setSearch({ ...search, inquilino: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, '& fieldset': { border: 'none' } } }}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                />
                {loading.inquilinos ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#8b5cf6' }} /></Box>
                ) : error.inquilinos ? (
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', border: `1px solid ${isDark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.2)'}`, bgcolor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)' }}>
                    <Typography variant="body2" color="error">Error: {error.inquilinos}</Typography>
                  </Paper>
                ) : paginatedInquilinos.length === 0 ? (
                  <Paper elevation={0} sx={{ textAlign: 'center', py: 4, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                    <Typography variant="body2" color="text.secondary">No se encontraron inquilinos</Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                    {paginatedInquilinos.map((inquilino) => {
                      const isSelected = selectedInquilino?.id === inquilino.id;
                      return (
                        <Paper key={inquilino.id} elevation={0} onClick={() => handleSelectInquilino(inquilino)}
                          sx={{ p: 2, cursor: 'pointer', borderRadius: 2.5, transition: 'all 0.2s ease',
                            border: `2px solid ${isSelected ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                            bgcolor: isSelected ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)') : 'transparent',
                            '&:hover': { borderColor: isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)' },
                          }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{inquilino.nombre} {inquilino.apellido}</Typography>
                          <Typography variant="caption" color="text.secondary">{inquilino.email}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{inquilino.telefono || '—'}</Typography>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
                  <IconButton size="small" disabled={pagination.inquilinos === 0} onClick={() => handlePrevPage('inquilinos')}><NavigateBeforeIcon fontSize="small" /></IconButton>
                  <Typography variant="caption" color="text.secondary">{pagination.inquilinos + 1} / {Math.ceil(filteredInquilinos.length / ITEMS_PER_PAGE) || 1}</Typography>
                  <IconButton size="small" disabled={filteredInquilinos.length <= (pagination.inquilinos + 1) * ITEMS_PER_PAGE} onClick={() => handleNextPage('inquilinos')}><NavigateNextIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              // Step 3: Select Property
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Seleccionar Propiedad</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenPropiedadDialog(true)}
                    sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', fontWeight: 600, boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' } }}>
                    Nueva
                  </Button>
                </Box>
                <TextField fullWidth size="small" placeholder="Buscar propiedad..." value={search.propiedad}
                  onChange={(e) => setSearch({ ...search, propiedad: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, '& fieldset': { border: 'none' } } }}
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                />
                {loading.propiedades ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#8b5cf6' }} /></Box>
                ) : error.propiedades ? (
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', border: `1px solid ${isDark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.2)'}`, bgcolor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)' }}>
                    <Typography variant="body2" color="error">Error: {error.propiedades}</Typography>
                  </Paper>
                ) : paginatedPropiedades.length === 0 ? (
                  <Paper elevation={0} sx={{ textAlign: 'center', py: 4, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                    <Typography variant="body2" color="text.secondary">No se encontraron propiedades</Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                    {paginatedPropiedades.map((propiedad) => {
                      const isSelected = selectedPropiedad?.id === propiedad.id;
                      const isAvailable = propiedad.disponibilidad === true;
                      return (
                        <Paper key={propiedad.id} elevation={0} onClick={() => handleSelectPropiedad(propiedad)}
                          sx={{ cursor: 'pointer', borderRadius: 2.5, overflow: 'hidden', transition: 'all 0.2s ease',
                            border: `2px solid ${isSelected ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                            bgcolor: isSelected ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)') : 'transparent',
                            '&:hover': { borderColor: isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)' },
                          }}>
                          {/* Image */}
                          <Box sx={{ height: 80, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {propiedad.imagenes && propiedad.imagenes.length > 0 ? (
                              <img src={propiedad.imagenes[0].imageUrl || propiedad.imagenes[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <Box sx={{ display: propiedad.imagenes && propiedad.imagenes.length > 0 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                              <HomeIcon sx={{ fontSize: 32, opacity: 0.4 }} />
                            </Box>
                          </Box>
                          <Box sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Chip label={isAvailable ? 'Disponible' : 'No disponible'} size="small"
                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: isAvailable ? (isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)') : (isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)'), color: isAvailable ? '#22c55e' : '#ef4444' }} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>{propiedad.direccion}</Typography>
                            <Typography variant="caption" color="text.secondary">{propiedad.localidad || '—'}</Typography>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
                  <IconButton size="small" disabled={pagination.propiedades === 0} onClick={() => handlePrevPage('propiedades')}><NavigateBeforeIcon fontSize="small" /></IconButton>
                  <Typography variant="caption" color="text.secondary">{pagination.propiedades + 1} / {Math.ceil(filteredPropiedades.length / ITEMS_PER_PAGE) || 1}</Typography>
                  <IconButton size="small" disabled={filteredPropiedades.length <= (pagination.propiedades + 1) * ITEMS_PER_PAGE} onClick={() => handleNextPage('propiedades')}><NavigateNextIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 3 && (
              // Step 4: Select Garantes
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Seleccionar Garantes</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="tipo-garantia-label">Tipo de Garantía</InputLabel>
                  <Select labelId="tipo-garantia-label" label="Tipo de Garantía" name="tipoGarantia" value={contratoForm.tipoGarantia}
                    onChange={(e) => { setContratoForm(prev => ({ ...prev, tipoGarantia: e.target.value })); setPagination(prev => ({ ...prev, garantes: 0 })); }}
                    sx={{ borderRadius: 2.5 }}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Recibo de Sueldo">Recibo de Sueldo</MenuItem>
                    <MenuItem value="Garantía Propietaria">Garantía Propietaria</MenuItem>
                    <MenuItem value="SEGURO_CAUCION">Seguro de caución</MenuItem>
                  </Select>
                </FormControl>
                {(contratoForm.tipoGarantia || '') === 'SEGURO_CAUCION' ? (
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, mb: 2, border: `1px dashed ${isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)'}`, bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Seguro de caución seleccionado</Typography>
                    <Typography variant="caption" color="text.secondary">No es necesario cargar garantes. Al finalizar, descarga el PDF para tu broker.</Typography>
                  </Paper>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">Selecciona uno o más garantes</Typography>
                      <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenGaranteDialog(true)}
                        sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', fontWeight: 600, boxShadow: 'none', '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' } }}>
                        Nuevo
                      </Button>
                    </Box>
                    <TextField fullWidth size="small" placeholder="Buscar garante..." value={search.garante}
                      onChange={(e) => setSearch({ ...search, garante: e.target.value })}
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, '& fieldset': { border: 'none' } } }}
                      InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                    {loading.garantes ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#8b5cf6' }} /></Box>
                    ) : error.garantes ? (
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', border: `1px solid ${isDark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.2)'}`, bgcolor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)' }}>
                        <Typography variant="body2" color="error">Error: {error.garantes}</Typography>
                      </Paper>
                    ) : paginatedGarantes.length === 0 ? (
                      <Paper elevation={0} sx={{ textAlign: 'center', py: 4, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                        <Typography variant="body2" color="text.secondary">No se encontraron garantes</Typography>
                      </Paper>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        {paginatedGarantes.map((garante) => {
                          const isSelected = selectedGarantes.some(g => g.id === garante.id);
                          return (
                            <Paper key={garante.id} elevation={0} onClick={() => handleSelectGarante(garante)}
                              sx={{ p: 2, cursor: 'pointer', borderRadius: 2.5, transition: 'all 0.2s ease',
                                border: `2px solid ${isSelected ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                                bgcolor: isSelected ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)') : 'transparent',
                                '&:hover': { borderColor: isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)' },
                              }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{garante.nombre} {garante.apellido}</Typography>
                              <Typography variant="caption" color="text.secondary">{garante.email}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{garante.telefono || '—'}</Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                    )}
                  </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
                  <IconButton size="small" disabled={pagination.garantes === 0} onClick={() => handlePrevPage('garantes')}><NavigateBeforeIcon fontSize="small" /></IconButton>
                  <Typography variant="caption" color="text.secondary">{pagination.garantes + 1} / {Math.ceil(filteredGarantes.length / ITEMS_PER_PAGE) || 1}</Typography>
                  <IconButton size="small" disabled={filteredGarantes.length <= (pagination.garantes + 1) * ITEMS_PER_PAGE} onClick={() => handleNextPage('garantes')}><NavigateNextIcon fontSize="small" /></IconButton>
                </Box>
                {selectedGarantes.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Seleccionados ({selectedGarantes.length})</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedGarantes.map(garante => (
                        <Chip key={garante.id} label={`${garante.nombre} ${garante.apellido}`} onDelete={() => handleSelectGarante(garante)} size="small"
                          sx={{ bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)', color: isDark ? '#a78bfa' : '#7c3aed', '& .MuiChip-deleteIcon': { color: isDark ? '#a78bfa' : '#7c3aed' } }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 4 && (
              // Step 5: Contract Details
              <Box sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Detalles del Contrato</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField size="small" label="Nombre del Contrato" name="nombreContrato" value={contratoForm.nombreContrato} onChange={handleFormChange} fullWidth required
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Monto de Alquiler" name="montoAlquiler" type="text" value={contratoForm.montoAlquiler} onChange={handleFormChange} fullWidth required placeholder="Ej: 150.000"
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Monto en Letras" name="montoAlquilerLetras" value={contratoForm.montoAlquilerLetras} onChange={handleFormChange} fullWidth required
                    sx={{ gridColumn: { sm: '1 / -1' }, '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Duración (meses)" name="duracion" type="number" value={contratoForm.duracion} onChange={handleFormChange} fullWidth required
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Multa por Día" name="multaXDia" type="text" value={contratoForm.multaXDia} onChange={handleFormChange} fullWidth required placeholder="Ej: 5.000"
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Actualizar cada (meses)" name="actualizacion" type="number" value={contratoForm.actualizacion} onChange={handleFormChange} fullWidth required
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Fecha de Inicio" name="fecha_inicio" type="date" value={contratoForm.fecha_inicio} onChange={handleFormChange} fullWidth required InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Fecha de Fin" name="fecha_fin" type="date" value={contratoForm.fecha_fin} onChange={handleFormChange} fullWidth required InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Índice de Ajuste" name="indiceAjuste" value={contratoForm.indiceAjuste} onChange={handleFormChange} fullWidth required
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <FormControl fullWidth size="small">
                    <InputLabel id="destino-label">Destino</InputLabel>
                    <Select labelId="destino-label" name="destino" value={contratoForm.destino} onChange={handleFormChange} label="Destino"
                      sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                      {destinos.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Comisión Contrato (%)" name="comisionContratoPorc" type="number" value={contratoForm.comisionContratoPorc} onChange={handleFormChange} fullWidth inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                  <TextField size="small" label="Comisión Mensual (%)" name="comisionMensualPorc" type="number" value={contratoForm.comisionMensualPorc} onChange={handleFormChange} fullWidth inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                </Box>

                {/* Servicios */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Servicios</Typography>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                    {[
                      { icon: <OpacityIcon />, color: '#3b82f6', nameEmpresa: 'aguaEmpresa', namePorcentaje: 'aguaPorcentaje', labelEmpresa: 'Empresa de Agua', valEmpresa: contratoForm.aguaEmpresa, valPorc: contratoForm.aguaPorcentaje },
                      { icon: <LocalFireDepartmentIcon />, color: '#f97316', nameEmpresa: 'gasEmpresa', namePorcentaje: 'gasPorcentaje', labelEmpresa: 'Empresa de Gas', valEmpresa: contratoForm.gasEmpresa, valPorc: contratoForm.gasPorcentaje },
                      { icon: <BoltIcon />, color: '#eab308', nameEmpresa: 'luzEmpresa', namePorcentaje: 'luzPorcentaje', labelEmpresa: 'Empresa de Luz', valEmpresa: contratoForm.luzEmpresa, valPorc: contratoForm.luzPorcentaje },
                      { icon: <AccountBalanceIcon />, color: '#22c55e', nameEmpresa: 'municipalEmpresa', namePorcentaje: 'municipalPorcentaje', labelEmpresa: 'Empresa Municipal', valEmpresa: contratoForm.municipalEmpresa, valPorc: contratoForm.municipalPorcentaje },
                    ].map((svc, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: i < 3 ? 1.5 : 0, p: 1, borderRadius: 2, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}>
                        {React.cloneElement(svc.icon, { sx: { color: svc.color, fontSize: 20 } })}
                        <TextField size="small" name={svc.nameEmpresa} label={svc.labelEmpresa} fullWidth value={svc.valEmpresa || ''} onChange={handleFormChange}
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }} />
                        <TextField size="small" name={svc.namePorcentaje} label="%" type="number" value={svc.valPorc || ''} onChange={handleFormChange}
                          sx={{ width: 100, minWidth: 80, '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                      </Box>
                    ))}
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Step navigation buttons */}
      {activeStep !== steps.length && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          gap: 1.5,
          mb: { xs: 8, md: 2 },
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              borderRadius: 2.5,
              color: 'text.secondary',
              flex: { xs: 1, sm: 'none' },
            }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            data-tour="crearcontrato-next"
            sx={{
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              boxShadow: 'none',
              fontWeight: 600,
              minHeight: 44,
              flex: { xs: 1, sm: 'none' },
              minWidth: { sm: 140 },
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              },
            }}
          >
            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      )}
      </Box>

      {/* Dialog Modals */}
      <Dialog open={openPropietarioDialog} TransitionComponent={Transition} keepMounted onClose={handleClosePropietarioDialog} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Crear Nuevo Propietario
          <IconButton size="small" onClick={handleClosePropietarioDialog}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <PropietarioForm onSuccess={handleClosePropietarioDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={openInquilinoDialog} TransitionComponent={Transition} keepMounted onClose={handleCloseInquilinoDialog} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Crear Nuevo Inquilino
          <IconButton size="small" onClick={handleCloseInquilinoDialog}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <InquilinoForm onSuccess={handleCloseInquilinoDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={openPropiedadDialog} TransitionComponent={Transition} keepMounted onClose={handleClosePropiedadDialog} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Crear Nueva Propiedad
          <IconButton size="small" onClick={handleClosePropiedadDialog}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <PropiedadesForm onSuccess={handleClosePropiedadDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={openGaranteDialog} TransitionComponent={Transition} keepMounted onClose={handleCloseGaranteDialog} fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Crear Nuevo Garante
          <IconButton size="small" onClick={handleCloseGaranteDialog}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <GaranteForm onSuccess={handleCloseGaranteDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CrearContratoPage;
