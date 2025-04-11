import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ContratoPDF from '../pdf/ContratoPDF';
import { Button, CircularProgress, Box } from '@mui/material';
import { contratoApi } from '../../api/contratoApi';
import { UseEditorGlobalContext } from '../../context/EditorGlobal';

const GenerarContrato = ({ contratoId }) => {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { parrafo, isEditorDirty } = UseEditorGlobalContext() || {};

  useEffect(() => {
    const fetchContratoCompleto = async () => {
      if (!contratoId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await contratoApi.getContratoById(contratoId);
        setContrato(data);
      } catch (err) {
        console.error('Error al cargar el contrato:', err);
        setError('No se pudo cargar el contrato. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchContratoCompleto();
  }, [contratoId]);

  if (!contratoId) {
    return (
      <Box sx={{ 
        color: 'warning.main',
        padding: '8px',
        textAlign: 'center' 
      }}>
        No se ha seleccionado ningún contrato.
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '8px' 
      }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <span>Cargando contrato...</span>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        color: 'error.main',
        padding: '8px',
        textAlign: 'center' 
      }}>
        {error}
      </Box>
    );
  }

  if (!contrato) {
    return (
      <Box sx={{ 
        color: 'warning.main',
        padding: '8px',
        textAlign: 'center' 
      }}>
        No se encontró el contrato solicitado.
      </Box>
    );
  }

  const fileName = `${contrato.nombreContrato || 'Contrato'}_${new Date().toISOString().split('T')[0]}.pdf`.replace(/\s+/g, '_');

  return (
    <Box sx={{ display: 'inline-block' }}>
      <PDFDownloadLink
        document={<ContratoPDF contrato={contrato} editorContent={parrafo} />}
        fileName={fileName}
      >
        {({ loading: pdfLoading, error: pdfError }) => (
          <Button
            variant="contained"
            color="success"
            disabled={pdfLoading || isEditorDirty}
            sx={{
              minWidth: '180px',
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              }
            }}
          >
            {pdfLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Preparando PDF...
              </>
            ) : pdfError ? (
              'Error al generar PDF'
            ) : isEditorDirty ? (
              'Guarde los cambios primero'
            ) : (
              'Descargar Contrato'
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </Box>
  );
};

export default GenerarContrato;