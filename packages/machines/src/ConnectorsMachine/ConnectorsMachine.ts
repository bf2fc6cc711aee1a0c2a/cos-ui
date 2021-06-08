import axios from 'axios';
import { createMachine, createSchema, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { Configuration, Connector, ConnectorsApi } from '@cos-ui/api';

import {
  ApiCallback,
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PaginatedApiResponse,
} from '../shared';

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
  authToken?: Promise<string>;
  basePath?: string;
  response?: PaginatedApiResponse<Connector>;
  error?: Object;
};

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    selectedInstance: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      ...getPaginatedApiMachineEvents<Connector, {}>(),
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
              makePaginatedApiMachine<Connector, {}>(
                fetchConnectors(context.authToken, context.basePath)
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
    },
  },
});

export type ConnectorsMachineInterpretType = InterpreterFrom<
  typeof connectorsMachine
>;
