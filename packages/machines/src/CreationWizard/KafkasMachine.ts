import { useSelector } from '@xstate/react';
import axios from 'axios';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  send,
} from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import { useCallback } from 'react';
import { Configuration, DefaultApi, KafkaRequest } from '@cos-ui/api';
import {
  paginatedApiMachineEvents,
  makePaginatedApiMachine,
  ApiCallback,
  PaginatedApiRequest,
  PaginatedApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  usePagination,
  PaginatedApiActorType,
} from '../shared/PaginatedResponseMachine';

const PAGINATED_MACHINE_ID = 'paginatedApi';

const fetchKafkaInstances = (
  accessToken?: Promise<string>,
  basePath?: string
): ApiCallback<KafkaRequest> => {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, name = '' } = request as PaginatedApiRequest & {
      name?: string;
    };
    const query = name.length > 0 ? `name LIKE ${name}` : undefined;
    apisService
      .listKafkas(
        `${page}`,
        `${size}`,
        undefined,
        query as string | undefined,
        {
          cancelToken: source.token,
        }
      )
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
  instances?: PaginatedApiResponse<KafkaRequest>;
  selectedInstance?: KafkaRequest;
  error?: Object;
};

const kafkasMachineSchema = {
  context: createSchema<Context>(),
};

const kafkasMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    instances: undefined,
    selectedInstance: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectInstance: (payload: { selectedInstance: string }) => ({
        ...payload,
      }),
      deselectInstance: () => ({}),
      confirm: () => ({}),
      loading: (payload: PaginatedApiRequest) => payload,
      success: (payload: ApiSuccessResponse<KafkaRequest>) => payload,
      error: (payload: ApiErrorResponse) => payload,
      ...paginatedApiMachineEvents,
    },
  }
);

export const kafkasMachine = createMachine<typeof kafkasMachineModel>(
  {
    schema: kafkasMachineSchema,
    id: 'kafkas',
    initial: 'root',
    context: kafkasMachineModel.initialContext,
    states: {
      root: {
        type: 'parallel',
        states: {
          api: {
            initial: 'deferred',
            invoke: {
              id: PAGINATED_MACHINE_ID,
              src: context =>
                makePaginatedApiMachine<KafkaRequest>(
                  fetchKafkaInstances(context.authToken, context.basePath)
                ),
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
          selection: {
            id: 'selection',
            initial: 'verify',
            states: {
              verify: {
                always: [
                  { target: 'selecting', cond: 'noInstanceSelected' },
                  { target: 'valid', cond: 'instanceSelected' },
                ],
              },
              selecting: {
                entry: sendParent('isInvalid'),
                on: {
                  selectInstance: {
                    target: 'valid',
                    actions: 'selectInstance',
                  },
                },
              },
              valid: {
                entry: sendParent('isValid'),
                on: {
                  selectInstance: {
                    target: 'verify',
                    actions: 'selectInstance',
                    cond: (_, event) => event.selectedInstance !== undefined,
                  },
                  deselectInstance: {
                    target: 'verify',
                    actions: 'reset',
                  },
                  confirm: {
                    target: '#done',
                    cond: 'instanceSelected',
                  },
                },
              },
            },
          },
        },
      },
      done: {
        id: 'done',
        type: 'final',
        data: {
          selectedInstance: (context: Context) => context.selectedInstance,
        },
      },
    },
  },
  {
    actions: {
      selectInstance: assign({
        selectedInstance: (context, event) => {
          if (event.type === 'selectInstance') {
            return context.instances?.items?.find(
              i => i.id === event.selectedInstance
            );
          }
          return context.selectedInstance;
        },
      }),
      reset: assign({
        selectedInstance: (context, event) =>
          event.type === 'deselectInstance'
            ? undefined
            : context.selectedInstance,
      }),
    },
    guards: {
      instanceSelected: context => context.selectedInstance !== undefined,
      noInstanceSelected: context => context.selectedInstance === undefined,
    },
  }
);

export type KafkaMachineActorRef = ActorRefFrom<typeof kafkasMachine>;

export const useKafkasMachineIsReady = (actor: KafkaMachineActorRef) => {
  return useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => {
        return state.matches({ root: { api: 'ready' } });
      },
      [actor]
    )
  );
};

export const useKafkasMachine = (actor: KafkaMachineActorRef) => {
  const api = usePagination<KafkaRequest>(
    actor.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType
  );
  const { selectedId } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        selectedId: state.context.selectedInstance?.id,
      }),
      [actor]
    )
  );
  return {
    ...api,
    selectedId,
  };
};
