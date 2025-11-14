import React from 'react';
import { Field } from 'formik';
import { TextField, Box, Typography } from '@mui/material';

const FormTextField = ({
  name,
  label,
  placeholder,
  type = "text",
  validate,
  fullWidth = true,
  variant = "outlined",
  ...otherProps
}) => {
  return (
    <Field name={name} validate={validate}>
      {({ field, form, meta }) => {
        const { values, handleChange, handleBlur, errors, touched } = form;
        const hasError = touched[name] && Boolean(errors[name]);
        const isValid = touched[name] && !errors[name];
        
        return (
          <Box sx={{ mb: 1.5 }}>
            {label && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 0.5, 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {label}
              </Typography>
            )}
            <TextField
              {...field}
              placeholder={placeholder}
              type={type}
              variant={variant}
              fullWidth={fullWidth}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values[name] || ''}
              error={hasError}
              helperText={touched[name] && errors[name]}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  height: '48px',
                  fontSize: '16px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #6c5ce7',
                  },
                  '&.Mui-error fieldset': {
                    border: '2px solid #e74c3c',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
                ...(isValid && {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '&.Mui-focused fieldset': {
                      border: '2px solid #27ae60',
                    },
                  },
                }),
              }}
              {...otherProps}
            />
          </Box>
        );
      }}
    </Field>
  );
};

export default FormTextField;
