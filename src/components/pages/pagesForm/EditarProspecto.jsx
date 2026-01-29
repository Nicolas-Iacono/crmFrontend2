import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import ProspectoForm from '../../common/ProspectoForm';
import { ProspectosApi } from '../../api/prospectos';
import { showError, showSuccess } from '../../alertas/showAlert';

const EditarProspecto = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prospecto, setProspecto] = useState(null);

  useEffect(() => {
    const loadProspecto = async () => {
      const stateProspecto = location.state?.prospecto;
      if (stateProspecto) {
        setProspecto(stateProspecto);
        return;
      }
      try {
        setIsLoading(true);
        const result = await ProspectosApi.listarMisProspectos();
        if (result.error) {
          throw new Error(result.error);
        }
        const arr = Array.isArray(result.data)
          ? result.data
          : (result.data?.data && Array.isArray(result.data.data)) ? result.data.data : [];
        const found = arr.find((item) => String(item.id) === String(id));
        if (!found) {
          showError('No se encontró el prospecto.');
          navigate('/prospectos');
          return;
        }
        setProspecto(found);
      } catch (error) {
        console.error('Error al cargar prospecto:', error);
        showError('No se pudo cargar el prospecto.');
        navigate('/prospectos');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      loadProspecto();
    }
  }, [id, location.state, navigate]);

  const handleSubmit = async (payload) => {
    setIsLoading(true);
    try {
      await ProspectosApi.actualizarProspecto(id, payload);
      showSuccess('Prospecto actualizado exitosamente');
      navigate('/prospectos');
    } catch (error) {
      console.error('Error al actualizar prospecto:', error);
      showError('No se pudo actualizar el prospecto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProspectoForm
      initialValues={{
        nombre: prospecto?.nombre || '',
        apellido: prospecto?.apellido || '',
        telefono: prospecto?.telefono || '',
        email: prospecto?.email || '',
        rangoPrecioMin: prospecto?.rangoPrecioMin ?? '',
        rangoPrecioMax: prospecto?.rangoPrecioMax ?? '',
        cantidadPersonas: prospecto?.cantidadPersonas ?? '',
        zonaPreferencia: prospecto?.zonaPreferencia || '',
        cantidadAmbientes: prospecto?.cantidadAmbientes ?? '',
        cochera: Boolean(prospecto?.cochera),
        patio: Boolean(prospecto?.patio),
        jardin: Boolean(prospecto?.jardin),
        pileta: Boolean(prospecto?.pileta),
        visibilidadPublico: prospecto?.visibilidadPublico ?? true,
      }}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/prospectos')}
      isSubmitting={isLoading}
      title="Editar Prospecto"
      submitLabel="Guardar Cambios"
      theme={theme}
    />
  );
};

export default EditarProspecto;
