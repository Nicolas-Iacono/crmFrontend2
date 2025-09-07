import React, { useEffect, useMemo, useState } from 'react';

const ReceiptFormTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('receiptFormTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    { target: 'body', placement: 'center', title: 'Recibos del Contrato', content: 'Acá podés generar y gestionar recibos de un contrato.', disableBeacon: true },
    { target: '[data-tour="reciboform-title"]', title: 'Generar Recibo', content: 'Este es el formulario de generación de recibos.', placement: 'bottom' },
    { target: '[data-tour="reciboform-contract"]', title: 'Datos del Contrato', content: 'Resumen del contrato asociado.', placement: 'bottom' },
    { target: '[data-tour="reciboform-numero"]', title: 'Número de Recibo', content: 'Indicá el número del recibo.', placement: 'bottom' },
    { target: '[data-tour="reciboform-fecha-emision"]', title: 'Fecha de Emisión', content: 'Seleccioná la fecha de emisión.', placement: 'bottom' },
    { target: '[data-tour="reciboform-fecha-vencimiento"]', title: 'Fecha de Vencimiento', content: 'Seleccioná el vencimiento.', placement: 'bottom' },
    { target: '[data-tour="reciboform-periodo"]', title: 'Periodo', content: 'Indicá el periodo (ej: Enero 2025).', placement: 'bottom' },
    { target: '[data-tour="reciboform-concepto"]', title: 'Concepto', content: 'Detalle del concepto del recibo.', placement: 'bottom' },
    { target: '[data-tour="reciboform-metodopago"]', title: 'Método de Pago', content: 'Elegí el método de pago.', placement: 'bottom' },
    { target: '[data-tour="reciboform-impuestos"]', title: 'Impuestos', content: 'Activá e ingresá valores para impuestos a incluir.', placement: 'bottom' },
    { target: '[data-tour="reciboform-submit"]', title: 'Guardar Recibo', content: 'Guardá el recibo cuando esté listo.', placement: 'top' },
    { target: '[data-tour="reciboform-list-title"]', title: 'Recibos Generados', content: 'Acá se listan los recibos del contrato.', placement: 'bottom' },
    { target: '[data-tour="reciboform-filters"]', title: 'Filtros', content: 'Filtrá por pagados, pendientes o ver todos.', placement: 'bottom' },
    { target: '[data-tour="reciboform-list"]', title: 'Listado', content: 'Vista de recibos en tarjetas o tabla según el dispositivo.', placement: 'top' },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(data.status)) {
      localStorage.setItem('receiptFormTourSeen', 'true');
      setRun(false);
    }
  };

  if (!run || !joyrideMod) return null;

  return (
    <joyrideMod.Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      disableOverlayClose={false}
      disableScrolling
      scrollToFirstStep
      styles={{ options: { primaryColor: '#6f33f1', zIndex: 20000 } }}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
      callback={handleCallback}
    />
  );
};

export default ReceiptFormTour;
