import React from 'react';
import { Box, Button, TextField, Typography, Paper, Link, IconButton } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { styled } from '@mui/material/styles';
import logoinmoListopng from "../../../../assets/logoInmo192.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: 'rgb(86, 23, 164)',
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const RecoverPassword = () => {
  const navigate = useNavigate();
  const initialValues = { email: '' };

  const handleSubmit = (values, { setSubmitting }) => {
    // Solo UI por ahora: no implementamos API
    setTimeout(() => {
      setSubmitting(false);
    }, 500);
  };

  return (
    <Container>
      <IconButton
        onClick={() => navigate('/login')}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          color: 'white',
          zIndex: 10,
        }}
        aria-label="Volver al login"
      >
        <ArrowBackIcon />
      </IconButton>
      <Card>
        <Box sx={{
          backgroundImage: `url(${logoinmoListopng})`,
          width: '10rem',
          height: '10rem',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 2,
        }} />

        <Typography variant="h5" sx={{ color: 'white', fontWeight: 100 }}>
          Recuperar contraseña
        </Typography>

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, handleChange, handleBlur, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <Box mb={2}>
                <Field
                  name="email"
                  as={TextField}
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  sx={{ borderRadius: 2, backgroundColor: 'white', color: '#2E2C97' }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: 6,
                    backgroundColor: 'rgb(54, 154, 159)',
                    color: 'white',
                    width: '18rem',
                    height: '3rem',
                    fontSize: '1rem',
                  }}
                >
                  Recuperar mi contraseña
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default RecoverPassword;
