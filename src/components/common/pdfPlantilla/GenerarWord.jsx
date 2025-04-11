import React, { useEffect, useState } from 'react'
import jsPDF from "jspdf";
import { LightTooltip } from '../../styles/componentsStyled';
import { IconButton } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const GenerarWord = ({contrato}) => {
  const [contratos, setContratos] = useState([]);

  const fetchContratoById = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contrato/buscar/${id}`);
      return response.data; // Devuelve los datos del contrato
    } catch (error) {
      console.error('Error al buscar contrato:', error);
      throw error; // Lanza el error para manejarlo más adelante
    }
  };

  useEffect(() => {
    if (contrato.id) {
      fetchContratoById(contrato.id)
        .then((data) => {
          setContratos(data); // Actualiza el estado con los datos del contrato
        })
        .catch((error) => {
          console.error('Error al recuperar el contrato:', error);
        });
    }
  }, [contrato.id]);

  const generateWord = async () => {
    // Crear un documento de Word con metadata
    const doc = new Document({
      creator: 'Nombre del Creador', // Define aquí el nombre del creador
      title: 'Contrato de Locación',
      description: 'Contrato de Locación generado automáticamente',
    });

    const contenido = `
   convienen en celebrar el presente Contrato de Locación, que celebran de buena fé, con el cuidado y previsión que exigen y contemplan los art. 9, 729, 961, 965 y 1061 Del Código Civil y Comercial de La Nación, en un todo de acuerdo el que se regirá por las siguientes cláusulas y condiciones.
    PRIMERA: OBJETO: La parte Locadora da en locación a la parte Locataria, quien acepta de plena conformidad y a entera satisfacción, ${contrato.propiedad.tipo} del que es propietaria, ubicado sobre la calle ${contrato.propiedad.direccion} de la ciudad de ${contrato.propiedad.localidad}, partido de ${contrato.propiedad.partido} Provincia de ${contrato.propiedad.provincia}, que consta del siguiente INVENTARIO: ${contrato.propiedad.inventario}. Todo lo detallado deberá restituirse al momento de la finalización del presente contrato, ya sea por vencimiento del término u otro motivo, en el mismo estado de funcionamiento y conservación, salvo el desgaste natural producido en las cosas por su correcto uso y el transcurso del tiempo (Art. 1210 CC).
    --------------------------------------------------------------------------------
    SEGUNDA: PLAZO: El plazo de vigencia del presente contrato es pactado entre las partes en ${contrato.duracion} meses. Dicho plazo será contado a partir del ${contrato.fecha_inicio}, por lo que operará su vencimiento de pleno derecho el ${contrato.fecha_fin}, plazo definitivo e improrrogable de la locación a excepción que ambas partes de común acuerdo decidan renovar el mismo estableciendo las nuevas condiciones, sin fijación de plazo alguno para ello. En caso que las partes no logren acuerdo, La Locataria se obliga a restituir la tenencia del inmueble locado, totalmente desocupado sin requerimiento judicial ni extrajudicial alguno, por el solo vencimiento del plazo pactado. En caso que La Locataria no haga entrega del inmueble el día del vencimiento del contrato, se obliga a pagar una multa de pesos ($ ${contrato.multaXDia}-) por cada día que pase de la fecha convenida de finalización, sin perjuicio de seguir obligada a abonar el canon locativo mensual, hasta que la Locadora obtenga efectivamente la restitución de la tenencia del bien por parte de La Locataria. Se pacta que dicha indemnización podrá ser reclamada por la misma vía ejecutiva que para el cobro de alquileres y accesorios. En caso de que la Locadora estimare que los daños y perjuicios que le ocasionare la falta de entrega en término fueran superiores a una indemnización pactada, la Locadora podrá reclamar estos, pudiendo iniciar de inmediato las acciones judiciales para desocupar el bien alquilado. 
    ---------------
    TERCERA: PRECIO: Las partes de común acuerdo pactan que el canon locativo MENSUAL inicial será de PESOS ${contrato.montoAlquilerLetras} ($${contrato.montoAlquiler}). El índice de ajuste para este contrato sera el ${contrato.indiceAjuste} será publicado por el Banco Central de la República Argentina, aplicando el correspondiente al último día hábil del mes anterior a cada ajuste. Correrán a cargo de ambas partes (Locadora y Locataria), informarse y notificarse sobre el valor a abonar con su respectivo ajuste. Si a la fecha de vencimiento de pago mensual estipulado correspondiente a las cuotas N° 7, 13 y 19, no se hubiese efectuado aún la publicación respectiva, La Locataria pagará el monto que venía abonando durante los meses anteriores con carácter provisorio; debiendo integrar la diferencia que surja de la aplicación de dicho índice, dentro de las 48 hs. hábiles posteriores contadas desde la fecha que resulte publicado el mismo. El precio del alquiler se pacta por períodos de mes entero, aunque La Locataria desocupará el inmueble antes de finalizar el mes, debiendo abonar íntegramente el mismo. Si por una disposición legal y futura los arriendos se vieren gravados con el pago del impuesto al valor agregado (IVA), la parte Locataria deberá adicionar al monto mensual, el porcentaje correspondiente al IVA.
    -----------------------------------------
    ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha al principio indicado, dejando constancia que la parte Locataria vuelve a tomar tenencia del inmueble locado en este acto.
    -------------------------------------------------------------------------------------
    `;

    const contratoParrafos = contenido.split('\n').map(parrafo => new Paragraph(parrafo));

    // Añadir los párrafos al documento
    doc.addSection({
      properties: {},
      children: contratoParrafos,
    });

    // Generar el archivo Word y guardarlo
    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'contrato_locacion.docx');
  };

  return (
    <LightTooltip title="Generar Contrato" placement="top">
      <IconButton color="secondary" aria-label="add" size='large' onClick={generateWord}>
        <PostAddIcon />
      </IconButton>
    </LightTooltip>
  );
};

export default GenerarWord