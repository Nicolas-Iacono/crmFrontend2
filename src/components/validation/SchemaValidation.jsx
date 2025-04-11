import React from 'react'
import * as Yup from 'yup';

export const SchemaValidation  = {

  inquilinoValidation : () =>{
    return Yup.object().shape({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellido: Yup.string().required('El apellido es obligatorio'),
    telefono: Yup.string().required('El telefono es obligatorio'),
    email: Yup.string().required('El email es obligatorio'),
    dni: Yup.string().required("El dni es obligatorio"),
    direccionResidencial: Yup.string().required('La direccion es obligatoria'),

    })
  },
  propietarioValidation : ()=>{
    return Yup.object().shape({
      nombre: Yup.string().required('El nombre es obligatorio'),
      apellido: Yup.string().required('El apellido es obligatorio'),
      telefono: Yup.string('El telefono es opcional'),
      email: Yup.string('El email es obligatorio'),
      dni: Yup.string().required("El dni es obligatorio"),
      direccionResidencial: Yup.string().required('La direccion es obligatoria'),
      })

  },
  propiedadesValidation : () =>{
      return Yup.object().shape({
        direccion: Yup.string().required('La dirección es obligatoria'),
        localidad: Yup.string().required('La localidad es obligatoria'),
        partido: Yup.string().required('El partido es obligatorio'),
        provincia: Yup.string().required('La provincia es obligatoria'),
        disponibilidad: Yup.boolean(),
        id_propietario: Yup.number().required('El propietario es obligatorio'),
        inventario: Yup.string().max(65535, 'El inventario no puede exceder los 65535 caracteres').required('El inventario es obligatorio'),

      })
  },
  garanteValidation : () => {
    return Yup.object().shape({
      nombre: Yup.string().required('El nombre es obligatorio'),
      apellido: Yup.string().required('El apellido es obligatorio'),
      telefono: Yup.string('Opcional'),
      email: Yup.string('El email debe ser correcto'),
      dni: Yup.string().required("El dni es obligatorio"),
      direccionResidencial: Yup.string().required('La direccion es obligatoria'),
      id_contrato: Yup.number('Debe asignar el garante a un contrato'),
      imageUrls:Yup.string("opcional: agregar url de imagen de dni o recibo")
      })
  },
  contratoValidation : () => {
    return Yup.object().shape({
      nombreContrato: Yup.string().required('Asigna un nombre al contrato'),
      fecha_inicio: Yup.date().required('Asigna una fecha de inicio de contrato'),
      fecha_fin: Yup.date().required('Asigna una fecha de finalizacion de contrato'),
      id_propietario: Yup.number().required('asigna un propietario al contrato'),
      id_inquilino: Yup.number().required('asigna un inquilino al contrato'),
      id_propiedad: Yup.number().required('asigna una propiedad al contrato'),
      garantesIds: Yup.array("Asigna 1 o mas garantes"),
      actualizacion: Yup.number("Asigna periodo de actualizacion"),
      montoAlquiler: Yup.number('Asigna valor de alquiler en pesos'),
      duracion: Yup.number('Asigna duracion de contrato en meses'),
      })
  }
  
}


export default SchemaValidation