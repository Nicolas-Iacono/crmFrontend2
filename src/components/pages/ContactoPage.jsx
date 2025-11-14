import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  useTheme,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  ContactMail as ContactIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import {useAuth} from '../context/GlobalAuth';


const ContactoPage = () => {
  const theme = useTheme();
  const { usuarioFetch } = useAuth();


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, marginTop: 3 }}>
        <ContactIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main }}
        >
          Contacto
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Botones de contacto directo */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Contáctanos directamente
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
                Elige la forma más conveniente para comunicarte con nosotros
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'center' }}>
                {/* Botón Email */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EmailIcon />}
                  onClick={() => {
                    const emailBody = `Hola, me gustaría hacer una consulta sobre el CRM.

Mis datos de contacto:
- Nombre: ${usuarioFetch?.username || 'No disponible'}
- Empresa: ${usuarioFetch?.nombreNegocio || 'No disponible'}
- Email: ${usuarioFetch?.email || 'No disponible'}
- Teléfono: ${usuarioFetch?.telefono || 'No disponible'}
- CUIT: ${usuarioFetch?.cuit || 'No disponible'}
- Matrícula: ${usuarioFetch?.matricula || 'No disponible'}
- Ubicación: ${usuarioFetch?.localidad || 'No disponible'}, ${usuarioFetch?.partido || 'No disponible'}, ${usuarioFetch?.provincia || 'No disponible'}

Consulta:
[Escriba aquí su consulta específica]

Saludos cordiales.`;
                    
                    window.open(`mailto:bewebworld@gmail.com?subject=Consulta desde CRM - ${usuarioFetch?.nombreNegocio || 'Usuario'}&body=${encodeURIComponent(emailBody)}`, '_blank');
                  }}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    backgroundColor: '#1976d2',
                    minWidth: { xs: '100%', sm: '200px' },
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Enviar Email
                </Button>

                {/* Opción WhatsApp eliminada por requerimiento */}
              </Box>

              {/* Información adicional */}
              <Paper 
                sx={{ 
                  mt: 4,
                  p: 3, 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                  💡 <strong>Consejos para un mejor contacto:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  • <strong>Email:</strong> Ideal para consultas detalladas, envío de documentos o solicitudes formales<br/>
                  • <strong>Respuesta:</strong> Te responderemos dentro de las 24 horas en días hábiles
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de contacto */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Información de contacto
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      bewebworld@gmail.com
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      +54 {usuarioFetch?.telefono || '11 1234-5678'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ubicación
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {usuarioFetch?.localidad || 'Buenos Aires'}, {usuarioFetch?.provincia || 'Argentina'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: theme.palette.primary.light + '10',
                  border: `1px solid ${theme.palette.primary.light}40`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Horarios de atención:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lunes a Viernes: 9:00 - 18:00
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sábados: 9:00 - 13:00
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Responderemos tu mensaje dentro de las 24 horas.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactoPage;
