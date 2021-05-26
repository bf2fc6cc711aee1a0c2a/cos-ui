import { Configuration, Connector, ConnectorsApi } from '@cos-ui/api';
import axios from 'axios';
import { createMachine, createSchema, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
  ApiCallback,
  ApiErrorResponse,
  ApiSuccessResponse,
  makePaginatedApiMachine,
  paginatedApiMachineEvents,
  PaginatedApiRequest,
  PaginatedApiResponse,
} from '../shared/PaginatedResponseMachine';

export const PAGINATED_MACHINE_ID = 'paginatedApi';

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
          initial: 'deferred',
          invoke: {
            id: PAGINATED_MACHINE_ID,
            src: context =>
              makePaginatedApiMachine<Connector>(
                fetchConnectors(context.authToken, context.basePath)
              ).withContext({
                request: context.request,
              }),
            autoForward: true,
          },
          states: {
            deferred: {
              entry: send('refresh', { to: PAGINATED_MACHINE_ID }),
              on: {
                loading: { target: 'ready' },
              },
            },
            ready: {},
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
