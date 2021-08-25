import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';

import {
  connectorsPageMachine,
  ConnectorsMachineInterpretType,
} from './ConnectorsPage.machine';

const ConnectorsPageContext =
  createContext<ConnectorsMachineInterpretType | null>(null);
type ConnectorsPageProviderPropsType = {
  accessToken: () => Promise<string>;
  basePath: string;
  onError: (error: string) => void;
};

export const ConnectorsPageProvider: FunctionComponent<ConnectorsPageProviderPropsType> =
  ({ children, accessToken, basePath, onError }) => {
    const service = useInterpret(connectorsPageMachine, {
      context: { accessToken, basePath, onError },
      devTools: true,
    });
    return (
      <ConnectorsPageContext.Provider value={service}>
        {children}
      </ConnectorsPageContext.Provider>
    );
  };

export const useConnectorsPageMachineService =
  (): ConnectorsMachineInterpretType => {
    const service = useContext(ConnectorsPageContext);
    if (!service) {
      throw new Error(
        `useConnectorsMachineService() must be used in a child of <ConnectorsMachineProvider>`
      );
    }
    return service;
  };

export const useConnectorsPageIsReady = () => {
  const service = useConnectorsPageMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) => {
        return state.matches({ root: { api: 'ready' } });
      },
      [service]
    )
  );
};
