import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import PropietarioApi from '../../api/propietarios';
import PropiedadesApi from '../../api/propiedades';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const AsignarPropietario = () => {
  const { id: propiedadId } = useParams();
  const navigate = useNavigate();
  const [searchTermPropietario, setSearchTermPropietario] = useState('');
  const [propietarios, setPropietarios] = useState([]);
  const [user, setUser] = useState({
    name: "",
    authorities: "",
  });

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

  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        if (!user.name) return;
        const response = await PropietarioApi.buscarPropietarioPorUsuario(user.name);

        const propietariosObtenidos = Array.isArray(response.data)
          ? response.data
          : (response.data?.data && Array.isArray(response.data.data))
          ? response.data.data
          : [];

        setPropietarios(propietariosObtenidos);
      } catch (error) {
        console.error('Error fetching propietarios:', error);
        setPropietarios([]);
      }
    };
    fetchPropietarios();
  }, [user]);

  const validationSchema = Yup.object({
    id_propietario: Yup.string().required('Debe seleccionar un propietario'),
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, marginTop: "4rem" }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Asignar Propietario a la Propiedad
        </Typography>

        <Formik
          initialValues={{ id_propietario: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await PropiedadesApi.asignarPropietario(propiedadId, values.id_propietario);
              Swal.fire('¡Éxito!', 'Propietario asignado correctamente.', 'success');
              navigate('/propiedades');
            } catch (error) {
              Swal.fire('Error', 'No se pudo asignar el propietario.', 'error');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Campo de búsqueda */}
              <TextField
                fullWidth
                label="Buscar Propietario"
                variant="outlined"
                value={searchTermPropietario}
                onChange={(e) => setSearchTermPropietario(e.target.value)}
                sx={{ mb: 2, width: "100%", '& .MuiOutlinedInput-root': { borderRadius: '8px' } , marginTop:"2rem"}}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>
                  ),
                }}
                placeholder="Buscar por nombre, apellido, dni, email, teléfono"
              />

              {/* Select de propietarios */}
              <FormControl fullWidth>
                <InputLabel id="propietario-label">Propietario</InputLabel>
                <Select
                  labelId="propietario-label"
                  value={values.id_propietario}
                  onChange={(e) => setFieldValue("id_propietario", e.target.value)}
                  sx={{
                    width: "100%",
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                    '& .MuiSelect-select': { padding: '12px' }
                  }}
                >
                  <MenuItem value="">
                    <em>Seleccione un propietario</em>
                  </MenuItem>
                  {propietarios
                    .filter((propietario) => {
                      if (searchTermPropietario === '') return true;
                      const termino = searchTermPropietario.toLowerCase();
                      return (
                        propietario.nombre?.toLowerCase().includes(termino) ||
                        propietario.apellido?.toLowerCase().includes(termino) ||
                        propietario.dni?.toLowerCase().includes(termino) ||
                        propietario.email?.toLowerCase().includes(termino) ||
                        propietario.telefono?.toLowerCase().includes(termino)
                      );
                    })
                    .map((propietario) => (
                      <MenuItem key={propietario.id} value={propietario.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">
                            {`${propietario.nombre} ${propietario.apellido}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {propietario.dni && `DNI: ${propietario.dni}`}
                            {propietario.telefono && ` • Tel: ${propietario.telefono}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
                <ErrorMessage name="id_propietario" component="div" style={{ color: 'red', marginLeft: '1rem' }} />
              </FormControl>

              <Box sx={{ mt: 5 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting} sx={{ borderRadius: '6px',width:"100%",margin:"0 auto" }}>
                  Guardar
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default AsignarPropietario;
