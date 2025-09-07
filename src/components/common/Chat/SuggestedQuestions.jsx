import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';

const questions = [
  '¿Haz una lista de mis inquilinos?',
  'Busca el telefono del ultimo inquilino que cree',
  '¿Cual es el proximo contrato en actualizarse?',
  'Muestra los recibos pendientes de pago del mes de agosto',
  // 'Muéstrame los últimos 5 emails recibidos.',
  'Muestra la lista de propiedades'
];

const SuggestedQuestions = ({ onQuestionClick }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'rgb(55, 25, 114)' }}>
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
              color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgb(57, 29, 109)',
              
              borderRadius: '16px',
              textTransform: 'none',
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
