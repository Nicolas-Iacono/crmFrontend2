import React, { useEffect, useState } from 'react';
import { Typography, Box, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material';

const PutMontoForm = ({selectedContract, setSelectedContract, setContratos}) => {
    const theme = useTheme();
    const [actulizarMonto, setActulizarMonto] = useState({
        idContrato: 0,
        montoAlquiler: 0
    });
    const [displayValue, setDisplayValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Function to format number with thousand separators
    const formatNumber = (num) => {
        if (!num) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Function to parse formatted number back to numeric value
    const parseNumber = (str) => {
        if (!str) return 0;
        return parseInt(str.replace(/\./g, '')) || 0;
    };

    useEffect(() => {
        if (selectedContract?.id) {
          setActulizarMonto(prev => ({
            ...prev,
            idContrato: selectedContract.id
          }));
        }
      }, [selectedContract]);


    const handleMontoAlquiler = async() =>{
        setIsLoading(true);
        try{
            const response  = await axios.put(`${import.meta.env.VITE_API_URL}/contrato/actualizacion`, actulizarMonto);
            // Calculate new commission amounts based on updated rent and existing percentages
            const newComisionContrato = selectedContract.comisionContratoPorc 
                ? (response.data.montoAlquiler * selectedContract.duracion * selectedContract.comisionContratoPorc / 100)
                : selectedContract.comisionContratoMonto;
            
            const newComisionMensual = selectedContract.comisionMensualPorc 
                ? (response.data.montoAlquiler * selectedContract.comisionMensualPorc / 100)
                : selectedContract.comisionMensualMonto;
            
            // Create updated contract object
            const updatedContract = {
                ...selectedContract,
                montoAlquiler: response.data.montoAlquiler,
                comisionContratoMonto: newComisionContrato,
                comisionMensualMonto: newComisionMensual
            };
            
       
            
            // Update the selected contract in the modal
            setSelectedContract(updatedContract);
            
            // Update the contracts list in the parent component if available
            if (typeof setContratos === 'function') {
                setContratos(prev => 
                    Array.isArray(prev) 
                        ? prev.map(contrato => 
                            contrato.id === selectedContract.id 
                                ? updatedContract 
                                : contrato
                        )
                        : prev
                );
            }
            
            // Force a re-render by updating the local state as well
            setActulizarMonto({
                idContrato: response.data.idContrato,
                montoAlquiler: 0 // Reset the input field
            });
            setDisplayValue(''); // Reset the display value as well
        }
        catch(error){
        }
        finally{
            setIsLoading(false);
        }
    }
    return(
        <Box 
            sx={{
                width: '100%',
                backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.02)' 
                    : 'rgba(0, 0, 0, 0.01)',
                borderRadius: 2,
                border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.08)' 
                    : '1px solid rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <Typography 
                variant="subtitle1" 
                sx={{ 
                    p: 1.5,
                    mb: 2.5, 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: theme.palette.mode === 'dark' ? 'rgb(190, 190, 190)' : '#1F2C61'
                }}
            >
                Actualizar Monto
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', p: 1.5 }}>
                <TextField
                    label="Nuevo monto"
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        // Remove all non-numeric characters except dots
                        const numericValue = inputValue.replace(/[^\d]/g, '');
                        
                        if (numericValue) {
                            const parsedValue = parseInt(numericValue);
                            setActulizarMonto({ ...actulizarMonto, montoAlquiler: parsedValue });
                            setDisplayValue(formatNumber(parsedValue));
                        } else {
                            setActulizarMonto({ ...actulizarMonto, montoAlquiler: 0 });
                            setDisplayValue('');
                        }
                    }}
                    disabled={isLoading}
                    size="small"
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            fontSize: '0.9rem',
                            '& fieldset': {
                                borderColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.12)' 
                                    : 'rgba(0, 0, 0, 0.12)'
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused fieldset': {
                                borderWidth: 1
                            }
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '0.85rem',
                            fontWeight: 500
                        }
                    }}
                />
                
                <Button
                    variant="contained"
                    onClick={handleMontoAlquiler}
                    disabled={!actulizarMonto.montoAlquiler || isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : null}
                    size="small"
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        py: 1,
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                            : 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                            background: theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isLoading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </Box>
        </Box>
    )
}

export default PutMontoForm;