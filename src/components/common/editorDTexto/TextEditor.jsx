import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button, Box, CircularProgress, Modal, Slide, useTheme, useMediaQuery, Typography, IconButton, Backdrop, Grid, Grid2 } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { UseEditorGlobalContext } from "../../context/EditorGlobal";
import DOMPurify from 'dompurify';
import axios from 'axios';
import { useAuth } from '../../context/GlobalAuth';
import ShareButtons from './ShareButtons';
import { showAlert, showError, showInfo, showSuccess } from '../../alertas/showAlert';

// ⚠️ Si usas Grid v5 "Unstable_Grid2", importa así:
// import Grid2 from '@mui/material/Unstable_Grid2';

const ALLOWED = {
  ALLOWED_TAGS: ['p','br','strong','b','em','i','u','span','div','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','table','thead','tbody','tr','td','th'],
  ALLOWED_ATTR: ['style','class','href','src','alt','title','target','colspan','rowspan'],
  ALLOW_DATA_ATTR: false
};

const TextEditor = ({ contrato, isOpen, onClose, onSaved, embed = false }) => {
  const { addParagraph } = UseEditorGlobalContext();
  const [contenido, setContenido] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { usuarioFetch } = useAuth();

  const formatDate = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    const base = s.split('T')[0].replaceAll('.', '-');
    if (/^\d{4}-\d{2}-\d{2}$/.test(base)) {
      const [y, m, d] = base.split('-');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear());
      return `${dd}/${mm}/${yy}`;
    }
    return s;
  };

  const formatMoney = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const raw = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9,.-]/g, '').replace(',', '.'));
    if (isNaN(raw)) return String(val);
    const fixed = raw.toFixed(2);
    let [int, dec] = fixed.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    // Mostrar decimales solo si existen
    const withDecimals = dec && dec !== '00' ? `${int},${dec}` : int;
    return `$${withDecimals}`;
  };
  
  const formatDni = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const raw = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9,.-]/g, '').replace(',', '.'));
    if (isNaN(raw)) return String(val);
    const fixed = raw.toFixed(2);
    let [int, dec] = fixed.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    // Mostrar decimales solo si existen
    const withDecimals = dec && dec !== '00' ? `${int},${dec}` : int;
    return `${withDecimals}`;
  };

  const formatCuil = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const digits = String(val).replace(/\D/g, '');
    const a = digits.slice(0, 2);
    const b = digits.slice(2, 10);
    const c = digits.slice(10, 11);
    return [a, b, c].filter(Boolean).join('-');
  };
 


  // Genera el HTML inicial si no existe texto del contrato
  const buildTemplate = (contrato, usuarioFetch) => {
    const empresa = contrato?.usuarioDtoSalida || usuarioFetch || {};
    const prop = typeof contrato?.propiedad === 'string' ? { direccion: contrato?.propiedad } : (contrato?.propiedad || {});
    const owner = contrato?.propietario || {};
    const tenant = contrato?.inquilino || {};
    const garantes = Array.isArray(contrato?.garantes) ? contrato.garantes : [];
    const fechaInicio = contrato?.fecha_inicio || contrato?.fechaInicio || '';
    const fechaFin = contrato?.fecha_fin || contrato?.fechaFin || '';
    const monto = contrato?.montoAlquiler ?? contrato?.monto ?? '';
    const aguaPorcentaje = contrato?.aguaPorcentaje ?? 0;
    const aguaEmpresa = contrato?.aguaEmpresa || '';
    const luzPorcentaje = contrato?.luzPorcentaje ?? 0;
    const luzEmpresa = contrato?.luzEmpresa || '';
    const gasPorcentaje = contrato?.gasPorcentaje ?? 0;
    const gasEmpresa = contrato?.gasEmpresa || '';
    const municipalPorcentaje = contrato?.municipalPorcentaje ?? 0;
    const municipalEmpresa = contrato?.municipalEmpresa || '';
    const actualizacion = contrato?.actualizacion || 6;
    
const indexacion = (actualizacion) => {
  const mapa = {
    1: 'mensuales',
    2: 'bimestrales',
    3: 'trimestrales',
    4: 'cuatrimestrales',
    5: 'quintumestrales',
    6: 'semestrales',
    12: 'anuales'
  };

  return mapa[actualizacion] || "";
};

    const html = `
       <div class="contrato-content">
        <p>En la Ciudad de ${(contrato?.usuarioDtoSalida?.partido || usuarioFetch.partido)}, en el dia de hoy sito <strong>${formatDate(contrato?.fecha_inicio || contrato?.fechaInicio || "")}</strong>, ${contrato?.propietario?.pronombre || ""} <strong>${contrato?.propietario?.nombre || ""} ${contrato?.propietario?.apellido ||   ""}</strong> de nacionalidad ${contrato?.propietario?.nacionalidad || ""}, <strong>DNI N° ${formatDni(contrato?.propietario?.dni || "")}</strong> , <strong>CUIL ${formatCuil(contrato?.propietario?.cuit || "")}</strong> en adelante denominada la "parte LOCADORA", y por la otra parte ${contrato?.inquilino?.pronombre || ""} <strong>${contrato?.inquilino?.nombre || ""} ${contrato?.inquilino?.apellido || ""}</strong> de nacionalidad ${contrato?.inquilino?.nacionalidad || ""} con <strong>DNI N° ${formatDni(contrato?.inquilino?.dni || "")}</strong>, <strong>CUIL ${formatCuil(contrato?.inquilino?.cuit || "")}</strong> con domicilio en la calle <strong>${contrato?.propiedad?.direccion || ""} de la ciudad de ${contrato?.propiedad?.localidad || ""}, partido de ${contrato?.propiedad?.partido || ""} Provincia de ${contrato?.propiedad?.provincia || ""}</strong>, en adelante llamado la "parte LOCATARIA", convienen en celebrar el presente Contrato de Locación, que celebran de buena fé, con el cuidado y previsión que exigen y contemplan los art. 9, 729, 961, 965 y 1061 Del Código Civil y Comercial de La Nación, en un todo de acuerdo el que se regirá por las siguientes cláusulas y condiciones.</p>


          <strong><u>PRIMERA: OBJETO:</strong></u>
          <p>La parte Locadora da en locación a la parte Locataria, quien acepta de plena conformidad y a entera satisfacción, ${contrato?.propiedad?.tipo || ""} del que es propietaria, ubicado sobre la calle <strong>${contrato?.propiedad?.direccion || ""} de la ciudad de ${contrato?.propiedad?.localidad || ""}, partido de ${contrato?.propiedad?.partido || ""}, Provincia de ${contrato?.propiedad?.provincia || ""}</strong>, que consta del siguiente <strong>INVENTARIO:</strong> ${contrato?.propiedad?.inventario || ""}. Todo lo detallado deberá restituirse al momento de la finalización del presente contrato, ya sea por vencimiento del término u otro motivo, en el mismo estado de funcionamiento y conservación, salvo el desgaste natural producido en las cosas por su correcto uso y el transcurso del tiempo (Art. 1210 CC).</p>


          <strong><u>SEGUNDA: PLAZO:</strong></u>
          <p>El plazo de vigencia del presente contrato es pactado entre las partes en <strong>${contrato?.duracion ?? ""} meses</strong>. Dicho plazo será contado a partir del <strong>${formatDate(contrato?.fecha_inicio || contrato?.fechaInicio || "")}</strong>, por lo que operará su vencimiento de pleno derecho el <strong>${formatDate(contrato?.fecha_fin || contrato?.fechaFin || "")}</strong>, plazo definitivo e improrrogable de la locación a excepción que ambas partes de común acuerdo decidan renovar el mismo estableciendo las nuevas condiciones, sin fijación de plazo alguno para ello. En caso que las partes no logren acuerdo, La Locataria se obliga a restituir la tenencia del inmueble locado, totalmente desocupado sin requerimiento judicial ni extrajudicial alguno, por el solo vencimiento del plazo pactado. En caso que La Locataria no haga entrega del inmueble el día del vencimiento del contrato, se obliga a pagar una multa de pesos (${formatMoney(contrato?.multaXDia ?? "")}-) por cada día que pase de la fecha convenida de finalización, sin perjuicio de seguir obligada a abonar el canon locativo mensual, hasta que la Locadora obtenga efectivamente la restitución de la tenencia del bien por parte de La Locataria. Se pacta que dicha indemnización podrá ser reclamada por la misma vía ejecutiva que para el cobro de alquileres y accesorios. En caso de que la Locadora estimare que los daños y perjuicios que le ocasionare la falta de entrega en término fueran superiores a una indemnización pactada, la Locadora podrá reclamar estos, pudiendo iniciar de inmediato las acciones judiciales para desocupar el bien alquilado.</p>


          <strong><u>TERCERA: PRECIO:</u></strong>
          <p>Las partes de común acuerdo pactan que el canon locativo MENSUAL inicial será de <strong>PESOS ${contrato?.montoAlquilerLetras || ""} (${formatMoney(contrato?.montoAlquiler ?? contrato?.monto ?? "")})</strong>. El índice de ajuste para este contrato sera el <strong>${contrato?.indiceAjuste || ""}</strong> será publicado por el Banco Central de la República Argentina. Los ajustes se pactan por periodos <strong>${indexacion(contrato?.actualizacion)}</strong>, aplicando el correspondiente al último día hábil del mes anterior a cada ajuste. Correrán a cargo de ambas partes (Locadora y Locataria), informarse y notificarse sobre el valor a abonar con su respectivo ajuste. Si a la fecha de vencimiento de pago mensual estipulado, no se hubiese efectuado aún la publicación respectiva, La Locataria pagará el monto que venía abonando durante los meses anteriores con carácter provisorio; debiendo integrar la diferencia que surja de la aplicación de dicho índice, dentro de las 48 hs. hábiles posteriores contadas desde la fecha que resulte publicado el mismo. El precio del alquiler se pacta por períodos de mes entero, aunque La Locataria desocupará el inmueble antes de finalizar el mes, debiendo abonar íntegramente el mismo. Si por una disposición legal y futura los arriendos se viven gravados con el pago del impuesto al valor agregado (IVA), la parte Locataria deberá adicionar al monto mensual, el porcentaje correspondiente al IVA.</p>


          <strong><u>CUARTA: FORMA DE PAGO:</u></strong>
          <p>La parte Locataria abonará el alquiler del mes en curso del <strong>1 al 10</strong> de cada mes, en la inmobiliaria <strong>${(contrato?.usuarioDtoSalida?.nombreNegocio || usuarioFetch.nombreNegocio)},</strong> sito en la calle <strong>${(contrato?.usuarioDtoSalida?.razonSocial || usuarioFetch.razonSocial)},</strong> Localidad de <strong>${(contrato?.usuarioDtoSalida?.localidad || usuarioFetch.localidad)},</strong> Partido de <strong>${(contrato?.usuarioDtoSalida?.partido || usuarioFetch.partido)},</strong>. La mora en el pago de los alquileres se producirá en forma automática por el mero transcurso del tiempo y sin necesidad de interpelación ni gestión previa de ninguna naturaleza. La falta de pago del alquiler dentro del plazo establecido facultará a la Locadora, a aplicar un interés punitorio pactado del 0,50 % diario. Dicho interés deberá abonarse conjuntamente con el alquiler correspondiente. La Locadora podrá rechazar el pago que no contenga dicho interés.</p>

       

          <strong><u>QUINTA: SERVICIOS E IMPUESTOS:</u></strong>
          <p>La Locataria tomará a su cargo el pago de los siguientes servicios, relevando a la Locadora de toda responsabilidad al respecto. Debiendo La Locataria efectuar todos los gastos necesarios de su exclusivo peculio. La Locataria se compromete a conservar, mantener y restituir los medidores libres de deuda al finalizar el contrato; por el contrario, si se retirara algún medidor por falta de abono o a pedido de La Locataria sin acuerdo por escrito de la parte Locadora, la parte Locataria queda obligada a solicitar ante la prestadora del servicio que corresponda el medidor y/o la reconexión del mismo (según corresponda) a su cargo y costo exclusivo, incluyendo todo tipo de gasto que requiera realizarse sobre el inmueble locado, (a exigencia de la empresa prestadora), sin derecho a solicitar suma alguna a la parte Locadora. La Locadora dentro de los sesenta (60) días de finalizado el contrato, deberá asegurar el cambio de titularidad de todos los servicios que se encuentren a nombre de La Locataria.</p>
          <p>Las partes convienen que será a cargo de la Parte Locataria:
          El pago del ${aguaPorcentaje}% del servicio provisto por ${aguaEmpresa}, ademas tambien debera abonar el 
          ${luzPorcentaje}% del servicio provisto por ${luzEmpresa} y el 
          ${gasPorcentaje}% del servicio provisto por ${gasEmpresa}.
          Asimismo le correspondera a la parte locataria, abonar el 
          ${municipalPorcentaje}% del servicio provisto por ${municipalEmpresa}.
              
         Dejando expresa constancia que dicha carga fue deducida oportunamente y contemplada sobre el precio pactado contractualmente. Será a cargo de la parte Locadora, el impuesto Inmobiliario provincial (ARBA). Se deja especialmente aclarado que cualquier otro impuesto, tasa, o servicio que pudieran crearse en el futuro con motivo del alquiler, las partes acuerdan que será asumido y abonado por La Locataria, incluso los de emergencia que gravaren la unidad locada, de manera que el alquiler que percibe la Locadora lo recibirá íntegro, sin deducción alguna. La parte Locataria deberá entregar conjuntamente con el pago del alquiler los respectivos recibos abonados, bajo constancia escrita de su entrega. (Art. 1210, 2° párrafo CCC).</p>

           <strong><u>SEXTA: ESTADO DEL BIEN LOCADO:</u></strong>
          <p>La Locataria recibe el inmueble en muy buen estado de conservación, situación que manifiesta conocer, comprometiéndose a reintegrar el inmueble en las mismas condiciones que lo recibe al momento de la finalización del presente contrato, salvo el desgaste natural producido en las cosas por su correcto uso y el transcurso del tiempo.</p>


          <strong><u>SÉPTIMA: DESTINO DE LA LOCACIÓN:</u></strong>
          <p>La Locataria destinará el inmueble para uso ${contrato?.destino || ""}, el cual será ocupado únicamente por La Locataria, no pudiéndose dar otro destino por causa alguna. La falta de cumplimiento será causal de resolución sin perjuicio de las demás acciones por incumplimiento contractual. Queda terminantemente prohibido a La Locataria almacenar en el inmueble productos inflamables, explosivos y/o que emanen olores nauseabundos, como así la emisión de ruidos molestos, cualquier situación mencionada, será causal de resolución ut supra.</p>
          
          <strong><u>OCTAVA: RESOLUCIÓN ANTICIPADA:</u></strong> La Locataria tendrán derecho, transcurridos los seis (6) primeros meses de vigencia de la relación locativa, rescindir el contrato en forma unilateral, debiendo notificar fehacientemente a la Locadora con un (1) mes de anticipación como mínimo. La Locataria, de hacer uso de la opción resolutoria, deberá abonar a la Locadora la indemnización equivalente a un mes y medio (1 y 1/2) del alquiler, cuando esta se produzca antes del año y de un (1) mes vigente al momento de la rescisión, si es de después del año de haber iniciado el contrato. En caso que La Locataria notifique fehacientemente a la Locadora con 3 (tres) meses o más de anticipación y transcurrido seis (6) meses de contrato no corresponderá abonar suma alguna en concepto de indemnización. 
          
          <strong><u>NOVENA: RENOVACIÓN DE CONTRATO:</u></strong> Queda facultada cualquiera de las partes (Locadora y Locataria) a notificar fehacientemente dentro de los 3 (tres) últimos meses de finalizar el presente contrato, con el objeto de acordar las nuevas condiciones para la renovación de la contratación, debiendo expedirse dentro de los quince (15) días hábiles. En caso que la notificación la ejerciera La Locataria, en caso de silencio o negativa de la Locadora, facultará a resolver anticipadamente el contrato, sin indemnización alguna, en cuyo caso deberá notificar fehacientemente a la Locadora la resolución anticipada con un mes de preaviso o bien en caso de incumplimiento deberá abonar a la Locadora la suma equivalente a  un (1)  mes del alquiler vigente al momento de la resolución. 
          
          <strong><u>DÉCIMA: REPARACIONES:</u></strong> La Locataria dará cuenta a la Locadora de cualquier desperfecto estructural, edilicio o por roturas de cañerías de cualquier tipo que sufriera la propiedad dentro de las 48 hs. de ocurrido el mismo, permitiéndole al mismo o a sus representantes el libre acceso a cualquier dependencia, cuando éste juzgue necesario su inspección. Dichas reparaciones estarán a cargo de la Locadora, siempre que las mismas no obedezcan a causas imputables a La Locataria, en cuyo caso deberán ser soportadas por esta última a su exclusivo costo y cargo. Para todos los casos, se pacta que dichas reparaciones serán exclusivamente a cargo de la Locadora, debiendo ser efectuadas en un plazo no mayor de diez (10) días hábiles de notificado fehacientemente por La Locataria, debiendo permitir todo trabajo que sea necesario para su conservación o mejora sin derecho a cobrar indemnización alguna por frustración de uso o goce, desistiendo expresamente La Locataria a plantear la cesación del pago del precio del canon, durante el tiempo de reparación. Conviniendo las partes que quedarán a cargo y costo de La Locataria todas las reparaciones destinadas al mantenimiento del buen estado del inmueble, conservando el mismo en el estado que lo recibió, como asimismo el funcionamiento de todos los artefactos y servicios (gas, refrigeración, agua caliente y fría, electricidad, etc), conforme lo prevé el Art. 1206 del Código Civil y Comercial de la Nación.  Por dichas erogaciones que efectúen La Locataria, motivadas en el cumplimiento de las obligaciones pactadas en el presente contrato, no corresponderá ningún tipo de indemnización o reintegro por parte de la Locadora. 
          
          <strong><u>DÉCIMA PRIMERA: OBLIGACIONES:</strong></u> La Locadora queda totalmente desobligada para eventuales casos de incendio, destrucción total y/o parcial, etc., de los bienes y objetos depositados en el inmueble arrendado, incluso en el supuesto de caso fortuito o fuerza mayor, o frente a cualquier hecho de terceros, como así también los daños y accidentes ocurridos a La Locataria u otras personas que se hallaren en el inmueble (dependientes y/o cualquier persona que circunstancialmente se encontrare en el inmueble), ya sea que provengan de inundaciones, filtraciones, desprendimientos, desperfectos y/o roturas de caños, techos o cualquier otro accidente producido en la propiedad. La Locataria queda obligada para eventuales casos de incendio, destrucción total y/o parcial, etc., del inmueble arrendado, para lo cual La Locataria se compromete a contratar un seguro de incendio, robo, hurto total o parcial, destrucción total o parcial y responsabilidad civil, sobre el inmueble locado, como así los daños que pudiese provocar el siniestro sobre las propiedades linderas, por el periodo que dure este contrato, endosando la póliza a nombre de la Locadora. La Locataria deberá entregar la póliza dentro de los 30 días de firmado el Contrato. En el evento que la compañía aseguradora rechazare total o parcialmente el pago de las indemnizaciones y gastos correspondientes a un siniestro, La Locataria será responsable frente a la Locadora, debiendo indemnizar íntegramente todos los daños y perjuicios que sufra el inmueble. La falta de contratación de esta cobertura dentro del plazo establecido facultará a la Locadora a generar dicha póliza, siendo a costo y cargo de La Locataria, debiendo ser abonada juntamente con el pago del alquiler subsiguiente mensual. Asimismo, La Locataria se obligan formalmente a: 1º) abstenerse de realizar actos contrarios a normas municipales vigentes o que alteren la normal convivencia de los vecinos. 2º) Mantener en buen estado de conservación el inmueble alquilado, obligándose a pagar al primer requerimiento de la Locadora, el importe de los objetos que faltasen y/o desperfectos ocasionados, asumiendo expresamente la responsabilidad por todos y cada uno de los daños y/o perjuicios que resultaren en el inmueble  (Art. 1206 del Código Civil y Comercial de la Nación).  En caso que La Locataria no cumpliera inmediatamente cualquiera de las reparaciones asumidas, este contrato quedará resuelto de pleno derecho, (Art. 1219 Inc. B, primer párrafo del CCyC), pero ello no eximirá a La Locataria y sus fiadores a cumplir con sus obligaciones de pagar lo que resulten adeudar. 3°) No introducir o mantener en el inmueble arrendado, sustancias o elementos inflamables o malolientes, explosivos o que puedan llegar a afectar la seguridad del inmueble, las personas y/o instalaciones. 4°) Le corresponderá a La Locataria la ventilación de los ambientes del inmueble locado, para evitar la condensación, transpiración en paredes que provocan manchas de hongos, desprendimiento de pintura y humedad ambiente. En caso de incumplimiento La Locataria deberá proceder a la limpieza y/o proceder a la pintura de paredes y techos de acuerdo a la gravedad de las manchas o descascarado de pintura ocasionadas por su negligente accionar; sin poder exigir la limpieza y/o costo alguno o compensación de precio a la Locadora.
          
           <strong><u>DÉCIMA SEGUNDA: DESISTIMIENTO:</strong></u> La Locataria desiste de efectuar reclamos, pedir indemnizaciones, y/o suspender el pago de los alquileres o solicitar reducción de los mismos, por frustración de uso o goce de la cosa, sea cual fuera la causa o motivo que genere la misma, exonerando en consecuencia a la Locadora de todo tipo de responsabilidad al respecto.
          
           <strong><u>DÉCIMA TERCERA: MODIFICACIONES:</strong></u> Está terminantemente prohibido realizar modificaciones estructurales en el inmueble, las que deberán ser aprobadas previamente por escrito por la Locadora o su representante legal. En caso de realizarlas sin autorización, la Locadora podrá exigir la restitución del inmueble en las mismas condiciones que fue entregado, debiendo La Locataria eliminar las estructuras incorporadas sin la debida autorización, a su exclusivo costo y cargo; o bien si estas fueran aceptadas por la Locadora, quedarán a exclusivo beneficio del inmueble, sin derecho a retribución o compensación alguna por parte de la Locadora, aún en el supuesto que las mejoras o modificaciones introducidas puedan considerarse como necesarias y útiles, es decir que toda mejora de cualquier tipo cederá en beneficio de la propiedad locada. La Locataria responderá en todo deterioro causado por su culpa o negligencia y de las personas por quienes deba responder.
          
           <strong><u>DÉCIMA CUARTA: USO:</strong></u> La Locataria deberá obedecer todas las normas de convivencia, evitando producir cualquier disturbio, no realizar ruidos molestos, y en general absteniéndose de realizar o permitir cualquier tipo de acto, omisión o negligencia que haga peligrar la tranquilidad y seguridad de las personas y de las cosas. Debiendo responder en igual sentido por todo hecho proveniente de terceros a su cargo o bajo su dependencia. El incumplimiento de esta cláusula será tratado como "uso abusivo" y dará derecho a solicitar el inmediato desalojo (Art. 1219  CCC).
          
           <strong><u>DÉCIMA QUINTA: INCUMPLIMIENTO DE PAGO: </strong></u> En caso de incumplimiento de pago del precio de dos (2) mensualidades consecutivas por adelantada, la Locadora deberá notificar fehacientemente a La Locataria, a abonar en plazo no inferior a diez (10) días corridos, indicando la deuda y el lugar de pago. Cumplido el plazo previsto, La Locataria deberán abonar la deuda o bien restituir la tenencia del inmueble. Vencido el plazo (10 días) la Locadora podrá iniciar la acción de desalojo por falta de pago. Dejando constancia que la notificación al domicilio denunciado por La Locataria y los fiadores se tendrán por válidas, aunque estos se negasen a recibirla o no pudiesen perfeccionarse por motivos imputables a estos. En caso que La Locataria desee restituir la tenencia del inmueble locado, encontrándose totalmente desocupado y libre de intrusos y/o pertenencias, la Locadora no podrá negarse injustificadamente a recibir las llaves, condicionado al pago de la deuda existente, reservándose en su caso el derecho a reclamar el importe total adeudado. Si persiste la negativa a recibir la tenencia, la parte Locataria deberá notificar fehacientemente a la Locadora, bajo apercibimiento de consignar las llaves judicialmente dentro del plazo de diez (10) días hábiles siguientes a la notificación, debiendo la parte Locadora acarrear los gastos y costas del proceso de consignación y liberándose la parte Locataria del pago de alquileres y accesorios desde la efectiva consignación judicial.
          
           <strong><u> DÉCIMA SEXTA: PAGO POR CONSIGNACIÓN: </strong></u> Para el caso que la Locadora se rehusare injustificadamente a cobrar los cánones locativos y accesorios, siendo el pago INTEGRO, en los términos de los Arts. 867 al 870 Código Civil y Comercial de la Nación, La Locataria podrá consignar judicialmente, a costo y cargo de la Locadora (Conforme prevé el Art 1122 CCC). Previamente a la consignación, La Locataria deberá intimar fehacientemente a la Locadora a recibir el pago en un plazo de cuarenta y ocho (48) hs. corridas. Vencido el plazo, en caso de negativa o silencio, La Locataria deberá proceder a la consignación dentro de los tres (3) días hábiles. Se considerará que el pago consignado deberá ser INTEGRO, debiendo incluir canon locativo, intereses, y accesorios correspondientes (servicios, impuestos, etc), que establezcan las distintas cláusulas contractuales. Desistiendo La Locataria a consignar pagos parciales o violatorios al principio de integridad, bajo apercibimiento de cargar las costas y gastos judiciales por incumplimiento contractual. Se deja expresa constancia que bajo ninguna circunstancia la Locadora estará obligada a recibir pagos parciales y/o sin incluir los intereses pactados contractualmente.
         
           <strong><u> DÉCIMA SÉPTIMA: DIÁLOGO: </strong></u> Las partes se comprometen a manejarse en todo momento de buena fe y a sostener diálogo permanente, pacífico y tolerante entre sí durante el desarrollo del contrato. Asimismo, ante desavenencias o divergencias que no pudiesen resolver, sobre precio, plazo, intereses, reparaciones, accesorios y/o cualquier otro tipo de incumplimiento a las obligaciones asumidas por cualquiera de las partes, la Locadora y Locataria, se comprometen a responder positivamente la invitación de la otra a tratar la controversia que fuere a través de la mediación voluntaria gratuita o de bajo costo. En caso de no llegar a acuerdo, la parte que se considere perjudicada podrá requerir judicialmente lo que por derecho corresponda.
          
           <strong><u> DECIMA OCTAVA: DOMICILIOS Y COMPETENCIA JUDICIAL: </strong></u> Para cualquier cuestión que pudiera plantearse con motivo del presente contrato, su validez, interpretación, alcances, cumplimiento, ejecución o resolución, las partes intervinientes declaran someterse definitivamente a los Tribunales Ordinarios de ${(contrato?.usuarioDtoSalida?.partido || usuarioFetch.partido)}, renunciando a todo fuero que pudiera corresponderles, constituyendo los firmantes domicilios especiales enunciados en el presente contrato  en  las que serán válidas todas las notificaciones y diligencias que se practiquen; En caso que los fiadores realicen  cambio de domicilio sin notificar en forma fehaciente a la parte Locadora, se tendrán por válidas y eficaces las notificaciones remitidas a los domicilios denunciados en el contrato.
          
           <strong><u> DÉCIMA NOVENA: PROHIBICIONES: </strong></u> Queda prohibido a la parte Locataria: 1) colocar vinilos decorativos en cualquier superficie del inmueble. 2) Pintar las paredes de color oscuro. El no cumplimiento de lo precitado será causal de resolución de contrato, toda vez que se demuestre fehacientemente dichas situaciones.
          
           <strong><u> VIGÉSIMA: FIANZA:</strong></u>
  ${
    contrato?.garantes && contrato?.garantes?.length > 0 
      ? contrato?.garantes?.map((garante, index) => `
          ${garante?.pronombre || ''} ${garante?.nombre || ''} ${garante?.apellido || ''} de nacionalidad ${garante?.nacionalidad || ''}, con DNI N°${garante?.dni || ''}; CUIL ${garante?.cuit || ''}, con domicilio en la calle ${garante?.direccionResidencial || ''},
      `).join('')
      : 'No hay fiador registrado en el contrato.'
  }  
  ${
    (() => {
      const cantidadGarantes = contrato?.garantes?.length || 0;
      const plural = cantidadGarantes > 1;
  
      return `
        se constituye${plural ? 'n' : ''} en FIADOR${plural ? 'ES LISOS LLANOS' : ' LISO LLANO'} y principal${plural ? 'es pagadores' : ' pagador'} con todo su patrimonio presente y futuro de todos los gastos que devengue este contrato, hasta que El Locatario devuelva el inmueble a la Locadora. Esta queda autorizada, en caso de iniciar acción judicial, para hacerlo contra ${plural ? 'los Garantes' : 'el Garante'} o contra El Locatario o contra ambos, según convenga a sus intereses, sin que el hecho de iniciarla contra uno implique que se libere al otro de la obligación contraída.
      `;
    })()
  }
    ${
    garantes.length > 0 
      ? garantes.map((garante) => `
          ${garante?.pronombre || ''} ${garante?.nombre || ''} ${garante?.apellido || ''} de nacionalidad ${garante?.nacionalidad || ''}, con DNI N° ${garante?.dni || ''}; CUIL ${garante?.cuit || ''}, con domicilio en ${garante?.direccionResidencial || ''}.
      `).join('')
      : 'No hay fiador registrado en el contrato.'
  }  
   <strong><u>VIGÉSIMA PRIMERA:IMPUESTOS DE SELLOS: </strong></u>
  Ambas partes pactan que tanto el impuesto de sellos como derecho de registración, será abonado íntegramente por La Locataria.
      
   <strong><u>VIGÉSIMA SEGUNDA: INCUMPLIMIENTO:</strong></u>
       En cualquiera de los casos de incumplimiento de La Locataria, sin perjuicio de las penalidades que se establecen en las demás cláusulas, la Locadora podrá pedir el cumplimiento de este contrato o resolverlo por culpa de La Locataria y solicitar el inmediato desalojo.
      
       <strong><u>VIGÉSIMA TERCERA: INTRANSFERIBILIDAD: </strong></u>
      El presente Contrato de Locación es absolutamente intransferible y su trasgresión se considerará especial causal de desalojo, asimismo le queda prohibido a La Locataria subarrendar total o parcialmente, ni ceder, ni transferir total o parcialmente el inmueble locado, ni aún a título precario,  ni dar el inmueble en préstamo, aunque sea en forma gratuita (comodato), ni permitir su ocupación por terceros en ningún carácter, aplicándose la prohibición estipulada en el Art. 1213 CCC.
      
      <strong><u> VIGÉSIMA CUARTA: FALTA DE DEVOLUCIÓN:</strong></u>
       Rigiéndose este contrato exclusivamente por las disposiciones de la legislación vigente, La Locataria deberá devolver el inmueble arrendado a su vencimiento, sin excusas, demoras, ni invocación de ninguna naturaleza. Queda perfectamente aclarado que la permanencia de La Locataria en el inmueble locado, después de vencido el contrato, en ningún caso, conformará tácita reconducción, por lo tanto, se podrá exigir la restitución del bien en cualquier momento. 
      
       <strong><u> VIGÉSIMA QUINTA: ENTREGA DE LLAVES:</strong></u>
       Al finalizar el contrato la entrega de las llaves de la propiedad solo se justificará por escrito emanado de la Locadora o su representante, no admitiendo otro medio de prueba. Si La Locataria consigna las llaves, adeudará a la Locadora el alquiler hasta el día en que la Locadora acepte la consignación o se restituya la tenencia del inmueble judicialmente, sin que esto menoscabe el derecho de la Locadora de exigir el pago de las penalidades pactadas por estas circunstancias. La Locataria sólo tendrá derecho de consignar las llaves del inmueble en caso que estando la Locadora fehacientemente notificada se negase a recibirlas, sin perjuicio de su derecho de efectuar las reservas que correspondan por cualquier tipo de obligación incumplida por La Locataria en el momento de la restitución de tenencia.
      
       <strong><u> VIGÉSIMA SEXTA: ABANDONO DE LA PROPIEDAD:</strong></u> 
      Las partes acuerdan que para el caso de abandono de la propiedad por parte de La Locataria sea cual fuere la circunstancia, y para evitar los posibles deterioros que pudieran producirse y/o la ocupación ilegal de terceros, queda facultado la Locadora para ingresar al inmueble y retomar la  tenencia de la propiedad previa estricta probanza de la circunstancia (conforme Art. 1219, Inciso b CCC), quedando facultado a solicitar el auxilio de cerrajero, labrándose acta en tal sentido por Oficial Público, y constituyéndose en depositario de los bienes muebles que pudieran hallarse en el lugar, pertenecientes a La Locataria, por el término de treinta (30) días corridos contados desde el día de practicarse la diligencia. Vencido el plazo del depósito, se entenderá que La Locataria ha renunciado voluntariamente a los efectos de su pertenencia, facultando a la Locadora a deshacerse de los mismos.Asimismo, para dicho evento La Locataria faculta a cualquiera de los Fiadores, autorizándolos especialmente a solicitar el auxilio de cerrajero para la apertura de la/s puerta/s de acceso al inmueble locado, a efectos de restituir la tenencia del Inmueble mediante acta que se formalizará por escrito ante la Locadora y/o su representante. La Locadora podrá reservarse en su caso los derechos para exigir el cumplimiento del contrato, en relación a aquellas obligaciones incumplidas por La Locataria, ya sea por deuda de alquileres y accesorios, roturas, reparaciones, etc., con más los daños que pudiera haber sufrido la propiedad.
      
      <strong><u>VIGÉSIMA SÉPTIMA: </strong></u> La Locataria reconocen y aceptan la facultad que posee la Locadora o su representante legal, de visitar el inmueble dado en locación. El plazo de visita será cada seis (6) meses, con previo aviso de 72 hs., a los efectos de corroborar el estado de uso y conservación del mismo. En prueba de Ratificación y Conformidad, se firman tres ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha al principio indicado, dejando constancia que la parte Locataria toma tenencia del inmueble locado en este acto.

          </div>`;
    return html;
  };

  // Inicializa / reinicializa el editor cada vez que se abre o cambian contrato/pdfContratoTexto
  useEffect(() => {
    if (!(isOpen || embed) || !contrato || !usuarioFetch) return;

    const currentPdfContratoTexto = contrato?.pdfContratoTexto?.trim?.() || '';
    const currentContratoPdf = contrato?.contratoPdf?.trim?.() || '';

    // console.log('Cargando contenido del editor:', {
    //   contratoId: contrato.id,
    //   tiene_pdfContratoTexto: currentPdfContratoTexto.length > 0,
    //   tiene_contratoPdf: currentContratoPdf.length > 0,
    //   preview_usa: (currentPdfContratoTexto || currentContratoPdf || '').slice(0, 100) + '...'
    // });

    setLoading(true);

    // ✅ Lógica mejorada: Si hay contenido guardado Y es diferente de solo el nombre del contrato, usarlo. Si no, usar plantilla.
    const templateContent = buildTemplate(contrato, usuarioFetch);
    const contratoNameOnly = contrato?.nombreContrato || '';
    
    // Verificar si el contenido guardado es solo el nombre del contrato o está vacío
    const isContentOnlyName = (content) => {
      const cleanContent = content.replace(/<[^>]*>/g, '').trim(); // Remover HTML tags
      return cleanContent === contratoNameOnly || cleanContent.length === 0;
    };
    
    let raw;
    if (currentPdfContratoTexto.length > 0 && !isContentOnlyName(currentPdfContratoTexto)) {
      raw = currentPdfContratoTexto;
    } else if (currentContratoPdf.length > 0 && !isContentOnlyName(currentContratoPdf)) {
      raw = currentContratoPdf;
    } else {
      raw = templateContent;
    }

    const sanitized = DOMPurify.sanitize(raw, ALLOWED);
    setContenido(sanitized);
    addParagraph(sanitized);
    setLoading(false);
  }, [
    isOpen,
    contrato?.id,
    contrato?.pdfContratoTexto, // 👈 importante para rehidratar con lo último guardado
    contrato?.contratoPdf,      // soporte legacy
    usuarioFetch?.id
  ]);

  const handleEditorChange = (content) => {
    const sanitized = DOMPurify.sanitize(content, ALLOWED);
    setContenido(sanitized);
    addParagraph(sanitized);
  };

  const handlerSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      pdfContratoTexto: contenido, // 👈 guardamos siempre en este campo
      contrato_id: contrato.id,
    };

    try {
      const url = `${import.meta.env.VITE_API_URL}/contrato/${contrato.id}/updateContract`;
      const jwt = localStorage.getItem('token');


      const response = await axios.put(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        withCredentials: true
      });

      const savedHtml = response?.data?.pdfContratoTexto || contenido;

      if (onSaved) onSaved(savedHtml);      // avisa al padre
      setContenido(savedHtml);              // asegura estado local con lo último

      showSuccess('Contrato guardado exitosamente');

      // En mobile cierro el modal como hacías:
      if (isMobile && onClose) onClose();
    } catch (error) {
      console.error('Error al guardar el contrato:', error);
      showError('Hubo un problema al guardar el contrato.');
    } finally {
      setSaving(false);
    }
  };

  const editorContent = (
    <Grid2 sx={{
      height: '100%',
      width: "100%",
      p: { xs: 1.5, sm: 3 },
      borderRadius: isMobile ? 0 : 3,
      boxShadow: 'none',
      display: "flex",
      flexDirection: "column",
      gap: 2,
      position: 'relative',
      bgcolor: isDark ? '#0c0a14' : '#f8f7fc',
    }}>
      {loading && (
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: isDark ? 'rgba(12,10,20,0.85)' : 'rgba(248,247,252,0.85)',
          zIndex: 10, backdropFilter: 'blur(4px)',
          borderRadius: 'inherit',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ mb: 1.5, color: '#8b5cf6' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Cargando editor...
            </Typography>
          </Box>
        </Box>
      )}

      {isMobile && (
        <Box sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          mb: 1.5, pb: 1, minHeight: "10px",
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 700, fontSize: '1rem',
            color: isDark ? '#a78bfa' : '#7c3aed', lineHeight: 1.2,
          }}>
            Editor — {contrato?.nombreContrato}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              onClick={() => setToolbarVisible(!toolbarVisible)}
              size="small"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' },
              }}
            >
              {toolbarVisible ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {!isMobile && (
        <Box sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          mb: 1.5, pb: 1, minHeight: "10px",
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 700, fontSize: '1.05rem',
            color: isDark ? '#a78bfa' : '#7c3aed', lineHeight: 1.2,
          }}>
            Editor — {contrato?.nombreContrato}
          </Typography>
          <IconButton
            onClick={() => setToolbarVisible(!toolbarVisible)}
            size="small"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' },
            }}
          >
            {toolbarVisible ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}

      <Editor
        key={`editor-${toolbarVisible}`}
        apiKey="yk10ygeb6q71ucxlc2kqvhzpliekkdjmjgw8bxrxbxmvbl6y"
        value={contenido}
        init={{
          theme: 'silver',
          height: isMobile ? "calc(100vh - 130px)" : "620px",
          menubar: toolbarVisible,
          toolbar: toolbarVisible ? 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | searchreplace | preview fullscreen | removeformat' : false,
          plugins: [
            'advlist','autolink','lists','link','image','charmap','preview','anchor',
            'searchreplace','visualblocks','code','fullscreen',
            'insertdatetime','media','table','wordcount'
          ],
          content_style: `
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                   font-size: 12pt; line-height: 1.7;
                   color: ${isDark ? '#e2e0e9' : '#1e1b2e'};
                   padding: 12px;
                   width: 95%; margin: 0 auto;
                   background-color: ${isDark ? '#12101c' : '#ffffff'}; }
            .contrato-content {
                   background-color: ${isDark ? '#12101c' : '#ffffff'};
                   padding: 40px;
                   border-radius: 8px;
                   box-shadow: 0 0 12px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}; }
            p { margin: 0 0 1em 0; text-align: justify; }
            strong u { font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 12pt; display: block; margin: 15px 0 10px 0; }
            p[style*="text-align: center;"] { margin: 1.5em 0;
                   color: ${isDark ? '#8a86a0' : '#666'};
                   font-size: 10pt; }
            .mce-content-body { outline: none !important; }
          `,
          formats: { bold: { inline: 'strong' }, italic: { inline: 'em' }, underline: { inline: 'u' } },
          style_formats: [
            { title: 'Título de Cláusula', block: 'p', wrapper: true, styles: { 'font-weight': 'bold', 'text-transform': 'uppercase', 'text-decoration': 'underline' } },
            { title: 'Separador', block: 'p', wrapper: true, styles: { 'text-align': 'center' } },
            { title: 'Párrafo Normal', block: 'p', wrapper: true }
          ]
        }}
        onEditorChange={handleEditorChange}
      />

      <Box sx={{
        width: "100%", 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.5,
        position: 'relative', 
        mt: 'auto', 
        mb: '3rem',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <ShareButtons contrato={contrato} contenido={contenido} />
        
        <Button
          onClick={handlerSubmit}
          variant="contained"
          disabled={saving}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 2.5, 
            px: 3, 
            fontWeight: 600, 
            boxShadow: 'none',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            },
          }}
        >
          {saving ? (<><CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} /> Guardando...</>) : 'Guardar'}
        </Button>
      </Box>
    </Grid2>
  );

  if (embed) {
    return (
      <Box sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        {editorContent}
      </Box>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300, sx: { backdropFilter: 'blur(4px)' } }}>
      <Slide direction="up" in={isOpen} timeout={250}>
        <Box sx={{
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          position: 'fixed',
          ...(isMobile ? {
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 'calc(100dvh - 56px)'
          } : {
            bottom: -5,
            left: '',
            transform: 'translate(-50%, -50%)',
            width: '100vw',
            maxWidth: '1200px',
            height: '85vh'
          }),
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDark ? '#0c0a14' : '#f8f7fc',
          overflow: 'hidden',
          zIndex: 1300,
          boxShadow: isMobile
            ? '0 -6px 32px rgba(0,0,0,0.25)'
            : `0 12px 48px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)'}`,
          '& .tox-tinymce': { border: 'none', borderRadius: 0, height: '100%' },
          '& .tox-editor-header': {
            backgroundColor: isDark ? '#15121f' : '#f8f7fc',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
          '& .tox-toolbar__primary': {
            backgroundColor: isDark ? '#15121f' : '#f8f7fc',
            p: '4px 8px',
          },
          '& .tox-toolbar__group': { p: '4px 0' },
        }}>
          {editorContent}
        </Box>
      </Slide>
    </Modal>
  );
};

export default TextEditor;
