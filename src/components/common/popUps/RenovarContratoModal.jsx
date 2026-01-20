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
  CircularProgress,
  Chip,
  Autocomplete
} from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const destinosOpts = [
  { value: 'Habitacional como vivienda unica', label: 'Habitacional' },
  { value: 'Comercial', label: 'Comercial' }
];

// Modal para armar RenovarContratoRequest (DTO backend)
const RenovarContratoModal = ({
  open,
  onClose,
  defaultValues = {},
  onSave,
  // opcional: lista de garantes disponibles para seleccionar (por usuario)
  // formato sugerido: [{ id: 12, nombre: 'Juan', apellido:'Perez', dni:'...' }, ...]
  garantesOptions = []
}) => {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    duracion: '',
    montoAlquiler: '',
    montoAlquilerLetras: '',
    actualizacion: '',
    indiceAjuste: '',
    multaXDia: '',
    destino: '',
    tipoGarantia: '',
    garantesIds: null, // null => clonar del contrato anterior (default)
    aguaEmpresa: '',
    aguaPorcentaje: '',
    luzEmpresa: '',
    luzPorcentaje: '',
    gasEmpresa: '',
    gasPorcentaje: '',
    municipalEmpresa: '',
    municipalPorcentaje: '',
    comisionContratoPorc: '',
    comisionMensualPorc: ''
  });

  // helper: YYYY-MM-DD para input date
  const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');
  const toStr = (v) => (v === null || v === undefined ? '' : String(v));

  // Opciones de garantes: null (clonar), [] (sin), [ids] (seleccion)
  const garantesMode = useMemo(() => {
    if (form.garantesIds === null) return 'clonar';
    if (Array.isArray(form.garantesIds) && form.garantesIds.length === 0) return 'sin';
    return 'seleccionar';
  }, [form.garantesIds]);

  useEffect(() => {
    // default: que venga precargado con datos actuales del contrato
    // PERO: garantesIds queda en null para clonar por defecto (lo pediste vos: si no tocás nada, clona)
    const fechaInicioDefault = defaultValues?.fecha_inicio ?? defaultValues?.fechaInicio;
    const fechaFinDefault = defaultValues?.fecha_fin ?? defaultValues?.fechaFin;
    setForm((prev) => ({
      ...prev,
      fechaInicio: toDateInput(fechaInicioDefault) || '',
      fechaFin: toDateInput(fechaFinDefault) || '',
      duracion: toStr(defaultValues?.duracion),
      montoAlquiler: toStr(defaultValues?.montoAlquiler ?? defaultValues?.monto),
      montoAlquilerLetras: defaultValues?.montoAlquilerLetras ?? '',
      actualizacion: toStr(defaultValues?.actualizacion),
      indiceAjuste: defaultValues?.indiceAjuste ?? '',
      multaXDia: toStr(defaultValues?.multaXDia),
      destino: defaultValues?.destino ?? '',
      tipoGarantia: defaultValues?.tipoGarantia ?? '',
      garantesIds: null,

      aguaEmpresa: defaultValues?.aguaEmpresa ?? '',
      aguaPorcentaje: toStr(defaultValues?.aguaPorcentaje),
      luzEmpresa: defaultValues?.luzEmpresa ?? '',
      luzPorcentaje: toStr(defaultValues?.luzPorcentaje),
      gasEmpresa: defaultValues?.gasEmpresa ?? '',
      gasPorcentaje: toStr(defaultValues?.gasPorcentaje),
      municipalEmpresa: defaultValues?.municipalEmpresa ?? '',
      municipalPorcentaje: toStr(defaultValues?.municipalPorcentaje),

      comisionContratoPorc: toStr(defaultValues?.comisionContratoPorc),
      comisionMensualPorc: toStr(defaultValues?.comisionMensualPorc)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGarantesModeChange = (e) => {
    const mode = e.target.value;
    setForm((prev) => {
      if (mode === 'clonar') return { ...prev, garantesIds: null };
      if (mode === 'sin') return { ...prev, garantesIds: [] };
      // seleccionar
      return { ...prev, garantesIds: prev.garantesIds === null ? [] : prev.garantesIds };
    });
  };

  const selectedGarantesObjects = useMemo(() => {
    if (!Array.isArray(form.garantesIds)) return [];
    const setIds = new Set(form.garantesIds);
    return garantesOptions.filter((g) => setIds.has(g.id));
  }, [form.garantesIds, garantesOptions]);

  const handleGarantesSelect = (_, newValues) => {
    // newValues: array de objects garantes
    const ids = newValues.map((g) => g.id);
    setForm((prev) => ({ ...prev, garantesIds: ids }));
  };

  const buildDto = () => {
    const toBigDecimalOrNull = (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (!s) return null;
      // backend espera BigDecimal: mandamos number y Jackson lo parsea, o mandamos string.
      // Mejor: mandamos number.
      const n = Number(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    const toIntOrNull = (v) => {
      const s = String(v ?? '').trim();
      if (!s) return null;
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : null;
    };

    const toDoubleOrNull = (v) => {
      const s = String(v ?? '').trim();
      if (!s) return null;
      const n = Number(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    // fechas: obligatorias según tu lógica actual
    const fechaInicio = form.fechaInicio ? form.fechaInicio : null;
    const fechaFin = form.fechaFin ? form.fechaFin : null;

    return {
      fechaInicio,
      fechaFin,
      duracion: toIntOrNull(form.duracion),
      montoAlquiler: toDoubleOrNull(form.montoAlquiler),
      actualizacion: toIntOrNull(form.actualizacion),
      indiceAjuste: form.indiceAjuste?.trim() || null,
      montoAlquilerLetras: form.montoAlquilerLetras?.trim() || null,
      multaXDia: toDoubleOrNull(form.multaXDia),
      destino: form.destino || null,
      tipoGarantia: form.tipoGarantia || null,
      garantesIds: form.garantesIds, // null / [] / [ids]
      aguaEmpresa: form.aguaEmpresa?.trim() || null,
      aguaPorcentaje: toBigDecimalOrNull(form.aguaPorcentaje),
      luzEmpresa: form.luzEmpresa?.trim() || null,
      luzPorcentaje: toBigDecimalOrNull(form.luzPorcentaje),
      gasEmpresa: form.gasEmpresa?.trim() || null,
      gasPorcentaje: toBigDecimalOrNull(form.gasPorcentaje),
      municipalEmpresa: form.municipalEmpresa?.trim() || null,
      municipalPorcentaje: toBigDecimalOrNull(form.municipalPorcentaje),
      comisionContratoPorc: toBigDecimalOrNull(form.comisionContratoPorc),
      comisionMensualPorc: toBigDecimalOrNull(form.comisionMensualPorc)
    };
  };

  const validateForm = () => {
    if (!form.fechaInicio || !form.fechaFin) return 'Fecha inicio y fin son obligatorias';
    if (new Date(form.fechaFin) <= new Date(form.fechaInicio)) return 'La fecha fin debe ser posterior a la fecha inicio';
    if (garantesMode === 'seleccionar' && (!Array.isArray(form.garantesIds) || form.garantesIds.length === 0)) {
      return 'Seleccioná al menos un garante, o elegí "Clonar" / "Sin garantes"';
    }
    return null;
  };

  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!onSave) return;
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    try {
      setSaving(true);
      const dto = buildDto();
      await onSave(dto); // esto debería pegarle a POST /api/contrato/renovar/{id}
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen
      fullWidth
      PaperProps={{
        sx: {
          width: '100vw',
          height: '90vh',
          m: 0,
          borderRadius: '25px 25px 0 0',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        }
      }}
    >
      <DialogTitle>
        Renovar Contrato
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
          Genera un nuevo contrato en base al vigente, con cambios opcionales (garantes, monto, índice, duración, servicios, comisiones).
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 25 },
            '& .MuiOutlinedInput-notchedOutline': { borderRadius: 25 }
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Datos de Renovación
          </Typography>

          {error && (
            <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Paper>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Columna izquierda */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              {/* Fechas */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label="Fecha Inicio"
                  name="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Fecha Fin"
                  name="fechaFin"
                  type="date"
                  value={form.fechaFin}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Box>

              {/* Duración */}
              <TextField
                label="Duración (meses) (opcional)"
                name="duracion"
                type="number"
                value={form.duracion}
                onChange={handleChange}
                fullWidth
                placeholder="Si lo dejás vacío, se calcula por fechas"
                sx={{ mb: 2 }}
              />

              {/* Monto */}
              <TextField
                label="Monto Alquiler"
                name="montoAlquiler"
                type="number"
                value={form.montoAlquiler}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />

              <TextField
                label="Monto en letras (opcional)"
                name="montoAlquilerLetras"
                value={form.montoAlquilerLetras}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />

              {/* Ajustes */}
              <TextField
                label="Actualización (meses)"
                name="actualizacion"
                type="number"
                value={form.actualizacion}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Índice de Ajuste"
                name="indiceAjuste"
                value={form.indiceAjuste}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Multa por Día"
                name="multaXDia"
                type="number"
                value={form.multaXDia}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />

              {/* Destino */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="destino-label">Destino</InputLabel>
                <Select
                  labelId="destino-label"
                  name="destino"
                  value={form.destino}
                  onChange={handleChange}
                  fullWidth
                  label="Destino"
                >
                  {destinosOpts.map((destino) => (
                    <MenuItem key={destino.value} value={destino.value}>
                      {destino.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tipo Garantía */}
              <TextField
                label="Tipo de garantía (texto)"
                name="tipoGarantia"
                value={form.tipoGarantia}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Ej: Recibo de sueldo / Propietaria / Caución"
              />

              {/* Comisiones */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label="Comisión contrato (%)"
                  name="comisionContratoPorc"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={form.comisionContratoPorc}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
                <TextField
                  label="Comisión mensual (%)"
                  name="comisionMensualPorc"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={form.comisionMensualPorc}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 2, width: '1px', color: 'grey' }} />

            {/* Columna derecha */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              {/* Garantes */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Garantes
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="garantes-mode-label">Cómo se resuelven los garantes</InputLabel>
                <Select
                  labelId="garantes-mode-label"
                  value={garantesMode}
                  label="Cómo se resuelven los garantes"
                  onChange={handleGarantesModeChange}
                >
                  <MenuItem value="clonar">Clonar garantes del contrato vigente</MenuItem>
                  <MenuItem value="sin">Renovar SIN garantes</MenuItem>
                  <MenuItem value="seleccionar">Seleccionar garantes</MenuItem>
                </Select>
              </FormControl>

              {garantesMode === 'seleccionar' && (
                <Autocomplete
                  multiple
                  options={garantesOptions}
                  value={selectedGarantesObjects}
                  onChange={handleGarantesSelect}
                  getOptionLabel={(g) => `${g.nombre ?? ''} ${g.apellido ?? ''}${g.dni ? ` (DNI ${g.dni})` : ''}`}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`${option.nombre ?? ''} ${option.apellido ?? ''}`}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Seleccionar garantes" placeholder="Buscar..." />}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Servicios */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Servicios
              </Typography>

              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f8fafc',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 }
                }}
              >
                {/* Agua */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    height: '6rem',
                    mb: 2,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f7ff'
                    }
                  }}
                >
                  <OpacityIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#2196f3', mr: 2 }} />
                  <TextField
                    name="aguaEmpresa"
                    label="Empresa de Agua"
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.aguaEmpresa || ''}
                    sx={{ width: '300px' }}
                  />
                  <TextField
                    name="aguaPorcentaje"
                    label="Porcentaje"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.aguaPorcentaje || ''}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Gas */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 2,
                    height: '6rem',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff7f0'
                    }
                  }}
                >
                  <LocalFireDepartmentIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ff9800', mr: 2 }} />
                  <TextField
                    name="gasEmpresa"
                    label="Empresa de Gas"
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.gasEmpresa || ''}
                    sx={{ width: '300px' }}
                  />
                  <TextField
                    name="gasPorcentaje"
                    label="Porcentaje"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.gasPorcentaje || ''}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Luz */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 2,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f9fce8'
                    }
                  }}
                >
                  <BoltIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ffc107', mr: 2 }} />
                  <TextField
                    name="luzEmpresa"
                    label="Empresa de Luz"
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.luzEmpresa || ''}
                    sx={{ width: '300px' }}
                  />
                  <TextField
                    name="luzPorcentaje"
                    label="Porcentaje"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.luzPorcentaje || ''}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Municipal */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    height: '6rem',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f5f0'
                    }
                  }}
                >
                  <AccountBalanceIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#4caf50', mr: 2 }} />
                  <TextField
                    name="municipalEmpresa"
                    label="Empresa Municipal"
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.municipalEmpresa || ''}
                    sx={{ width: '300px' }}
                  />
                  <TextField
                    name="municipalPorcentaje"
                    label="Porcentaje"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    fullWidth
                    size="small"
                    onChange={handleChange}
                    value={form.municipalPorcentaje || ''}
                    sx={{ width: '150px' }}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pb: 4 }}>
        <Button onClick={onClose} sx={{ borderRadius: '25px' }} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: '25px' }}
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {saving ? 'Renovando...' : 'Renovar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenovarContratoModal;
