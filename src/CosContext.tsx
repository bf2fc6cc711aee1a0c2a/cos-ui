import React, { createContext, FunctionComponent, useContext } from 'react';

type AppContextType = {
  /**
   * Gets the JWT needed by all the API calls. The token comes from Keycloak
   * when running the app in development mode. In production, it will come from
   * the `@rhoas/app-services-ui-shared` package.
   */
  getToken: () => Promise<string>;
  /**
   * The base path that gets prepended to all API urls.
   * Eg. A `basePath` of `http://my.api.com/something` for an API `/my-api` will
   * generate an URL like `http://my.api.com/something/my-api`
   */
  basePath: string;
};
const CosContext = createContext<AppContextType | null>(null);

export const CosContextProvider: FunctionComponent<AppContextType> = ({
  getToken,
  basePath,
  children,
}) => (
  <CosContext.Provider value={{ getToken, basePath }}>
    {children}
  </CosContext.Provider>
);

export const useCos = () => {
  const context = useContext(CosContext);
  if (!context)
    throw new Error('useAppContext must be used inside an AppContextProvider');

  return {
    ...context,
  };
};
