import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Grid2,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from "@mui/material";
import SelectContract from "../../common/SelectContract";
import ServicioDetalle from "../../common/serviciosCommon/ServicioDetalle";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  empresa: Yup.string().required("El tipo de servicio es obligatorio"),
  porcentaje: Yup.number()
    .required("El porcentaje es obligatorio")
    .min(0, "Debe ser al menos 0")
    .max(100, "No puede exceder el 100"),
  descripcion: Yup.string().required("La descripción es obligatoria"),
  numeroMedidor: Yup.string().required("El número de medidor es obligatorio"),
  numeroCliente: Yup.string().required("El número de cliente es obligatorio"),
});

const NuevoServicio = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    authorities: "",
  })
  useEffect(() => {
    const username = localStorage.getItem("username");
    const authorities = localStorage.getItem("authorities");

    if (username) {
      setUser({
        name: username,
        authorities,
      });
    }
  }, []);
  const initialValues = {
    descripcion: "",
    empresa: "",
    porcentaje: 0,
    numeroCliente: "",
    numeroMedidor: "",
    id_contrato:0,
    usuario: user.name,
  };
  const [idContrato, setIdContrato] = useState(null);
  const handleSubmit = (values) => {
    console.log("Datos enviados:", values);
    alert("Formulario enviado con éxito");
  };

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
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 2 }}>
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

          <Tooltip title="Ir al inicio" placement="bottom">
            <IconButton
              onClick={() => navigate('/')}
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
              <HomeIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Grid2
        sx={{
          width: { xs: '100%', md: '50%' },
          mx: 'auto',
          p: { xs: '1.5rem', md: '2rem' },
          borderRadius: '10px',
          bgcolor: 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 2,
          minHeight: { xs: 'calc(100vh - 7rem)', md: 'auto' }
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1100,
            margin: "0 auto",
            padding: 3,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Crear Nuevo Servicio
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                {/* Selección de contrato */}

                <Grid2 sx={{display:"flex"}}>
                <Box sx={{
                width: "60%",
            maxWidth: 430,
            height: "36rem",
            padding: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection:"column",
            justifyContent: "space-around",
          }}>
           <Box sx={{
                width: "100%",
            height: "15rem",
            padding: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection:"column",
            justifyContent: "space-around",
          }}>
            <Typography variant="h6" gutterBottom>Seleccionar contrato</Typography>
            <Typography variant="p" gutterBottom>Selecciona el contrato al que se va aplicar el servicio</Typography>

               <SelectContract
              value={values.id_contrato}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setIdContrato={setIdContrato} // Callback para actualizar el ID
                />

                
               </Box>
                <Box sx={{height:"50%", display:"flex", flexDirection:"column", justifyContent:"flex-start",  padding:1}}>
                  <Typography variant="h6" gutterBottom>Servicios asignados</Typography>
                <ServicioDetalle id={idContrato} />

                </Box>
                
               </Box>

              
                <Box 
            
                sx={{
            width: "100%",
            maxWidth: 500,
            margin: "0 auto",
            padding: 3,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: 1,
          }}>


                {/* Tipo de servicio */}
                <TextField
                  select
                  label="Tipo de servicio"
                  name="empresa"
                  value={values.empresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.empresa && Boolean(errors.empresa)}
                  helperText={touched.empresa && errors.empresa}
                >
                  <MenuItem value="agua">Agua</MenuItem>
                  <MenuItem value="gas">Gas</MenuItem>
                  <MenuItem value="luz">Luz</MenuItem>
                  <MenuItem value="municipal">Municipal</MenuItem>
                </TextField>

                {/* Porcentaje */}
                <TextField
                  type="number"
                  label="Porcentaje"
                  name="porcentaje"
                  value={values.porcentaje}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.porcentaje && Boolean(errors.porcentaje)}
                  helperText={touched.porcentaje && errors.porcentaje}
                />

                {/* Descripción */}
                <TextField
                  label="Descripción del servicio"
                  name="descripcion"
                  value={values.descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.descripcion && Boolean(errors.descripcion)}
                  helperText={touched.descripcion && errors.descripcion}
                />

                {/* Número de medidor */}
                <TextField
                  label="Número de medidor"
                  name="numeroMedidor"
                  value={values.numeroMedidor}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.numeroMedidor && Boolean(errors.numeroMedidor)}
                  helperText={touched.numeroMedidor && errors.numeroMedidor}
                />

                {/* Número de cliente */}
                <TextField
                  label="Número de cliente"
                  name="numeroCliente"
                  value={values.numeroCliente}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.numeroCliente && Boolean(errors.numeroCliente)}
                  helperText={touched.numeroCliente && errors.numeroCliente}
                />

                {/* Botón de envío */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 2 }}
                >
                  Crear Servicio
                </Button>
                </Box>

                </Grid2>

              </Form>
            )}
          </Formik>
        </Box>
      </Grid2>
    </Box>
  );
};

export default NuevoServicio;
