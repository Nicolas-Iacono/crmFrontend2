import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const CreateTenantProfileModal = ({ open, onClose, inquilino, onSubmit }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) setPassword('');
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inquilino) return;
    const payload = {
      nombre: inquilino?.nombre || '',
      apellido: inquilino?.apellido || '',
      dni: inquilino?.dni || '',
      email: inquilino?.email || '',
      password: password || ''
    };
    onSubmit && onSubmit(payload);
  };

  const username = inquilino?.email || '';

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, width: 420, maxWidth: '90vw' } }}>
      <DialogTitle>Crear perfil de inquilino</DialogTitle>
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

export default CreateTenantProfileModal;
