import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';
import suscripcionesApi from '../api/suscripcionesMp';

const numberOr = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export default function CreateSubscriptionPlan() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Editable metadata (synced with URL)
  const [planCode, setPlanCode] = useState(searchParams.get('planCode') || '');
  const [planName, setPlanName] = useState(searchParams.get('planName') || '');
  const [contractLimit, setContractLimit] = useState(searchParams.get('contractLimit') || '');

  // Form state for MP payload
  const [reason, setReason] = useState('Yoga classes');
  const [backUrl, setBackUrl] = useState(window.location.origin);
  const [frequency, setFrequency] = useState(1);
  const [frequencyType, setFrequencyType] = useState('months');
  const [repetitions, setRepetitions] = useState(12);
  const [billingDay, setBillingDay] = useState(10);
  const [billingDayProportional, setBillingDayProportional] = useState(false);
  const [freeTrialFrequency, setFreeTrialFrequency] = useState(1);
  const [freeTrialFrequencyType, setFreeTrialFrequencyType] = useState('months');
  const [transactionAmount, setTransactionAmount] = useState(300);
  const [currencyId, setCurrencyId] = useState('ARS');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update URL when metadata changes
  const updateURL = useCallback(() => {
    const newParams = new URLSearchParams();
    if (planCode) newParams.set('planCode', planCode);
    if (planName) newParams.set('planName', planName);
    if (contractLimit) newParams.set('contractLimit', contractLimit);
    setSearchParams(newParams, { replace: true });
  }, [planCode, planName, contractLimit, setSearchParams]);

  // Initialize defaults from query params if present
  useEffect(() => {
    if (planName) setReason(planName);
  }, [planName]);

  // Update URL when metadata changes
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const finalPayload = useMemo(() => ({
    // Solo el payload de Mercado Pago
    reason,
    back_url: backUrl,
    auto_recurring: {
      frequency: numberOr(frequency, 1),
      frequency_type: frequencyType,
      repetitions: numberOr(repetitions, 12),
      billing_day: numberOr(billingDay, 1),
      billing_day_proportional: Boolean(billingDayProportional),
      free_trial: {
        frequency: numberOr(freeTrialFrequency, 0),
        frequency_type: freeTrialFrequencyType
      },
      transaction_amount: numberOr(transactionAmount, 0),
      currency_id: currencyId
    }
  }), [reason, backUrl, frequency, frequencyType, repetitions, billingDay, billingDayProportional, freeTrialFrequency, freeTrialFrequencyType, transactionAmount, currencyId]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!planCode) {
      setLoading(false);
      return setError('Falta planCode');
    }
    if (!planName) {
      setLoading(false);
      return setError('Falta planName');
    }
    const contractLimitNum = numberOr(contractLimit, 0);
    if (!contractLimit || contractLimitNum <= 0) {
      setLoading(false);
      return setError('contractLimit debe ser un número mayor a 0');
    }

    const { data, error } = await suscripcionesApi.createPlan(finalPayload, planCode, planName, contractLimit);
    setLoading(false);
    if (error) {
      return setError(error);
    }

    setSuccess('Plan creado correctamente');
  };

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Crear plan de suscripción
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Lee los parámetros de la URL y arma el payload requerido para crear un plan.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Metadatos (desde URL)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField 
              size="small" 
              fullWidth 
              label="planCode" 
              value={planCode} 
              onChange={(e) => setPlanCode(e.target.value)}
              helperText="Se refleja en la URL"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              size="small" 
              fullWidth 
              label="planName" 
              value={planName} 
              onChange={(e) => setPlanName(e.target.value)}
              helperText="Se refleja en la URL"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              size="small" 
              fullWidth 
              label="contractLimit" 
              type="number"
              value={contractLimit} 
              onChange={(e) => setContractLimit(e.target.value)}
              helperText="Se refleja en la URL"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Datos del plan (payload requerido)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="reason" size="small" fullWidth value={reason} onChange={e => setReason(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="back_url" size="small" fullWidth value={backUrl} onChange={e => setBackUrl(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField type="number" label="frequency" size="small" fullWidth value={frequency} onChange={e => setFrequency(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="frequency_type" size="small" fullWidth value={frequencyType} onChange={e => setFrequencyType(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField type="number" label="repetitions" size="small" fullWidth value={repetitions} onChange={e => setRepetitions(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField type="number" label="billing_day" size="small" fullWidth value={billingDay} onChange={e => setBillingDay(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Switch checked={billingDayProportional} onChange={e => setBillingDayProportional(e.target.checked)} />} label="billing_day_proportional" />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField type="number" label="free_trial.frequency" size="small" fullWidth value={freeTrialFrequency} onChange={e => setFreeTrialFrequency(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="free_trial.frequency_type" size="small" fullWidth value={freeTrialFrequencyType} onChange={e => setFreeTrialFrequencyType(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField type="number" label="transaction_amount" size="small" fullWidth value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="currency_id" size="small" fullWidth value={currencyId} onChange={e => setCurrencyId(e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Vista previa del payload a enviar
        </Typography>
        <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: (t) => t.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa', borderRadius: 1, overflowX: 'auto' }}>
{JSON.stringify(finalPayload, null, 2)}
        </Box>
      </Paper>

      <Box display="flex" gap={1}>
        <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>Volver</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Crear plan</Button>
      </Box>

      {!!error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}
