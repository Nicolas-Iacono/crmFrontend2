import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Field } from 'formik';
import ContratoApi from '../api/contratoApi';

const SelectContract = ({ value, handleChange, handleBlur, setIdContrato }) => {
  const [contratos, setContratos] = useState([]);
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
    const fechtContratos = async () => {
      try {
        const response = await ContratoApi.getContratos();
      
        setContratos(response.data);
      } catch (error) {
        console.error('Error fetching contratos:', error);
      }
    };
    fechtContratos();
  }, []);

  const handleSelectionChange = (event) => {
    const selectedId = event.target.value;
    setIdContrato(selectedId); // Actualiza el ID seleccionado en el componente principal

  };
  return (
    <FormControl fullWidth>
      <InputLabel id="contrato-label">Asignar servicio a contrato</InputLabel>
      <Field
        name="id_contrato"
        as={Select}
        labelId="contrato-label"
        label="Contrato"
        onChange={handleSelectionChange}
        onBlur={handleBlur}
        value={value.id_contrato}
      >
        {contratos.data && contratos.data.length > 0
        ? contratos.data
            .filter((contrato) => contrato.usuarioDtoSalida && contrato.usuarioDtoSalida.username === user.name)
            .map((contrato) => (
              <MenuItem key={contrato.id} value={contrato.id}>
                {`${contrato.nombreContrato}`}
              </MenuItem>
            ))
        : (
          <MenuItem disabled value="">
            No hay contratos disponibles
          </MenuItem>
        )}
      </Field>
    </FormControl>
  );
};

export default SelectContract;
