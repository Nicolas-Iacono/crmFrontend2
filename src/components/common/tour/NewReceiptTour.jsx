import React, { useEffect, useMemo, useState } from 'react';

const NewReceiptTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('newReceiptTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    { target: 'body', placement: 'center', title: 'Nuevo Recibo', content: 'Generá un recibo seleccionando contrato y completando los datos.', disableBeacon: true },
    { target: '[data-tour="newreceipt-title"]', title: 'Título', content: 'Pantalla de generación de recibos.', placement: 'bottom' },
    { target: '[data-tour="newreceipt-contrato"]', title: 'Contrato', content: 'Elegí el contrato asociado.', placement: 'bottom' },
    { target: '[data-tour="newreceipt-periodo"]', title: 'Periodo', content: 'Seleccioná el periodo del recibo.', placement: 'bottom' },
    { target: '[data-tour="newreceipt-numero"]', title: 'Número', content: 'Asigná un número de recibo.', placement: 'bottom' },
    { target: '[data-tour="newreceipt-monto"]', title: 'Monto', content: 'Podés usar el monto del contrato o definir uno.', placement: 'bottom' },
    { target: '[data-tour="newreceipt-submit"]', title: 'Generar', content: 'Creá el recibo con este botón.', placement: 'top' },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(data.status)) {
      localStorage.setItem('newReceiptTourSeen', 'true');
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

export default NewReceiptTour;
