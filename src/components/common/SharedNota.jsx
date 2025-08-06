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
  const handleShare = (destino) => {
  let persona;
  if (destino === 'inquilino') {
    persona = info.inquilino;
  } else if (destino === 'propietario') {
    persona = info.propietario;
  }
  if (onShare) {
    onShare(persona, nota, contrato);
  } else if (persona) {
   
    const mensaje =
      `Reporte de ${info.usuarioDtoSalida?.nombreNegocio}:  \n\n` +
      `A ${persona.nombre} ${persona.apellido} en caracter de ${destino === 'inquilino' ? 'Inquilino' : 'Propietario'} \n` +
      `Fecha: ${nota?.fechaCreacion[2] + "/" + nota?.fechaCreacion[1] + "/" + nota?.fechaCreacion[0] || ''}\n` +
      `Motivo: ${nota?.motivo || ''}\n` +
      `Observaciones: ${nota?.observaciones || ''}\n` +
      `Gravedad: ${nota?.prioridad || ''}\n` +
      `Estado: ${nota?.estado || ''}\n`;
    // Si hay teléfono, lo usamos; si no, link genérico
    let url = 'https://wa.me/?text=' + encodeURIComponent(mensaje);
    if (persona.telefono) {
      // Limpiar el número para formato internacional (eliminar espacios, paréntesis, guiones)
      const tel = persona.telefono.replace(/[^\d]/g, '');
      url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
    }
    window.open(url, '_blank');
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
        <MenuItem onClick={() => handleShare('inquilino')} disabled={!info?.inquilino}>
          Compartir con Inquilino
        </MenuItem>
        <MenuItem onClick={() => handleShare('propietario')} disabled={!info?.propietario}>
          Compartir con Propietario
        </MenuItem>
      </Menu>
    </>
  );
};

export default SharedNota;
