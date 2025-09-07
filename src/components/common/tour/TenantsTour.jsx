import React, { useEffect, useMemo, useState } from 'react';

const TenantsTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('tenantsTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    { target: 'body', placement: 'center', title: 'Sección Inquilinos', content: 'Gestioná inquilinos: buscá, creá y administrá sus datos.', disableBeacon: true },
    { target: '[data-tour="tenants-title"]', title: 'Inquilinos', content: 'Título de la sección.', placement: 'bottom' },
    { target: '[data-tour="tenants-add"]', title: 'Nuevo inquilino', content: 'Creá un inquilino desde aquí.', placement: 'left' },
    { target: '[data-tour="tenants-search"]', title: 'Buscar', content: 'Buscá por nombre, apellido, email, teléfono o DNI.', placement: 'bottom' },
    { target: '[data-tour="tenants-pagination"]', title: 'Paginación', content: 'Navegá entre páginas de resultados.', placement: 'top' },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(data.status)) {
      localStorage.setItem('tenantsTourSeen', 'true');
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

export default TenantsTour;
