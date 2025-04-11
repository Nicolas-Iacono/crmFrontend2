import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import contratoApi from '../../api/contratoApi'
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
const MoreInfoPropietario = ({propietario}) => {
  const link = `https://wa.me/${propietario}`;
  const linkEmail = `mailto:${propietario}`

  return (
    <TableContainer component={Paper}>
    <TableHead>
          <TableRow>
            
            <TableCell>ID</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Apellido</TableCell>
            <TableCell align="center">DNI</TableCell>
            <TableCell align="center">CUIT</TableCell>
            <TableCell align="center">Domicilio</TableCell>
            <TableCell align="center">Nacionalidad</TableCell>
            <TableCell align="center">Estado Civil</TableCell>
            <TableCell align="center">Contacto</TableCell>
            
            
          </TableRow>
    </TableHead>
    <TableBody>
          <TableRow key={propietario.id}>
            <TableCell align="center" component="th" scope="row">{propietario.id}</TableCell>
            <TableCell align="center">{propietario.nombre}</TableCell>
            <TableCell align="center">{propietario.apellido}</TableCell>
            <TableCell align="center">{propietario.dni}</TableCell>
            <TableCell align="center">{propietario.cuit}</TableCell>
            <TableCell align="center">{propietario.direccionResidencial}</TableCell>
           
            <TableCell align="center">{propietario.nacionalidad}</TableCell>
            <TableCell align="center">{propietario.estadoCivil}</TableCell>
            
            <TableCell align="center" sx={{display:"flex", justifyContent:"space-around", alignItems:"center"}}>

                      <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                  <WhatsAppIcon style={{ marginRight: '8px', color:"green" }} />
            
                </a>
                <a
                  href={linkEmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                  <EmailIcon style={{ marginRight: '8px', color:"red"}} />
            
                </a>
              
              </TableCell>
          </TableRow>
        </TableBody>
    </TableContainer>
  );
};

export default MoreInfoPropietario