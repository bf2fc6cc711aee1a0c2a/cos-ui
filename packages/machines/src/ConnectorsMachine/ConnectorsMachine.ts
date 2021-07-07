import { useSelector } from '@xstate/react';
import { useCallback } from 'react';
import {
  createMachine,
  createSchema,
  InterpreterFrom,
  send,
  spawn,
  assign,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorResult } from '@cos-ui/graphql';

import {
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PaginatedApiActorType,
  usePagination,
  usePaginationReturnValue,
  getPaginatedApiMachineEventsHandlers,
} from '../shared';
import { fetchConnectors } from './actors';
import {
  ConnectorMachineActorRef,
  makeConnectorMachine,
} from './ConnectorMachine';

export const PAGINATED_MACHINE_ID = 'paginatedApi';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  selectedConnector?: ConnectorResult;
  onError?: (error: string) => void;
};

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
    selectedConnector: undefined,
  } as Context,
  {
    events: {
      ...getPaginatedApiMachineEvents<
        ConnectorResult,
        {},
        ConnectorMachineActorRef
      >(),
      actionSuccess: () => ({}),
      actionFailure: () => ({}),
      selectConnector: (payload: { connector: ConnectorResult }) => payload,
      deselectConnector: () => ({}),
    },
  }
);

export const connectorsMachine = createMachine<typeof connectorsMachineModel>(
  {
    schema: connectorsMachineSchema,
    id: 'connectors',
    initial: 'root',
    context: connectorsMachineModel.initialContext,
    states: {
      root: {
        type: 'parallel',
        states: {
          api: {
            initial: 'idle',
            invoke: {
              id: PAGINATED_MACHINE_ID,
              src: context =>
                makePaginatedApiMachine<
                  ConnectorResult,
                  {},
                  ConnectorMachineActorRef
                >(
                  fetchConnectors(context.accessToken, context.basePath),
                  connector =>
                    spawn(
                      makeConnectorMachine({
                        accessToken: context.accessToken,
                        basePath: context.basePath,
                        connector,
                      }),
                      `connector-${connector.id}`
                    ),
                  {
                    pollingEnabled: true,
                    onBeforeSetResponse: data => {
                      if (data) {
                        data.forEach(d => {
                          if (d && d.stop) {
                            d.stop();
                          }
                        });
                      }
                    },
                  }
                ),
            },
            states: {
              idle: {
                on: {
                  'api.ready': 'ready',
                },
              },
              ready: {
                entry: send('api.query', { to: PAGINATED_MACHINE_ID }),
              },
            },
            on: {
              ...getPaginatedApiMachineEventsHandlers(PAGINATED_MACHINE_ID),
              'api.error': {
                actions: 'notifyError',
              },
              actionSuccess: {
                actions: send('api.query', { to: PAGINATED_MACHINE_ID }),
              },
              actionFailure: {
                actions: send('api.query', { to: PAGINATED_MACHINE_ID }),
              },
              selectConnector: {
                actions: 'setSelectedConnector',
              },
              deselectConnector: {
                actions: 'unsetSelectedConnector',
              },
            },
          },
          listing: {},
        },
      },
    },
  },
  {
    actions: {
      setSelectedConnector: assign((_context, event) => {
        if (event.type !== 'selectConnector') return {};
        return {
          selectedConnector: event.connector,
        };
      }),
      unsetSelectedConnector: assign((_context, event) => {
        if (event.type !== 'deselectConnector') return {};
        return {
          selectedConnector: undefined,
        };
      }),
      notifyError: (context, event) => {
        console.log(context, event);
        if (event.type === 'api.error' && context.onError) {
          context.onError(event.error);
        }
      },
    },
  }
);

export type ConnectorsMachineInterpretType = InterpreterFrom<
  typeof connectorsMachine
>;

type useConnectorsMachineReturnType = usePaginationReturnValue<
  {},
  ConnectorMachineActorRef
> & {
  selectedConnector: ConnectorResult | undefined;
  deselectConnector: () => void;
};
export const useConnectorsMachine = (
  service: ConnectorsMachineInterpretType
): useConnectorsMachineReturnType => {
  const apiData = usePagination<ConnectorResult, {}, ConnectorMachineActorRef>(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      ConnectorResult,
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

  return {
    ...apiData,
    selectedConnector,
    deselectConnector,
  };
};
