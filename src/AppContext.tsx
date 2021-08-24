import React, { createContext, FunctionComponent, useContext } from 'react';

type AppContextType = {
  getToken: () => Promise<string>;
  basePath: string;
};
const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider: FunctionComponent<AppContextType> = ({
  getToken,
  basePath,
  children,
}) => (
  <AppContext.Provider value={{ getToken, basePath }}>
    {children}
  </AppContext.Provider>
);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error('useAppContext must be used inside an AppContextProvider');

  return {
    ...context,
  };
};
