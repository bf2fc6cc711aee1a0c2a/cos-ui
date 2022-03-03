import React, { createContext, FunctionComponent, useContext } from 'react';

type ConnectorsPageProviderPropsType = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  onError: (error: string) => void;
};
type ConnectorDetailsPageContextType = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  onError: (error: string) => void;
};

const ConnectorDetailsPageContext =
  createContext<ConnectorDetailsPageContextType | null>(null);

export const ConnectorDetailsPageProvider: FunctionComponent<ConnectorsPageProviderPropsType> =
  ({ children, accessToken, connectorsApiBasePath, onError }) => {
    return (
      <ConnectorDetailsPageContext.Provider
        value={{ accessToken, connectorsApiBasePath, onError }}
      >
        {children}
      </ConnectorDetailsPageContext.Provider>
    );
  };

export const useConnectorDetailsPage = (): ConnectorDetailsPageContextType => {
  const service = useContext(ConnectorDetailsPageContext);
  if (!service) {
    throw new Error(
      `useConnectorDetailsPage() must be used in a child of <ConnectorsMachineProvider>`
    );
  }
  return service;
};
