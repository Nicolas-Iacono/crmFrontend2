
import React, { useEffect, useState } from 'react';
import { Typography, Box, TextField, Button } from '@mui/material';
import axios from 'axios';

const PutMontoForm = ({selectedContract,setSelectedContract}) => {
    const [actulizarMonto, setActulizarMonto] = useState({
        idContrato: 0,
        montoAlquiler: 0
    });

    useEffect(() => {
        if (selectedContract?.id) {
          setActulizarMonto(prev => ({
            ...prev,
            idContrato: selectedContract.id
          }));
        }
      }, [selectedContract]);


    const handleMontoAlquiler = async() =>{
        try{
            const response  = await axios.put(`${import.meta.env.VITE_API_URL}/contrato/actualizacion`, actulizarMonto);
            console.log("🚀 ~ handleMontoAlquiler ~ response:", response)
            setActulizarMonto({
                idContrato: response.data.idContrato,
                montoAlquiler: response.data.montoAlquiler
            });
            // Actualiza el contrato seleccionado en el padre para reflejar el nuevo monto
            setSelectedContract(prev => ({
                ...prev,
                montoAlquiler: response.data.montoAlquiler
            }));
        }
        catch(error){
            console.log("🚀 ~ handleMontoAlquiler ~ error:", error)
        }
    }
    return(
        <Box>
            <Typography variant="h6" color="#1F2C61" sx={{ mb: 2, fontWeight: 600 }}>
                Nueva actualización
            </Typography>
            <TextField
                label="Monto de actualización"
                type="number"
                value={actulizarMonto.montoAlquiler}
                onChange={(e) => setActulizarMonto({ ...actulizarMonto, montoAlquiler: e.target.value })}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleMontoAlquiler}
                sx={{ mt: 2 }}
            >
                Actualizar
            </Button>
        </Box>
    )
}

export default PutMontoForm;