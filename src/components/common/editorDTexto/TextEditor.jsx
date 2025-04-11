import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button, Grid2, Box, CircularProgress, Modal, Slide, useTheme, useMediaQuery, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UseEditorGlobalContext } from "../../context/EditorGlobal";
import DOMPurify from 'dompurify';
import axios from 'axios';
import Swal from 'sweetalert2';

const TextEditor = ({ contrato, isOpen, onClose }) => {
  const { addParagraph, resetEditor, clearEditor } = UseEditorGlobalContext();
  const [contenido, setContenido] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    if (!contrato) {
      clearEditor();
      setLoading(false);
      return;
    }

    if (contrato?.pdfContratoTexto) {
      const sanitizedContent = DOMPurify.sanitize(contrato.pdfContratoTexto);
      setContenido(sanitizedContent);
      addParagraph(sanitizedContent);
    } else {
      const contenidoInicial = `
        <div class="contrato-content">
          <p>En la Ciudad de Quilmes, en el dia de hoy sito ${contrato.fecha_inicio}, ${contrato.propietario.pronombre} ${contrato.propietario.nombre} ${contrato.propietario.apellido} de nacionalidad ${contrato.propietario.nacionalidad}, D.N.I. ${contrato.propietario.dni} , C.U.I.L. ${contrato.propietario.cuit} en adelante denominada la "parte LOCADORA", y por la otra parte ${contrato.inquilino.pronombre} ${contrato.inquilino.nombre} ${contrato.inquilino.apellido} de ${contrato.inquilino.nacionalidad} con DNI N° ${contrato.inquilino.dni}, CUIL ${contrato.inquilino.cuit} con domicilio en la ${contrato.propiedad.direccion} de la ciudad de ${contrato.propiedad.localidad}, partido de ${contrato.propiedad.partido} Provincia de ${contrato.propiedad.provincia}, en adelante llamado la "parte LOCATARIA", convienen en celebrar el presente Contrato de Locación, que celebran de buena fé, con el cuidado y previsión que exigen y contemplan los art. 9, 729, 961, 965 y 1061 Del Código Civil y Comercial de La Nación, en un todo de acuerdo el que se regirá por las siguientes cláusulas y condiciones.</p>


          PRIMERA: OBJETO:
          <p>La parte Locadora da en locación a la parte Locataria, quien acepta de plena conformidad y a entera satisfacción, ${contrato.propiedad.tipo} del que es propietaria, ubicado sobre la calle ${contrato.propiedad.direccion} de la ciudad de ${contrato.propiedad.localidad}, partido de ${contrato.propiedad.partido} Provincia de ${contrato.propiedad.provincia}, que consta del siguiente INVENTARIO: ${contrato.propiedad.inventario}. Todo lo detallado deberá restituirse al momento de la finalización del presente contrato, ya sea por vencimiento del término u otro motivo, en el mismo estado de funcionamiento y conservación, salvo el desgaste natural producido en las cosas por su correcto uso y el transcurso del tiempo (Art. 1210 CC).</p>


          SEGUNDA: PLAZO:
          <p>El plazo de vigencia del presente contrato es pactado entre las partes en ${contrato.duracion} meses. Dicho plazo será contado a partir del ${contrato.fecha_inicio}, por lo que operará su vencimiento de pleno derecho el ${contrato.fecha_fin}, plazo definitivo e improrrogable de la locación a excepción que ambas partes de común acuerdo decidan renovar el mismo estableciendo las nuevas condiciones, sin fijación de plazo alguno para ello. En caso que las partes no logren acuerdo, La Locataria se obliga a restituir la tenencia del inmueble locado, totalmente desocupado sin requerimiento judicial ni extrajudicial alguno, por el solo vencimiento del plazo pactado. En caso que La Locataria no haga entrega del inmueble el día del vencimiento del contrato, se obliga a pagar una multa de pesos ($ ${contrato.multaXDia}-) por cada día que pase de la fecha convenida de finalización, sin perjuicio de seguir obligada a abonar el canon locativo mensual, hasta que la Locadora obtenga efectivamente la restitución de la tenencia del bien por parte de La Locataria. Se pacta que dicha indemnización podrá ser reclamada por la misma vía ejecutiva que para el cobro de alquileres y accesorios. En caso de que la Locadora estimare que los daños y perjuicios que le ocasionare la falta de entrega en término fueran superiores a una indemnización pactada, la Locadora podrá reclamar estos, pudiendo iniciar de inmediato las acciones judiciales para desocupar el bien alquilado.</p>


          TERCERA: PRECIO:
          <p>Las partes de común acuerdo pactan que el canon locativo MENSUAL inicial será de PESOS ${contrato.montoAlquilerLetras} ($${contrato.montoAlquiler}). El índice de ajuste para este contrato sera el ${contrato.indiceAjuste} será publicado por el Banco Central de la República Argentina,, aplicando el correspondiente al último día hábil del mes anterior a cada ajuste. Correrán a cargo de ambas partes (Locadora y Locataria), informarse y notificarse sobre el valor a abonar con su respectivo ajuste. Si a la fecha de vencimiento de pago mensual estipulado correspondiente a las cuotas N° 7, 13 y 19, no se hubiese efectuado aún la publicación respectiva, La Locataria pagará el monto que venía abonando durante los meses anteriores con carácter provisorio; debiendo integrar la diferencia que surja de la aplicación de dicho índice, dentro de las 48 hs. hábiles posteriores contadas desde la fecha que resulte publicado el mismo. El precio del alquiler se pacta por períodos de mes entero, aunque La Locataria desocupará el inmueble antes de finalizar el mes, debiendo abonar íntegramente el mismo. Si por una disposición legal y futura los arriendos se vieren gravados con el pago del impuesto al valor agregado (IVA), la parte Locataria deberá adicionar al monto mensual, el porcentaje correspondiente al IVA.</p>


          CUARTA: FORMA DE PAGO:
          <p>La parte Locataria abonará el alquiler del mes en curso del 1 al 10 de cada mes, en la inmobiliaria IACONO TROFA PROPIEDADES, sito en la calle Corrientes N°321, Localidad de Quilmes Oeste, Partido de Quilmes. La mora en el pago de los alquileres se producirá en forma automática por el mero transcurso del tiempo y sin necesidad de interpelación ni gestión previa de ninguna naturaleza. La falta de pago del alquiler dentro del plazo establecido facultará a la Locadora, a aplicar un interés punitorio pactado del 0,50 % diario. Dicho interés deberá abonarse conjuntamente con el alquiler correspondiente. La Locadora podrá rechazar el pago que no contenga dicho interés.</p>

       

         QUINTA: SERVICIOS E IMPUESTOS:
          <p>La Locataria tomará a su cargo el pago de los siguientes servicios, relevando a la Locadora de toda responsabilidad al respecto. Debiendo La Locataria efectuar todos los gastos necesarios de su exclusivo peculio. La Locataria se compromete a conservar, mantener y restituir los medidores libres de deuda al finalizar el contrato; por el contrario, si se retirara algún medidor por falta de abono o a pedido de La Locataria sin acuerdo por escrito de la parte Locadora, la parte Locataria queda obligada a solicitar ante la prestadora del servicio que corresponda el medidor y/o la reconexión del mismo (según corresponda) a su cargo y costo exclusivo, incluyendo todo tipo de gasto que requiera realizarse sobre el inmueble locado, (a exigencia de la empresa prestadora), sin derecho a solicitar suma alguna a la parte Locadora. La Locadora dentro de los sesenta (60) días de finalizado el contrato, deberá asegurar el cambio de titularidad de todos los servicios que se encuentren a nombre de La Locataria.</p>
          <p>Las partes convienen que será a cargo de la Parte Locataria:
          El pago del ${contrato.aguaPorcentaje}% del servicio provisto por ${contrato.aguaEmpresa}, ademas tambien debera abonar el 
          ${contrato.luzPorcentaje}% del servicio provisto por ${contrato.luzEmpresa} y el 
          ${contrato.gasPorcentaje}% del servicio provisto por ${contrato.gasEmpresa}.
          </p>
          Asimismo le correspondera a la parte locataria, abonar el 
          ${contrato.municipalPorcentaje}% del servicio provisto por ${contrato.municipalEmpresa}.
              
          <p>Dejando expresa constancia que dicha carga fue deducida oportunamente y contemplada sobre el precio pactado contractualmente. Será a cargo de la parte Locadora, el impuesto Inmobiliario provincial (ARBA). Se deja especialmente aclarado que cualquier otro impuesto, tasa, o servicio que pudieran crearse en el futuro con motivo del alquiler, las partes acuerdan que será asumido y abonado por La Locataria, incluso los de emergencia que gravaren la unidad locada, de manera que el alquiler que percibe la Locadora lo recibirá íntegro, sin deducción alguna. La parte Locataria deberá entregar conjuntamente con el pago del alquiler los respectivos recibos abonados, bajo constancia escrita de su entrega. (Art. 1210, 2° párrafo CCC).</p>

          SEXTA: ESTADO DEL BIEN LOCADO:
          <p>La Locataria recibe el inmueble en muy buen estado de conservación, situación que manifiesta conocer, comprometiéndose a reintegrar el inmueble en las mismas condiciones que lo recibe al momento de la finalización del presente contrato, salvo el desgaste natural producido en las cosas por su correcto uso y el transcurso del tiempo.</p>


          SÉPTIMA: DESTINO DE LA LOCACIÓN:
          <p>La Locataria destinará el inmueble para uso ${contrato.destino}, el cual será ocupado únicamente por La Locataria, no pudiéndose dar otro destino por causa alguna. La falta de cumplimiento será causal de resolución sin perjuicio de las demás acciones por incumplimiento contractual. Queda terminantemente prohibido a La Locataria almacenar en el inmueble productos inflamables, explosivos y/o que emanen olores nauseabundos, como así la emisión de ruidos molestos, cualquier situación mencionada, será causal de resolución ut supra.</p>
          OCTAVA: RESOLUCIÓN ANTICIPADA: La Locataria tendrán derecho, transcurridos los seis (6) primeros meses de vigencia de la relación locativa, rescindir el contrato en forma unilateral, debiendo notificar fehacientemente a la Locadora con un (1) mes de anticipación como mínimo. La Locataria, de hacer uso de la opción resolutoria, deberá abonar a la Locadora la indemnización equivalente a un mes y medio (1 y 1/2) del alquiler, cuando esta se produzca antes del año y de un (1) mes vigente al momento de la rescisión, si es de después del año de haber iniciado el contrato. En caso que La Locataria notifique fehacientemente a la Locadora con 3 (tres) meses o más de anticipación y transcurrido seis (6) meses de contrato no corresponderá abonar suma alguna en concepto de indemnización. 
          NOVENA: RENOVACIÓN DE CONTRATO: Queda facultada cualquiera de las partes (Locadora y Locataria) a notificar fehacientemente dentro de los 3 (tres) últimos meses de finalizar el presente contrato, con el objeto de acordar las nuevas condiciones para la renovación de la contratación, debiendo expedirse dentro de los quince (15) días hábiles. En caso que la notificación la ejerciera La Locataria, en caso de silencio o negativa de la Locadora, facultará a resolver anticipadamente el contrato, sin indemnización alguna, en cuyo caso deberá notificar fehacientemente a la Locadora la resolución anticipada con un mes de preaviso o bien en caso de incumplimiento deberá abonar a la Locadora la suma equivalente a  un (1)  mes del alquiler vigente al momento de la resolución. 
          DÉCIMA: REPARACIONES: La Locataria dará cuenta a la Locadora de cualquier desperfecto estructural, edilicio o por roturas de cañerías de cualquier tipo que sufriera la propiedad dentro de las 48 hs. de ocurrido el mismo, permitiéndole al mismo o a sus representantes el libre acceso a cualquier dependencia, cuando éste juzgue necesario su inspección. Dichas reparaciones estarán a cargo de la Locadora, siempre que las mismas no obedezcan a causas imputables a La Locataria, en cuyo caso deberán ser soportadas por esta última a su exclusivo costo y cargo. Para todos los casos, se pacta que dichas reparaciones serán exclusivamente a cargo de la Locadora, debiendo ser efectuadas en un plazo no mayor de diez (10) días hábiles de notificado fehacientemente por La Locataria, debiendo permitir todo trabajo que sea necesario para su conservación o mejora sin derecho a cobrar indemnización alguna por frustración de uso o goce, desistiendo expresamente La Locataria a plantear la cesación del pago del precio del canon, durante el tiempo de reparación. Conviniendo las partes que quedarán a cargo y costo de La Locataria todas las reparaciones destinadas al mantenimiento del buen estado del inmueble, conservando el mismo en el estado que lo recibió, como asimismo el funcionamiento de todos los artefactos y servicios (gas, refrigeración, agua caliente y fría, electricidad, etc), conforme lo prevé el Art. 1206 del Código Civil y Comercial de la Nación.  Por dichas erogaciones que efectúen La Locataria, motivadas en el cumplimiento de las obligaciones pactadas en el presente contrato, no corresponderá ningún tipo de indemnización o reintegro por parte de la Locadora. 
          DÉCIMA PRIMERA: OBLIGACIONES: La Locadora queda totalmente desobligada para eventuales casos de incendio, destrucción total y/o parcial, etc., de los bienes y objetos depositados en el inmueble arrendado, incluso en el supuesto de caso fortuito o fuerza mayor, o frente a cualquier hecho de terceros, como así también los daños y accidentes ocurridos a La Locataria u otras personas que se hallaren en el inmueble (dependientes y/o cualquier persona que circunstancialmente se encontrare en el inmueble), ya sea que provengan de inundaciones, filtraciones, desprendimientos, desperfectos y/o roturas de caños, techos o cualquier otro accidente producido en la propiedad. La Locataria queda obligada para eventuales casos de incendio, destrucción total y/o parcial, etc., del inmueble arrendado, para lo cual La Locataria se compromete a contratar un seguro de incendio, robo, hurto total o parcial, destrucción total o parcial y responsabilidad civil, sobre el inmueble locado, como así los daños que pudiese provocar el siniestro sobre las propiedades linderas, por el periodo que dure este contrato, endosando la póliza a nombre de la Locadora. La Locataria deberá entregar la póliza dentro de los 30 días de firmado el Contrato. En el evento que la compañía aseguradora rechazare total o parcialmente el pago de las indemnizaciones y gastos correspondientes a un siniestro, La Locataria será responsable frente a la Locadora, debiendo indemnizar íntegramente todos los daños y perjuicios que sufra el inmueble. La falta de contratación de esta cobertura dentro del plazo establecido facultará a la Locadora a generar dicha póliza, siendo a costo y cargo de La Locataria, debiendo ser abonada juntamente con el pago del alquiler subsiguiente mensual. Asimismo, La Locataria se obligan formalmente a: 1º) abstenerse de realizar actos contrarios a normas municipales vigentes o que alteren la normal convivencia de los vecinos. 2º) Mantener en buen estado de conservación el inmueble alquilado, obligándose a pagar al primer requerimiento de la Locadora, el importe de los objetos que faltasen y/o desperfectos ocasionados, asumiendo expresamente la responsabilidad por todos y cada uno de los daños y/o perjuicios que resultaren en el inmueble  (Art. 1206 del Código Civil y Comercial de la Nación).  En caso que La Locataria no cumpliera inmediatamente cualquiera de las reparaciones asumidas, este contrato quedará resuelto de pleno derecho, (Art. 1219 Inc. B, primer párrafo del CCyC), pero ello no eximirá a La Locataria y sus fiadores a cumplir con sus obligaciones de pagar lo que resulten adeudar. 3°) No introducir o mantener en el inmueble arrendado, sustancias o elementos inflamables o malolientes, explosivos o que puedan llegar a afectar la seguridad del inmueble, las personas y/o instalaciones. 4°) Le corresponderá a La Locataria la ventilación de los ambientes del inmueble locado, para evitar la condensación, transpiración en paredes que provocan manchas de hongos, desprendimiento de pintura y humedad ambiente. En caso de incumplimiento La Locataria deberá proceder a la limpieza y/o proceder a la pintura de paredes y techos de acuerdo a la gravedad de las manchas o descascarado de pintura ocasionadas por su negligente accionar; sin poder exigir la limpieza y/o costo alguno o compensación de precio a la Locadora.
          DÉCIMA SEGUNDA: DESISTIMIENTO: La Locataria desiste de efectuar reclamos, pedir indemnizaciones, y/o suspender el pago de los alquileres o solicitar reducción de los mismos, por frustración de uso o goce de la cosa, sea cual fuera la causa o motivo que genere la misma, exonerando en consecuencia a la Locadora de todo tipo de responsabilidad al respecto.
          DÉCIMA TERCERA: MODIFICACIONES: Está terminantemente prohibido realizar modificaciones estructurales en el inmueble, las que deberán ser aprobadas previamente por escrito por la Locadora o su representante legal. En caso de realizarlas sin autorización, la Locadora podrá exigir la restitución del inmueble en las mismas condiciones que fue entregado, debiendo La Locataria eliminar las estructuras incorporadas sin la debida autorización, a su exclusivo costo y cargo; o bien si estas fueran aceptadas por la Locadora, quedarán a exclusivo beneficio del inmueble, sin derecho a retribución o compensación alguna por parte de la Locadora, aún en el supuesto que las mejoras o modificaciones introducidas puedan considerarse como necesarias y útiles, es decir que toda mejora de cualquier tipo cederá en beneficio de la propiedad locada. La Locataria responderá en todo deterioro causado por su culpa o negligencia y de las personas por quienes deba responder.
          DÉCIMA CUARTA: USO: La Locataria deberá obedecer todas las normas de convivencia, evitando producir cualquier disturbio, no realizar ruidos molestos, y en general absteniéndose de realizar o permitir cualquier tipo de acto, omisión o negligencia que haga peligrar la tranquilidad y seguridad de las personas y de las cosas. Debiendo responder en igual sentido por todo hecho proveniente de terceros a su cargo o bajo su dependencia. El incumplimiento de esta cláusula será tratado como "uso abusivo" y dará derecho a solicitar el inmediato desalojo (Art. 1219  CCC).
          DÉCIMA QUINTA: INCUMPLIMIENTO DE PAGO: En caso de incumplimiento de pago del precio de dos (2) mensualidades consecutivas por adelantada, la Locadora deberá notificar fehacientemente a La Locataria, a abonar en plazo no inferior a diez (10) días corridos, indicando la deuda y el lugar de pago. Cumplido el plazo previsto, La Locataria deberán abonar la deuda o bien restituir la tenencia del inmueble. Vencido el plazo (10 días) la Locadora podrá iniciar la acción de desalojo por falta de pago. Dejando constancia que la notificación al domicilio denunciado por La Locataria y los fiadores se tendrán por válidas, aunque estos se negasen a recibirla o no pudiesen perfeccionarse por motivos imputables a estos. En caso que La Locataria desee restituir la tenencia del inmueble locado, encontrándose totalmente desocupado y libre de intrusos y/o pertenencias, la Locadora no podrá negarse injustificadamente a recibir las llaves, condicionado al pago de la deuda existente, reservándose en su caso el derecho a reclamar el importe total adeudado. Si persiste la negativa a recibir la tenencia, la parte Locataria deberá notificar fehacientemente a la Locadora, bajo apercibimiento de consignar las llaves judicialmente dentro del plazo de diez (10) días hábiles siguientes a la notificación, debiendo la parte Locadora acarrear los gastos y costas del proceso de consignación y liberándose la parte Locataria del pago de alquileres y accesorios desde la efectiva consignación judicial.
          DÉCIMA SEXTA: PAGO POR CONSIGNACIÓN: Para el caso que la Locadora se rehusare injustificadamente a cobrar los cánones locativos y accesorios, siendo el pago INTEGRO, en los términos de los Arts. 867 al 870 Código Civil y Comercial de la Nación, La Locataria podrá consignar judicialmente, a costo y cargo de la Locadora (Conforme prevé el Art 1122 CCC). Previamente a la consignación, La Locataria deberá intimar fehacientemente a la Locadora a recibir el pago en un plazo de cuarenta y ocho (48) hs. corridas. Vencido el plazo, en caso de negativa o silencio, La Locataria deberá proceder a la consignación dentro de los tres (3) días hábiles. Se considerará que el pago consignado deberá ser INTEGRO, debiendo incluir canon locativo, intereses, y accesorios correspondientes (servicios, impuestos, etc), que establezcan las distintas cláusulas contractuales. Desistiendo La Locataria a consignar pagos parciales o violatorios al principio de integridad, bajo apercibimiento de cargar las costas y gastos judiciales por incumplimiento contractual. Se deja expresa constancia que bajo ninguna circunstancia la Locadora estará obligada a recibir pagos parciales y/o sin incluir los intereses pactados contractualmente.
          DÉCIMA SÉPTIMA: DIÁLOGO: Las partes se comprometen a manejarse en todo momento de buena fe y a sostener diálogo permanente, pacífico y tolerante entre sí durante el desarrollo del contrato. Asimismo, ante desavenencias o divergencias que no pudiesen resolver, sobre precio, plazo, intereses, reparaciones, accesorios y/o cualquier otro tipo de incumplimiento a las obligaciones asumidas por cualquiera de las partes, la Locadora y Locataria, se comprometen a responder positivamente la invitación de la otra a tratar la controversia que fuere a través de la mediación voluntaria gratuita o de bajo costo. En caso de no llegar a acuerdo, la parte que se considere perjudicada podrá requerir judicialmente lo que por derecho corresponda.
          DECIMA OCTAVA: DOMICILIOS Y COMPETENCIA JUDICIAL: Para cualquier cuestión que pudiera plantearse con motivo del presente contrato, su validez, interpretación, alcances, cumplimiento, ejecución o resolución, las partes intervinientes declaran someterse definitivamente a los Tribunales Ordinarios de Quilmes, renunciando a todo fuero que pudiera corresponderles, constituyendo los firmantes domicilios especiales enunciados en el presente contrato  en  las que serán válidas todas las notificaciones y diligencias que se practiquen; En caso que los fiadores realicen  cambio de domicilio sin notificar en forma fehaciente a la parte Locadora, se tendrán por válidas y eficaces las notificaciones remitidas a los domicilios denunciados en el contrato.
          DÉCIMA NOVENA: PROHIBICIONES: Queda prohibido a la parte Locataria: 1) colocar vinilos decorativos en cualquier superficie del inmueble. 2) Pintar las paredes de color oscuro. El no cumplimiento de lo precitado será causal de resolución de contrato, toda vez que se demuestre fehacientemente dichas situaciones.
          VIGÉSIMA: FIANZA:
  ${
    contrato.garantes && contrato.garantes.length > 0 
      ? contrato.garantes.map((garante, index) => `
          ${garante.pronombre} ${garante.nombre} ${garante.apellido} de nacionalidad ${garante.nacionalidad}, ${garante.estadoCivil}, con DNI N°${garante.dni}; CUIL ${garante.cuit}, con domicilio en la calle ${garante.direccionResidencial},
      `).join('')
      : 'No hay fiador registrado en el contrato.'
  }  
  ${`
          se constituye${contrato.garantes.length > 1 ? 'n' : ''} en FIADOR${contrato.garantes.length > 1 ? 'ES LISOS LLANOS' : ' LISO LLANO'} y principal${contrato.garantes.length > 1 ? 'es pagadores' : ' pagador'} con todo su patrimonio presente y futuro de todos los gastos que devengue este contrato, hasta que El Locatario devuelva el inmueble a la Locadora. Esta queda autorizada, en caso de iniciar acción judicial, para hacerlo contra ${contrato.garantes.length > 1 ? 'los Garantes' : 'el Garante'} o contra El Locatario o contra ambos, según convenga a sus intereses, sin que el hecho de iniciarla contra uno implique que se libere al otro de la obligación contraída.`
  } 
    ${
    contrato.garantes && contrato.garantes.length > 0 
      ? contrato.garantes.map((garante, index) => `
          ${garante.pronombre} ${garante.nombre} ${garante.apellido} de nacionalidad ${garante.nacionalidad}, aporta ${contrato.garantes.nombreEmpresa === null ? `la siguiente escritura publica  de un ${garante.tipoPropiedad}; Partida Inmobiliaria N° ${garante.partidaInmobiliaria}; Informacion catastral: ${garante.infoCatastral}; ubicada en la calle ${garante.direccion}; la cual se encuentra ${garante.estadoOcupacion}` : `recibos de sueldo de ${garante.nombreEmpresa}; C.U.I.T : ${garante.cuitEmpresa}; Legajo: ${garante.legajo}; Sector: ${garante.sectorActual}; Cargo: ${garante.cargoActual};  `}
      `).join('')
      : 'No hay fiador registrado en el contrato.'
  }  
  VIGÉSIMA PRIMERA:IMPUESTOS DE SELLOS: 
  Ambas partes pactan que tanto el impuesto de sellos como derecho de registración, será abonado íntegramente por La Locataria.
      VIGÉSIMA SEGUNDA: INCUMPLIMIENTO:
       En cualquiera de los casos de incumplimiento de La Locataria, sin perjuicio de las penalidades que se establecen en las demás cláusulas, la Locadora podrá pedir el cumplimiento de este contrato o resolverlo por culpa de La Locataria y solicitar el inmediato desalojo.
      VIGÉSIMA TERCERA: INTRANSFERIBILIDAD: 
      El presente Contrato de Locación es absolutamente intransferible y su trasgresión se considerará especial causal de desalojo, asimismo le queda prohibido a La Locataria subarrendar total o parcialmente, ni ceder, ni transferir total o parcialmente el inmueble locado, ni aún a título precario,  ni dar el inmueble en préstamo, aunque sea en forma gratuita (comodato), ni permitir su ocupación por terceros en ningún carácter, aplicándose la prohibición estipulada en el Art. 1213 CCC.
      VIGÉSIMA CUARTA: FALTA DE DEVOLUCIÓN:
       Rigiéndose este contrato exclusivamente por las disposiciones de la legislación vigente, La Locataria deberá devolver el inmueble arrendado a su vencimiento, sin excusas, demoras, ni invocación de ninguna naturaleza. Queda perfectamente aclarado que la permanencia de La Locataria en el inmueble locado, después de vencido el contrato, en ningún caso, conformará tácita reconducción, por lo tanto, se podrá exigir la restitución del bien en cualquier momento. 
      VIGÉSIMA QUINTA: ENTREGA DE LLAVES:
       Al finalizar el contrato la entrega de las llaves de la propiedad solo se justificará por escrito emanado de la Locadora o su representante, no admitiendo otro medio de prueba. Si La Locataria consigna las llaves, adeudará a la Locadora el alquiler hasta el día en que la Locadora acepte la consignación o se restituya la tenencia del inmueble judicialmente, sin que esto menoscabe el derecho de la Locadora de exigir el pago de las penalidades pactadas por estas circunstancias. La Locataria sólo tendrá derecho de consignar las llaves del inmueble en caso que estando la Locadora fehacientemente notificada se negase a recibirlas, sin perjuicio de su derecho de efectuar las reservas que correspondan por cualquier tipo de obligación incumplida por La Locataria en el momento de la restitución de tenencia.
      VIGÉSIMA SEXTA: 
      ABANDONO DE LA PROPIEDAD; 
      Las partes acuerdan que para el caso de abandono de la propiedad por parte de La Locataria sea cual fuere la circunstancia, y para evitar los posibles deterioros que pudieran producirse y/o la ocupación ilegal de terceros, queda facultado la Locadora para ingresar al inmueble y retomar la  tenencia de la propiedad previa estricta probanza de la circunstancia (conforme Art. 1219, Inciso b CCC), quedando facultado a solicitar el auxilio de cerrajero, labrándose acta en tal sentido por Oficial Público, y constituyéndose en depositario de los bienes muebles que pudieran hallarse en el lugar, pertenecientes a La Locataria, por el término de treinta (30) días corridos contados desde el día de practicarse la diligencia. Vencido el plazo del depósito, se entenderá que La Locataria ha renunciado voluntariamente a los efectos de su pertenencia, facultando a la Locadora a deshacerse de los mismos.Asimismo, para dicho evento La Locataria faculta a cualquiera de los Fiadores, autorizándolos especialmente a solicitar el auxilio de cerrajero para la apertura de la/s puerta/s de acceso al inmueble locado, a efectos de restituir la tenencia del Inmueble mediante acta que se formalizará por escrito ante la Locadora y/o su representante. La Locadora podrá reservarse en su caso los derechos para exigir el cumplimiento del contrato, en relación a aquellas obligaciones incumplidas por La Locataria, ya sea por deuda de alquileres y accesorios, roturas, reparaciones, etc., con más los daños que pudiera haber sufrido la propiedad.
      VIGÉSIMA SÉPTIMA: La Locataria reconocen y aceptan la facultad que posee la Locadora o su representante legal, de visitar el inmueble dado en locación. El plazo de visita será cada seis (6) meses, con previo aviso de 72 hs., a los efectos de corroborar el estado de uso y conservación del mismo. En prueba de Ratificación y Conformidad, se firman tres ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha al principio indicado, dejando constancia que la parte Locataria vuelve a  tomar tenencia del inmueble locado en este acto.

          </div>`;
      
      const sanitizedContent = DOMPurify.sanitize(contenidoInicial);
      setContenido(sanitizedContent);
      addParagraph(sanitizedContent);
    }
    setLoading(false);
  }, [contrato?.id]);

  const handleEditorChange = (content, editor) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    setContenido(sanitizedContent);
    addParagraph(sanitizedContent);
  };

  const handlerSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updatedContratoPdf = {
      pdfContratoTexto: contenido,
      contrato_id: contrato.id,
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/contrato/${contrato.id}/updateContract`,
        updatedContratoPdf,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      resetEditor();
      
      Swal.fire({
        title: '¡Contrato guardado!',
        text: 'El contrato ya se encuentra disponible.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });

      if (isMobile && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar el contrato:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar el contrato.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setSaving(false);
    }
  };

  const editorContent = (
    <Grid2 sx={{ 
      height: isMobile ? "100vh" : "700px",
      width: "100%",
      backgroundColor: "#f8fafc",
      padding: { xs: "12px", sm: "24px" },
      borderRadius: isMobile ? 0 : "8px",
      boxShadow: isMobile ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      position: 'relative'
    }}>
      {loading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          zIndex: 10,
          backdropFilter: 'blur(2px)'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Cargando editor...
            </Typography>
          </Box>
        </Box>
      )}
      {isMobile && (
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          borderBottom: "1px solid #e0e0e0",
          pb: 1,
          minHeight: "48px"
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: theme.palette.primary.main,
            lineHeight: 1.2
          }}>
            Editor de Contrato - {contrato?.nombreContrato}
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: "text.secondary",
              bgcolor: 'rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      <Editor
        apiKey="yk10ygeb6q71ucxlc2kqvhzpliekkdjmjgw8bxrxbxmvbl6y"
        value={contenido}
        init={{
          height: isMobile ? "calc(100vh - 130px)" : "620px",
          menubar: true,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic underline | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
            }
            .contrato-content {
              background-color: white;
              padding: 40px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            p {
              margin: 0 0 1em 0;
              text-align: justify;
            }
            strong u { 
              font-weight: bold;
              text-decoration: underline;
              text-transform: uppercase;
              font-size: 12pt;
              display: block;
              margin: 15px 0 10px 0;
            }
            p[style*="text-align: center;"] {
              margin: 1.5em 0;
              color: #666;
              font-size: 11pt;
            }
            .mce-content-body {
              outline: none !important;
            }
          `,
          formats: {
            bold: { inline: 'strong' },
            italic: { inline: 'em' },
            underline: { inline: 'u' },
          },
          style_formats: [
            { title: 'Título de Cláusula', block: 'p', wrapper: true, styles: { 'font-weight': 'bold', 'text-transform': 'uppercase', 'text-decoration': 'underline' } },
            { title: 'Separador', block: 'p', wrapper: true, styles: { 'text-align': 'center' } },
            { title: 'Párrafo Normal', block: 'p', wrapper: true }
          ],
          setup: function (editor) {
            editor.on('init', function (e) {
              editor.getBody().style.fontSize = '12pt';
            });
          }
        }}
        onEditorChange={handleEditorChange}
      />
      <Box sx={{ 
        width: "100%", 
        height: "3rem",
        justifyContent: "flex-end", 
        display: 'flex', 
        padding: "10px",
        position: 'relative',
        backgroundColor: isMobile ? '#f8fafc' : 'white',
        borderTop: '1px solid #ddd',
        mt: 'auto',
        mb: '3rem' // Agregado el margen inferior de 3rem
      }}>
        <Button 
          onClick={handlerSubmit} 
          variant="contained" 
          color="primary"
          disabled={saving}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </Box>
    </Grid2>
  );

  if (isMobile) {
    return (
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Box sx={{ 
          width: '100%',
          height: '100%',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '& .tox-tinymce': {
            border: 'none',
            borderRadius: 0,
          },
          '& .tox-editor-header': {
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e0e0e0',
          },
          '& .tox-toolbar__primary': {
            backgroundColor: '#f8fafc',
            padding: '4px 8px',
          },
          '& .tox-toolbar__group': {
            padding: '4px 0',
          }
        }}>
          {editorContent}
        </Box>
      </Slide>
    );
  }

  return editorContent;
};

export default TextEditor;