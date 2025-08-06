import React from 'react';
import { Box, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalImgFull = ({ open, onClose, img }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 18, right: 18, color: '#fff', zIndex: 10 }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>
      {img && (
        <img
          src={img}
          alt="Imagen ampliada"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            borderRadius: 12,
            boxShadow: '0 8px 32px #0009',
            background: '#fff',
            objectFit: 'contain',

          }}
          onClick={e => e.stopPropagation()}
        />
      )}
    </Box>
  </Modal>
);

export default ModalImgFull;