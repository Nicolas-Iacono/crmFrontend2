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
const MoreInfoGarantes = ({ garantes }) => {
  return (
    <TableContainer component={Paper}>
    <TableHead>
          <TableRow>
            
            <TableCell>ID</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Apellido</TableCell>
            <TableCell align="center">Telefono</TableCell>
            <TableCell align="center">Domicilio</TableCell>
            <TableCell align="center">Nacionalidad</TableCell>
            <TableCell align="center">DNI</TableCell>
            <TableCell align="center">CUIT</TableCell>
            <TableCell align="center">Empresa</TableCell>
            <TableCell align="center">CUIT Emp.</TableCell>
            <TableCell align="center">Legajo</TableCell>
            <TableCell align="center">Puesto</TableCell>
            
          </TableRow>
    </TableHead>
    <TableBody>
      {Array.isArray(garantes) && garantes.map((garante) => (
        <TableRow key={garante.id}>
          <TableCell align="center" component="th" scope="row">{garante.id}</TableCell>
          <TableCell align="center">{garante.nombre}</TableCell>
          <TableCell align="center">{garante.apellido}</TableCell>
          <TableCell align="center">{garante.telefono}</TableCell>
          <TableCell align="center">{garante.direccionResidencial}</TableCell>
          <TableCell align="center">{garante.nacionalidad}</TableCell>
          <TableCell align="center">{garante.dni}</TableCell>
          <TableCell align="center">{garante.cuit}</TableCell>
          <TableCell align="center">{garante.nombreEmpresa}</TableCell>
          <TableCell align="center">{garante.cuitEmpresa}</TableCell>
          <TableCell align="center">{garante.legajo}</TableCell>
          <TableCell align="center">{garante.cargoActual}</TableCell>

        </TableRow>
      ))}
    </TableBody>
    </TableContainer>
  );
};

export default MoreInfoGarantes