import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';

import { Connector } from '@rhoas/connector-management-sdk';

import { ConnectorMachineActorRef } from './Connector.machine';
import {
  connectorsPageMachine,
  ConnectorsMachineInterpretType,
} from './ConnectorsPage.machine';
import {
  usePaginationReturnValue,
  usePagination,
  PaginatedApiActorType,
  PaginatedApiRequest,
} from './PaginatedResponse.machine';
import { PAGINATED_MACHINE_ID } from './constants';

const ConnectorsPageContext =
  createContext<ConnectorsMachineInterpretType | null>(null);
type ConnectorsPageProviderPropsType = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  onError: (error: string) => void;
};

export const ConnectorsPageProvider: FunctionComponent<ConnectorsPageProviderPropsType> =
  ({ children, accessToken, connectorsApiBasePath, onError }) => {
    const service = useInterpret(connectorsPageMachine, {
      context: { accessToken, connectorsApiBasePath, onError },
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

type useConnectorsMachineReturnType = usePaginationReturnValue<
  {},
  ConnectorMachineActorRef
> & {
  selectedConnector: Connector | undefined;
  deselectConnector: () => void;
  query: (props: PaginatedApiRequest<{}>) => void;
};

export const useConnectorsMachine = (): useConnectorsMachineReturnType => {
  const service = useConnectorsPageMachineService();

  const apiData = usePagination<Connector, {}, ConnectorMachineActorRef>(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      Connector,
      {},
      ConnectorMachineActorRef
    >
  );
  const { selectedConnector } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        selectedConnector: state.context.selectedConnector,
      }),
      [service]
    )
  );

  const deselectConnector = useCallback(() => {
    service.send({ type: 'deselectConnector' });
  }, [service]);

  const query = useCallback(
    (props: PaginatedApiRequest<{}>) => {
      service.send({ type: 'api.query', ...props });
    },
    [service]
  );

  return {
    ...apiData,
    selectedConnector,
    deselectConnector,
    query,
  };
};
