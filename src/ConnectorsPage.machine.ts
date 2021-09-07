import { InterpreterFrom, send, spawn } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@rhoas/connector-management-sdk';

import {
  ConnectorMachineActorRef,
  makeConnectorMachine,
} from './Connector.machine';
import {
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
} from './PaginatedResponse.machine';
import { fetchConnectors } from './api';
import { PAGINATED_MACHINE_ID } from './constants';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  selectedConnector?: Connector;
  onError?: (error: string) => void;
};

const model = createModel(
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
      selectConnector: (payload: { connector: Connector }) => payload,
      deselectConnector: () => ({}),
    },
    actions: {
      notifyError: () => ({}),
    },
  }
);

const setSelectedConnector = model.assign(
  (_context, event) => ({
    selectedConnector: event.connector,
  }),
  'selectConnector'
);
const unsetSelectedConnector = model.assign(
  (_context) => ({
    selectedConnector: undefined,
  }),
  'deselectConnector'
);

export const connectorsPageMachine = model.createMachine(
  {
    id: 'connectors',
    initial: 'root',
    context: model.initialContext,
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
              'api.refresh': {
                actions: send((_, e) => e, { to: PAGINATED_MACHINE_ID }),
              },
              'api.nextPage': {
                actions: send((_, e) => e, { to: PAGINATED_MACHINE_ID }),
              },
              'api.prevPage': {
                actions: send((_, e) => e, { to: PAGINATED_MACHINE_ID }),
              },
              'api.query': {
                actions: send((_, e) => e, { to: PAGINATED_MACHINE_ID }),
              },
              'api.error': {
                actions: 'notifyError',
              },
              selectConnector: {
                actions: setSelectedConnector,
              },
              deselectConnector: {
                actions: unsetSelectedConnector,
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
