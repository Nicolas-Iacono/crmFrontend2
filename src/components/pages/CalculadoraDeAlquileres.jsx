import { Box } from "@mui/material";


const CalculadoraDeAlquileres = () => {
    return (
        <Box sx={{ width: {xs:"100%",md:"100VW"}, height: '100vh' 

        }}>

            <iframe
    title="Calculadora de alquileres"
    src="https://arquiler.com/mini?theme=light&backgroundColor=ffffff"
    width="100%"
    height="100%">
</iframe>
        </Box>
    );
};  

export default CalculadoraDeAlquileres;