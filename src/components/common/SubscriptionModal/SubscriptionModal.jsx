import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import PremiumIcon from '@mui/icons-material/Diamond';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import suscripcionesApi from '../../api/suscripcionesMp';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const SubscriptionModal = ({ open, onClose, onSelectPlan }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);

  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await suscripcionesApi.getPlans();
        if (response.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    fetchPlans();
  }, []);
  const formatArs = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);

  // Presets por código para mantener estilos y textos
  const codePresets = {
    FREE2: {
      id: 'free',
      description: 'Experiencia completa limitada',
      icon: <StarIcon sx={{ fontSize: 40, color: 'rgb(195, 162, 233)' }} />,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg,rgb(149, 125, 177) 0%,rgb(12, 23, 121) 100%)',
      popular: false,
      features: [
        'Hasta 3 contratos Grátis',
        'Gestión completa',
      ],
    },   
    // BARATO: {
    //   id: 'barato',
    //   description: 'pruebas',
    //   icon: <StarIcon sx={{ fontSize: 40, color: 'rgb(144, 226, 148)' }} />,
    //   color: '#4CAF50',
    //   gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    //   popular: false,
    //   features: [
    //     'Hasta 10 contratos',
    //     'Gestión completa',
    //     'Todo lo que ya usas',
    //   ],
    // },
    FREE: {
      id: 'basic',
      description: 'Perfecto para comenzar',
      icon: <StarIcon sx={{ fontSize: 40, color: 'rgb(144, 226, 148)' }} />,
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      popular: false,
      features: [
        'Hasta 10 contratos',
        'Gestión completa',
        'Todo lo que ya usas',
      ],
    },
    PROFESIONAL: {
      id: 'professional',
      description: 'Para profesionales inmobiliarios',
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'rgb(153, 202, 241)' }} />,
      color: '#2196F3',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      popular: true,
      features: [
        'Hasta 20 contratos',
        'Gestión completa',
        'Todo lo que ya usas',
        
      ],
    },
    SUPERIOR: {
      id: 'premium',
      description: 'Para empresas inmobiliarias',
      icon: <PremiumIcon sx={{ fontSize: 40, color: 'rgb(240, 198, 134)' }} />,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      popular: false,
      features: [
        'Hasta 30 contratos',
        'Gestión completa',
        'Todo lo que ya usas',
      ],
    },
  };
  // Tomar del backend solo FREE, PROFESIONAL, SUPERIOR (activos) y mapear a las cards
  const subscriptionPlans = (() => {
    const filtered = (plans || [])
      .filter((p) => p && p.active !== false)
      .filter((p) => ['FREE', 'PROFESIONAL', 'SUPERIOR'].includes(String(p.code || '').toUpperCase()));

    const mapped = filtered.map((p) => {
      const code = String(p.code || '').toUpperCase();
      const preset = codePresets[code] || codePresets.FREE;
      return {
        id: preset.id, // mantener ids esperados por estilos y selección
        name: p.name || code,
        price: p.priceArs != null ? formatArs(p.priceArs) : (code === 'FREE' ? 'Gratis' : formatArs(0)),
        period: '/mes',
        description: preset.description,
        icon: preset.icon,
        color: preset.color,
        gradient: preset.gradient,
        popular: preset.popular,
        features: preset.features,
        backendCode: p.code, // para checkout
      };
    });
    // Fallback si el backend aún no responde
    if (mapped.length === 0) {
      return [
        { ...codePresets.FREE2, id: 'free', name: 'Free',  price: formatArs(0), period: '/mes'},
        { ...codePresets.FREE, id: 'basic', name: 'Pro',  price: formatArs(30000), period: '/mes'},
        { ...codePresets.PROFESIONAL, id: 'professional', name: 'Pro +', price: formatArs(35000), period: '/mes' },
        { ...codePresets.SUPERIOR, id: 'premium', name: 'Superior', price: formatArs(45000), period: '/mes' },
      ];
    }
    return mapped;
  })();

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setError(null);
    setConfirmOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError('Por favor, selecciona un plan antes de proceder.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    // Mapear ids UI -> códigos esperados por el backend
    const planCodeMap = {
      // barato: 'PLAN-BARATO',
      basic: 'PLAN-PRO',         // Plan base (Profesional)
      professional: 'PLAN-PROF', // Plan medio
      premium: 'PLAN-SUP'        // Plan superior
    };
    const planCode = selectedPlan.backendCode || planCodeMap[selectedPlan.id] || selectedPlan.id;
    try {
      const response = await fetch('https://crminmobiliario-app-production.up.railway.app/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planCode })
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status} al iniciar el pago.`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const initPoint = data.initPoint ?? data.redirectUrl;

      if (initPoint) {
        window.location.href = initPoint;
      } else {
        throw new Error('Respuesta del servidor inválida: initPoint no encontrado.');
      }
    } catch (e) {
      console.error('Error durante el checkout:', e);
      setError(`Error en el pago: ${e.message}`);
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
      if (onSelectPlan && selectedPlan) {
        // notificar selección si el padre lo requiere
        onSelectPlan(selectedPlan);
      }
    }
  };

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '90%', md: '80%', lg: '70%' },
          maxWidth: '1200px',
          height: { xs: '90%', md: '85%' },
          bgcolor: 'background.paper',
          borderRadius: 5,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <Box sx={{
            p: 3,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg,rgb(79, 26, 126) 0%,rgb(79, 13, 177) 100%)'
              : 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '5px solid #D4AF37',
            borderLeft: '5px solid #D4AF37',
            borderRight: '5px solid #D4AF37',
            borderRadius:"20px 20px 0 0"
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height:"5rem" }}>
              <CardGiftcardIcon sx={{ fontSize: 50, color: '#D4AF37' }} />
              <Box>
                
                <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
                  Elige el plan perfecto para tu negocio inmobiliario
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Plans Swiper */}
          <Box sx={{ 
            flex: 1, 
            height: { xs: "50vh", md: "45vh" },
            p: { xs: 5, md: 2 },
            display: 'flex',
            alignItems: 'center',
            borderLeft: '5px solid #D4AF37',
            borderRight: '5px solid #D4AF37',
            borderBottom: '5px solid #D4AF37',
            borderRadius:"0 0 20px 20px",
            overflow: 'hidden'
          }}>
            <Swiper
              modules={[Navigation, Pagination, EffectCoverflow]}
              spaceBetween={30}
              slidesPerView={isMobile ? 1 : 3}
              centeredSlides={true}
              effect="coverflow"
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              navigation={!isMobile}
              pagination={{ 
                clickable: true,
                dynamicBullets: true
              }}
              style={{ 
                width: '100%', 
                height: '100%',
                paddingTop: '20px',
                paddingBottom: '40px'
              }}
            >
              {subscriptionPlans.map((plan) => (
                <SwiperSlide key={plan.id}>
                  <Card sx={{
                    height: { xs: '580px', md: '420px' },
                    maxHeight: { xs: '425px', md: '420px' },
                    width: { xs: '100%', md: '420px' },
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedPlan?.id === plan.id ? `3px solid ${plan.color}` : '1px solid transparent',
                    overflow: 'hidden',
                    borderRadius: '15px',
                    top:"0px",
                    position:"relative",
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 15px 30px rgba(0,0,0,0.1)`
                    }
                  }}>
                    {plan.popular && (
                      <Chip
                        label="MÁS POPULAR"
                        sx={{
                          position: 'absolute',
                          top: '20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: ' #FF4081',
                          fontWeight: 'bold',
                          zIndex: 10,
                          borderRadius:"30px",
                          color:"white",
                         
                        }}
                      />
                    )}

                    <CardContent sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 2, md: 2.5 },
                      background: plan.gradient,
                      color: 'white',
                      overflow: 'hidden'
                    }}>
                      {/* Plan Icon */}
                      <Box sx={{ textAlign: 'center',  }}>
                        {plan.icon}
                      </Box>

                      {/* Plan Name */}
                      <Typography variant={ isMobile ? "h6" : "h5" } fontWeight="bold" textAlign="center" gutterBottom>
                        {plan.name}
                      </Typography>

                      {/* Plan Description */}
                      <Typography variant="body2" textAlign="center" sx={{ opacity: 0.9, mb: 2, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                        {plan.description}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant={ isMobile ? "h4" : "h3" } fontWeight="bold" component="span">
                          {plan.price}
                        </Typography>
                        <Typography variant={ isMobile ? "body1" : "h6" } component="span" sx={{ opacity: 0.8 }}>
                          {plan.period}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <List sx={{ flex: 0.8, py: 0, overflow: 'auto' }}>
                        {plan.features.slice(0, isMobile ? 4 : plan.features.length).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.3, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 25 }}>
                              <CheckCircleIcon sx={{ color: 'white', fontSize: 17 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{
                                fontSize: { xs: '0.75rem', md: '0.85rem' },
                                color: 'white',
                                lineHeight: 1.2
                              }}
                            />
                          </ListItem>
                        ))}
                        {isMobile && plan.features.length > 4 && (
                          <ListItem sx={{ py: 0.3, px: 0 }}>
                            <ListItemText 
                              primary={`+${plan.features.length - 4} características más`}
                              primaryTypographyProps={{
                                fontSize: '0.7rem',
                                color: 'white',
                                opacity: 0.8,
                                fontStyle: 'italic'
                              }}
                            />
                          </ListItem>
                        )}
                      </List>

                      {/* Select Button - No mostrar para plan Free */}
                      {plan.name !== 'Free' && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleSelectPlan(plan)}
                          sx={{
                            mt: -6,
                            py: { xs: 0.8, md: 1 },
                            bgcolor: 'white',
                            color: plan.color,
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', md: '0.9rem' },
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          {selectedPlan?.id === plan.id ? 'SELECCIONADO' : 'SELECCIONAR'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* Footer */}
          <Box sx={{
            p: 2,
            height:"2rem",
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              • Cancela en cualquier momento • Soporte 24/7 • Garantía de 30 días
            </Typography>
          
          </Box>
        </Box>
      </Fade>
    </Modal>
    {/* Confirmación de Checkout */}
    <Dialog open={confirmOpen} onClose={() => (!isSubmitting ? setConfirmOpen(false) : null)} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar suscripción</DialogTitle>
      <DialogContent>
        {selectedPlan && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedPlan.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {selectedPlan.description}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              {selectedPlan.price}
              <Typography component="span" variant="subtitle1" sx={{ ml: 0.5, opacity: 0.8 }}>
                {selectedPlan.period}
              </Typography>
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Serás redirigido a Mercado Pago para completar el pago.
            </Typography>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>Cancelar</Button>
        <Button onClick={handleCheckout} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirmar y pagar'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default SubscriptionModal;
