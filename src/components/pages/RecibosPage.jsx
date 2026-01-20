import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Box, Typography, IconButton, CircularProgress, Tooltip, useTheme, Modal, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WaterIcon from '@mui/icons-material/Water';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaymentsIcon from '@mui/icons-material/Payments';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalAuth';
import RecibosGeneradosSection from './pagesForm/RecibosGeneradosSection';
import DeleteIcon from '@mui/icons-material/Delete';
import { showSuccess } from '../alertas/showAlert';
import Swal from 'sweetalert2';
const RecibosPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, usuarioFetch } = useAuth();
  const theme = useTheme();

  const [contrato, setContrato] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [filteredRecibos, setFilteredRecibos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');
  const [reciboModalOpen, setReciboModalOpen] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState({});

  // Utils
const formatFecha = (fecha) => {
  // Caso LocalDate de Java → [yyyy, mm, dd]
  if (Array.isArray(fecha) && fecha.length >= 3) {
    const [y, m, d] = fecha;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }

  // Caso string yyyy-mm-dd
  if (typeof fecha === 'string' && fecha.includes('-')) {
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

  return 'N/A';
};

  const getTipoImpuestoIcon = (tipo) => {
    switch (tipo) {
      case 'AGUA': return <WaterIcon />;
      case 'GAS': return <LocalFireDepartmentIcon />;
      case 'LUZ': return <BoltIcon />;
      case 'MUNICIPAL': return <AccountBalanceIcon />;
      case 'DEUDA_PENDIENTE': return <MoneyOffIcon />;
      case 'EXP_ORD': return <PaymentsIcon />;
      case 'EXP_EXT_ORD': return <PriceChangeIcon />;
      default: return null;
    }
  };

  // Fetch contrato
  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/buscar/${id}`, {
          headers: { Authorization: `Bearer ${token ?? localStorage.getItem('token') ?? ''}` }
        });
        const data = res.data?.data || res.data;
        setContrato(data);
      } catch (e) {
        setError('No se pudo cargar el contrato');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchContrato();
  }, [id, token]);

  // Fetch recibos para el contrato
  const fetchRecibos = useCallback(async () => {
    if (!id) return;
    setError(null);
    setIsLoading(true);
    try {
      const authHeaders = { headers: { Authorization: `Bearer ${token ?? localStorage.getItem('token') ?? ''}` } };
      let data = [];
      try {
        const r = await axios.get(`${import.meta.env.VITE_API_URL}/recibo/por-contrato/${id}`, authHeaders);
        data = Array.isArray(r.data) ? r.data : (Array.isArray(r.data?.data) ? r.data.data : []);
      } catch (err) {
        const rAll = await axios.get(`${import.meta.env.VITE_API_URL}/recibo/all`, authHeaders);
        const all = Array.isArray(rAll.data) ? rAll.data : (Array.isArray(rAll.data?.data) ? rAll.data.data : []);
        data = all.filter(rec => Number(rec?.contrato?.id ?? rec?.idContrato ?? rec?.contratoId) === Number(id));
      }
      // Normalizar
      const normalizados = data.map(rec => ({
        id: rec.id || 0,
        numeroRecibo: rec.numeroRecibo || rec.id || 0,
        fechaEmision: Array.isArray(rec.fechaEmision)
          ? `${rec.fechaEmision[0]}-${String(rec.fechaEmision[1]).padStart(2, '0')}-${String(rec.fechaEmision[2]).padStart(2, '0')}`
          : rec.fechaEmision || new Date().toISOString(),
        fechaVencimiento: Array.isArray(rec.fechaVencimiento)
          ? `${rec.fechaVencimiento[0]}-${String(rec.fechaVencimiento[1]).padStart(2, '0')}-${String(rec.fechaVencimiento[2]).padStart(2, '0')}`
          : rec.fechaVencimiento || new Date().toISOString(),
        periodo: rec.periodo || 'No especificado',
        concepto: rec.concepto || 'No especificado',
        montoTotal: parseFloat(rec.montoTotal || 0),
        estado: rec.estado === undefined ? false : rec.estado,
        impuestos: Array.isArray(rec.impuestos) ? rec.impuestos : [],
        contrato: rec.contrato || {},
        idContrato: rec.idContrato || rec.contratoId || rec.contrato?.id || Number(id),
        nombreContrato: rec.nombreContrato || ''
      }));
      setRecibos(normalizados);
    } catch (e) {
      setError('Error al cargar los recibos');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchRecibos();
  }, [fetchRecibos]);

  // Filtro local
  useEffect(() => {
    if (filtro === 'todos') setFilteredRecibos(recibos);
    else if (filtro === 'pagados') setFilteredRecibos(recibos.filter(r => r.estado === true));
    else if (filtro === 'pendientes') setFilteredRecibos(recibos.filter(r => r.estado === false));
  }, [filtro, recibos]);

  const handleUpdateEstado = async (recibo) => {
    try {
      if (!recibo || !recibo.id) return;
      setUpdatingEstado(prev => ({ ...prev, [recibo.id]: true }));
      const nuevoEstado = !recibo.estado;
      await axios.put(`${import.meta.env.VITE_API_URL}/recibo/estado`, { id: recibo.id, estado: nuevoEstado }, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? localStorage.getItem('token') ?? ''}` }
      });
      setRecibos(prev => prev.map(r => r.id === recibo.id ? { ...r, estado: nuevoEstado } : r));
    } catch (e) {
      // noop minimal: podríamos mostrar alerta si se desea
    } finally {
      setUpdatingEstado(prev => {
        const { [recibo.id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleOpenReciboModal = (recibo) => {
    setSelectedRecibo(recibo);
    setReciboModalOpen(true);
  };
  const handleCloseReciboModal = () => {
    setReciboModalOpen(false);
    setSelectedRecibo(null);
  };

  const handleDeleteRecibo = async () => {
    if (!selectedRecibo || !selectedRecibo.id) return;
    try {
      setIsDeleting(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/recibo/${selectedRecibo.id}` , {
        headers: { Authorization: `Bearer ${token ?? localStorage.getItem('token') ?? ''}` }
      });
      setRecibos(prev => prev.filter(r => r.id !== selectedRecibo.id));
      showSuccess('Recibo eliminado correctamente');
    } catch (_) {
      // opcional: manejar error de eliminación
    } finally {
      setIsDeleting(false);
      handleCloseReciboModal();
    }
  };

  // Gestos: deslizar hacia abajo para cerrar el detalle
  const handleTouchStart = (e) => {
    if (!reciboModalOpen) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    setDragStartY(t.clientY);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (dragStartY == null) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const dy = t.clientY - dragStartY;
    if (dy > 0) {
      setIsDragging(true);
      setDragOffset(dy);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) {
      setDragStartY(null);
      setDragOffset(0);
      return;
    }
    const threshold = 120; // px para cerrar
    if (dragOffset > threshold) {
      handleCloseReciboModal();
    }
    setDragStartY(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  // Gestos con mouse (desktop)
  const handleMouseDown = (e) => {
    if (!reciboModalOpen || e.button !== 0) return; // solo botón principal
    setDragStartY(e.clientY);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseMove = (e) => {
    if (dragStartY == null) return;
    const dy = e.clientY - dragStartY;
    if (dy > 0) {
      setIsDragging(true);
      setDragOffset(dy);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      setDragStartY(null);
      setDragOffset(0);
      return;
    }
    const threshold = 120;
    if (dragOffset > threshold) {
      handleCloseReciboModal();
    }
    setDragStartY(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleDownloadPDF = async (recibo, event) => {
    if (event && event.target && event.target.closest && event.target.closest('.estado-chip')) return;

    // Normalizar datos como en ReciboForm
    const reciboNormalizado = {
      id: recibo.id || 0,
      numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
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
      impuestos: Array.isArray(recibo.impuestos)
        ? recibo.impuestos.map(imp => ({
            id: imp.id || 0,
            tipoImpuesto: imp.tipoImpuesto || 'Otro',
            montoAPagar: parseFloat(imp.montoAPagar || 0),
            estadoPago: imp.estadoPago === undefined ? false : imp.estadoPago,
            porcentaje: parseFloat(imp.porcentaje || 0),
          }))
        : [],
      contrato: recibo.contrato || contrato || {},
    };

    // Utilidades de color como en ReciboForm
    const primaryColor = theme.palette.primary.main;
    const secondaryColor = theme.palette.text.secondary;
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };
    const primaryRgb = hexToRgb(primaryColor);

    const doc = new jsPDF();

    // Cabecera estilo ReciboForm
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGO', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${usuarioFetch?.nombreNegocio || ''}${usuarioFetch?.matricula ? ` - COL: ${usuarioFetch.matricula}` : ''}`, 105, 22, { align: 'center' });

    // Logo (si existe). Si el logo es URL externa, puede requerir dataURL; mantenemos misma intención que ReciboForm
    const logo = usuarioFetch?.logo;
    if (logo) {
      try { doc.addImage(logo, 'PNG', 20, 32, 30, 30); } catch (_) {}
    }

    // Información de la empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    if (usuarioFetch?.nombreNegocio) doc.text(`${usuarioFetch.nombreNegocio}`, 55, 45);
    doc.setFont('helvetica', 'normal');
    if (usuarioFetch?.razonSocial || usuarioFetch?.localidad) doc.text(`${usuarioFetch?.razonSocial || ''}, ${usuarioFetch?.localidad || ''}`, 55, 50);
    if (usuarioFetch?.partido || usuarioFetch?.provincia) doc.text(`${usuarioFetch?.partido || ''}, ${usuarioFetch?.provincia || ''}`, 55, 55);

    // Separador
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);

    // Caja principal de datos del recibo
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, 70, 170, 30, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recibo N°: ${reciboNormalizado.numeroRecibo}`, 25, 80);
    doc.text(`Fecha de Emisión: ${formatFecha(reciboNormalizado.fechaEmision)}`, 25, 90);

    // Estado del pago
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

    // Secciones siguientes (información de inquilino/propiedad/propietario)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL INQUILINO', 20, 110);
    doc.setLineWidth(0.2);
    doc.line(20, 117, 100, 117);
    doc.setFont('helvetica', 'normal');
    const inq = reciboNormalizado.contrato?.inquilino || {};
    const prop = reciboNormalizado.contrato?.propiedad || {};
    const due = reciboNormalizado.contrato?.propietario || {};
    doc.text(`Inquilino: ${(contrato?.inquilino?.nombre || '') + ' ' + (contrato?.inquilino?.apellido || '') || 'N/A'}`, 20, 125);
    doc.text(`DNI: ${contrato?.inquilino?.dni || 'N/A'}`, 20, 132);
    doc.text(`Propiedad: ${contrato?.propiedad?.direccion || 'N/A'}`, 20, 139);
    doc.text(`Localidad: ${contrato?.propiedad?.localidad || 'N/A'}, ${contrato?.propiedad?.partido || ''}`, 20, 146);

    doc.text(`Propietario: ${(contrato?.propietario?.nombre || '') + ' ' + (contrato?.propietario?.apellido || '') || 'N/A'}`, 130, 125);
    doc.text(`DNI: ${contrato?.propietario?.dni || 'N/A'}`, 130, 132);

    // Detalle de pago básico (alineado al diseño)
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DEL PAGO', 20, 160);
    doc.setLineWidth(0.2);
    doc.line(20, 162, 80, 162);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reciboNormalizado.periodo || 'N/A'}`, 20, 170);
    doc.text(`${reciboNormalizado.concepto || 'N/A'}`, 20, 177, { maxWidth: 165, align: 'left' });

    // Importe principal
    const baseMonto = isNaN(reciboNormalizado.montoTotal) ? 0 : reciboNormalizado.montoTotal;
    let y = 190;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 25, y + 5);
    doc.text('Importe', 160, y + 5, { align: 'right' });
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.text('Alquiler base', 25, y);
    doc.text(`$${baseMonto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y, { align: 'right' });

    // Impuestos con porcentaje aplicado (como en ReciboForm)
    let totalImpuestosCalculados = 0;
    if (reciboNormalizado.impuestos && reciboNormalizado.impuestos.length > 0) {
      reciboNormalizado.impuestos.forEach((impuesto) => {
        y += 8;
        // salto de página simple si se pasa del margen inferior
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const porcentaje = parseFloat(impuesto.porcentaje) || 0;
        const montoCalculado = impuesto.montoAPagar;
        totalImpuestosCalculados += montoCalculado;

        const etiqueta = `${impuesto.tipoImpuesto || 'Impuesto'}${porcentaje ? ` (${porcentaje}%)` : ''}`;
        doc.text(etiqueta, 25, y);
        doc.text(
          `$${montoCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          160,
          y,
          { align: 'right' }
        );
      });
    }

    // Total a pagar
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, 190, y);
    y += 8;
    const totalAPagar = baseMonto + totalImpuestosCalculados;
    doc.setFont('helvetica', 'bold');
    doc.text('Total a pagar', 25, y);
    doc.text(
      `$${totalAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      160,
      y,
      { align: 'right' }
    );

    // Descarga directa
const rawFilename = `${usuarioFetch?.nombreNegocio || 'Tuinmo'}-Recibo_${(contrato?.propietario?.apellido || '') + ' ' + (contrato?.inquilino?.apellido || '')}_${reciboNormalizado.periodo || 'Sin_Periodo'}.pdf`;

const filename = rawFilename
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca acentos
  .replace(/[^\w\-(). ]+/g, '')                    // saca caracteres raros
  .replace(/\s+/g, '_');                           // espacios -> _

Swal.fire({
  title: 'Generando PDF...',
  text: 'Preparando recibo',
  allowOutsideClick: false,
  didOpen: () => Swal.showLoading(),
});

try {
  // ✅ SIEMPRE generar Blob (lo más confiable en PWA/mobile)
  const blob = doc.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });

  // ✅ Mejor experiencia en mobile: "Abrir con..." / "Compartir"
  const canShareFiles =
    !!navigator.canShare && navigator.canShare({ files: [file] }) && !!navigator.share;

  if (canShareFiles) {
    await navigator.share({
      files: [file],
      title: 'Recibo',
      text: 'Te comparto el recibo en PDF',
    });
  } else {
    // ✅ fallback: abrir visor PDF (PWA/mobile suele mostrar opciones ahí)
    const url = URL.createObjectURL(blob);

    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator.standalone; // iOS

    if (isStandalone) {
      window.open(url, '_blank');
    } else {
      // desktop: descarga directa
      doc.save(filename);
    }

    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
} finally {
  Swal.close();
}

  };

  const handleDownloadPDFDirect = async (recibo, event) => {
    if (event && event.target && event.target.closest && event.target.closest('.estado-chip')) return;

    // Normalizar datos como en ReciboForm
    const reciboNormalizado = {
      id: recibo.id || 0,
      numeroRecibo: recibo.numeroRecibo || recibo.id || 0,
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
      impuestos: Array.isArray(recibo.impuestos)
        ? recibo.impuestos.map(imp => ({
            id: imp.id || 0,
            tipoImpuesto: imp.tipoImpuesto || 'Otro',
            montoAPagar: parseFloat(imp.montoAPagar || 0),
            estadoPago: imp.estadoPago === undefined ? false : imp.estadoPago,
            porcentaje: parseFloat(imp.porcentaje || 0),
          }))
        : [],
      contrato: recibo.contrato || contrato || {},
    };

    // Utilidades de color como en ReciboForm
    const primaryColor = theme.palette.primary.main;
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };
    const primaryRgb = hexToRgb(primaryColor);

    const doc = new jsPDF();

    // Cabecera estilo ReciboForm
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGO', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${usuarioFetch?.nombreNegocio || ''}${usuarioFetch?.matricula ? ` - COL: ${usuarioFetch.matricula}` : ''}`, 105, 22, { align: 'center' });

    const logo = usuarioFetch?.logo;
    if (logo) {
      try { doc.addImage(logo, 'PNG', 20, 32, 30, 30); } catch (_) {}
    }

    // Información de la empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    if (usuarioFetch?.nombreNegocio) doc.text(`${usuarioFetch.nombreNegocio}`, 55, 45);
    doc.setFont('helvetica', 'normal');
    if (usuarioFetch?.razonSocial || usuarioFetch?.localidad) doc.text(`${usuarioFetch?.razonSocial || ''}, ${usuarioFetch?.localidad || ''}`, 55, 50);
    if (usuarioFetch?.partido || usuarioFetch?.provincia) doc.text(`${usuarioFetch?.partido || ''}, ${usuarioFetch?.provincia || ''}`, 55, 55);

    // Separador
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);

    // Caja principal de datos del recibo
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, 70, 170, 30, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recibo N°: ${reciboNormalizado.numeroRecibo}`, 25, 80);
    doc.text(`Fecha de Emisión: ${formatFecha(reciboNormalizado.fechaEmision)}`, 25, 90);

    // Estado del pago
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

    // Secciones siguientes (información de inquilino/propiedad/propietario)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL INQUILINO', 20, 110);
    doc.setLineWidth(0.2);
    doc.line(20, 117, 100, 117);
    doc.setFont('helvetica', 'normal');
    doc.text(`Inquilino: ${(contrato?.inquilino?.nombre || '') + ' ' + (contrato?.inquilino?.apellido || '') || 'N/A'}`, 20, 125);
    doc.text(`DNI: ${contrato?.inquilino?.dni || 'N/A'}`, 20, 132);
    doc.text(`Propiedad: ${contrato?.propiedad?.direccion || 'N/A'}`, 20, 139);
    doc.text(`Localidad: ${contrato?.propiedad?.localidad || 'N/A'}, ${contrato?.propiedad?.partido || ''}`, 20, 146);

    doc.text(`Propietario: ${(contrato?.propietario?.nombre || '') + ' ' + (contrato?.propietario?.apellido || '') || 'N/A'}`, 130, 125);
    doc.text(`DNI: ${contrato?.propietario?.dni || 'N/A'}`, 130, 132);

    // Detalle de pago básico (alineado al diseño)
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DEL PAGO', 20, 160);
    doc.setLineWidth(0.2);
    doc.line(20, 162, 80, 162);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reciboNormalizado.periodo || 'N/A'}`, 20, 170);
    doc.text(`${reciboNormalizado.concepto || 'N/A'}`, 20, 177, { maxWidth: 165, align: 'left' });

    const baseMonto = isNaN(reciboNormalizado.montoTotal) ? 0 : reciboNormalizado.montoTotal;
    let y = 190;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 25, y + 5);
    doc.text('Importe', 160, y + 5, { align: 'right' });
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.text('Alquiler base', 25, y);
    doc.text(`$${baseMonto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y, { align: 'right' });

    let totalImpuestosCalculados = 0;
    if (reciboNormalizado.impuestos && reciboNormalizado.impuestos.length > 0) {
      reciboNormalizado.impuestos.forEach((impuesto) => {
        y += 8;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const porcentaje = parseFloat(impuesto.porcentaje) || 0;
        const montoCalculado = impuesto.montoAPagar;
        totalImpuestosCalculados += montoCalculado;

        const etiqueta = `${impuesto.tipoImpuesto || 'Impuesto'}${porcentaje ? ` (${porcentaje}%)` : ''}`;
        doc.text(etiqueta, 25, y);
        doc.text(
          `$${montoCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          160,
          y,
          { align: 'right' }
        );
      });
    }

    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, 190, y);
    y += 8;
    const totalAPagar = baseMonto + totalImpuestosCalculados;
    doc.setFont('helvetica', 'bold');
    doc.text('Total a pagar', 25, y);
    doc.text(
      `$${totalAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      160,
      y,
      { align: 'right' }
    );

    const rawFilename = `${usuarioFetch?.nombreNegocio || 'Tuinmo'}-Recibo_${(contrato?.propietario?.apellido || '') + ' ' + (contrato?.inquilino?.apellido || '')}_${reciboNormalizado.periodo || 'Sin_Periodo'}.pdf`;
    const filename = rawFilename
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\-(). ]+/g, '')
      .replace(/\s+/g, '_');

    Swal.fire({
      title: 'Generando PDF...',
      text: 'Preparando recibo',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally {
      Swal.close();
    }
  };

  return (
    <Box sx={{ width: { xs: '95%', sm: '100%', md: '84vw' }, maxWidth: '100vw', mx: { xs: 'auto', md: 0 }, overflowX: 'hidden', marginLeft: { md: '15rem' } }}>
  
   

      {(isLoading && !contrato) ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 , justifyContent: 'center'}}>
          <CircularProgress size={24} />
          <Typography>Cargando...</Typography>
        </Box>
      ) : (
        <RecibosGeneradosSection
          contrato={contrato}
          isLoading={isLoading}
          error={error}
          recibos={recibos}
          filteredRecibos={filteredRecibos}
          filtro={filtro}
          setFiltro={setFiltro}
          handleOpenReciboModal={handleOpenReciboModal}
          handleUpdateEstado={handleUpdateEstado}
          getTipoImpuestoIcon={getTipoImpuestoIcon}
          formatFecha={formatFecha}
          handleDownloadPDF={handleDownloadPDF}
          updatingEstado={updatingEstado}
         
        />
      )}
      {/* PDF Viewer Modal */}
      <Modal open={pdfViewerOpen} onClose={() => {
        if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
        setCurrentPdfUrl('');
        setPdfViewerOpen(false);
      }}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          width: { xs: '95vw', md: '80vw' },
          height: { xs: '85vh', md: '80vh' },
          boxShadow: 24,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{currentPdfTitle || 'Vista previa del recibo'}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (!currentPdfUrl) return;
                  const a = document.createElement('a');
                  a.href = currentPdfUrl;
                  a.download = currentPdfTitle || 'recibo.pdf';
                  a.click();
                }}
                sx={{ borderRadius: '25px' }}
              >
                Descargar
              </Button>
          
            </Box>
          </Box>
          <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {currentPdfUrl && (
              <iframe title="pdf-viewer" src={currentPdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
            )}
          </Box>
        </Box>
      </Modal>
      {/* Recibo Detail Dialog */}
      <Dialog
        open={reciboModalOpen}
        onClose={handleCloseReciboModal}
        fullScreen
        PaperProps={{
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
          sx: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '85%',
            borderTopLeftRadius: '25px',
            borderTopRightRadius: '25px',
            transform: `translateY(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            touchAction: 'none',
          }
        }}
      >
        <DialogTitle>
          Detalle del Recibo N°{selectedRecibo?.numeroRecibo || selectedRecibo?.id || ''}

          <IconButton
            aria-label="close"
            onClick={handleDeleteRecibo}
            disabled={isDeleting}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.error.main,
            }}
          >
            {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Fecha Emisión</Typography>
              <Typography>{selectedRecibo ? formatFecha(selectedRecibo.fechaEmision) : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Fecha Vencimiento</Typography>
              <Typography>{selectedRecibo ? formatFecha(selectedRecibo.fechaVencimiento) : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Periodo</Typography>
              <Typography>{selectedRecibo?.periodo || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Estado</Typography>
              <Chip
                icon={selectedRecibo?.estado ? <span /> : <span />}
                label={selectedRecibo?.estado ? 'Pagado' : 'Pendiente'}
                color={selectedRecibo?.estado ? 'success' : 'warning'}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Concepto</Typography>
              <Typography>{selectedRecibo?.concepto || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Impuestos</Typography>
              {selectedRecibo?.impuestos && selectedRecibo.impuestos.length > 0 ? (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedRecibo.impuestos.map((imp, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTipoImpuestoIcon(imp.tipoImpuesto)}
                        <Typography>{imp.tipoImpuesto}</Typography>
                        {imp.porcentaje ? (
                          <Chip size="small" label={`${imp.porcentaje}%`} />
                        ) : null}
                      </Box>
                      <Typography>
                        ${Number(imp.montoAPagar || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography>Sin impuestos</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Monto Total</Typography>
                {(() => {
                  const base = Number(selectedRecibo?.montoTotal || 0);
                  const impuestosTotal = Array.isArray(selectedRecibo?.impuestos)
                    ? selectedRecibo.impuestos.reduce((acc, imp) => {
                        const monto = parseFloat(imp?.montoAPagar || 0);
                        const porcentaje = parseFloat(imp?.porcentaje || 0);
                        const calculado = (porcentaje === 0 || porcentaje === 100)
                          ? monto
                          : monto * (porcentaje / 100);
                        return acc + calculado;
                      }, 0)
                    : 0;
                  const total = base + impuestosTotal;
                  return (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.93)' : '#273D97' }}>
                        ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      {impuestosTotal > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Impuestos: ${impuestosTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: 4 }}>
          <Button onClick={() => { if (selectedRecibo) handleDownloadPDF(selectedRecibo); }} variant="contained" sx={{borderRadius: '25px'}}>
            COMPARTIR PDF
          </Button>
          <Button onClick={() => { if (selectedRecibo) handleDownloadPDFDirect(selectedRecibo); }} variant="outlined" sx={{borderRadius: '25px'}}>
            DESCARGAR PDF
          </Button>
          <Button onClick={handleCloseReciboModal} variant="outlined" sx={{borderRadius: '25px', 
            color:(theme) => theme.palette.mode === 'dark' ? 'rgba(253, 253, 253, 0.93)' : '#181549ff',}}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

};

export default RecibosPage;

