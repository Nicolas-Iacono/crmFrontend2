import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import PremiumIcon from '@mui/icons-material/Diamond';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import suscripcionesApi from '../../api/suscripcionesMp';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const SubscriptionModal = ({ open, onClose, onSelectPlan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const swiperRef = useRef(null);
  const autoScrollDone = useRef(false);

  const onSwiperInit = useCallback((swiper) => {
    swiperRef.current = swiper;
  }, []);

  useEffect(() => {
    if (!open) {
      autoScrollDone.current = false;
      return;
    }
    if (autoScrollDone.current) return;

    const timer = setTimeout(() => {
      const swiper = swiperRef.current;
      if (!swiper || swiper.destroyed) return;
      const lastIndex = swiper.slides?.length ? swiper.slides.length - 1 : 0;
      if (lastIndex === 0) return;
      swiper.slideTo(0, 0);
      setTimeout(() => {
        if (!swiper || swiper.destroyed) return;
        swiper.slideTo(lastIndex, 1200);
        setTimeout(() => {
          if (!swiper || swiper.destroyed) return;
          swiper.slideTo(0, 1200);
          autoScrollDone.current = true;
        }, 1400);
      }, 300);
    }, 400);

    return () => clearTimeout(timer);
  }, [open, plans.length]);

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
      icon: <StarIcon />,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      popular: false,
      features: [
        'Hasta 3 contratos Grátis',
        'Gestión completa',
      ],
    },
    FREE: {
      id: 'basic',
      description: 'Perfecto para comenzar',
      icon: <StarIcon />,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
      icon: <BusinessIcon />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
      icon: <PremiumIcon />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
        id: preset.id,
        name: p.name || code,
        price: p.priceArs != null ? formatArs(p.priceArs) : (code === 'FREE' ? 'Gratis' : formatArs(0)),
        period: '/mes',
        description: preset.description,
        icon: preset.icon,
        color: preset.color,
        gradient: preset.gradient,
        popular: preset.popular,
        features: preset.features,
        backendCode: p.code,
      };
    });
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
    const planCodeMap = {
      basic: 'PLAN-PRO',
      professional: 'PLAN-PROF',
      premium: 'PLAN-SUP'
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
          sx: { bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' },
        },
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '92%', md: '82%', lg: '72%' },
          maxWidth: 1100,
          height: { xs: '93%', md: '85%' },
          background: isDark
            ? 'linear-gradient(160deg, #0f0f1a 0%, #1a1028 40%, #0f0f1a 100%)'
            : 'linear-gradient(160deg, #faf8ff 0%, #f0ebff 40%, #faf8ff 100%)',
          borderRadius: 5,
          boxShadow: '0 32px 100px rgba(139,92,246,0.15), 0 0 0 1px rgba(139,92,246,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <Box sx={{
            px: { xs: 2.5, md: 4 },
            py: { xs: 2.5, md: 3 },
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ position: 'absolute', bottom: -20, left: '40%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <WorkspacePremiumIcon sx={{ color: '#fbbf24', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                  Planes Premium
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
                  Elige el plan perfecto para tu negocio
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, zIndex: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Plans Swiper */}
          <Box sx={{
            flex: 1,
            p: { xs: 1.5, md: 2.5 },
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            <Swiper
              onSwiper={onSwiperInit}
              modules={[Navigation, Pagination, EffectCoverflow]}
              spaceBetween={20}
              slidesPerView={isMobile ? 1 : 3}
              centeredSlides={true}
              effect="coverflow"
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              navigation={!isMobile}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              style={{
                width: '100%',
                height: '100%',
                paddingTop: '40px',
                paddingBottom: '40px'
              }}
            >
              {subscriptionPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                <SwiperSlide key={plan.id}>
                  <Box
                    sx={{
                      height: { xs: '430px', md: '410px' },
                      maxHeight: { xs: '430px', md: '410px' },
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      background: plan.gradient,
                      boxShadow: isSelected
                        ? `0 20px 50px ${plan.color}50, 0 0 0 2px ${plan.color}`
                        : `0 8px 30px ${plan.color}20`,
                      '&:hover': {
                        transform: 'translateY(-6px) scale(1.01)',
                        boxShadow: `0 24px 60px ${plan.color}40`,
                      },
                    }}
                  >
                    {/* Glass inner card */}
                    <Box sx={{
                      position: 'absolute', inset: 0,
                      background: isDark
                        ? 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.95) 100%)',
                      backdropFilter: 'blur(40px)',
                    }} />

                    {/* Gradient accent top */}
                    <Box sx={{ position: 'relative', height: 4, background: plan.gradient, zIndex: 1 }} />

                    {/* Decorative glow */}
                    <Box sx={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `${plan.color}15`, filter: 'blur(20px)', zIndex: 0 }} />
                    <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: `${plan.color}10`, filter: 'blur(20px)', zIndex: 0 }} />

                    {plan.popular && (
                      <Chip
                        label="MÁS POPULAR"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
                          background: plan.gradient,
                          fontWeight: 700,
                          fontSize: '0.55rem',
                          height: 24,
                          zIndex: 10,
                          color: '#fff',
                          letterSpacing: 0.8,
                          boxShadow: `0 4px 12px ${plan.color}40`,
                        }}
                      />
                    )}

                    <Box sx={{ p: { xs: 2.5, md: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                      {/* Plan Icon */}
                      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                        <Box sx={{
                          width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 1,
                          background: plan.gradient,
                          boxShadow: `0 8px 24px ${plan.color}35`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff',
                          '& .MuiSvgIcon-root': { fontSize: 26 },
                        }}>
                          {plan.icon}
                        </Box>
                        <Typography variant="h6" sx={{
                          fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.2rem' },
                          background: plan.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: isDark ? 'unset' : 'transparent',
                          color: isDark ? '#fff' : undefined,
                        }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.7rem' }}>
                          {plan.description}
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Box sx={{
                        textAlign: 'center', mb: 2, py: 1.5, mx: -1,
                        borderRadius: 2.5,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : `${plan.color}08`,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : `${plan.color}15`}`,
                      }}>
                        <Typography sx={{
                          fontWeight: 900, fontSize: { xs: '1.8rem', md: '2rem' }, lineHeight: 1,
                          color: isDark ? '#fff' : plan.color,
                        }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', fontSize: '0.7rem' }}>
                          {plan.period}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <Box sx={{ flex: 1, overflow: 'auto', mb: 1.5 }}>
                        {plan.features.slice(0, isMobile ? 4 : plan.features.length).map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                            <Box sx={{
                              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                              background: plan.gradient, color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: `0 2px 6px ${plan.color}30`,
                            }}>
                              <CheckIcon sx={{ fontSize: 13 }} />
                            </Box>
                            <Typography variant="body2" sx={{
                              fontSize: { xs: '0.78rem', md: '0.82rem' }, lineHeight: 1.3,
                              color: isDark ? 'rgba(255,255,255,0.85)' : 'text.primary',
                            }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                        {isMobile && plan.features.length > 4 && (
                          <Typography variant="caption" sx={{ fontStyle: 'italic', pl: 3.5, color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary' }}>
                            +{plan.features.length - 4} más
                          </Typography>
                        )}
                      </Box>

                      {/* Select Button */}
                      {plan.name !== 'Free' && (
                        <Button
                          fullWidth
                          onClick={() => handleSelectPlan(plan)}
                          sx={{
                            py: 1.2,
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textTransform: 'none',
                            background: isSelected ? plan.gradient : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'),
                            color: isSelected ? '#fff' : plan.color,
                            border: isSelected ? 'none' : `1.5px solid ${plan.color}50`,
                            boxShadow: isSelected ? `0 6px 20px ${plan.color}40` : 'none',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              background: plan.gradient,
                              color: '#fff',
                              border: 'none',
                              boxShadow: `0 8px 24px ${plan.color}45`,
                              transform: 'scale(1.02)',
                            },
                          }}
                        >
                          {isSelected ? '✓ Seleccionado' : 'Seleccionar plan'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </SwiperSlide>
                );
              })}
            </Swiper>
          </Box>

          {/* Footer */}
          <Box sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.08)'}`,
          }}>
            {['Cancela cuando quieras', 'Soporte 24/7', 'Garantía 30 días'].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', fontSize: '0.65rem' }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>
    </Modal>

    {/* Confirmación de Checkout */}
    <Dialog
      open={confirmOpen}
      onClose={() => (!isSubmitting ? setConfirmOpen(false) : null)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: isDark ? '#111118' : '#fff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        }
      }}
    >
      {selectedPlan && (
        <>
          <Box sx={{ height: 6, background: selectedPlan.gradient }} />
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, pt: 2.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2.5,
              background: selectedPlan.gradient,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${selectedPlan.color}30`,
              '& .MuiSvgIcon-root': { fontSize: 18 },
            }}>
              {selectedPlan.icon}
            </Box>
            Confirmar suscripción
          </DialogTitle>
          <DialogContent>
            <Box sx={{
              p: 2.5, borderRadius: 3, mb: 2,
              background: isDark
                ? `linear-gradient(135deg, ${selectedPlan.color}12 0%, ${selectedPlan.color}06 100%)`
                : `linear-gradient(135deg, ${selectedPlan.color}08 0%, ${selectedPlan.color}03 100%)`,
              border: `1px solid ${isDark ? `${selectedPlan.color}20` : `${selectedPlan.color}15`}`,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: selectedPlan.color }}>
                {selectedPlan.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPlan.description}
              </Typography>
              <Typography sx={{ fontWeight: 900, mt: 1, fontSize: '1.5rem', color: isDark ? '#fff' : selectedPlan.color }}>
                {selectedPlan.price}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {selectedPlan.period}
                </Typography>
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
            </Typography>
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={isSubmitting} sx={{ borderRadius: 2.5, color: 'text.secondary', px: 3 }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: 2.5,
                background: selectedPlan.gradient,
                fontWeight: 700,
                px: 4,
                py: 1.2,
                boxShadow: `0 6px 20px ${selectedPlan.color}35`,
                '&:hover': { boxShadow: `0 8px 28px ${selectedPlan.color}50`, transform: 'scale(1.02)' },
              }}
            >
              {isSubmitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirmar y pagar'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
    </>
  );
};

export default SubscriptionModal;
