import { useCallback } from 'react';

import { useSelector } from '@xstate/react';
import {
  assign,
  createMachine,
  createSchema,
  InterpreterFrom,
  send,
  spawn,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@rhoas/connector-management-sdk';

import {
  ConnectorMachineActorRef,
  makeConnectorMachine,
} from './Connector.machine';
import {
  getPaginatedApiMachineEvents,
  getPaginatedApiMachineEventsHandlers,
  makePaginatedApiMachine,
  PaginatedApiActorType,
  usePagination,
  usePaginationReturnValue,
} from './PaginatedResponse.machine';
import { fetchConnectors } from './api';
import { PAGINATED_MACHINE_ID } from './constants';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  selectedConnector?: Connector;
  onError?: (error: string) => void;
};

const connectorsPageMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsPageMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
    selectedConnector: undefined,
  } as Context,
  {
    events: {
      ...getPaginatedApiMachineEvents<
        Connector,
        {},
        ConnectorMachineActorRef
      >(),
      actionSuccess: () => ({}),
      actionFailure: () => ({}),
      selectConnector: (payload: { connector: Connector }) => payload,
      deselectConnector: () => ({}),
    },
  }
);

export const connectorsPageMachine = createMachine<
  typeof connectorsPageMachineModel
>(
  {
    schema: connectorsPageMachineSchema,
    id: 'connectors',
    initial: 'root',
    context: connectorsPageMachineModel.initialContext,
    states: {
      root: {
        type: 'parallel',
        states: {
          api: {
            initial: 'idle',
            invoke: {
              id: PAGINATED_MACHINE_ID,
              src: (context) =>
                makePaginatedApiMachine<
                  Connector,
                  {},
                  ConnectorMachineActorRef
                >(
                  fetchConnectors(context),
                  (connector) =>
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
                    onBeforeSetResponse: (data) => {
                      if (data) {
                        data.forEach((d) => {
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
  typeof connectorsPageMachine
>;

type useConnectorsMachineReturnType = usePaginationReturnValue<
  {},
  ConnectorMachineActorRef
> & {
  selectedConnector: Connector | undefined;
  deselectConnector: () => void;
};
export const useConnectorsMachine = (
  service: ConnectorsMachineInterpretType
): useConnectorsMachineReturnType => {
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

  return {
    ...apiData,
    selectedConnector,
    deselectConnector,
  };
};
