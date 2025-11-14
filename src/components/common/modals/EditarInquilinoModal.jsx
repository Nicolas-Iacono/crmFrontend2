import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
import { InquilinosApi } from '../../api/inquilinosApi';
import { showSuccess, showError } from '../../alertas/showAlert';

const EditarInquilinoModal = ({ open, onClose, inquilino, onInquilinoUpdated }) => {
  const [formData, setFormData] = useState({
    id: '',
    pronombre: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    dni: '',
    direccionResidencial: '',
    cuit: '',
    nacionalidad: '',
    estadoCivil: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Opciones para los selects
  const pronombres = ['Sr.', 'Sra.', 'Dr.', 'Dra.', 'Ing.', 'Lic.', 'Prof.'];
  const estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Civil'];
  const nacionalidades = ['Argentina', 'Brasileña', 'Chilena', 'Uruguaya', 'Paraguaya', 'Boliviana', 'Peruana', 'Colombiana', 'Venezolana', 'Otra'];

  // Cargar datos del inquilino cuando se abre el modal
  useEffect(() => {
    if (open && inquilino) {
      setFormData({
        id: inquilino.id || '',
        pronombre: inquilino.pronombre || '',
        nombre: inquilino.nombre || '',
        apellido: inquilino.apellido || '',
        telefono: inquilino.telefono || '',
        email: inquilino.email || '',
        dni: inquilino.dni || '',
        direccionResidencial: inquilino.direccionResidencial || '',
        cuit: inquilino.cuit || '',
        nacionalidad: inquilino.nacionalidad || '',
        estadoCivil: inquilino.estadoCivil || ''
      });
      setErrors({});
    }
  }, [open, inquilino]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'dni') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      next = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else if (name === 'cuit') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      const a = digits.slice(0, 2);
      const b = digits.slice(2, 10);
      const c = digits.slice(10, 11);
      next = [a, b, c]
        .map((seg, idx) => (idx === 0 ? seg : seg ? '-' + seg : ''))
        .join('')
        .replace(/^-/, '');
    }
    setFormData(prev => ({
      ...prev,
      [name]: next
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
      const processed = {
        ...formData,
        dni: formData.dni ? parseInt(onlyDigits(formData.dni), 10) : formData.dni,
        cuit: formData.cuit ? parseInt(onlyDigits(formData.cuit), 10) : formData.cuit,
        telefono: formData.telefono ? parseInt(onlyDigits(formData.telefono), 10) : formData.telefono,
      };
      await InquilinosApi.actualizarInquilino(processed);
      showSuccess('Inquilino actualizado exitosamente');
      
      // Notificar al componente padre que se actualizó el inquilino
      if (onInquilinoUpdated) {
        onInquilinoUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      showError('Error al actualizar el inquilino. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        id: '',
        pronombre: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        dni: '',
        direccionResidencial: '',
        cuit: '',
        nacionalidad: '',
        estadoCivil: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
        },
      }}
      PaperProps={{
        sx: {
          m: 0,
          width: '100%',
          position: 'relative',
          borderRadius: '25px 25px 0 0',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        Editar Inquilino
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          pt: 2,
          '& .MuiOutlinedInput-root': { borderRadius: 25 },
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: 25 }
        }}>
          <Grid container spacing={2}>
            {/* Pronombre */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Pronombre</InputLabel>
                <Select
                  name="pronombre"
                  value={formData.pronombre}
                  onChange={handleInputChange}
                  label="Pronombre"
                >
                  {pronombres.map((pronombre) => (
                    <MenuItem key={pronombre} value={pronombre}>
                      {pronombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Nombre */}
            <Grid item xs={12} sm={4}>
              <TextField
                name="nombre"
                label="Nombre *"
                value={formData.nombre}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            {/* Apellido */}
            <Grid item xs={12} sm={4}>
              <TextField
                name="apellido"
                label="Apellido *"
                value={formData.apellido}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.apellido}
                helperText={errors.apellido}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                label="Teléfono *"
                value={formData.telefono}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.telefono}
                helperText={errors.telefono}
              />
            </Grid>

            {/* DNI */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="dni"
                label="DNI *"
                value={formData.dni}
                onChange={handleInputChange}
                fullWidth
                error={!!errors.dni}
                helperText={errors.dni}
              />
            </Grid>

            {/* CUIT */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="cuit"
                label="CUIT"
                value={formData.cuit}
                onChange={handleInputChange}
                fullWidth
                placeholder="XX-XXXXXXXX-X"
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <TextField
                name="direccionResidencial"
                label="Dirección Residencial"
                value={formData.direccionResidencial}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/* Nacionalidad */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nacionalidad</InputLabel>
                <Select
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleInputChange}
                  label="Nacionalidad"
                >
                  {nacionalidades.map((nacionalidad) => (
                    <MenuItem key={nacionalidad} value={nacionalidad}>
                      {nacionalidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Estado Civil */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleInputChange}
                  label="Estado Civil"
                >
                  {estadosCiviles.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditarInquilinoModal;
