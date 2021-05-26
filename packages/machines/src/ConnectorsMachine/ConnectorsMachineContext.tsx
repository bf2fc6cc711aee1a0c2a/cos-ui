import React, {
  createContext,
  FunctionComponent,
  useContext,
  useCallback,
} from 'react';
import { useSelector, useInterpret } from '@xstate/react';
import { Connector } from '@cos-ui/api';
import {
  ConnectorsMachineInterpretType,
  connectorsMachine,
  PAGINATED_MACHINE_ID,
} from './ConnectorsMachine';
import { PaginatedApiActorType, usePagination } from '../shared';

const ConnectorsMachineServiceContext = createContext<ConnectorsMachineInterpretType | null>(
  null
);
type ConnectorsMachineProviderPropsType = {
  authToken?: Promise<string>;
  basePath?: string;
};

export const ConnectorsMachineProvider: FunctionComponent<ConnectorsMachineProviderPropsType> = ({
  children,
  authToken,
  basePath,
}) => {
  const service = useInterpret(connectorsMachine, {
    context: { authToken, basePath },
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

export const useConnectorsMachine = (
  service: ConnectorsMachineInterpretType
) => {
  return usePagination<Connector, {}>(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType
  );
};
