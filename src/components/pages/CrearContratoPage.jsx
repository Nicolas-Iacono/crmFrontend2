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
  Card,
  CardContent,
  Grid2,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Slide,
  Divider,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
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
      pt: 7, 
      width: { xs: '100%', md: '84vw' },
      minHeight: '100vh',
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: 'center', md: 'flex-start' },
      justifyContent: "flex-start",
      pb: { xs: 12, md: 3 },
      // Mantener comportamiento fijo/scroll sólo en mobile/tablet
      position: { xs: 'fixed', md: 'static' },
      top: { xs: 0, md: 'auto' },
      left: { xs: 0, md: 'auto' },
      right: { xs: 0, md: 'auto' },
      bottom: { xs: 0, md: 'auto' },
      overflowY: { xs: 'auto', md: 'visible' },
      overflowX: 'hidden',
      mb: 7,
      marginLeft: { md: '15rem' }
    }}>
      <CreateContractTour />
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        pb: 2,
        marginTop:{xs:"0",md:"2rem"},
        width:"100%",
        pl:3,
      }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }} data-tour="crearcontrato-title">
          Crear Nuevo Contrato
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ 
          mb: 4,
          width: "100%",
          py: 2,
          px: 1,
          
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '& .MuiStepIcon-root': {
            color: theme.palette.mode === 'dark' ? " #2E2C97" : ' #2E2C97',
            '&.Mui-active': {
              color: theme.palette.mode === 'dark' ? " #C22961" : ' #C22961',
            },
            '&.Mui-completed': {
              color: theme.palette.success.main,
            }
          }
        }}
        data-tour="crearcontrato-stepper"
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 },
          width:"90%", 

          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
        }}
      >
        {activeStep === steps.length ? (
          // Final step - show summary and submit button
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Todos los pasos completados
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              El contrato está listo para ser creado. Revise la información antes de continuar.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Resumen del Contrato
              </Typography>
              
              <Grid2 sx={{ gap: 2 }}>
                <Grid2 item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Nombre del Contrato:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.nombreContrato}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Propietario:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedPropietario?.nombre} {selectedPropietario?.apellido}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Inquilino:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedInquilino?.nombre} {selectedInquilino?.apellido}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Propiedad:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedPropiedad?.direccion}</Typography>
                </Grid2>
                
                <Grid2 item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Monto de Alquiler:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>${contratoForm.montoAlquiler}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Duración:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.duracion} meses</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Fecha Inicio:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.fecha_inicio}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Fecha Fin:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.fecha_fin}</Typography>
                </Grid2>
              </Grid2>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'center', md: 'flex-end' }, 
              flexDirection: { xs: 'row', sm: 'row' },
              mt: 2, 
              gap: 2,
              marginBottom: { xs: 15, md: 0 },
              width: '100%',
              px: { xs: 2, md: 0 }
            }}>
              <Button 
                onClick={handleReset} 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit',
                  width: { xs: '100%', sm: 'auto' }
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
                    width: { xs: '100%', sm: 'auto' }
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
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                  color: theme.palette.mode === 'dark' ? 'white' : 'white',
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: { xs: '48px', md: 'auto' },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
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
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 1: Seleccionar Propietario</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar propietario..."
                      variant="standard"
                      value={search.propietario}
                      onChange={(e) => setSearch({ ...search, propietario: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenPropietarioDialog(true)}
                      data-tour="crearcontrato-new-propietario"
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nuevo Propietario
                    </Button>
                  </Box>
                  
                  {loading.propietarios ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.propietarios ? (
                    <Box sx={{ 
                      bgcolor: ' #ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.propietarios}</Typography>
                    </Box>
                  ) : paginatedPropietarios.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron propietarios</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedPropietarios.map((propietario) => (
                        <Card 
                          key={propietario.id}
                          elevation={selectedPropietario?.id === propietario.id ? 3 : 1}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderLeft: selectedPropietario?.id === propietario.id ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            bgcolor: selectedPropietario?.id === propietario.id ? '#e8eaf6' : 'white'
                          }}
                          onClick={() => handleSelectPropietario(propietario)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                              {propietario.nombre} {propietario.apellido}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Email: {propietario.email}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Teléfono: {propietario.telefono || 'No disponible'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.propietarios === 0}
                    onClick={() => handlePrevPage('propietarios')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.propietarios + 1} / {Math.ceil(filteredPropietarios.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredPropietarios.length <= (pagination.propietarios + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('propietarios')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              // Step 2: Select Inquilino
              <Box sx={{ width: "100%"}}>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 2: Seleccionar Inquilino</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar inquilino..."
                      variant="standard"
                      value={search.inquilino}
                      onChange={(e) => setSearch({ ...search, inquilino: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenInquilinoDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nuevo Inquilino
                    </Button>
                  </Box>
                  
                  {loading.inquilinos ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.inquilinos ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' ,
                    }}>
                      <Typography>Error: {error.inquilinos}</Typography>
                    </Box>
                  ) : paginatedInquilinos.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron inquilinos</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      width: "100%",
                      gap: 2
                    }}>
                      {paginatedInquilinos.map((inquilino) => (
                        <Card 
                          key={inquilino.id}
                          elevation={selectedInquilino?.id === inquilino.id ? 3 : 1}
                          sx={{
                            width: "100%",
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderLeft: selectedInquilino?.id === inquilino.id ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            bgcolor: selectedInquilino?.id === inquilino.id ? '#e8eaf6' : 'white'
                          }}
                          onClick={() => handleSelectInquilino(inquilino)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                              {inquilino.nombre} {inquilino.apellido}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Email: {inquilino.email}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Teléfono: {inquilino.telefono || 'No disponible'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.inquilinos === 0}
                    onClick={() => handlePrevPage('inquilinos')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.inquilinos + 1} / {Math.ceil(filteredInquilinos.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredInquilinos.length <= (pagination.inquilinos + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('inquilinos')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              // Step 3: Select Property
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 3: Seleccionar Propiedad</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar propiedad..."
                      variant="standard"
                      value={search.propiedad}
                      onChange={(e) => setSearch({ ...search, propiedad: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenPropiedadDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nueva Propiedad
                    </Button>
                  </Box>
                  
                  {loading.propiedades ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.propiedades ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.propiedades}</Typography>
                    </Box>
                  ) : paginatedPropiedades.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron propiedades</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedPropiedades.map((propiedad) => {
                        // Determinar color según estado
                        const getEstadoColor = (disponibilidad) => {
                          switch(disponibilidad) {
                            case false:
                          
                              return {
                                bg: 'rgba(244, 67, 54, 0.1)',
                                border: '#f44336',
                                text: '#d32f2f'
                              };
                            case true:
                              return {
                                bg: 'rgba(76, 175, 80, 0.1)',
                                border: '#4caf50',
                                text: '#388e3c'
                              };
                            default:
                              return {
                                bg: 'rgba(158, 158, 158, 0.1)',
                                border: '#9e9e9e',
                                text: '#616161'
                              };
                          }
                        };

                        const estadoColors = getEstadoColor(propiedad.disponibilidad);
                        const isSelected = selectedPropiedad?.id === propiedad.id;

                        return (
                          <Card 
                            key={propiedad.id}
                            elevation={isSelected ? 3 : 1}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              borderLeft: isSelected 
                                ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e')
                                : `4px solid ${estadoColors.border}`,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                              },
                              bgcolor: isSelected ? '#e8eaf6' : estadoColors.bg
                            }}
                            onClick={() => handleSelectPropiedad(propiedad)}
                          >
                            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                              height: 90,alignItems:'center', gap:2
                             }}>
                              {/* Foto de la propiedad */}
                              <Box sx={{ 
                                width: '40%', 
                                height:90, 
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt:1
                              }}>
                                {propiedad.imagenes && propiedad.imagenes.length > 0 ? (
                                  <img
                                    src={propiedad.imagenes[0].imageUrl || propiedad.imagenes[0]}
                                    alt={`Propiedad ${propiedad.direccion}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <Box sx={{ 
                                  display: propiedad.imagenes && propiedad.imagenes.length > 0 ? 'none' : 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  color: '#9e9e9e'
                                }}>
                                  <HomeIcon sx={{ fontSize: 40 }} />
                                </Box>
                              </Box>

                              {/* Estado de la propiedad */}
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'start',
                                mb: 1,
                                flexDirection: 'column',
                                height: 80,
                                gap: 0.3,
                                mt:2,
                                width:"60%"
                               
                              }}>
                                <Chip
                                  label={propiedad.disponibilidad === true ? 'Disponible' : 'No disponible'}
                                  size="small"
                                  sx={{
                                    bgcolor: estadoColors.border,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }}
                                />
                                <Typography  color="#1F2C61" variant="body2" sx={{ fontWeight: 600 }}>
                                  {propiedad.direccion}
                                </Typography>
                          
                              <Typography variant="body2" color="black" sx={{ mb: 0.5 }}>
                                Localidad: {propiedad.localidad || 'No especificado'}
                              </Typography>
                              
                              
                              </Box>

                              
                              
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.propiedades === 0}
                    onClick={() => handlePrevPage('propiedades')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.propiedades + 1} / {Math.ceil(filteredPropiedades.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredPropiedades.length <= (pagination.propiedades + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('propiedades')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 3 && (
              // Step 4: Select Garantes
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 4: Seleccionar Garantes</Typography>
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel id="tipo-garantia-label">Tipo de Garantía</InputLabel>
                    <Select
                      labelId="tipo-garantia-label"
                      label="Tipo de Garantía"
                      name="tipoGarantia"
                      value={contratoForm.tipoGarantia}
                      onChange={(e) => {
                        const value = e.target.value;
                        setContratoForm(prev => ({ ...prev, tipoGarantia: value }));
                        setPagination(prev => ({ ...prev, garantes: 0 }));
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Recibo de Sueldo">Recibo de Sueldo</MenuItem>
                      <MenuItem value="Garantía Propietaria">Garantía Propietaria</MenuItem>
                      <MenuItem value="SEGURO_CAUCION">Seguro de caución</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                { (contratoForm.tipoGarantia || '') === 'SEGURO_CAUCION' ? (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.08)',
                    border: '1px dashed',
                    borderColor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
                    borderRadius: 2,
                    mb: 3
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Seguro de caución seleccionado
                    </Typography>
                    <Typography variant="body2">
                      Para la opción de caución no es necesario cargar garantes en el sistema. Al finalizar, descarga el PDF para enviar a tu broker.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                      Seleccione uno o más garantes para el contrato.
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        mb: 3, 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                        borderRadius: 2,
                        p: 1,
                        boxShadow: 1
                      }}>
                        <SearchIcon sx={{ 
                          mx: 1.5, 
                          color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                        }} />
                        <TextField
                          fullWidth
                          placeholder="Buscar garante..."
                          variant="standard"
                          value={search.garante}
                          onChange={(e) => setSearch({ ...search, garante: e.target.value })}
                          InputProps={{
                            disableUnderline: true,
                          }}
                          sx={{ 
                            '& .MuiInputBase-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setOpenGaranteDialog(true)}
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                            color: theme.palette.mode === 'dark' ? 'white' : 'white',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                            },
                            borderRadius: '8px'
                          }}
                        >
                          Nuevo Garante
                        </Button>
                      </Box>
                      
                      {loading.garantes ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                        </Box>
                      ) : error.garantes ? (
                        <Box sx={{ 
                          bgcolor: '#ffebee', 
                          color: '#c62828', 
                          p: 2, 
                          borderRadius: 2,
                          textAlign: 'center' 
                        }}>
                          <Typography>Error: {error.garantes}</Typography>
                        </Box>
                      ) : paginatedGarantes.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4, 
                          bgcolor: '#f5f5f5',
                          borderRadius: 2
                        }}>
                          <Typography variant="body1">No se encontraron garantes</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { 
                            xs: '1fr', 
                            sm: 'repeat(2, 1fr)', 
                            md: 'repeat(3, 1fr)' 
                          },
                          gap: 2
                        }}>
                          {paginatedGarantes.map((garante) => {
                            const isSelected = selectedGarantes.some(g => g.id === garante.id);
                            
                            return (
                              <Card 
                                key={garante.id}
                                elevation={isSelected ? 3 : 1}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  borderLeft: isSelected ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                  },
                                  bgcolor: isSelected ? '#e8eaf6' : 'white'
                                }}
                                onClick={() => handleSelectGarante(garante)}
                              >
                                <CardContent>
                                  <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                                    {garante.nombre} {garante.apellido}
                                  </Typography>
                                  <Typography variant="body2" color="black">
                                    Email: {garante.email}
                                  </Typography>
                                  <Typography variant="body2" color="black">
                                    Teléfono: {garante.telefono || 'No disponible'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  </>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.garantes === 0}
                    onClick={() => handlePrevPage('garantes')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.garantes + 1} / {Math.ceil(filteredGarantes.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredGarantes.length <= (pagination.garantes + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('garantes')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
                
                {selectedGarantes.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Garantes Seleccionados ({selectedGarantes.length})
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      {selectedGarantes.map(garante => (
                        <Chip
                          key={garante.id}
                          label={`${garante.nombre} ${garante.apellido}`}
                          onDelete={() => handleSelectGarante(garante)}
                          sx={{
                            bgcolor: '#1F2C61',
                            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white',
                            borderRadius: '16px',
                            '& .MuiChip-deleteIcon': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white',
                              '&:hover': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#0d47a1'
                              }
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 4 && (
              // Step 5: Contract Details
              <Box sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 25 },
                '& .MuiOutlinedInput-notchedOutline': { borderRadius: 25 }
              }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Paso 5: Detalles del Contrato</Typography>
                
                <Grid2 sx={{ gap: 3 }}>
                  <Grid2 item xs={12} sm={6}>
                    <TextField
                      label="Nombre del Contrato"
                      name="nombreContrato"
                      value={contratoForm.nombreContrato}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Monto de Alquiler"
                      name="montoAlquiler"
                      type="text"
                      value={contratoForm.montoAlquiler}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder="Ej: 150.000"
                    />
                    
                    <TextField
                      label="Monto de Alquiler en Letras"
                      name="montoAlquilerLetras"
                      value={contratoForm.montoAlquilerLetras}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Duración (en meses)"
                      name="duracion"
                      type="number"
                      value={contratoForm.duracion}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Multa por Día"
                      name="multaXDia"
                      type="text"
                      value={contratoForm.multaXDia}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder="Ej: 5.000"
                    />
                    
                    <TextField
                      label="Actulizar cada (meses)"
                      name="actualizacion"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      onChange={handleFormChange}
                      value={contratoForm.actualizacion}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid2>
                  
                  <Grid2 item xs={12} sm={6}>
                    <TextField
                      label="Fecha de Inicio"
                      name="fecha_inicio"
                      type="date"
                      value={contratoForm.fecha_inicio}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    
                    <TextField
                      label="Fecha de Fin"
                      name="fecha_fin"
                      type="date"
                      value={contratoForm.fecha_fin}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    
                    <TextField
                      label="Índice de Ajuste"
                      name="indiceAjuste"
                      value={contratoForm.indiceAjuste}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="destino-label">Destino</InputLabel>
                      <Select
                        labelId="destino-label"
                        name="destino"
                        value={contratoForm.destino}
                        onChange={handleFormChange}
                        fullWidth
                        required
                        label="Destino"
                      >
                        {destinos.map((destino) => (
                          <MenuItem key={destino.value} value={destino.value}>
                            {destino.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                      label="Comisión por Contrato (%)"
                      name="comisionContratoPorc"
                      type="number"
                      value={contratoForm.comisionContratoPorc}
                      onChange={handleFormChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />

                    <TextField
                      label="Comisión Mensual (%)"
                      name="comisionMensualPorc"
                      type="number"
                      value={contratoForm.comisionMensualPorc}
                      onChange={handleFormChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Servicios
                    </Typography>
                    
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f8fafc',
                        borderRadius: '8px',
                        mb: 2,
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 }
                      }}
                    >
                      {/* Agua */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f7ff',
                          }
                        }}
                      >
                        <OpacityIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#2196f3', mr: 2 }} />
                        <TextField
                          name="aguaEmpresa"
                          label="Empresa de Agua"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.aguaEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
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
                        <TextField
                          name="aguaPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.aguaPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
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
                      </Box>

                      {/* Gas */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff7f0',
                          }
                        }}
                      >
                        <LocalFireDepartmentIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ff9800', mr: 2 }} />
                        <TextField
                          name="gasEmpresa"
                          label="Empresa de Gas"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.gasEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
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
                        <TextField
                          name="gasPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.gasPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
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
                      </Box>

                      {/* Luz */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f9fce8',
                          }
                        }}
                      >
                        <BoltIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ffc107', mr: 2 }} />
                        <TextField
                          name="luzEmpresa"
                          label="Empresa de Luz"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.luzEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
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
                        <TextField
                          name="luzPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.luzPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
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
                      </Box>

                      {/* Municipal */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f5f0',
                          }
                        }}
                      >
                        <AccountBalanceIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#4caf50', mr: 2 }} />
                        <TextField
                          name="municipalEmpresa"
                          label="Empresa Municipal"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.municipalEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
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
                        <TextField
                          name="municipalPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.municipalPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
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
                      </Box>
                    </Paper>
                  </Grid2>
                </Grid2>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Step navigation buttons */}
      {activeStep !== steps.length && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', md: 'flex-end' },
          flexDirection: { xs: 'row', sm: 'row' },
          marginBottom: { xs: 20, md: 16 }, 
          width: { xs: '90%', md: '84%' },
          gap: { xs: 2, sm: 1 },
          px: { xs: 2, md: 0 }
        }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit', 
              mr: { xs: 0, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            data-tour="crearcontrato-next"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
              color: theme.palette.mode === 'dark' ? 'white' : 'white',
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: '48px', md: 'auto' },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
              }
            }}
          >
            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      )}

      {/* Dialog Modals */}
      <Dialog
        open={openPropietarioDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClosePropietarioDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Propietario</DialogTitle>
        <DialogContent dividers>
          <PropietarioForm onSuccess={handleClosePropietarioDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openInquilinoDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseInquilinoDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Inquilino</DialogTitle>
        <DialogContent dividers>
          <InquilinoForm onSuccess={handleCloseInquilinoDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openPropiedadDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClosePropiedadDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nueva Propiedad</DialogTitle>
        <DialogContent dividers>
          <PropiedadesForm onSuccess={handleClosePropiedadDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openGaranteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseGaranteDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Garante</DialogTitle>
        <DialogContent dividers>
          <GaranteForm onSuccess={handleCloseGaranteDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CrearContratoPage;
