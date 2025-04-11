import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import styled from '@emotion/styled';


export const TablaContainer = styled(TableContainer)`
  max-width: 800px;
  margin: auto;
`;
export const EncabezadoCelda = styled(TableCell)`
  background-color: black;
  color: white;
  font-weight: bold;
`;

export const CuerpoCelda = styled(TableCell)`
  color: black;
  border-bottom: 1px solid black;
  font-size:14px
`;
export const CuerpoCeldaFecha = styled(TableCell)`
  color: black;
  border-bottom: 1px solid black;
  font-size:13px;
 width: 100px;
`;

export const CuerpoCeldaPropiedad = styled(TableCell)`
  color: black;
  border-bottom: 1px solid black;
  font-size:15px;
 width: 150px;
`;

export const CuerpoCeldaNumero = styled(TableCell)`
  color: black;
  border-bottom: 1px solid black;
  font-size:15px;
  width: 40px;
  text-align:center;
`;

export const CuerpoFila = styled(TableRow)`
   cursor: pointer; 
  &:hover {
    background-color: yellow; 
  }
`;