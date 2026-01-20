import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  InputAdornment,
  useTheme,
  CircularProgress
} from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const destinosOpts = [
  { value: 'Habitacional como vivienda unica', label: 'Habitacional' },
  { value: 'Comercial', label: 'Comercial' }
];

const EditContratoModal = ({ open, onClose, defaultValues = {}, onSave }) => {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombreContrato: '',
    aguaEmpresa: '',
    aguaPorcentaje: '',
    luzEmpresa: '',
    luzPorcentaje: '',
    gasEmpresa: '',
    gasPorcentaje: '',
    municipalEmpresa: '',
    municipalPorcentaje: '',
    indiceAjuste: '',
    multaXDia: '',
    duracion: '',
    destino: ''
  });

  useEffect(() => {
    const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');
    const toStr = (v) => (v === null || v === undefined ? '' : String(v));
    setForm({
      nombreContrato: defaultValues.nombreContrato ?? '',
      aguaEmpresa: defaultValues.aguaEmpresa ?? '',
      aguaPorcentaje: toStr(defaultValues.aguaPorcentaje),
      luzEmpresa: defaultValues.luzEmpresa ?? '',
      luzPorcentaje: toStr(defaultValues.luzPorcentaje),
      gasEmpresa: defaultValues.gasEmpresa ?? '',
      gasPorcentaje: toStr(defaultValues.gasPorcentaje),
      municipalEmpresa: defaultValues.municipalEmpresa ?? '',
      municipalPorcentaje: toStr(defaultValues.municipalPorcentaje),
      indiceAjuste: defaultValues.indiceAjuste ?? '',
      multaXDia: defaultValues.multaXDia ?? '',
      duracion: defaultValues.duracion ?? '',
      destino: defaultValues.destino ?? ''
    });
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;

    const toDecimalOrNull = (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (!s) return null;
      const n = parseFloat(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    try {
      setSaving(true);
      await onSave({
        ...form,
        aguaPorcentaje: toDecimalOrNull(form.aguaPorcentaje),
        gasPorcentaje: toDecimalOrNull(form.gasPorcentaje),
        luzPorcentaje: toDecimalOrNull(form.luzPorcentaje),
        municipalPorcentaje: toDecimalOrNull(form.municipalPorcentaje),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen 
      fullWidth
      PaperProps={{
        sx: { width: '100vw', height: '90vh', m: 0, borderRadius:"25px 25px 0 0", position:"absolute", bottom:"0", left:"0", right:"0" }
      }}
    >
      <DialogTitle>
        Editar Contrato
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{
          '& .MuiOutlinedInput-root': { borderRadius: 25 },
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: 25 }
        }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Detalles del Contrato</Typography>

          <Box sx={{ display: 'flex',  gap: 2, flexDirection:{xs:"column",md:"row", sm:"column"} }}>
            <Box sx={{ width:{xs:"100%", md:"50%",sm:"100%"}}}>
              <TextField
                label="Nombre del Contrato"
                name="nombreContrato"
                value={form.nombreContrato}
                onChange={handleChange}
                fullWidth
                required
                placeholder={defaultValues?.nombreContrato ?? ''}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Duración (en meses)"
                name="duracion"
                type="number"
                value={form.duracion}
                onChange={handleChange}
                fullWidth
                required
                placeholder={String(defaultValues?.duracion ?? '')}
                helperText={defaultValues?.duracion ? `Actual: ${defaultValues.duracion}` : ''}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Multa por Día"
                name="multaXDia"
                type="number"
                value={form.multaXDia}
                onChange={handleChange}
                fullWidth
                required
                placeholder={String(defaultValues?.multaXDia ?? '')}
                helperText={defaultValues?.multaXDia ? `Actual: ${defaultValues.multaXDia}` : ''}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
               <TextField
                label="Índice de Ajuste"
                name="indiceAjuste"
                value={form.indiceAjuste}
                onChange={handleChange}
                fullWidth
                required
                placeholder={defaultValues?.indiceAjuste ?? ''}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="destino-label">Destino</InputLabel>
                <Select
                  labelId="destino-label"
                  name="destino"
                  value={form.destino}
                  onChange={handleChange}
                  fullWidth
                  required
                  label="Destino"
                >
                  {destinosOpts.map((destino) => (
                    <MenuItem key={destino.value} value={destino.value}>
                      {destino.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Divider orientation="vertical" flexItem variant='middle' sx={{ mx: 2, width:"1px", color:"grey" }} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Servicios
              </Typography>

                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f8fafc',
                    borderRadius: '8px',
                    mb: {xs:2, md:0, sm:2},
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 }
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      height: '6rem',
                      mb: 2,
                      p: 0,
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
                      size="small"
                      margin="dense"
                      onChange={handleChange}
                      value={form.aguaEmpresa || ''}    
                      placeholder={defaultValues?.aguaEmpresa ?? ''}
                      sx={{ width: '300px' }}
                    />
                    <TextField
                      name="aguaPorcentaje"
                      label="Porcentaje (%)"
                      type="number"
                       inputProps={{
                             step: "0.01"
                        }}
                      InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                      fullWidth
                      size="small"
                      onChange={handleChange}
                      value={form.aguaPorcentaje || ''}
                      placeholder={String(defaultValues?.aguaPorcentaje ?? '')}
                      helperText={defaultValues?.aguaPorcentaje !== undefined && defaultValues?.aguaPorcentaje !== '' ? `Actual: ${defaultValues.aguaPorcentaje}%` : ''}
                      sx={{ width: '150px' }}
                    />

                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      mb: 2,
                      p: 0,
                      height:"6rem",
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
                      size="small"
                      margin="dense"
                      onChange={handleChange}
                      value={form.gasEmpresa || ''}
                      placeholder={defaultValues?.gasEmpresa ?? ''}
                      sx={{ width: '300px' }}  
                    />
                    <TextField
                      name="gasPorcentaje"
                      label="Porcentaje (%)"
                      type="number"
                      inputProps={{
                             step: "0.01"
                        }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      size="small"
                      onChange={handleChange}
                      value={form.gasPorcentaje || ''}
                      placeholder={String(defaultValues?.gasPorcentaje ?? '')}
                      helperText={defaultValues?.gasPorcentaje !== undefined && defaultValues?.gasPorcentaje !== '' ? `Actual: ${defaultValues.gasPorcentaje}%` : ''}
                      sx={{ width: '150px' }}
                    />
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      mb: 2,
                      p: 0,
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
                      size="small"
                      margin="dense"
                      onChange={handleChange}
                      value={form.luzEmpresa || ''}
                      placeholder={defaultValues?.luzEmpresa ?? ''}
                      sx={{ width: '300px' }}
                    />

                    <TextField
                      name="luzPorcentaje"
                      label="Porcentaje (%)"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{
                             step: "0.01"
                        }}
                      fullWidth
                      size="small"
                      onChange={handleChange}
                      value={form.luzPorcentaje || ''}
                      placeholder={String(defaultValues?.luzPorcentaje ?? '')}
                      helperText={defaultValues?.luzPorcentaje !== undefined && defaultValues?.luzPorcentaje !== '' ? `Actual: ${defaultValues.luzPorcentaje}%` : ''}
                      sx={{ width: '150px' }}
                    />
                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      p: 0,
                      height:"6rem",
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
                      size="small"
                      margin="dense"
                      onChange={handleChange}
                      value={form.municipalEmpresa || ''}
                      placeholder={defaultValues?.municipalEmpresa ?? ''}
                    sx={{ width: '300px' }}
                    />
                    <TextField
                      name="municipalPorcentaje"
                      label="Porcentaje (%)"
                      inputProps={{
                             step: "0.01"
                        }}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      size="small"
                      onChange={handleChange}
                      value={form.municipalPorcentaje || ''}
                      placeholder={String(defaultValues?.municipalPorcentaje ?? '')}
                      helperText={defaultValues?.municipalPorcentaje !== undefined && defaultValues?.municipalPorcentaje !== '' ? `Actual: ${defaultValues.municipalPorcentaje}%` : ''}
                      sx={{ width: '150px' }}
                    />
                  </Box>
                </Paper>
             
            </Box>
          </Box>


          
        </Box>
      </DialogContent>
      <DialogActions sx={{pb:4}}>
        <Button onClick={onClose} sx={{borderRadius:"25px"}}>Cancelar</Button>
        <Button
          variant="contained"
          sx={{borderRadius:"25px"}}
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContratoModal;
