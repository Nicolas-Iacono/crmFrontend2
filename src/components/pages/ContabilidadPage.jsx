import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Modal,
  TextField,
  MenuItem,
  Alert,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  SwipeableDrawer,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  SwipeLeft as SwipeLeftIcon,
  BarChart as BarChartIcon,
  FiberManualRecord as DotIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/GlobalAuth';
import ingresoApi from '../api/ingresoApi';
import contratoApi from '../api/contratoApi';
import axios from 'axios';
import { config } from '../../config/env';
import { keyframes } from '@mui/system';

/** Parse seguro: evita corrimientos por UTC cuando viene 'yyyy-MM-dd' */
const asLocalDate = (s) => {
  if (s instanceof Date) return s;
  if (typeof s === 'string') {
    const dStr = s.slice(0, 10); // toma solo 'yyyy-MM-dd' si viniera con 'T...'
    return parse(dStr, 'yyyy-MM-dd', new Date());
  }
  return new Date(s);
};

/** Convierte posibles strings/BigDecimal a número */
const num = (v) => (v == null || v === '' ? 0 : Number(v));

const ContabilidadPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // (si lo necesitás después)
  const { usuarioFetch } = useAuth();

  // --- STATE ---
  const [user, setUser] = useState({ name: '', authorities: '' });
  const [contratos, setContratos] = useState([]);

  // Mes para ingresos de la API
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  // Mes contable para contratos (activos/honorarios)
  const [selectedContractMonth, setSelectedContractMonth] = useState(new Date());
  
  // Estado para el swipe de la card
  const [currentCardLayer, setCurrentCardLayer] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingContratos, setLoadingContratos] = useState(false);

  // Ingresos desde la API
  const [ingresosMensuales, setIngresosMensuales] = useState([]);
  const [loadingIngresos, setLoadingIngresos] = useState(false);
  
  // Ingresos anuales desde la API
  const [ingresosAnuales, setIngresosAnuales] = useState([]);
  const [loadingIngresosAnuales, setLoadingIngresosAnuales] = useState(false);
  
  // Ingresos manuales (form del modal)
  const [ingresos, setIngresos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: new Date(),
    categoria: 'alquiler',
    descripcion: ''
  });

  // --- EFECTOS ---
  useEffect(() => {
    if (usuarioFetch) {
      setUser({
        name: usuarioFetch.username,
        authorities: usuarioFetch.authorities
      });
    }
  }, []);

  useEffect(() => {
    const fetchContratos = async () => {
      if (!usuarioFetch.username) return;
      setLoadingContratos(true);
      try {
        const { data } = await contratoApi.buscarContratoPorUsuario();
        setContratos(data || []);
      } catch (err) {
        setError(err?.message || 'Error al cargar contratos');
      } finally {
        setLoadingContratos(false);
      }
    };
    fetchContratos();
  }, [user.name]);

  // Generar y cargar ingresos automáticamente al cargar la página
  useEffect(() => {
    const fetchIngresos = async () => {
      try {
        await axios.post(
          `${config.API_URL}/ingresos/generar`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        // Fetch de mensuales con los parámetros requeridos: mes, anio, userId
        const mes = (selectedMonth?.getMonth?.() ?? new Date().getMonth()) + 1;
        const anio = selectedMonth?.getFullYear?.() ?? new Date().getFullYear();
        const userId = usuarioFetch?.id;
        if (!userId) return;
        const res = await axios.get(`${config.API_URL}/ingresos/mensuales`, {
          params: { mes, anio },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setIngresos(res.data);
      } catch (error) {
        console.error("Error al cargar ingresos", error);
      }
    };
    fetchIngresos();
  }, []);

  // Fetch ingresos mensuales desde la API
  useEffect(() => {
    const fetchIngresosMensuales = async () => {
      if (!usuarioFetch.id) return;
      setLoadingIngresos(true);
      try {
        const mes = selectedMonth.getMonth() + 1; // getMonth() devuelve 0-11
        const anio = selectedMonth.getFullYear();
        const response = await ingresoApi.getMensuales(usuarioFetch.id, mes, anio);
        setIngresosMensuales(response.data || []);
      } catch (err) {
        console.error('Error al cargar ingresos mensuales:', err);
        setError(err?.message || 'Error al cargar ingresos mensuales');
      } finally {
        setLoadingIngresos(false);
      }
    };
    fetchIngresosMensuales();
  }, [usuarioFetch?.id, selectedMonth]);

  // Fetch ingresos anuales desde la API
  useEffect(() => {
    const fetchIngresosAnuales = async () => {
      if (!usuarioFetch.id) return;
      setLoadingIngresosAnuales(true);
      try {
        const response = await ingresoApi.getAnual(usuarioFetch.id, selectedYear);
        setIngresosAnuales(response.data || []);
      } catch (err) {
        console.error('Error al cargar ingresos anuales:', err);
        setError(err?.message || 'Error al cargar ingresos anuales');
      } finally {
        setLoadingIngresosAnuales(false);
      }
    };
    fetchIngresosAnuales();
  }, [usuarioFetch?.id, selectedYear]);

  // --- UTILIDADES ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nuevoIngreso = {
        id: Date.now(),
        ...formData,
        monto: parseFloat(formData.monto),
        fechaCreacion: new Date()
      };
      setIngresos((prev) => [...prev, nuevoIngreso]);
      setFormData({
        concepto: '',
        monto: '',
        fecha: new Date(),
        categoria: 'alquiler',
        descripcion: ''
      });
      setOpenModal(false);
      setSuccess('Ingreso registrado correctamente');
    } catch {
      setError('Error al registrar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  // Regenerar ingresos manualmente desde botón y refrescar vista
  const handleRegenerarIngresos = async () => {
    try {
      setRefreshing(true);
      await axios.post(
        `${config.API_URL}/ingresos/generar`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const mes = selectedMonth.getMonth() + 1;
      const anio = selectedMonth.getFullYear();
      if (!usuarioFetch?.id) return;
      const response = await ingresoApi.getMensuales(usuarioFetch.id, mes, anio);
      setIngresosMensuales(response.data || []);
      setSuccess('Ingresos actualizados');
    } catch (e) {
      console.error('Error al regenerar ingresos', e);
    }
    finally {
      setRefreshing(false);
    }
  };

  // --- CÁLCULOS DINÁMICOS DESDE LA API ---
  // Calcular totales desde la API de ingresos mensuales
  const totalIngresosPorMes = ingresosMensuales.reduce((total, ingreso) => {
    return total + num(ingreso.ingresoCalculadoPorMes);
  }, 0);

  const totalIngresosPorContrato = ingresosMensuales.reduce((total, ingreso) => {
    return total + num(ingreso.ingresoCalculadoPorContrato);
  }, 0);

  const totalMontoAlquileres = ingresosMensuales.reduce((total, ingreso) => {
    return total + num(ingreso.montoAlquiler);
  }, 0);

  // Sumar ingresos manuales del mes seleccionado
  const ingresosManualesDelMes = ingresos
    .filter((ingreso) => {
      const fechaIngreso = new Date(ingreso.fecha);
      return (
        fechaIngreso.getMonth() === selectedMonth.getMonth() &&
        fechaIngreso.getFullYear() === selectedMonth.getFullYear()
      );
    })
    .reduce((total, ingreso) => total + num(ingreso.monto), 0);

  const totalIngresos = totalIngresosPorMes + totalIngresosPorContrato + ingresosManualesDelMes;

  // Función para calcular ingresos de contratos por mes (fallback cuando no hay datos de API)
  const calcularIngresosPorMesDesdeContratos = (mes, anio) => {
    const monthStart = new Date(anio, mes - 1, 1);
    const monthEnd = new Date(anio, mes, 0);
    
    // Contratos activos en ese mes
    const contratosActivos = contratos.filter(c => {
      if (!c?.fecha_inicio) return false;
      const fi = asLocalDate(c.fecha_inicio);
      const ff = c.fecha_fin ? asLocalDate(c.fecha_fin) : null;
      return fi <= monthEnd && (!ff || ff >= monthStart);
    });
    
    // Contratos firmados en ese mes
    const contratosFirmados = contratos.filter(c => {
      if (!c?.fecha_inicio) return false;
      const fi = asLocalDate(c.fecha_inicio);
      return fi >= monthStart && fi <= monthEnd;
    });
    
    // Calcular comisiones mensuales (5% del monto de alquiler)
    const comisionesMensuales = contratosActivos.reduce((acc, c) => {
      return acc + (num(c.montoAlquiler) * 0.05);
    }, 0);
    
    // Calcular honorarios por contratos firmados (4% del monto anual)
    const honorariosContrato = contratosFirmados.reduce((acc, c) => {
      const monto = num(c.montoAlquiler);
      const duracion = num(c.duracion) || 12;
      const montoAnual = monto * duracion;
      return acc + (montoAnual * 0.04);
    }, 0);
    
    return {
      totalComisionesMensuales: comisionesMensuales,
      totalHonorariosContrato: honorariosContrato,
      totalDelMes: comisionesMensuales + honorariosContrato
    };
  };

  // Combinar datos de API con datos calculados de contratos
  const datosAnualesCompletos = React.useMemo(() => {
    const mesesCompletos = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      // Buscar datos de la API para este mes
      const datosAPI = ingresosAnuales.find(m => m.mes === mes);
      
      if (datosAPI) {
        // Si hay datos de la API, usarlos
        mesesCompletos.push(datosAPI);
      } else {
        // Si no hay datos de la API, calcular desde contratos
        const datosCalculados = calcularIngresosPorMesDesdeContratos(mes, selectedYear);
        mesesCompletos.push({
          mes: mes,
          anio: selectedYear,
          totalComisionesMensuales: datosCalculados.totalComisionesMensuales,
          totalHonorariosContrato: datosCalculados.totalHonorariosContrato,
          totalDelMes: datosCalculados.totalDelMes,
          esCalculado: true // Marcar como calculado para diferenciarlo
        });
      }
    }
    
    return mesesCompletos;
  }, [ingresosAnuales, contratos, selectedYear]);

  // --- CONTRATOS: cierre contable por mes (mantenemos para compatibilidad) ---
  const monthStart = startOfMonth(selectedContractMonth);
  const monthEnd = endOfMonth(selectedContractMonth);

  // Contratos activos en el período (superposición de rangos)
  const contratosActivosEnMes = React.useMemo(() => {
    return (contratos || []).filter((c) => {
      if (!c?.fecha_inicio) return false;
      const fi = asLocalDate(c.fecha_inicio);
      const ff = c.fecha_fin ? asLocalDate(c.fecha_fin) : null;
      return fi <= monthEnd && (!ff || ff >= monthStart);
    });
  }, [contratos, selectedContractMonth]);

  // Contratos firmados en el mes (para honorarios por única vez)
  const contratosFirmadosEnMes = React.useMemo(() => {
    return (contratos || []).filter((c) => {
      if (!c?.fecha_inicio) return false;
      const fi = asLocalDate(c.fecha_inicio);
      return fi >= monthStart && fi <= monthEnd;
    });
  }, [contratos, selectedContractMonth]);

  // Datos para el gráfico anual
  const monthlyData = React.useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(selectedYear, i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Contratos activos en ese mes
      const activeContracts = contratos.filter(c => {
        if (!c?.fecha_inicio) return false;
        const fi = asLocalDate(c.fecha_inicio);
        const ff = c.fecha_fin ? asLocalDate(c.fecha_fin) : null;
        return fi <= monthEnd && (!ff || ff >= monthStart);
      });
      
      // Contratos firmados en ese mes
      const signedContracts = contratos.filter(c => {
        if (!c?.fecha_inicio) return false;
        const fi = asLocalDate(c.fecha_inicio);
        return fi >= monthStart && fi <= monthEnd;
      });
      
      // Calcular comisiones mensuales (5% del monto de alquiler)
      const monthlyCommissions = activeContracts.reduce((acc, c) => acc + (num(c.montoAlquiler) * 0.05), 0);
      // Calcular honorarios por contratos firmados (4% del monto anual)
      const contractFees = signedContracts.reduce((acc, c) => {
        const monto = num(c.montoAlquiler);
        const duracion = num(c.duracion) || 12;
        const montoAnual = monto * duracion;
        return acc + (montoAnual * 0.04);
      }, 0);
      
      return {
        month: format(monthDate, 'MMM', { locale: es }),
        monthlyCommissions,
        contractFees,
        total: monthlyCommissions + contractFees
      };
    });
    
    return months;
  }, [contratos, selectedYear]);
  
  const annualTotal = monthlyData.reduce((acc, month) => acc + month.total, 0);

  // Limpia las alertas
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  // --- UI ---
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 ,marginTop: 3}}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main }}
          >
            Mis ingresos
          </Typography>
        </Box>

      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Selector de Mes + botón regenerar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <TextField
          select
          label="Seleccionar Mes/Año"
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => {
            const [year, month] = e.target.value.split('-');
            setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
          }}
          size="small"
          sx={{ minWidth: 220, flex: 1 }}
        >
          {Array.from({ length: 24 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return (
              <MenuItem key={i} value={format(date, 'yyyy-MM')}>
                {format(date, 'MMMM yyyy', { locale: es })}
              </MenuItem>
            );
          })}
        </TextField>

        <IconButton
          aria-label="Regenerar ingresos"
          onClick={handleRegenerarIngresos}
          disabled={refreshing}
          sx={{ ml: 1, color: 'success.main', border: '1px solid', borderColor: 'success.main' }}
        >
          <RefreshIcon sx={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            }
          }} />
        </IconButton>
      </Box>

      {/* Cards de Resumen de Ingresos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Resumen de Ingresos */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius:3, height: '100%', background: 'linear-gradient(135deg,rgb(53, 74, 168) 0%,rgb(122, 15, 228) 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold">
                  Resumen de Ingresos
                </Typography>
              </Box>
              
              {loadingIngresos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress color="inherit" />
                </Box>
              ) : (
                <>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                    {formatCurrency(totalIngresos)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                    {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Comisiones Mensuales</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(totalIngresosPorMes)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Honorarios Contratos</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(totalIngresosPorContrato)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Otros Ingresos</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(ingresosManualesDelMes)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contratos del Mes */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
               
                <Typography variant="h6" fontWeight="bold">
                  Contratos del Mes
                </Typography>
              </Box>
              
              {loadingIngresos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold" color="rgb(53, 74, 168)" sx={{ mb: 1 }}>
                    {ingresosMensuales.length}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {format(selectedMonth, 'MMMM yyyy', { locale: es })}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total en alquileres:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(totalMontoAlquileres)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Ingresos Mensuales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Detalle de Ingresos - {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </Typography>
              
              {loadingIngresos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : ingresosMensuales.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No hay ingresos registrados en este mes
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {ingresosMensuales.map((ingreso, index) => (
                    <Grid item xs={12} sm={6} md={4} key={ingreso.id || index}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            {ingreso.nombreContrato || 'Sin nombre'}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Monto Alquiler: {formatCurrency(num(ingreso.montoAlquiler))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Comisión Mensual ({ingreso.porcentajeComisionMensual}%): {formatCurrency(num(ingreso.ingresoCalculadoPorMes))}
                            </Typography>
                            {num(ingreso.ingresoCalculadoPorContrato) > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                Honorario Contrato ({ingreso.porcentajeComisionContrato}%): {formatCurrency(num(ingreso.ingresoCalculadoPorContrato))}
                              </Typography>
                            )}
                          </Box>
                          
                          <Chip
                            label={num(ingreso.ingresoCalculadoPorContrato) > 0 ? "Con Honorario" : "Solo Comisión"}
                            color={num(ingreso.ingresoCalculadoPorContrato) > 0 ? "primary" : "success"}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Total: {formatCurrency(num(ingreso.ingresoCalculadoPorMes) + num(ingreso.ingresoCalculadoPorContrato))}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 10,
          display: 'flex',
          gap: 1
        }}>
          {[0, 1].map((index) => (
            <DotIcon 
              key={index}
              sx={{ 
                fontSize: 12,
                color: currentCardLayer === index ? theme.palette.primary.main : theme.palette.grey[400],
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}
              onClick={() => setCurrentCardLayer(index)}
            />
          ))}
        </Box>
        
        {/* Container con animación de deslizamiento */}
        <Box sx={{ 
          position: 'relative',
          width: '100%', // Doble ancho para contener ambas capas
          display: 'flex',
         
        }}>
          {/* Capa 0: Ingresos Mensuales (placeholder) */}
        
          
          {/* Capa 1: Gráfico Anual desde API */}
          <Box sx={{ 
            width: '100%',
            
          }}>
            <CardContent sx={{ minHeight: { xs: '500px', sm: '600px' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Análisis Anual de Ingresos
              </Typography>
              <TextField
                select
                label="Año"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>
            
            {loadingIngresosAnuales ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Cargando datos anuales...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Total Anual */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.primary.light + '10', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? 'white' : 'inherit', textAlign: 'center' }}>
                    Total anual {selectedYear}: 
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? 'white' : 'inherit', textAlign: 'center' }}>
                    {formatCurrency(ingresosAnuales.reduce((total, mes) => total + num(mes.totalDelMes), 0))}
                  </Typography>
                </Box>
                
                {/* Gráfico de barras */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    Ingresos mensuales {selectedYear}
                  </Typography>
                  
                  <Box sx={{ 
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': {
                      height: 4,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: 2,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'end', 
                      gap: { xs: 0.5, sm: 1 }, 
                      height: { xs: 180, sm: 220 }, 
                      px: 1,
                      minWidth: { xs: 400, sm: 'auto' },
                      justifyContent: { xs: 'flex-start', sm: 'space-between' }
                    }}>
                      {Array.from({ length: 12 }, (_, i) => {
                        const mesNumero = i + 1;
                        const mesData = ingresosAnuales.find(m => m.mes === mesNumero);
                        const maxValue = ingresosAnuales.length > 0 ? Math.max(...ingresosAnuales.map(m => num(m.totalDelMes))) : 0;
                        const chartHeight = { xs: 120, sm: 150 };
                        const currentHeight = isMobile ? chartHeight.xs : chartHeight.sm;
                        
                        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        
                        return (
                          <Box key={i} sx={{ 
                            flex: { xs: '0 0 auto', sm: 1 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            minWidth: { xs: 28, sm: 'auto' }
                          }}>
                            {/* Tooltip con valor total */}
                            <Box sx={{ 
                              mb: 0.5, 
                              opacity: mesData && num(mesData.totalDelMes) > 0 ? 1 : 0,
                              transition: 'opacity 0.2s'
                            }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: { xs: '0.6rem', sm: '0.7rem' }, 
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  backgroundColor: theme.palette.background.paper,
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  border: `1px solid ${theme.palette.divider}`,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {mesData && num(mesData.totalDelMes) > 0 ? formatCurrency(num(mesData.totalDelMes)).replace('ARS', '').replace('$', '$').trim() : ''}
                              </Typography>
                            </Box>
                            
                            {/* Container de las barras */}
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column-reverse',
                              alignItems: 'center',
                              mb: 1,
                              position: 'relative'
                            }}>
                              {/* Barra de comisiones mensuales */}
                              <Box sx={{
                                width: { xs: 16, sm: 24 },
                                height: mesData && maxValue > 0 ? (num(mesData.totalComisionesMensuales) / maxValue) * currentHeight : 0,
                                backgroundColor: theme.palette.success.main,
                                borderRadius: mesData && num(mesData.totalHonorariosContrato) > 0 ? '4px 4px 0 0' : '4px',
                                minHeight: mesData && num(mesData.totalComisionesMensuales) > 0 ? 3 : 0,
                                transition: 'all 0.3s ease',
                                boxShadow: mesData && num(mesData.totalComisionesMensuales) > 0 ? `0 2px 4px ${theme.palette.success.main}40` : 'none',
                                '&:hover': {
                                  backgroundColor: theme.palette.success.dark,
                                  transform: 'scaleX(1.1)'
                                }
                              }} />
                              
                              {/* Barra de honorarios por contrato */}
                              <Box sx={{
                                width: { xs: 16, sm: 24 },
                                height: mesData && maxValue > 0 ? (num(mesData.totalHonorariosContrato) / maxValue) * currentHeight : 0,
                                backgroundColor: theme.palette.warning.main,
                                borderRadius: mesData && num(mesData.totalComisionesMensuales) > 0 ? '0 0 4px 4px' : '4px',
                                minHeight: mesData && num(mesData.totalHonorariosContrato) > 0 ? 3 : 0,
                                transition: 'all 0.3s ease',
                                boxShadow: mesData && num(mesData.totalHonorariosContrato) > 0 ? `0 2px 4px ${theme.palette.warning.main}40` : 'none',
                                '&:hover': {
                                  backgroundColor: theme.palette.warning.dark,
                                  transform: 'scaleX(1.1)'
                                }
                              }} />
                            </Box>
                            
                            {/* Etiqueta del mes */}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
                                textAlign: 'center',
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                                textTransform: 'capitalize'
                              }}
                            >
                              {monthNames[i]}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  
                  {/* Línea de base del gráfico */}
                  <Box sx={{ 
                    height: 1, 
                    backgroundColor: theme.palette.divider, 
                    mx: 1, 
                    mt: -1 
                  }} />
                </Box>
                
                {/* Leyenda */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: { xs: 2, sm: 3 }, 
                  mt: 2,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: { xs: 10, sm: 12 }, 
                      height: { xs: 10, sm: 12 }, 
                      backgroundColor: theme.palette.success.main, 
                      borderRadius: 1,
                      boxShadow: `0 1px 3px ${theme.palette.success.main}40`
                    }} />
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Comisiones Mensuales
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: { xs: 10, sm: 12 }, 
                      height: { xs: 10, sm: 12 }, 
                      backgroundColor: theme.palette.warning.main, 
                      borderRadius: 1,
                      boxShadow: `0 1px 3px ${theme.palette.warning.main}40`
                    }} />
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Honorarios por Contrato
                    </Typography>
                  </Box>
                </Box>
                
                {/* Resumen de datos */}
                {ingresosAnuales.length > 0 && (
                  <Box sx={{ mt: 3, p: 2,  borderRadius:3, height: '100%', background: 'linear-gradient(135deg,rgb(53, 74, 168) 0%,rgb(122, 15, 228) 100%)', color: 'white'  }}>
                    <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                      Resumen del año {selectedYear}:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Comisiones: {formatCurrency(ingresosAnuales.reduce((total, mes) => total + num(mes.totalComisionesMensuales), 0))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Honorarios: {formatCurrency(ingresosAnuales.reduce((total, mes) => total + num(mes.totalHonorariosContrato), 0))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Meses con ingresos: {ingresosAnuales.filter(mes => num(mes.totalDelMes) > 0).length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Botón para volver */}
           
              </>
            )}
            </CardContent>
          </Box>
        </Box>
        
        {/* Botón flotante para navegar */}

      </Card>

      <Modal open={openModal} onClose={() => setOpenModal(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: '90%',
            maxWidth: 500,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
  

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Concepto"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Alquiler Departamento Av. Corrientes 1234"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto"
                  name="monto"
                  type="number"
                  value={formData.monto}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Categoría"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                >
                  {[
                    { value: 'alquiler', label: 'Alquiler' },
                    { value: 'comision', label: 'Comisión' },
                    { value: 'honorarios', label: 'Honorarios' },
                    { value: 'sellado', label: 'Sellado' },
                    { value: 'gastos_admin', label: 'Gastos Administrativos' },
                    { value: 'otros', label: 'Otros' }
                  ].map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Fecha del Ingreso"
                  name="fecha"
                  type="date"
                  value={format(formData.fecha, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setFormData((prev) => ({ ...prev, fecha: newDate }));
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción (opcional)"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder="Información adicional sobre el ingreso"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setOpenModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Ingreso'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
};

export default ContabilidadPage;
