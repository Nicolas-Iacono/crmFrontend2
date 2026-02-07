import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Skeleton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid2,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Pagination,
  Zoom,
  Slide,
  ClickAwayListener,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PreviewIcon from '@mui/icons-material/Preview';
import contratoApi from '../api/contratoApi';
import TextEditor from '../common/editorDTexto/TextEditor';
import GenerarContrato from '../common/pdfPlantilla/GenerarContrato';
import Swal from 'sweetalert2';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { useNavigate } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotaContratoForm from '../common/NotaContratoForm';
import NotasContratoList from '../common/NotasContratoList';
import ModalContract from '../common/popUps/ModalContract';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContractsTour from '../common/tour/ContractsTour';
import { showSuccess, showError, showInfo, showConfirm } from '../alertas/showAlert';
import http from '../api/http';
import EditContratoModal from '../common/popUps/EditContratoModal';
import EditorWithChatModal from '../common/popUps/EditorWithChatModal';
import RenovarContratoModal from "../common/popUps/RenovarContratoModal";
const ContratosPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [contratos, setContratos] = useState([]);
  const [pressTimer, setPressTimer] = useState(null);
  const [showBubbles, setShowBubbles] = useState({});
  const [staggerOpen, setStaggerOpen] = useState({});
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorChatOpen, setEditorChatOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDefaults, setEditDefaults] = useState({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [contractNote, setContractNote] = useState('');
  const [contractNotes, setContractNotes] = useState({});
  const navigate = useNavigate();
  const [renovarModalOpen, setRenovarModalOpen] = useState(false);
  const [renovarDefaults, setRenovarDefaults] = useState({});
  const [renovarContratoId, setRenovarContratoId] = useState(null);
  const [garantesOptions, setGarantesOptions] = useState([]);
  const contractsPerPage = isMobile ? 3 : 4;

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);


    const fetchContratos = async () => {
      if (user.name) {
        try {
          const res = await http.get(`${import.meta.env.VITE_API_URL}/contrato/me/cards`);
          const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
          setContratos(data || []);
          
          // Recuperar notas guardadas del localStorage
          const savedNotes = localStorage.getItem('contractNotes');
          if (savedNotes) {
            setContractNotes(JSON.parse(savedNotes));
          }
          
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
  useEffect(() => {
    fetchContratos();
  }, [user.name]);

  useEffect(() => {
    const fetchGarantesOptions = async () => {
      if (!renovarModalOpen) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/garante/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        const payload = res?.data;
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        setGarantesOptions(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error fetching garantes options:', e);
        setGarantesOptions([]);
      } finally {
      }
    };

    fetchGarantesOptions();
  }, [renovarModalOpen]);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when filters change
  }, [searchTerm, estadoFilter]);
 
  const pausarContrato = async(id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contrato/finalizar/${id}`);
      await Swal.fire({
        title: 'Contrato Pausado!',
        text: 'Ahora puedes eliminar el contrato',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchContratos();
    } catch (error) {
      console.error('Error al pausar contrato:', error);
      showError('No se pudo pausar el contrato');
    }
  };

  const handleDeleteClick = async(id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/contrato/delete/${id}`);
      showSuccess('Contrato eliminado');
      
      // Remove the deleted contract from the frontend state
      const updatedContratos = contratos.filter(contrato => contrato.id !== id);
      setContratos(updatedContratos);
      
    } catch (error) {
      const mensajeError = error.response?.data?.message || '';
    
      if (
        error.response?.status === 500 ||
        (error.response?.status === 500 &&
         mensajeError.includes("contrato activo"))
      ) {
        const confirmar = await showConfirm({
          title: 'Contrato activo',
          text: '¿Querés eliminarlo de todas formas?',
          confirmText: 'Sí, eliminar igual',
        });
    
        if (confirmar.isConfirmed) {
          await axios.delete(`${import.meta.env.VITE_API_URL}/contrato/delete-forzado/${id}`);
          showSuccess('✅ Eliminado forzadamente');
          
          // Remove the deleted contract from the frontend state after forced deletion
          const updatedContratos = contratos.filter(contrato => contrato.id !== id);
          setContratos(updatedContratos);
        }
      } else {
        showError('No se pudo eliminar el contrato');
      }
    }}
  const handleSelectContrato = (contrato) => {
    if (!contrato || !contrato.id) return;
    (async () => {
      try {
        const res = await http.get(`${import.meta.env.VITE_API_URL}/contrato/pdf/${contrato.id}`);
        const data = res?.data?.data ?? res?.data;
        const isObj = (v) => v && typeof v === 'object';
        const merged = {
          ...contrato,
          // root-level simple fields
          nombreContrato: data?.nombreContrato ?? contrato?.nombreContrato,
          activo: data?.activo ?? contrato?.activo,
          actualizacion: data?.actualizacion ?? contrato?.actualizacion,
          fecha_inicio: data?.fecha_inicio ?? data?.fechaInicio ?? contrato?.fecha_inicio,
          fecha_fin: data?.fecha_fin ?? data?.fechaFin ?? contrato?.fecha_fin,
          duracion: data?.duracion ?? contrato?.duracion,
          multaXDia: data?.multaXDia ?? contrato?.multaXDia,
          indiceAjuste: data?.indiceAjuste ?? contrato?.indiceAjuste,
          montoAlquiler: data?.montoAlquiler ?? contrato?.montoAlquiler ?? contrato?.monto,
          montoAlquilerLetras: data?.montoAlquilerLetras ?? contrato?.montoAlquilerLetras,
          aguaPorcentaje: data?.aguaPorcentaje ?? contrato?.aguaPorcentaje,
          aguaEmpresa: data?.aguaEmpresa ?? contrato?.aguaEmpresa,
          luzPorcentaje: data?.luzPorcentaje ?? contrato?.luzPorcentaje,
          luzEmpresa: data?.luzEmpresa ?? contrato?.luzEmpresa,
          gasPorcentaje: data?.gasPorcentaje ?? contrato?.gasPorcentaje,
          gasEmpresa: data?.gasEmpresa ?? contrato?.gasEmpresa,
          municipalPorcentaje: data?.municipalPorcentaje ?? contrato?.municipalPorcentaje,
          municipalEmpresa: data?.municipalEmpresa ?? contrato?.municipalEmpresa,
          destino: data?.destino ?? contrato?.destino,
          tipoGarantia: data?.tipoGarantia ?? contrato?.tipoGarantia,
          tiempoRestante: data?.tiempoRestante ?? contrato?.tiempoRestante,
          contratoPdf: data?.contratoPdf ?? contrato?.contratoPdf,
          usuarioDtoSalida: isObj(data?.usuarioDtoSalida) ? data.usuarioDtoSalida : (contrato?.usuarioDtoSalida || undefined),
          garantes: Array.isArray(data?.garantes) ? data.garantes : (Array.isArray(contrato?.garantes) ? contrato.garantes : []),
          propietario: {
            ...(isObj(contrato?.propietario) ? contrato?.propietario : {}),
            pronombre: data?.propietario?.pronombre ?? contrato?.propietario?.pronombre,
            nombre: data?.propietario?.nombre ?? contrato?.propietario?.nombre,
            apellido: data?.propietario?.apellido ?? contrato?.propietario?.apellido,
            nacionalidad: data?.propietario?.nacionalidad ?? contrato?.propietario?.nacionalidad,
            dni: data?.propietario?.dni ?? contrato?.propietario?.dni,
            cuit: data?.propietario?.cuit ?? contrato?.propietario?.cuit,
            telefono: data?.propietario?.telefono ?? contrato?.propietario?.telefono,
            email: data?.propietario?.email ?? contrato?.propietario?.email,
            direccionResidencial: data?.propietario?.direccionResidencial ?? contrato?.propietario?.direccionResidencial,
            estadoCivil: data?.propietario?.estadoCivil ?? contrato?.propietario?.estadoCivil,
          },
          inquilino: {
            ...(isObj(contrato?.inquilino) ? contrato?.inquilino : {}),
            pronombre: data?.inquilino?.pronombre ?? contrato?.inquilino?.pronombre,
            nombre: data?.inquilino?.nombre ?? contrato?.inquilino?.nombre,
            apellido: data?.inquilino?.apellido ?? contrato?.inquilino?.apellido,
            nacionalidad: data?.inquilino?.nacionalidad ?? contrato?.inquilino?.nacionalidad,
            dni: data?.inquilino?.dni ?? contrato?.inquilino?.dni,
            cuit: data?.inquilino?.cuit ?? contrato?.inquilino?.cuit,
            telefono: data?.inquilino?.telefono ?? contrato?.inquilino?.telefono,
            email: data?.inquilino?.email ?? contrato?.inquilino?.email,
            direccionResidencial: data?.inquilino?.direccionResidencial ?? contrato?.inquilino?.direccionResidencial,
            estadoCivil: data?.inquilino?.estadoCivil ?? contrato?.inquilino?.estadoCivil,
          },
          propiedad: {
            ...(isObj(contrato?.propiedad) ? contrato?.propiedad : {}),
            tipo: data?.propiedad?.tipo ?? data?.propiedadTipo ?? contrato?.propiedad?.tipo,
            direccion: data?.propiedad?.direccion ?? data?.direccion ?? data?.propiedadDireccion ?? (isObj(contrato?.propiedad) ? contrato?.propiedad?.direccion : (typeof contrato?.propiedad === 'string' ? contrato?.propiedad : '')),
            localidad: data?.propiedad?.localidad ?? data?.localidad ?? contrato?.propiedad?.localidad,
            partido: data?.propiedad?.partido ?? data?.partido ?? contrato?.propiedad?.partido,
            provincia: data?.propiedad?.provincia ?? data?.provincia ?? contrato?.propiedad?.provincia,
            inventario: data?.propiedad?.inventario ?? data?.inventario ?? contrato?.propiedad?.inventario,
            imagenes: Array.isArray(data?.propiedad?.imagenes) ? data?.propiedad?.imagenes : (Array.isArray(contrato?.propiedad?.imagenes) ? contrato?.propiedad?.imagenes : []),
          },
        };
        setSelectedContract(merged);
      } catch (e) {
        // Fallback: abrir con datos actuales si la API falla
        setSelectedContract(contrato);
      } finally {
        setEditorChatOpen(true);
      }
    })();
  };

  const handleGenerateReceipt = (contratos) => {
    if (contratos && contratos.id) {
      let contratoId = contratos.id;
      navigate(`/recibos/${contratoId}`, { 
        state: { 
          contrato: contratos, 
          formValues: { id: contratoId } 
        } 
      });
      setSelectedContract(contratos);
    } else {
      showError('No se puede acceder a los recibos de este contrato');
    }
  };

  const contratosBuscados = contratos ? contratos.filter(contrato =>
    (contrato?.nombreContrato || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (
      (typeof contrato?.propietario === 'string'
        ? contrato?.propietario
        : `${contrato?.propietario?.nombre ?? ''} ${contrato?.propietario?.apellido ?? ''}`) || ''
    ).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (
      (typeof contrato?.inquilino === 'string'
        ? contrato?.inquilino
        : `${contrato?.inquilino?.nombre ?? ''} ${contrato?.inquilino?.apellido ?? ''}`) || ''
    ).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (
      (typeof contrato?.propiedad === 'string'
        ? contrato?.propiedad
        : (contrato?.propiedad?.direccion ?? '')) || ''
    ).toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getEstadoColor = (estado) => {
    const colorsLight = {
      ACTIVO: '#5E5CE6',
      RENOVADO: '#F7C931',
      ARCHIVADO: '#2FD5C7',
      FINALIZADO: '#F44336',
    };
    const colorsDark = {
      ACTIVO: '#333194ff',
      RENOVADO: '#bb930fff',
      ARCHIVADO: '#149489ff',
      FINALIZADO: '#a52b23ff',
    };
    const palette = theme.palette.mode === 'dark' ? colorsDark : colorsLight;
    return palette[estado] || (theme.palette.mode === 'dark' ? '#9E9E9E' : '#616161');
  };

  const toAlphaHex = (hexColor, alphaHex) => {
    if (typeof hexColor !== 'string') return hexColor;
    if (hexColor.length === 7) return `${hexColor}${alphaHex}`; // #RRGGBB
    if (hexColor.length === 9) return `${hexColor.slice(0, 7)}${alphaHex}`; // #RRGGBBAA
    return hexColor;
  };

  const hasEstado = (contrato, estado) => {
    const estados = Array.isArray(contrato?.estados)
      ? contrato.estados
      : (typeof contrato?.estados === 'string' ? [contrato.estados] : []);
    return estados.includes(estado);
  };

  const estadoCounts = contratosBuscados.reduce((acc, c) => {
    acc.ACTIVO += hasEstado(c, 'ACTIVO') ? 1 : 0;
    acc.RENOVADO += hasEstado(c, 'RENOVADO') ? 1 : 0;
    acc.FINALIZADO += hasEstado(c, 'FINALIZADO') ? 1 : 0;
    acc.ARCHIVADO += hasEstado(c, 'ARCHIVADO') ? 1 : 0;
    return acc;
  }, { ACTIVO: 0, RENOVADO: 0, FINALIZADO: 0, ARCHIVADO: 0 });

  const contratosFiltrados = !estadoFilter
    ? contratosBuscados
    : contratosBuscados.filter((c) => hasEstado(c, estadoFilter));

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditContract = (contrato) => {
    if (!contrato) return;
    const toDate = (v) => (v ? String(v).slice(0, 10) : '');
    (async () => {
      try {
        const [detailRes, pdfRes] = await Promise.all([
          http.get(`${import.meta.env.VITE_API_URL}/contrato/buscar/${contrato.id}`),
          http.get(`${import.meta.env.VITE_API_URL}/contrato/pdf/${contrato.id}`)
        ]);
        const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
        const pdf = pdfRes?.data?.data ?? pdfRes?.data ?? {};

        const merged = {
          ...contrato,
          ...detail,
          // top-level
          nombreContrato: detail?.nombreContrato ?? pdf?.nombreContrato ?? contrato?.nombreContrato,
          fecha_inicio: detail?.fecha_inicio ?? detail?.fechaInicio ?? pdf?.fecha_inicio ?? pdf?.fechaInicio ?? contrato?.fecha_inicio,
          fecha_fin: detail?.fecha_fin ?? detail?.fechaFin ?? pdf?.fecha_fin ?? pdf?.fechaFin ?? contrato?.fecha_fin,
          duracion: detail?.duracion ?? pdf?.duracion ?? contrato?.duracion,
          multaXDia: detail?.multaXDia ?? pdf?.multaXDia ?? contrato?.multaXDia,
          indiceAjuste: detail?.indiceAjuste ?? pdf?.indiceAjuste ?? contrato?.indiceAjuste,
          montoAlquilerLetras: pdf?.montoAlquilerLetras ?? detail?.montoAlquilerLetras ?? contrato?.montoAlquilerLetras,
          destino: detail?.destino ?? pdf?.destino ?? contrato?.destino,
          // servicios
          aguaEmpresa: pdf?.aguaEmpresa ?? detail?.aguaEmpresa ?? contrato?.aguaEmpresa,
          aguaPorcentaje: pdf?.aguaPorcentaje ?? detail?.aguaPorcentaje ?? contrato?.aguaPorcentaje,
          luzEmpresa: pdf?.luzEmpresa ?? detail?.luzEmpresa ?? contrato?.luzEmpresa,
          luzPorcentaje: pdf?.luzPorcentaje ?? detail?.luzPorcentaje ?? contrato?.luzPorcentaje,
          gasEmpresa: pdf?.gasEmpresa ?? detail?.gasEmpresa ?? contrato?.gasEmpresa,
          gasPorcentaje: pdf?.gasPorcentaje ?? detail?.gasPorcentaje ?? contrato?.gasPorcentaje,
          municipalEmpresa: pdf?.municipalEmpresa ?? detail?.municipalEmpresa ?? contrato?.municipalEmpresa,
          municipalPorcentaje: pdf?.municipalPorcentaje ?? detail?.municipalPorcentaje ?? contrato?.municipalPorcentaje,
          // nested
          propietario: detail?.propietario ?? pdf?.propietario ?? contrato?.propietario ?? {},
          inquilino: detail?.inquilino ?? pdf?.inquilino ?? contrato?.inquilino ?? {},
          propiedad: detail?.propiedad ?? pdf?.propiedad ?? contrato?.propiedad ?? {},
        };

        setSelectedContract(merged);
        setEditDefaults({
          nombreContrato: merged?.nombreContrato ?? '',
          fecha_inicio: toDate(merged?.fecha_inicio || merged?.fechaInicio),
          fecha_fin: toDate(merged?.fecha_fin || merged?.fechaFin),
          aguaEmpresa: merged?.aguaEmpresa ?? '',
          aguaPorcentaje: (merged?.aguaPorcentaje ?? ''),
          luzEmpresa: merged?.luzEmpresa ?? '',
          luzPorcentaje: (merged?.luzPorcentaje ?? ''),
          gasEmpresa: merged?.gasEmpresa ?? '',
          gasPorcentaje: (merged?.gasPorcentaje ?? ''),
          municipalEmpresa: merged?.municipalEmpresa ?? '',
          municipalPorcentaje: (merged?.municipalPorcentaje ?? ''),
          indiceAjuste: merged?.indiceAjuste ?? '',
          montoAlquilerLetras: merged?.montoAlquilerLetras ?? '',
          multaXDia: (merged?.multaXDia ?? ''),
          duracion: (merged?.duracion ?? ''),
          destino: merged?.destino ?? ''
        });
      } catch (e) {
        // Fallback a los datos existentes en card si falla el fetch
        setSelectedContract(contrato);
        setEditDefaults({
          nombreContrato: contrato?.nombreContrato ?? '',
          fecha_inicio: toDate(contrato?.fecha_inicio || contrato?.fechaInicio),
          fecha_fin: toDate(contrato?.fecha_fin || contrato?.fechaFin),
          aguaEmpresa: contrato?.aguaEmpresa ?? '',
          aguaPorcentaje: contrato?.aguaPorcentaje ?? '',
          luzEmpresa: contrato?.luzEmpresa ?? '',
          luzPorcentaje: contrato?.luzPorcentaje ?? '',
          gasEmpresa: contrato?.gasEmpresa ?? '',
          gasPorcentaje: contrato?.gasPorcentaje ?? '',
          municipalEmpresa: contrato?.municipalEmpresa ?? '',
          municipalPorcentaje: contrato?.municipalPorcentaje ?? '',
          indiceAjuste: contrato?.indiceAjuste ?? '',
          montoAlquilerLetras: contrato?.montoAlquilerLetras ?? '',
          multaXDia: contrato?.multaXDia ?? '',
          duracion: contrato?.duracion ?? '',
          destino: contrato?.destino ?? ''
        });
      } finally {
        setEditModalOpen(true);
      }
    })();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleSaveEdit = async (values) => {
    if (!selectedContract) return;
    try {
      const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
      const payload = {
        nombreContrato: values?.nombreContrato ?? '',
        fecha_inicio: values?.fecha_inicio ?? '',
        fecha_fin: values?.fecha_fin ?? '',
        aguaEmpresa: values?.aguaEmpresa ?? '',
        aguaPorcentaje: num(values?.aguaPorcentaje),
        luzEmpresa: values?.luzEmpresa ?? '',
        luzPorcentaje: num(values?.luzPorcentaje),
        gasEmpresa: values?.gasEmpresa ?? '',
        gasPorcentaje: num(values?.gasPorcentaje),
        municipalEmpresa: values?.municipalEmpresa ?? '',
        municipalPorcentaje: num(values?.municipalPorcentaje),
        indiceAjuste: values?.indiceAjuste ?? '',
        montoAlquilerLetras: values?.montoAlquilerLetras ?? '',
        multaXDia: num(values?.multaXDia),
        duracion: num(values?.duracion),
        destino: values?.destino ?? ''
      };

      const endpoint = `${import.meta.env.VITE_API_URL}/contrato/mod/${selectedContract.id}`;
      const res = await http.put(endpoint, payload);
      const updated = res?.data || { ...selectedContract, ...payload };

      setContratos((prev) => Array.isArray(prev)
        ? prev.map((c) => c.id === selectedContract.id ? { ...c, ...updated } : c)
        : prev);
      setSelectedContract((prev) => (prev && prev.id === selectedContract.id ? { ...prev, ...updated } : prev));
      showSuccess('Contrato actualizado');
      setEditModalOpen(false);
    } catch (e) {
      console.error('Error actualizando contrato', e);
      showError('No se pudo actualizar el contrato');
    }
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedContract(null);
  };

  const handlePressStart = (contratoId) => {
    const timer = setTimeout(() => {
      setShowBubbles(prev => ({ ...prev, [contratoId]: true }));
    }, 200);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setShowBubbles({});
  };

  const toggleStagger = (contratoId) => {
    setStaggerOpen((prev) => {
      const isOpen = !!prev?.[contratoId];
      return isOpen ? {} : { [contratoId]: true };
    });
  };

  const closeStagger = () => {
    setStaggerOpen({});
  };

  const setContratoEstados = async (contratoId, estados) => {
    if (!contratoId) return;
    const payload = Array.isArray(estados) ? estados : [];
    try {
      await http.put(
        `${import.meta.env.VITE_API_URL}/contrato/${contratoId}/estados`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setContratos((prev) => Array.isArray(prev)
        ? prev.map((c) => (c.id === contratoId ? { ...c, estados: payload } : c))
        : prev);
      setSelectedContract((prev) => (prev?.id === contratoId ? { ...prev, estados: payload } : prev));
    } catch (e) {
      console.error('Error actualizando estados del contrato', e);
      showError(e?.response?.data?.message || 'No se pudieron actualizar los estados');
    }
  };

  const toggleContratoEstado = async (contrato, estado) => {
    if (!contrato?.id || !estado) return;
    const current = Array.isArray(contrato?.estados) ? contrato.estados : [];
    const next = current.includes(estado)
      ? current.filter((s) => s !== estado)
      : [...current, estado];
    await setContratoEstados(contrato.id, next);
  };

  const getContratoEstadosTopBarBg = (contrato) => {
    const estadoColors = {
      ACTIVO:  theme.palette.mode === 'dark' ? '#333194ff' : '#5E5CE6',
      RENOVADO: theme.palette.mode === 'dark' ? '#bb930fff' : '#F7C931',
      ARCHIVADO: theme.palette.mode === 'dark' ? '#149489ff' : '#2FD5C7',
      FINALIZADO: theme.palette.mode === 'dark' ? '#a52b23ff' : '#F44336',
    };

    const order = ['ACTIVO', 'RENOVADO', 'FINALIZADO', 'ARCHIVADO'];
    const raw = Array.isArray(contrato?.estados) ? contrato.estados : [];
    const unique = Array.from(new Set(raw.filter(Boolean)));
    if (unique.length === 0) return 'transparent';

    const sorted = [
      ...order.filter((s) => unique.includes(s)),
      ...unique.filter((s) => !order.includes(s)),
    ];

    const colors = sorted.map((s) => estadoColors[s] || '#9E9E9E');
    if (colors.length === 1) return colors[0];

    const n = colors.length;
    const stops = colors
      .map((c, i) => {
        const start = (i * 100) / n;
        const end = ((i + 1) * 100) / n;
        return `${c} ${start}%, ${c} ${end}%`;
      })
      .join(', ');
    return `linear-gradient(90deg, ${stops})`;
  };

  const getStaggerActions = (contrato) => {
    const estados = Array.isArray(contrato?.estados) ? contrato.estados : [];

    const mkSx = (active, baseColor) => ({
      color: '#fff',
      bgcolor: baseColor,
      width: 31,
      height: 31,
      marginTop:".2rem",
      boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.9)' : 'none',
      '&:hover': { bgcolor: baseColor, filter: 'brightness(0.92)' },
    });

    return [
      {
        key: 'ACTIVO',
        title: 'Activo',
        icon: <CheckCircleOutlineIcon fontSize="small" />,
        onClick: () => toggleContratoEstado(contrato, 'ACTIVO'),
        sx: mkSx(estados.includes('ACTIVO'), theme.palette.mode === 'dark' ? '#333194ff' : '#5E5CE6')
        ,
      },
      {
        key: 'FINALIZADO',
        title: 'Finalizado',
        icon: <CancelOutlinedIcon fontSize="small" />,
        onClick: () => toggleContratoEstado(contrato, 'FINALIZADO'),
        sx: mkSx(estados.includes('FINALIZADO'),theme.palette.mode === 'dark' ? '#a52b23ff' : '#F44336'),
      },
      {
        key: 'RENOVADO',
        title: 'Renovado',
        icon: <AutorenewIcon fontSize="small" />,
        onClick: () => toggleContratoEstado(contrato, 'RENOVADO'),
        sx: mkSx(estados.includes('RENOVADO'),theme.palette.mode === 'dark' ? '#bb930fff' : '#F7C931'),
      },
      {
        key: 'ARCHIVADO',
        title: 'Archivado',
        icon: <ArchiveOutlinedIcon fontSize="small" />,
        onClick: () => toggleContratoEstado(contrato, 'ARCHIVADO'),
        sx: mkSx(estados.includes('ARCHIVADO'),theme.palette.mode === 'dark' ? '#149489ff' : '#2FD5C7'),
      },
    ];
  };

  const handleOpenDetailModal = (contrato) => {
    if (!contrato) return;
    (async () => {
      try {
        const res = await http.get(`${import.meta.env.VITE_API_URL}/contrato/buscar/${contrato.id}`);
        const data = res?.data?.data ?? res?.data;
        setSelectedContract(data);
        setDetailModalOpen(true);
        if (contractNotes[data?.id]) {
          setContractNote(contractNotes[data.id]);
        } else {
          setContractNote('');
        }
      } catch (e) {
        showError('No se pudo cargar el detalle del contrato');
      }
    })();
  };
  const handleEditorSaved = (html) => {
    // actualiza el seleccionado
    setSelectedContract(prev =>
      prev ? { ...prev, contratoPdf: html } : prev
    );
    // si manejás una lista base:
    setContratos(prev =>
      Array.isArray(prev)
        ? prev.map(c => c.id === selectedContract?.id ? { ...c, contratoPdf: html } : c)
        : prev
    );
    // si renderizás desde contratosFiltrados derivados, con que actualices la base alcanza
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedContract(null);
  };

  const handleSaveNote = () => {
    if (!selectedContract) return;
    
    const updatedNotes = {
      ...contractNotes,
      [selectedContract.id]: contractNote
    };

    
    setContractNotes(updatedNotes);
    localStorage.setItem('contractNotes', JSON.stringify(updatedNotes));
    
    showSuccess('Nota guardada');
    
  };

  const handleWhatsAppClick = (phone) => {
    if (!phone) {
      showError('No hay número de teléfono disponible');
      return;
    }
    
    // Formatear número para WhatsApp
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleEmailClick = (email) => {
    if (!email) {
      showError('No hay correo electrónico disponible');
      return;
    }
    
    window.open(`mailto:${email}`, '_blank');
  };

  const openRenovar = async (contrato) => {
  if (!contrato?.id) return;

  setRenovarContratoId(contrato.id);

  const toDate = (v) => (v ? String(v).slice(0, 10) : '');
  const baseFi = contrato?.fecha_inicio || contrato?.fechaInicio || '';
  const baseFf = contrato?.fecha_fin || contrato?.fechaFin || '';

  try {
    const [detailRes, pdfRes] = await Promise.all([
      http.get(`${import.meta.env.VITE_API_URL}/contrato/buscar/${contrato.id}`),
      http.get(`${import.meta.env.VITE_API_URL}/contrato/pdf/${contrato.id}`)
    ]);

    const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
    const pdf = pdfRes?.data?.data ?? pdfRes?.data ?? {};

    const merged = {
      ...contrato,
      ...detail,
      ...pdf,
    };

    setRenovarDefaults({
      ...merged,
      fecha_inicio: toDate(merged?.fecha_inicio ?? merged?.fechaInicio ?? baseFi),
      fecha_fin: toDate(merged?.fecha_fin ?? merged?.fechaFin ?? baseFf),
      duracion: merged?.duracion ?? '',
      montoAlquiler: merged?.montoAlquiler ?? merged?.monto ?? '',
      montoAlquilerLetras: merged?.montoAlquilerLetras ?? '',
      actualizacion: merged?.actualizacion ?? '',
      indiceAjuste: merged?.indiceAjuste ?? '',
      multaXDia: merged?.multaXDia ?? '',
      destino: merged?.destino ?? '',
      tipoGarantia: merged?.tipoGarantia ?? '',

      aguaEmpresa: merged?.aguaEmpresa ?? '',
      aguaPorcentaje: merged?.aguaPorcentaje ?? '',
      luzEmpresa: merged?.luzEmpresa ?? '',
      luzPorcentaje: merged?.luzPorcentaje ?? '',
      gasEmpresa: merged?.gasEmpresa ?? '',
      gasPorcentaje: merged?.gasPorcentaje ?? '',
      municipalEmpresa: merged?.municipalEmpresa ?? '',
      municipalPorcentaje: merged?.municipalPorcentaje ?? '',

      comisionContratoPorc: merged?.comisionContratoPorc ?? '',
      comisionMensualPorc: merged?.comisionMensualPorc ?? '',
      garantesIds: null,
    });
  } catch (e) {
    // Fallback a los datos existentes en card si falla el fetch
    const fi = baseFi;
    const ff = baseFf;
    setRenovarDefaults({
      ...contrato,
      fecha_inicio: toDate(fi),
      fecha_fin: toDate(ff),
      duracion: contrato?.duracion ?? '',
      montoAlquiler: contrato?.montoAlquiler ?? contrato?.monto ?? '',
      montoAlquilerLetras: contrato?.montoAlquilerLetras ?? '',
      actualizacion: contrato?.actualizacion ?? '',
      indiceAjuste: contrato?.indiceAjuste ?? '',
      multaXDia: contrato?.multaXDia ?? '',
      destino: contrato?.destino ?? '',
      tipoGarantia: contrato?.tipoGarantia ?? '',
      aguaEmpresa: contrato?.aguaEmpresa ?? '',
      aguaPorcentaje: contrato?.aguaPorcentaje ?? '',
      luzEmpresa: contrato?.luzEmpresa ?? '',
      luzPorcentaje: contrato?.luzPorcentaje ?? '',
      gasEmpresa: contrato?.gasEmpresa ?? '',
      gasPorcentaje: contrato?.gasPorcentaje ?? '',
      municipalEmpresa: contrato?.municipalEmpresa ?? '',
      municipalPorcentaje: contrato?.municipalPorcentaje ?? '',
      comisionContratoPorc: contrato?.comisionContratoPorc ?? '',
      comisionMensualPorc: contrato?.comisionMensualPorc ?? '',
      garantesIds: null,
    });
  } finally {
    setRenovarModalOpen(true);
  }
};

const closeRenovar = () => {
  setRenovarModalOpen(false);
  setRenovarContratoId(null);
  setRenovarDefaults({});
};

const onSaveRenovar = async (payload) => {
  try {
    if (!renovarContratoId) throw new Error("No hay contrato seleccionado");

    // tu backend usa JWT details, así que solo con cookies/headers ya está
    await http.post(
      `${import.meta.env.VITE_API_URL}/contrato/renovar/${renovarContratoId}`,
      payload
    );

    showSuccess("✅ Contrato renovado");
    closeRenovar();
    await fetchContratos(); // refresca cards
  } catch (e) {
    console.error(e);
    showError(e?.response?.data?.message || "No se pudo renovar el contrato");
  }
};


  const renderMobileView = (contratosFiltrados) => {
    const pageCount = Math.ceil(contratosFiltrados.length / contractsPerPage);
    const startIndex = currentPage * contractsPerPage;
    const endIndex = startIndex + contractsPerPage;
    const currentContratos = contratosFiltrados.slice(startIndex, endIndex);

    return (
      <Box sx={{ width: {xs:"90%",md:"100vw"}, mx: 'auto'}}>
        {currentContratos.map((contrato) => (
          <Card 
            key={contrato.id} 
            sx={{ 
              mb: 2.5, 
              borderRadius: 4,
              background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(47, 51, 88) 0%,rgb(12, 12, 33) 100%)' : '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'visible',
              position: 'relative',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 1,
                left: 0,
                right: 0,
                height: 10,
                background: getContratoEstadosTopBarBg(contrato),
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              }
            }}
          >
             <CardContent sx={{ p: 2.5 }}>
              <ClickAwayListener onClickAway={closeStagger}>
                <Box sx={{ position: 'absolute', top: 16, right: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Tooltip title="Editar contrato" placement="left">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContract(contrato);
                    }}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Más opciones" placement="left">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStagger(contrato?.id);
                    }}
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {getStaggerActions(contrato).map((action, idx) => (
                  <Slide
                    key={action.key}
                    direction="down"
                    in={!!staggerOpen?.[contrato?.id]}
                    mountOnEnter
                    unmountOnExit
                    timeout={200 + idx * 60}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title={action.title} placement="left">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                          sx={action.sx}
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Slide>
                ))}
                </Box>
              </ClickAwayListener>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ color: theme.palette.mode === 'dark' ? '#bebebeff' : '#1F2C61', mr: 1.5 }} />
                <Typography variant="h6" sx={{ 
                 fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
                 fontFamily:'Poppins, sans-serif',
                 color:  theme.palette.mode === 'dark' ? '#b4b4b4ff' : '#1F2C61',
                 }}>
                  {contrato.nombreContrato}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Dirección:</span> {(
                  typeof contrato?.propiedad === 'string'
                    ? contrato?.propiedad
                    : (contrato?.propiedad?.direccion || 'No especificada')
                )}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Propietario:</span> {(
                  typeof contrato?.propietario === 'string'
                    ? contrato?.propietario
                    : `${contrato?.propietario?.nombre ?? ''} ${contrato?.propietario?.apellido ?? ''}`.trim()
                )}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Inquilino:</span> {(
                  typeof contrato?.inquilino === 'string'
                    ? contrato?.inquilino
                    : `${contrato?.inquilino?.nombre ?? ''} ${contrato?.inquilino?.apellido ?? ''}`.trim()
                )}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1.5, fontFamily:'Roboto, sans-serif'}}>
                <span style={{ fontWeight: 500 }}>Monto:</span> ${contrato.montoAlquiler?.toLocaleString() || '0'}
              </Typography>

      
              
              <Box sx={{ display: 'flex', mt: 2, justifyContent: 'center', gap: 2 }}>
                <Tooltip title="Ver detalles" placement="top">
                  <IconButton 
                    onClick={() => handleOpenDetailModal(contrato)}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #1F2C61', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(132, 63, 181) 0%,rgb(38, 53, 185) 100%)' : 'rgba(31, 44, 97, 0.29)',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' } 
                    }}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Generar contrato" placement="top">
                      <IconButton 
                        onClick={() => handleSelectContrato(contrato)}
                        sx={{ 
                          color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #C22961', 
                          background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(225, 185, 9) 0%,rgb(185, 38, 38) 100%)' : 'rgba(194, 41, 97, 0.34)',
                          '&:hover': { bgcolor: 'rgba(194, 41, 97, 0.12)' } 
                        }}
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                
                <Tooltip title="Ver recibos" placement="top">
                  <IconButton 
                    onClick={() => {
                      if (contrato && contrato.id) {
                        navigate(`/recibos-page/${contrato.id}`);
                      } else {
                        showError('No se puede acceder a los recibos de este contrato');
                      }
                    }}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #4CAF50', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(31, 200, 39) 0%,rgb(18, 119, 102) 100%)' : 'rgba(76, 175, 79, 0.3)',
                      '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.12)' } 
                    }}
                  >
                    <ReceiptIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Eliminar contrato" placement="top">
                  <IconButton 
                    onClick={() => handleDeleteClick(contrato.id)}
                    sx={{ 
                      color:  theme.palette.mode === 'dark' ? 'rgb(241, 241, 241)' :  ' #FF5252', 
                      background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,rgb(242, 42, 42) 0%,rgb(136, 25, 25) 100%)' : 'rgba(255, 82, 82, 0.31)',
                      '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.12)' } 
                    }}
                  >
                    <DeleteForeverIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 5 }}>
            <Pagination 
              count={pageCount} 
              page={currentPage + 1}
              onChange={(_, page) => setCurrentPage(page - 1)}
              color="primary"
              siblingCount={0}
              boundaryCount={0}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
                mb: '5rem'
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderDesktopView = (contratosFiltrados) => {
    const pageCount = Math.ceil(contratosFiltrados.length / contractsPerPage);
    const startIndex = currentPage * contractsPerPage;
    const endIndex = startIndex + contractsPerPage;
    const currentContratos = contratosFiltrados.slice(startIndex, endIndex);

    return (
      <Box sx={{ width: { xs: '95%', md: '90%' }, mx: 'auto', padding:{xs:"0",md:"1rem"}}}>
        <Grid2 container spacing={2} sx={{ 
          display: 'flex', 
          justifyContent: "flex-start",
          alignItems:"center",
          paddingLeft:"3.5rem"
        }}>
          {currentContratos.map((contrato) => (
            <Grid2 item  key={contrato.id} sx={{ 
              display: 'flex',
              justifyContent: 'center',
              width: {xs:"100%",sm:"45%",md:"45%",},
              alignItems: 'center',
            }}>
              <Card 
                sx={{ 
                  height: '24rem', 
                  width: {xs:"100%",sm:"90%",md:"100%",},
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'visible',
                  position: 'relative',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 1,
                    left: 0,
                    right: 0,
                    height: 10,
                    background: getContratoEstadosTopBarBg(contrato),
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    pointerEvents: 'none',
                  },
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                 <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <ClickAwayListener onClickAway={closeStagger}>
                    <Box sx={{ position: 'absolute', top: 16, right: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Tooltip title="Editar contrato" placement="left">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditContract(contrato);
                        }}
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.04)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Más opciones" placement="left">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStagger(contrato?.id);
                        }}
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.04)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {getStaggerActions(contrato).map((action, idx) => (
                      <Slide
                        key={action.key}
                        direction="down"
                        in={!!staggerOpen?.[contrato?.id]}
                        mountOnEnter
                        unmountOnExit
                        timeout={200 + idx * 60}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title={action.title} placement="left">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                              }}
                              sx={action.sx}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Slide>
                    ))}
                    </Box>
                  </ClickAwayListener>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HomeIcon sx={{ color: theme.palette.mode === 'dark' ? '#bebebeff' : '#1F2C61', mr: 1.5 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
                        color: theme.palette.mode === 'dark' ? '#b4b4b4ff' : '#1F2C61'
                      }}
                    >
                      {contrato.nombreContrato}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Dirección:</span> {(
                        typeof contrato?.propiedad === 'string'
                          ? contrato?.propiedad
                          : (contrato?.propiedad?.direccion || 'No especificada')
                      )}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Propietario:</span> {(
                        typeof contrato?.propietario === 'string'
                          ? contrato?.propietario
                          : `${contrato?.propietario?.nombre ?? ''} ${contrato?.propietario?.apellido ?? ''}`.trim()
                      )}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Inquilino:</span> {(
                        typeof contrato?.inquilino === 'string'
                          ? contrato?.inquilino
                          : `${contrato?.inquilino?.nombre ?? ''} ${contrato?.inquilino?.apellido ?? ''}`.trim()
                      )}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>Monto:</span> ${contrato?.montoAlquiler || '0'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Fab
                      variant="extended"
                      startIcon={<PreviewIcon  sx={{ fontSize: 16, mr: 0.5 }}/>}
                      onClick={() => handleOpenDetailModal(contrato)}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#1F2C61',
                        color: '#f1f1f1ff',
                        backgroundColor: 'rgba(10, 28, 102, 1)',
                        '&:hover': {
                          borderColor: '#1F2C61',
                          backgroundColor: 'rgba(20, 6, 111, 1)'
                        },
                          minHeight: 28,
                          height: 28,
                          px: 1,
                          py: 0,
                          boxShadow: 'none',
                          textTransform: 'none',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          width:"100%"
                        }}
                    >
                      Ver detalles
                    </Fab>
                  </Box>

           
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="Generar contrato" placement="top">
                      <Fab  variant='extended'
                        onClick={() => handleSelectContrato(contrato)}
                        sx={{ 
                          color: '#C22961', 
                          bgcolor: 'rgba(194, 41, 97, 0.08)',
                          '&:hover': { bgcolor: 'rgba(194, 41, 97, 0.12)' },
                          
                          minHeight: 28,
                          height: 28,
                          px: 1,
                          py: 0,
                          boxShadow: 'none',
                          textTransform: 'none',
                          gap: 0.5
                        }}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 16, mr: 0.5 }}/>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Generar contrato</Typography>
                      </Fab>
                    </Tooltip>
                    
                    <Tooltip title="Ver recibos" placement="top">
                      <Fab variant="extended" size="small"
                        onClick={() => {
                          if (contrato && contrato.id) {
                            navigate(`/recibos-page/${contrato.id}`);
                          } else {
                            showError('No se puede acceder a los recibos de este contrato');
                          }
                        }}
                        sx={{ 
                          color: '#4CAF50', 
                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                          '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.12)' },
                          minHeight: 28,
                          height: 28,
                          px: 1,
                          py: 0,
                          boxShadow: 'none',
                          textTransform: 'none',
                          gap: 0.5
                        }}
                      >
                       
                        <ReceiptIcon sx={{ fontSize: 16, mr: 0.5 }} />
                         <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Ver recibos</Typography>
                      </Fab>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar contrato" placement="top">
                      <Fab  variant="extended" size="small"
                        onClick={() => handleDeleteClick(contrato.id)}
                        sx={{ 
                          color: '#FF5252', 
                          bgcolor: 'rgba(255, 82, 82, 0.08)',
                          '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.12)' } ,
                            minHeight: 28,
                          height: 28,
                          px: 1,
                          py: 0,
                          boxShadow: 'none',
                          textTransform: 'none',
                          gap: 0.5
                        }}
                      >
                        <DeleteForeverIcon  sx={{ fontSize: 16, mr: 0.5 }}/>
                         <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Eliminar contrato</Typography>
                      </Fab>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
        
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 5 }}>
            <Pagination 
              count={pageCount} 
              page={currentPage + 1}
              onChange={(_, page) => setCurrentPage(page - 1)}
              color="primary"
              siblingCount={0}
              boundaryCount={0}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                },
                mb: '5rem'
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderSearchBar = () => (
    <Box sx={{ 
      width: { xs: '90%', md: '100%' }, 
      mx: 'auto', 
      alignItems: "center",
      mb: 4,
      px: { xs: 0, md: 0 }
    }}>
      <TextField
        variant="outlined"
        placeholder="Buscar por contrato, propietario, inquilino o propiedad..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  const renderDetailModal = () => {
    if (!selectedContract) return null;
    
    return (
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: '#1F2C61',
          color: 'white'
        }}>
          <Typography variant="h6" component="div">
            {selectedContract.nombreContrato}
          </Typography>
          <IconButton 
            onClick={handleCloseDetailModal}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        
         <ModalContract
          selectedContract={selectedContract}
          setSelectedContract={setSelectedContract}
          setContratos={setContratos}
          handleCloseDetailModal={handleCloseDetailModal}
          detailModalOpen={detailModalOpen}
          handleWhatsAppClick={handleWhatsAppClick}
          handleEmailClick={handleEmailClick}
          handleGenerateReceipt={handleGenerateReceipt}
          contractNote={contractNote}
          setContractNote={setContractNote}
          handleSaveNote={handleSaveNote}
        />
      </Dialog>
    );
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: { xs: '100%', md: '80vw', sm:"100%" },
        ml: { md: '14rem' },
        pt: { xs: 3, sm: 4 },
      }}
    >
      <ContractsTour />
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: { xs: '95%', md: '80%', sm:"80%" },
        mx: 'auto',
        mt: { xs: 5, md: 4 },
        mb: { xs: 3, md: 3 },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5  }}>
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
            data-tour="contracts-title"
            variant="h5" 
            sx={{
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            Contratos
          </Typography>
        </Box>

        <Tooltip title="Nuevo Contrato" placement="bottom">
          <Fab
            color="primary"
            size="small"
            aria-label="add"
            data-tour="contracts-add"
            onClick={() => navigate('/contratos/crear')}
            sx={{
              boxShadow: theme.shadows[1],
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
                boxShadow: theme.shadows[3]
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip> 
      </Box>

      {loading ? (
        <>
          <Box sx={{ 
            width: { xs: "90%", md: "80%" }, 
            mx: "auto",
            mb: 3
          }}>
            <TextField
              data-tour="contracts-search"
              fullWidth
              variant="outlined"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)'
                  }
                }
              }}
            />
          </Box>

          <Box
            sx={{
              width: { xs: '90%', md: '80%' },
              mx: 'auto',
              mb: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} variant="rounded" width={110} height={28} sx={{ borderRadius: 2 }} />
            ))}
            <Box sx={{ ml: 'auto' }}>
              <Skeleton variant="text" width={80} />
            </Box>
          </Box>

          {isMobile ? (
            <Box sx={{ width: { xs: '90%', md: '100vw' }, mx: 'auto' }}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card
                  key={idx}
                  sx={{
                    mb: 2.5,
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg,rgb(47, 51, 88) 0%,rgb(12, 12, 33) 100%)'
                      : '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    overflow: 'visible',
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="85%" />
                    <Skeleton variant="text" width="55%" />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ width: { xs: '95%', md: '90%' }, mx: 'auto', padding: { xs: '0', md: '1rem' } }}>
              <Grid2
                container
                spacing={2}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingLeft: '3.5rem'
                }}
              >
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Grid2
                    item
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: { xs: '100%', sm: '45%', md: '45%' },
                      alignItems: 'center',
                    }}
                  >
                    <Card
                      sx={{
                        height: '24rem',
                        width: { xs: '100%', sm: '90%', md: '100%' },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        overflow: 'visible',
                        position: 'relative',
                      }}
                    >
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Skeleton variant="text" width="55%" />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="45%" />
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Skeleton variant="rounded" width={96} height={28} sx={{ borderRadius: 2 }} />
                          <Skeleton variant="rounded" width={96} height={28} sx={{ borderRadius: 2 }} />
                          <Skeleton variant="rounded" width={96} height={28} sx={{ borderRadius: 2 }} />
                        </Box>
                        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                          <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 2 }} />
                          <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 2 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          )}
        </>
      ) : error ? (
        <Box sx={{ 
          bgcolor: theme.palette.error.main, 
          p: 3, 
          borderRadius: 2,
          mt: 3,
          mx: "auto",
          width: { xs: "90%", md: "80%" },
          textAlign: 'center'
        }}>
          <Typography color="error">
            Error al cargar los contratos: {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            width: { xs: "90%", md: "80%" }, 
            mx: "auto",
            mb: 3
          }}>
            <TextField
              data-tour="contracts-search"
              fullWidth
              variant="outlined"
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 69,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)'
                  }
                }
              }}
            />
          </Box>

          <Box
            sx={{
              width: { xs: '90%', md: '80%' },
              mx: 'auto',
              mb: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            {['ACTIVO', 'RENOVADO', 'FINALIZADO', 'ARCHIVADO'].map((estado) => {
              const selected = estadoFilter === estado;
              const baseColor = getEstadoColor(estado);
              return (
                <Chip
                  key={estado}
                  clickable
                  onClick={() => setEstadoFilter((prev) => (prev === estado ? null : estado))}
                  label={`${estado.charAt(0) + estado.slice(1).toLowerCase()} (${estadoCounts[estado]})`}
                  sx={{
                    borderColor: baseColor,
                    color: selected ? '#fff' : baseColor,
                    bgcolor: selected ? baseColor : 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    '&:hover': {
                      bgcolor: selected ? baseColor : toAlphaHex(baseColor, '22'),
                    },
                  }}
                  size="small"
                />
              );
            })}

            <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary' }}>
              Total: {contratosFiltrados.length}
            </Typography>
          </Box>

          {contratosFiltrados.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 4,
              color: 'text.secondary',
            }}>
              <Typography>No se encontraron contratos</Typography>
            </Box>
          ) : (
            <>
              {/* Renderizar modales globalmente */}
              {renderDetailModal()}
              <EditContratoModal
                open={editModalOpen}
                defaultValues={editDefaults}
                onClose={handleCloseEditModal}
                onSave={handleSaveEdit}
              />
              {selectedContract && (
                <TextEditor
                  contrato={selectedContract}
                  isOpen={editorOpen}
                  onClose={handleCloseEditor}
                  onSaved={handleEditorSaved}
                />
              )}
              {selectedContract && (
                <EditorWithChatModal
                  open={editorChatOpen}
                  onClose={() => setEditorChatOpen(false)}
                  contrato={selectedContract}
                  onSaved={handleEditorSaved}
                />
              )}

              <RenovarContratoModal
                open={renovarModalOpen}
                onClose={closeRenovar}
                defaultValues={renovarDefaults}
                onSave={onSaveRenovar}
                garantesOptions={garantesOptions}
              />
              
              {isMobile ? (
                <>
                  {renderMobileView(contratosFiltrados)}
                  {/* Mobile pagination anchor */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }} data-tour="contracts-pagination" />
                </>
              ) : (
                <>
                  {renderDesktopView(contratosFiltrados)}
                  {/* Desktop pagination anchor */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }} data-tour="contracts-pagination" />
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ContratosPage;
