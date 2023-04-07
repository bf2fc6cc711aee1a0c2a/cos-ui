import React, { createContext, FunctionComponent, useContext } from 'react';

export type RemoteConfigurator = {
  remoteEntry: string;
  scope: string;
  module: string;
};

export type AppContextType = {
  /**
   * Gets the JWT needed by all the API calls. The token comes from Keycloak
   * when running the app in development mode. In production, it will come from
   * insights chrome.
   */
  getToken: () => Promise<string>;
  /**
   * The base path that gets prepended to all API urls for connector management
   * Eg. A `connectorsApiBasePath` of `http://my.api.com/something` for an API `/my-api` will
   * generate an URL like `http://my.api.com/something/my-api`
   */
  connectorsApiBasePath: string;
  /**
   * The base path that gets prepended to all API urls for kafka management
   */
  kafkaManagementApiBasePath: string;
  /**
   * Remote federated configuration modules can be added to this dictionary
   */
  configurators?: Record<string, RemoteConfigurator>;
};
const CosContext = createContext<AppContextType | null>(null);

export const CosContextProvider: FunctionComponent<AppContextType> = ({
  getToken,
  connectorsApiBasePath,
  kafkaManagementApiBasePath,
  configurators,
  children,
}) => (
  <CosContext.Provider
    value={{
      getToken,
      connectorsApiBasePath,
      kafkaManagementApiBasePath,
      configurators,
    }}
  >
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
