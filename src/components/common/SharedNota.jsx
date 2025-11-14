import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

/**
 * SharedNota: Botón para compartir una nota con el inquilino o propietario del contrato.
 * Props:
 * - contrato: objeto con info del contrato (debe tener info de propietario e inquilino)
 * - nota: objeto de la nota a compartir
 * - onShare: función callback (opcional) que recibe (destino, nota, contrato)
 */
const SharedNota = ({ contrato, nota, onShare, info }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const buildMessage = (persona, destino, includeImages = false) => {
    const fechaStr = Array.isArray(nota?.fechaCreacion)
      ? `${nota?.fechaCreacion[2]}/${nota?.fechaCreacion[1]}/${nota?.fechaCreacion[0]}`
      : (typeof nota?.fechaCreacion === 'string' ? nota.fechaCreacion : '');
    const header =
      `Reporte de ${info?.usuarioDtoSalida?.nombreNegocio || info?.usuarioDtoSalida?.username || 'Inmobiliaria'}:\n\n` +
      `A ${persona?.nombre || ''} ${persona?.apellido || ''} en caracter de ${destino === 'inquilino' ? 'Inquilino' : 'Propietario'}\n` +
      `Fecha: ${fechaStr}\n` +
      `Motivo: ${nota?.motivo || ''}\n` +
      `Observaciones: ${nota?.observaciones || ''}\n` +
      `Gravedad: ${nota?.prioridad || ''}\n` +
      `Estado: ${nota?.estado || ''}`;

    if (!includeImages) return header;

    const imgs = Array.isArray(nota?.imagenes) ? nota.imagenes : [];
    const urls = imgs
      .map(i => i?.imageUrl || i?.url)
      .filter(Boolean);
    if (urls.length === 0) return header;

    const list = urls.map((u, idx) => `Imagen ${idx + 1}: ${u}`).join('\n');
    return `${header}\n\nAdjuntos:\n${list}`;
  };

  const openWhatsApp = (persona, mensaje) => {
    let url = 'https://wa.me/?text=' + encodeURIComponent(mensaje);
    if (persona?.telefono) {
      const tel = persona.telefono.replace(/[^\d]/g, '');
      url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
    }
    window.open(url, '_blank');
  };

  const fetchAsFile = async (url, idx) => {
    const res = await fetch(url, { cache: 'reload' });
    const blob = await res.blob();
    const ext = (blob.type && blob.type.split('/')[1]) || 'jpg';
    return new File([blob], `nota-imagen-${idx + 1}.${ext}`, { type: blob.type || 'image/jpeg' });
  };

  const handleShare = async (destino, includeImages = false) => {
  let persona;
  if (destino === 'inquilino') {
    persona = info.inquilino;
  } else if (destino === 'propietario') {
    persona = info.propietario;
  }
  if (onShare) {
    onShare(persona, nota, contrato);
  } else if (persona) {
    const mensaje = buildMessage(persona, destino, includeImages);
    if (includeImages) {
      try {
        const imgs = Array.isArray(nota?.imagenes) ? nota.imagenes : [];
        const urls = imgs.map(i => i?.imageUrl || i?.url).filter(Boolean).slice(0, 10); // limitar cantidad
        const files = await Promise.all(urls.map((u, i) => fetchAsFile(u, i)));
        if (navigator.canShare && navigator.canShare({ files })) {
          await navigator.share({ text: mensaje, files });
        } else {
          // Fallback: abrir WhatsApp con texto si el navegador no soporta compartir archivos
          openWhatsApp(persona, mensaje + '\n\n(Adjuntos no soportados por tu navegador)');
        }
      } catch (err) {
        console.error('Error al preparar imágenes para compartir:', err);
        openWhatsApp(persona, mensaje + '\n\n(No fue posible adjuntar imágenes automáticamente)');
      }
    } else {
      openWhatsApp(persona, mensaje);
    }
  }
  handleClose();
};

  return (
    <>
      <Tooltip title="Compartir nota">
        <IconButton onClick={handleClick} size="small">
          <ShareIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disablePortal={false}
        slotProps={{
          popover: { container: document.body }
        }}
        PaperProps={{
          style: { zIndex: 3000 }
        }}
      >
        <MenuItem onClick={() => handleShare('inquilino', false)} disabled={!info?.inquilino}>
          Compartir con Inquilino (solo texto)
        </MenuItem>
        <MenuItem onClick={() => handleShare('inquilino', true)} disabled={!info?.inquilino}>
          Compartir con Inquilino (imágenes)
        </MenuItem>
        <MenuItem onClick={() => handleShare('propietario', false)} disabled={!info?.propietario}>
          Compartir con Propietario (solo texto)
        </MenuItem>
        <MenuItem onClick={() => handleShare('propietario', true)} disabled={!info?.propietario}>
          Compartir con Propietario (imágenes)
        </MenuItem>
      </Menu>
    </>
  );
};

export default SharedNota;
