import {
  createMachine,
  createSchema,
  InterpreterFrom,
  send,
  spawn,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@cos-ui/api';

import {
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PaginatedApiActorType,
  PaginatedApiResponse,
  usePagination,
} from '../shared';
import { getPaginatedApiMachineEventsHandlers } from '../shared/PaginatedResponseMachine';
import { fetchConnectors } from './actors';
import {
  ConnectorMachineActorRef,
  makeConnectorMachine,
} from './ConnectorMachine';

export const PAGINATED_MACHINE_ID = 'paginatedApi';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  response?: PaginatedApiResponse<ConnectorMachineActorRef>;
  error?: Object;
};

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
    selectedInstance: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      ...getPaginatedApiMachineEvents<
        Connector,
        {},
        ConnectorMachineActorRef
      >(),
      'connector.action-success': () => ({}),
      'connector.action-failure': () => ({}),
    },
  }
);

export const connectorsMachine = createMachine<typeof connectorsMachineModel>({
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
              makePaginatedApiMachine<Connector, {}, ConnectorMachineActorRef>(
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
                true
              ),
          },
          states: {
            idle: {
              on: {
                ready: 'ready',
              },
            },
            ready: {
              entry: send('query', { to: PAGINATED_MACHINE_ID }),
            },
          },
          on: {
            ...getPaginatedApiMachineEventsHandlers(PAGINATED_MACHINE_ID),
            'connector.action-success': {
              actions: send('query', { to: PAGINATED_MACHINE_ID }),
            },
            'connector.action-failure': {
              actions: send('query', { to: PAGINATED_MACHINE_ID }),
            },
          },
        },
        listing: {},
      },
    },
  },
});

export type ConnectorsMachineInterpretType = InterpreterFrom<
  typeof connectorsMachine
>;

export const useConnectorsMachine = (
  service: ConnectorsMachineInterpretType
) => {
  return usePagination<Connector, {}, ConnectorMachineActorRef>(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      Connector,
      {},
      ConnectorMachineActorRef
    >
  );
};
