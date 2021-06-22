import React, {
  createContext,
  FunctionComponent,
  useContext,
  useCallback,
} from 'react';
import { useSelector, useInterpret } from '@xstate/react';
import {
  ConnectorsMachineInterpretType,
  connectorsMachine,
} from './ConnectorsMachine';

const ConnectorsMachineServiceContext = createContext<ConnectorsMachineInterpretType | null>(
  null
);
type ConnectorsMachineProviderPropsType = {
  accessToken?: Promise<string>;
  basePath?: string;
};

export const ConnectorsMachineProvider: FunctionComponent<ConnectorsMachineProviderPropsType> = ({
  children,
  accessToken,
  basePath,
}) => {
  const service = useInterpret(connectorsMachine, {
    context: { accessToken, basePath },
    devTools: true,
  });
  return (
    <ConnectorsMachineServiceContext.Provider value={service}>
      {children}
    </ConnectorsMachineServiceContext.Provider>
  );
};

export const useConnectorsMachineService = () => {
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
