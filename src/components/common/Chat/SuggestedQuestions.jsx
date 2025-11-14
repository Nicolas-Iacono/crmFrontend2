import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';

const questionSets = {
  mixto: [
    '¿Qué contratos ya están en condiciones de ajustar el depósito según lo que habilita el Código Civil?',
    '¿Qué contratos ya cumplen el plazo legal del Código Civil para que el inquilino pueda rescindir sin penalidad?',
    '¿Qué contratos requieren algún aviso formal según las fechas que tengo cargadas y el plazo legal aplicable?',
 
  ],
  legales: [
    '¿Qué cláusulas son recomendables para un contrato de vivienda? ',
    '¿Cómo se actualiza el alquiler según la normativa vigente?',
    '¿Cuáles son las obligaciones principales del inquilino y del propietario?',
    'Redacta una cláusula de rescisión anticipada equilibrada',
    '¿Qué debo considerar para la garantía y depósito según ley?',
  ],
  datos: [
    '¿Haz una lista de mis inquilinos?',
    'Busca el telefono del ultimo inquilino que cree',
    '¿Cuál es el próximo contrato en actualizarse?',
    'Muestra los recibos pendientes de pago del mes actual',
    'Muestra la lista de propiedades',
  ],
};

const SuggestedQuestions = ({ onQuestionClick, modo = 'mixto' }) => {
  const theme = useTheme();
  const questions = questionSets[modo] || questionSets.mixto;

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'rgba(76, 28, 167, 1)' }}>
        ¿Qué puedes hacer?
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
        {questions.map((q, i) => (
          <Button 
            key={i} 
            variant="outlined" 
            onClick={() => onQuestionClick(q)}
            sx={{
              borderColor: theme.palette.mode === 'dark' ? 'rgb(121, 64, 226)' : 'rgb(72, 26, 158)',
              color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgba(76, 28, 167, 1)',
              backgroundColor: 'rgba(243, 242, 245, 0.16)',
              borderRadius: '16px',
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: 'rgba(71, 28, 151, 0.1)',
                borderColor: 'rgb(71, 28, 151)',
              }
            }}
          >
            {q}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SuggestedQuestions;
