import axios from 'axios';
import {
  createMachine,
  createSchema,
  InterpreterFrom,
  send,
  spawn,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
  ConnectorMachineActorRef,
  makeConnectorMachine,
} from './ConnectorMachine';

import { Configuration, Connector, ConnectorsApi } from '@cos-ui/api';

import {
  ApiCallback,
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PaginatedApiResponse,
  PaginatedApiActorType,
  usePagination,
} from '../shared';

export type ConnectorWithActorRef = Connector & {
  ref: ConnectorMachineActorRef;
};

export const PAGINATED_MACHINE_ID = 'paginatedApi';

const fetchConnectors = (
  accessToken?: Promise<string>,
  basePath?: string
): ApiCallback<Connector, {}> => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size /*, name = '' */ } = request;
    // const query = name.length > 0 ? `name LIKE ${name}` : undefined;
    apisService
      .listConnectors(`${page}`, `${size}`, undefined, {
        cancelToken: source.token,
      })
      .then(response => {
        onSuccess({
          items: response.data.items,
          total: response.data.total,
          page: response.data.page,
          size: response.data.size,
        });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          onError({ error: error.message, page: request.page });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

type Context = {
  accessToken?: Promise<string>;
  basePath?: string;
  response?: PaginatedApiResponse<ConnectorWithActorRef>;
  error?: Object;
};

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    accessToken: undefined,
    basePath: undefined,
    selectedInstance: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      ...getPaginatedApiMachineEvents<Connector, {}, ConnectorWithActorRef>(),
      connector_action_success: () => ({}),
      connector_action_error: () => ({}),
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
              makePaginatedApiMachine<Connector, {}, ConnectorWithActorRef>(
                fetchConnectors(context.accessToken, context.basePath),
                c => ({
                  ...c,
                  ref: spawn(
                    makeConnectorMachine({
                      accessToken: context.accessToken,
                      basePath: context.basePath,
                      connectorId: c.id!,
                      desiredState: c.desired_state!,
                    }),
                    `connector-${c.id}`
                  ),
                })
              ),
            autoForward: true,
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
        },
        listing: {},
      },
      on: {
        connector_action_success: {
          actions: send('query', {
            to: PAGINATED_MACHINE_ID,
          }),
        },
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
  return usePagination<Connector, {}, ConnectorWithActorRef>(
    service.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      Connector,
      {},
      ConnectorWithActorRef
    >
  );
};
