import React, { useState, useEffect } from "react";
import { Box, Grid, useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

const NuevoRecibo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contrato/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json();
        // Check if the response has the expected structure with data property
        const contratosData = jsonResponse.data || jsonResponse;
        setContratos(Array.isArray(contratosData) ? contratosData : []);
      } catch (error) {
        console.error('Error fetching contratos:', error);
        setError('Error al cargar los contratos');
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  const [currentYear] = useState(new Date().getFullYear());
  const [nextYear] = useState(currentYear + 1);
  
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const periodos = [
    ...meses.map(mes => `${mes} ${currentYear}`),
    ...meses.map(mes => `${mes} ${nextYear}`)
  ];

  const servicios = ["Agua", "Luz", "Gas", "Municipal"];

  return (
    <Box
      sx={{
        width: '90%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: "2rem",
        pt: { xs: 2, md: 4 },
        pb: { xs: 8, md: 4 },
        px: { xs: 2, md: 0 },
        position: 'relative'
      }}
    >
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ position: 'absolute', top: 0, right: 60 }}>
            <Tooltip title="Ir al inicio" placement="bottom">
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
                  color: 'text.primary',
                  boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <HomeIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <Tooltip title="Volver" placement="bottom">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
                  color: 'text.primary',
                  boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <ArrowBackIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Grid
        sx={{
          width: { xs: '100%', md: '50%' },
          mx: 'auto',
          p: { xs: '1.5rem', md: '2rem' },
          borderRadius: '10px',
          bgcolor: 'background.paper',
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 2,
          minHeight: { xs: 'calc(100vh - 7rem)', md: 'auto' }
        }}
      >
        <Formik
          initialValues={{
            contrato: "",
            periodo: "",
            numeroRecibo: "",
            montoTotal: "",
            concepto: "Alquiler",
            servicios: {
              Agua: "0",
              Luz: "0",
              Gas: "0",
              Municipal: "0",
            },
          }}
          onSubmit={(values) => {
            // Find the selected contract
            const selectedContrato = contratos.find(c => c.id.toString() === values.contrato);
            if (selectedContrato) {
              // Navigate to ReciboForm with the selected contract and form values
              navigate('/recibo-form', { 
                state: { 
                  contrato: selectedContrato,
                  formValues: {
                    numeroRecibo: values.numeroRecibo,
                    periodo: values.periodo,
                    montoTotal: values.montoTotal || selectedContrato.montoAlquiler,
                    concepto: values.concepto,
                    servicios: values.servicios,
                  }
                } 
              });
            }
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Typography variant="h6" align="center" marginBottom={2}>
                Generar Recibo
              </Typography>

              <Grid container spacing={2}>
                {/* Selección de contrato */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Selección de contrato</InputLabel>
                    <Select
                      name="contrato"
                      value={values.contrato}
                      onChange={handleChange}
                    >
                      {loading ? (
                        <MenuItem disabled>Cargando contratos...</MenuItem>
                      ) : error ? (
                        <MenuItem disabled>Error al cargar contratos</MenuItem>
                      ) : contratos.length === 0 ? (
                        <MenuItem disabled>No hay contratos disponibles</MenuItem>
                      ) : (
                        contratos.map((contrato) => (
                          <MenuItem key={contrato.id} value={contrato.id.toString()}>
                            {contrato.nombreContrato} - {contrato.propiedad.direccion}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Periodo */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Periodo</InputLabel>
                    <Select
                      name="periodo"
                      value={values.periodo}
                      onChange={handleChange}
                    >
                      {periodos.map((periodo) => (
                        <MenuItem key={periodo} value={periodo}>
                          {periodo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Número de recibo */}
                <Grid item xs={6}>
                  <TextField
                    label="Número de recibo"
                    name="numeroRecibo"
                    type="number"
                    fullWidth
                    value={values.numeroRecibo}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Monto Total */}
                <Grid item xs={6}>
                  <TextField
                    label="Monto Total"
                    name="montoTotal"
                    type="number"
                    fullWidth
                    value={values.montoTotal}
                    onChange={handleChange}
                    placeholder={contratos.find(c => c.id.toString() === values.contrato)?.montoAlquiler || ""}
                    helperText="Si se deja vacío, se usará el monto del contrato"
                  />
                </Grid>

                {/* Concepto */}
                <Grid item xs={12}>
                  <TextField
                    label="Concepto"
                    name="concepto"
                    fullWidth
                    value={values.concepto}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* Servicios */}
                <Grid item xs={12}>
                  <Typography variant="h6">Servicios</Typography>
                </Grid>

                {servicios.map((servicio) => (
                  <Grid item xs={6} key={servicio}>
                    <TextField
                      label={servicio}
                      name={`servicios.${servicio}`}
                      type="number"
                      fullWidth
                      value={values.servicios[servicio]}
                      onChange={handleChange}
                    />
                  </Grid>
                ))}

                {/* Botón */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Generar Recibo
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Grid>
    </Box>
  );
};

export default NuevoRecibo;
