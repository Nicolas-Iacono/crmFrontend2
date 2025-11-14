import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const CreateOwnerProfileModal = ({ open, onClose, propietario, onSubmit }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) setPassword('');
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!propietario) return;
    const payload = {
      nombre: propietario?.nombre || '',
      apellido: propietario?.apellido || '',
      dni: propietario?.dni || '',
      email: propietario?.email || '',
      password: password || ''
    };
    onSubmit && onSubmit(payload);
  };

  const username = propietario?.email || '';

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, width: 420, maxWidth: '90vw' } }}>
      <DialogTitle>Crear perfil de propietario</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            disabled
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" type="submit">Crear perfil</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateOwnerProfileModal;
