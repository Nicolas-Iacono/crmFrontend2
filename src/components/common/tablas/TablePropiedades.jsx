import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import PropiedadesApi from '../../api/propiedades'; // Asegúrate de que la ruta sea correcta

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'direccion', headerName: 'Direccion', width: 150 },
  { field: 'localidad', headerName: 'Localidad', width: 120 },
  { field: 'partido', headerName: 'Partido', width: 100 },
  { field: 'disponibilidad', headerName: 'Disponibilidad', width: 150 },
  { field: 'propietario', headerName: 'Propietario', width: 150 },
];

export default function DataTable() {
  const [propiedades, setPropiedades] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState({
    name: "",
    authorities: "",
  });

  // Obtener el usuario de localStorage solo una vez al montar el componente


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
    // Función para obtener las propiedades
    const fetchPropiedades = async () => {

      if (user.name) {
        try {
          const { data } = await PropiedadesApi.buscarContratoPorUsuario(user.name);
          setPropiedades(data || []);
        } catch (error) {
          console.error(`Error al obtener propiedades: ${error.message}`);
        }
      }
    };
    fetchPropiedades();
  }, [user.name]);
  console.log(propiedades)
  const paginationModel = { page: 0, pageSize: 5 };

  // Convertir las propiedades en filas para el DataGrid
  const rows = propiedades.map((propiedad) => ({
    id: propiedad.id,
    direccion: propiedad.direccion,
    localidad: propiedad.localidad,
    partido: propiedad.partido,
    disponibilidad: propiedad.disponibilidad,
    propietario: propiedad.propietario.propietarioSalidaDto.nombre,
  }));

  if (isLoading) return <div>Cargando...</div>; // Mensaje de carga

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
