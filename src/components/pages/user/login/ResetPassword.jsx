import React, { useMemo, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import usuarioApi from '../../../api/usuarioApi';
import { showStyledError } from '../../../../utils/swalConfig';
import { showInfo, showSuccess } from '../../../alertas/showAlert';
import logoinmoListopng from "../../../../assets/logoInmo192.png"
const Container = styled('div')(({ theme }) => ({
  backgroundColor: 'rgb(86, 23, 164)',
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgb(86, 23, 164)',
  borderRadius: 8,
  padding: theme.spacing(3),
  width: '90%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
  boxShadow: 'none',
}));

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();

  const emailFromQuery = query.get('email') || '';
  const tokenFromQuery = query.get('token') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !token || !newPassword) {
      showStyledError('Datos incompletos', 'Completá email, token y la nueva contraseña.');
      return;
    }
    try {
      setSubmitting(true);
      await usuarioApi.resetPassword({ email, token, newPassword });
      showSuccess('Tu contraseña fue actualizada con éxito.', '¡Listo!');
      navigate('/login');
    } catch (error) {
      showStyledError('No pudimos actualizar tu contraseña', error?.response?.data?.message || error.message || 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{backgroundColor: 'rgb(86, 23, 164)', minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding:0, position:'relative'}}>
      <IconButton
        onClick={() => navigate('/login')}
        sx={{ position: 'absolute', top: 12, left: 12, color: 'white' }}
        aria-label="Volver"
      >
        <ArrowBackIcon />
      </IconButton>
      <Card sx={{}}>
       <Box sx={{ width: '100%', display:'flex', justifyContent:'center', alignItems:'center', mb:2 }}> 
        <img src={logoinmoListopng} alt="logo" style={{ display:'block', width:'150px', height:'150px', objectFit:'contain', borderRadius:12 }} />
       </Box>
       
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
          Restablecer contraseña
        </Typography>

        <Box sx={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ readOnly: true }}
            sx={{ borderRadius: 2, backgroundColor: 'white', color: '#2E2C97', mb: 2 }}
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ borderRadius: 2, backgroundColor: 'white', color: '#2E2C97' }}
          />
        </Box>

        <Button
          variant="contained"
          disabled={submitting || !newPassword}
          onClick={handleSubmit}
          sx={{
            borderRadius: 6,
            backgroundColor: 'rgb(54, 154, 159)',
            color: 'white',
            height: '3rem',
            fontSize: '1rem',
            px: 3,
            width: '80%',
          }}
        >
          {submitting ? 'Restableciendo...' : 'Restablecer contraseña'}
        </Button>
      </Card>
    </Container>
  );
};

export default ResetPassword;
