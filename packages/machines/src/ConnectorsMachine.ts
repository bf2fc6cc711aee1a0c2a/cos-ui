import axios from 'axios';
import { assign, createMachine, createSchema, send } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { Configuration, ConnectorsApi, Connector } from '@cos-ui/api';
import {
  paginatedApiMachineEvents,
  makePaginatedApiMachine,
  ApiCallback,
  PaginatedApiRequest,
  PaginatedApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from './PaginatedResponseMachine';

const fetchConnectors = (
  accessToken?: Promise<string>,
  basePath?: string
): ApiCallback<Connector> => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size /*, name = '' */ } = request as PaginatedApiRequest & {
      name?: string;
    };
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
  request: PaginatedApiRequest;
  connectors?: PaginatedApiResponse<Connector>;
  error?: Object;
};

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    connectors: undefined,
    selectedInstance: undefined,
    error: undefined,
    request: {
      page: 1,
      size: 10,
    },
  } as Context,
  {
    events: {
      loading: (payload: PaginatedApiRequest) => payload,
      success: (payload: ApiSuccessResponse<Connector>) => payload,
      error: (payload: ApiErrorResponse) => payload,
      ...paginatedApiMachineEvents,
    },
  }
);

type MakeConnectorsMachineProps = {
  authToken?: Promise<string>;
  basePath?: string;
};
export const makeConnectorsMachine = ({
  basePath,
  authToken,
}: MakeConnectorsMachineProps) => {
  return createMachine<typeof connectorsMachineModel>(
    {
      schema: connectorsMachineSchema,
      id: 'connectors',
      initial: 'running',
      context: {
        ...connectorsMachineModel.initialContext,
        basePath,
        authToken,
      },
      states: {
        running: {
          type: 'parallel',
          states: {
            api: {
              initial: 'idle',
              entry: send('refresh', { to: 'paginatedApi' }),
              invoke: {
                id: 'paginatedApi',
                src: context =>
                  makePaginatedApiMachine<Connector>(
                    fetchConnectors(context.authToken, context.basePath)
                  ).withContext({
                    request: context.request,
                  }),
                autoForward: true,
              },
              states: {
                idle: {
                  on: {
                    loading: { target: 'loading', actions: 'loading' },
                  },
                },
                loading: {
                  on: {
                    loading: { actions: 'loading' },
                    success: { target: 'idle', actions: 'success' },
                    error: { target: 'idle', actions: 'error' },
                  },
                  tags: 'loading',
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
        loading: assign((_context, event) => {
          if (event.type !== 'loading') return {};
          const { type, ...payload } = event;
          return {
            request: payload,
          };
        }),
        success: assign((_context, event) => {
          if (event.type !== 'success') return {};
          const { type, ...connectors } = event;
          return {
            connectors,
          };
        }),
        error: assign((_context, event) => {
          if (event.type !== 'error') return {};
          const { error } = event;
          return {
            error,
          };
        }),
      },
      guards: {},
    }
  );
};
