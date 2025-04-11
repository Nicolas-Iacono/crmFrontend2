import { Grid2, Box,Typography} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
const UsersControl = () => {

  const navigate = useNavigate();

  const ir = (adress) =>{
    navigate(adress)
  }

  return (
        <Grid2 sx={{
          backgroundColor: "black",
          boxSizing: "border-box",
          width: "100vw", // Se asegura de ocupar todo el ancho de la ventana
          height: "87vh",
          margin: "0px",
          padding: "0px",
          marginTop: "3rem",
          position: "fixed", // Fija el elemento en la pantalla
          top: 0,
          left: 0,
          right: 0,
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-evenly",
          alignItems:"center",
        }}>
         <Grid2 sx={{backgroundColor:"blue", width:"95%", height:"10rem", display:"flex", justifyContent:"center", flexDirection:"column"}}>
          
          <Box sx={{backgroundColor:"white", width:"10rem", height:"3rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto" }}>
            <Typography>PROPIETARIOS</Typography>
          </Box>
          <Grid2 sx={{backgroundColor:"green", width:"100%", height:"70%", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center",  }}
             onClick={() => ir("/propietarios")}>
              <Typography>VER PROPIETARIOS</Typography>
            </Box>
            
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center" }}
             onClick={() => ir("/nuevo-propietario")}>
              <Typography>NUEVO PROPIETARIO</Typography>
            </Box>
          
          </Grid2>


          </Grid2>
          <Grid2 sx={{backgroundColor:"blue", width:"95%", height:"10rem", display:"flex", justifyContent:"center", flexDirection:"column"}}>
          
          <Box sx={{backgroundColor:"white", width:"10rem", height:"3rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto" }}>
            <Typography>INQUILINOS</Typography>
          </Box>
          <Grid2 sx={{backgroundColor:"green", width:"100%", height:"70%", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center",  }} 
            onClick={() => ir("/inquilinos")}>
              <Typography>VER INQUILINOS</Typography>
            </Box>
            
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center" }}
            onClick={() => ir("/nuevo-inquilino")}>
              <Typography>NUEVO INQUILINO</Typography>
            </Box>
          
          </Grid2>


          </Grid2>
          
          <Grid2 sx={{backgroundColor:"blue", width:"95%", height:"10rem", display:"flex", justifyContent:"center", flexDirection:"column"}}>
          
          <Box sx={{backgroundColor:"white", width:"10rem", height:"3rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto" }}
          onClick={() => ir("/garantes")}>
            <Typography>GARANTES</Typography>
          </Box>
          <Grid2 sx={{backgroundColor:"green", width:"100%", height:"70%", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center",  }}
            onClick={() => ir("/garantes")}>
              <Typography>VER GARANTES</Typography>
            </Box>
            
            <Box sx={{backgroundColor:"white", width:"11rem", height:"6rem", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center" }}
            onClick={() => ir("/nuevo-garante")}>
              <Typography>NUEVO GARANTE</Typography>
            </Box>
          
          </Grid2>


          </Grid2>
         
        </Grid2>
  )
}

export default UsersControl;