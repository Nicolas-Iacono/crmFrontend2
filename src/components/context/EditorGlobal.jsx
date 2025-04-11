import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const EditorGlobalContext = createContext();

export const EditorTextContextProvider = ({ children }) => {
  const [parrafo, setParrafo] = useState('');
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  // Estado para el contenido intermedio antes del debounce
  const [pendingContent, setPendingContent] = useState('');

  // Usar useCallback para memoizar funciones
  const addParagraph = useCallback((text) => {
    // Ensure we always have a string
    const safeText = text || '';
    
    // Actualizar el contenido pendiente inmediatamente
    setPendingContent(safeText);
    
    // Establecer un temporizador para actualizar el estado global
    const timer = setTimeout(() => {
      setParrafo(safeText);
      setIsEditorDirty(true);
    }, 500); // 500ms debounce
    
    // Limpiar el temporizador cuando el componente se desmonte o cuando se llame de nuevo
    return () => clearTimeout(timer);
  }, []);

  const resetEditor = useCallback(() => {
    setIsEditorDirty(false);
  }, []);

  const clearEditor = useCallback(() => {
    setParrafo('');
    setPendingContent('');
    setIsEditorDirty(false);
  }, []);

  // Usar useMemo para memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    parrafo, 
    pendingContent,
    addParagraph, 
    isEditorDirty, 
    resetEditor,
    clearEditor
  }), [parrafo, pendingContent, isEditorDirty, addParagraph, resetEditor, clearEditor]);

  return (
    <EditorGlobalContext.Provider value={contextValue}>
      {children}
    </EditorGlobalContext.Provider>
  );
};

export const UseEditorGlobalContext = () => {
  const context = useContext(EditorGlobalContext);
  if (!context) {
    console.warn('UseEditorGlobalContext debe ser usado dentro de EditorTextContextProvider');
    return {
      parrafo: '',
      pendingContent: '',
      addParagraph: () => {},
      isEditorDirty: false,
      resetEditor: () => {},
      clearEditor: () => {}
    };
  }
  return context;
};
