import React, { useEffect, useMemo, useState } from 'react';

const ContractsTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('contractsTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    { target: 'body', placement: 'center', title: 'Sección Contratos', content: 'Buscá y gestioná tus contratos. Podés crear, ver detalles y generar recibos.', disableBeacon: true },
    { target: '[data-tour="contracts-title"]', title: 'Contratos', content: 'Título de la sección.', placement: 'bottom' },
    { target: '[data-tour="contracts-add"]', title: 'Nuevo contrato', content: 'Creá un contrato desde aquí.', placement: 'left' },
    { target: '[data-tour="contracts-search"]', title: 'Buscar', content: 'Buscá por contrato, propietario, inquilino o propiedad.', placement: 'bottom' },
    { target: '[data-tour="contracts-pagination"]', title: 'Paginación', content: 'Navegá entre páginas de resultados.', placement: 'top' },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(data.status)) {
      localStorage.setItem('contractsTourSeen', 'true');
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

export default ContractsTour;
