import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { showSuccess, showError } from '../../alertas/showAlert';
import ProspectoForm from '../../common/ProspectoForm';
import { ProspectosApi } from '../../api/prospectos';

const NuevoProspecto = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setIsLoading(true);
    try {
      await ProspectosApi.crearProspecto(payload);
      showSuccess('Prospecto creado exitosamente', '¡Éxito!');
      navigate('/prospectos');
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo crear el prospecto';
      showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/prospectos');
  };

  return (
    <ProspectoForm
      initialValues={{
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        rangoPrecioMin: '',
        rangoPrecioMax: '',
        cantidadPersonas: '',
        zonaPreferencia: '',
        cantidadAmbientes: '',
        cochera: false,
        patio: false,
        jardin: false,
        pileta: false,
        visibilidadPublico: true,
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isLoading}
      title="Nuevo Prospecto"
      submitLabel="Guardar Prospecto"
      theme={theme}
    />
  );
};

export default NuevoProspecto;
