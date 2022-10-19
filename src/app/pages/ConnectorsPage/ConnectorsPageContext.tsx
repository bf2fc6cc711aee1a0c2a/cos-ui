import { ConnectorsOrderBy, ConnectorsSearch } from '@apis/api';
import { ConnectorMachineActorRef } from '@app/machines/Connector.machine';
import {
  connectorsPageMachine,
  ConnectorsMachineInterpretType,
} from '@app/machines/ConnectorsPage.machine';
import {
  usePaginationReturnValue,
  usePagination,
  PaginatedApiActorType,
  PaginatedApiRequest,
} from '@app/machines/PaginatedResponse.machine';
import { PAGINATED_MACHINE_ID } from '@constants/constants';
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';

import { Loading } from '@rhoas/app-services-ui-components';
import { Connector } from '@rhoas/connector-management-sdk';

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
        <ConnectorsMachineInitializer>{children}</ConnectorsMachineInitializer>
      </ConnectorsPageContext.Provider>
    );
  };

const ConnectorsMachineInitializer: FunctionComponent = ({ children }) => {
  const isReady = useConnectorsPageIsReady();
  if (!isReady) {
    return <Loading />;
  }
  return <>{children}</>;
};

const useConnectorsPageMachineService = (): ConnectorsMachineInterpretType => {
  const service = useContext(ConnectorsPageContext);
  if (!service) {
    throw new Error(
      `useConnectorsMachineService() must be used in a child of <ConnectorsMachineProvider>`
    );
  }
  return service;
};

const useConnectorsPageIsReady = () => {
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
  ConnectorsOrderBy,
  ConnectorsSearch,
  ConnectorMachineActorRef
> & {
  selectedConnector: Connector | undefined;
  selectedConnectorRef: ConnectorMachineActorRef | undefined;
  deselectConnector: () => void;
  runQuery: (
    props: PaginatedApiRequest<ConnectorsOrderBy, ConnectorsSearch>
  ) => void;
};

export const useConnectorsMachine = (): useConnectorsMachineReturnType => {
  const service = useConnectorsPageMachineService();

  const apiData = usePagination<
    Connector,
    ConnectorsOrderBy,
    ConnectorsSearch,
    ConnectorMachineActorRef
  >(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      Connector,
      ConnectorsOrderBy,
      ConnectorsSearch,
      ConnectorMachineActorRef
    >
  );
  const { userSelectedConnector } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => {
        const userSelectedConnector = state.context.selectedConnector;
        return {
          userSelectedConnector,
        };
      },
      [service]
    )
  );

  const selectedConnectorRef =
    userSelectedConnector && apiData.response && apiData.response.items
      ? apiData.response.items.filter(
          (ref) => ref.id === `connector-${userSelectedConnector.id}`
        )[0]
      : undefined;
  const selectedConnector = selectedConnectorRef
    ? selectedConnectorRef?.getSnapshot()?.context.connector
    : undefined;

  const deselectConnector = useCallback(() => {
    service.send({ type: 'deselectConnector' });
  }, [service]);

  const runQuery = useCallback(
    (props: PaginatedApiRequest<ConnectorsOrderBy, ConnectorsSearch>) => {
      service.send({ type: 'api.query', ...props });
    },
    [service]
  );

  return {
    ...apiData,
    selectedConnector,
    selectedConnectorRef,
    deselectConnector,
    runQuery,
  };
};
