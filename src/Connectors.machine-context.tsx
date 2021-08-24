import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';

import {
  connectorsMachine,
  ConnectorsMachineInterpretType,
} from './Connectors.machine';

const ConnectorsMachineServiceContext =
  createContext<ConnectorsMachineInterpretType | null>(null);
type ConnectorsMachineProviderPropsType = {
  accessToken: () => Promise<string>;
  basePath: string;
  onError: (error: string) => void;
};

export const ConnectorsMachineProvider: FunctionComponent<ConnectorsMachineProviderPropsType> =
  ({ children, accessToken, basePath, onError }) => {
    const service = useInterpret(connectorsMachine, {
      context: { accessToken, basePath, onError },
      devTools: true,
    });
    return (
      <ConnectorsMachineServiceContext.Provider value={service}>
        {children}
      </ConnectorsMachineServiceContext.Provider>
    );
  };

export const useConnectorsMachineService =
  (): ConnectorsMachineInterpretType => {
    const service = useContext(ConnectorsMachineServiceContext);
    if (!service) {
      throw new Error(
        `useConnectorsMachineService() must be used in a child of <ConnectorsMachineProvider>`
      );
    }
    return service;
  };

export const useConnectorsMachineIsReady = (
  service: ConnectorsMachineInterpretType
) => {
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
