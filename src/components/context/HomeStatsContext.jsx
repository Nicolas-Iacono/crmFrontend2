import React, { createContext, useContext, useState } from 'react';

const HomeStatsContext = createContext();

export const useHomeStats = () => useContext(HomeStatsContext);

export const HomeStatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    numPropietarios: 0,
    numInquilinos: 0,
    numPropiedades: 0,
    numGarantes: 0,
    numContratos: 0,
    ultimosContratos: [],
    loaded: false 
  });

  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  return (
    <HomeStatsContext.Provider value={{ stats, updateStats }}>
      {children}
    </HomeStatsContext.Provider>
  );
};
