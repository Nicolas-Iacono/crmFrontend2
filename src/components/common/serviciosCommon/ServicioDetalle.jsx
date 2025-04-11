import { Box, Divider, Typography, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';

const ServicioDetalle = ({ id }) => {
  const [contratos, setContratos] = useState(null); // Datos del contrato
  const [servicioSeleccionado, setServicioSeleccionado] = useState(''); // Servicio seleccionado
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  // Obtener usuario desde localStorage
  useEffect(() => {
    const username = localStorage.getItem('username');
    const authorities = localStorage.getItem('authorities');
    if (username) {
      setUser({ name: username, authorities });
    }
  }, []);

  // Fetch de contratos
  useEffect(() => {
    if (id != null) {
      const fetchContratos = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contrato/buscar/${id}`);
          setContratos(response.data);
        } catch (error) {
          console.error('Error fetching contratos:', error);
        }
      };
      fetchContratos();
    }
  }, [id]);

  // Si no hay datos, mostrar un mensaje de carga
  if (!contratos) {
    return <Typography>Cargando...</Typography>;
  }

  const { impuestos } = contratos.data;

  // Manejar cambio de servicio seleccionado
  const handleChange = (event) => {
    setServicioSeleccionado(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid #ddd',
        borderRadius: 2,
        boxShadow: 1,
        width: '100%',
        padding: 2,
      }}
    >
      {/* Select para elegir servicio */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">Seleccione un Servicio</Typography>
        <Select
          value={servicioSeleccionado}
          onChange={handleChange}
          fullWidth
          displayEmpty
          sx={{ marginTop: 1 }}
        >
          <MenuItem value="">Todos los servicios</MenuItem>
          {Object.keys(impuestos).map((key) => (
            <MenuItem key={key} value={key}>
              {impuestos[key].empresa}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Renderizado de servicios */}
      {Object.entries(impuestos)
        .filter(([key]) => !servicioSeleccionado || key === servicioSeleccionado) // Filtrar según el select
        .map(([key, impuesto]) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              padding: 1,
              border: '1px solid #ccc',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>Servicio</Typography>
              <Typography>{impuesto.empresa}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>% Asignado</Typography>
              <Typography>{impuesto.porcentaje}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>N° Medidor</Typography>
              <Typography>{impuesto.numeroMedidor}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>N° Cliente</Typography>
              <Typography>{impuesto.numeroCliente}</Typography>
            </Box>
          </Box>
        ))}
    </Box>
  );
};

export default ServicioDetalle;
