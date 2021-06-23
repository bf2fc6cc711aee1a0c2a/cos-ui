import { getPaginatedApiMachineEventsHandlers } from './../shared/PaginatedResponseMachine';
import { Configuration, DefaultApi, KafkaRequest } from '@cos-ui/api';
import { useSelector } from '@xstate/react';
import axios from 'axios';
import { useCallback } from 'react';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  send,
} from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';
import {
  ApiCallback,
  makePaginatedApiMachine,
  PaginatedApiActorType,
  PaginatedApiRequest,
  PaginatedApiResponse,
  getPaginatedApiMachineEvents,
  usePagination,
} from '../shared';

const PAGINATED_MACHINE_ID = 'paginatedApi';

type KafkasQuery = {
  name?: string;
  statuses?: string[];
  cloudProvider?: string[];
};

const fetchKafkaInstances = (
  accessToken?: Promise<string>,
  basePath?: string
): ApiCallback<KafkaRequest, KafkasQuery> => {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, query } = request;
    const { name, statuses } = query || {};
    const nameSearch =
      name && name.length > 0 ? ` name LIKE ${name}` : undefined;
    const statusSearch =
      statuses && statuses.length > 0
        ? statuses.map(s => `status = ${s}`).join(' OR ')
        : undefined;
    const search = [nameSearch, statusSearch].filter(Boolean).join(' AND ');
    apisService
      .getKafkas(
        `${page}`,
        `${size}`,
        undefined,
        search as string | undefined,
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
  response?: PaginatedApiResponse<KafkaRequest>;
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
      ...getPaginatedApiMachineEvents<
        KafkaRequest,
        KafkasQuery,
        KafkaRequest
      >(),
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
            initial: 'idle',
            invoke: {
              id: PAGINATED_MACHINE_ID,
              src: context =>
                makePaginatedApiMachine<
                  KafkaRequest,
                  KafkasQuery,
                  KafkaRequest
                >(
                  fetchKafkaInstances(context.authToken, context.basePath),
                  i => i
                ),
            },
            states: {
              idle: {
                entry: send('query', { to: PAGINATED_MACHINE_ID }),
                on: {
                  ready: 'ready',
                },
              },
              ready: {},
            },
            on: {
              ...getPaginatedApiMachineEventsHandlers(PAGINATED_MACHINE_ID),
              success: { actions: 'success' },
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
      success: assign((_context, event) => {
        if (event.type !== 'success') return {};
        const { type, ...response } = event;
        return {
          response,
        };
      }),
      selectInstance: assign({
        selectedInstance: (context, event) => {
          if (event.type === 'selectInstance') {
            return context.response?.items?.find(
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
  const api = usePagination<KafkaRequest, KafkasQuery, KafkaRequest>(
    actor.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType<
      KafkaRequest,
      KafkasQuery,
      KafkaRequest
    >
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
  const onSelect = useCallback(
    (selectedInstance: string) => {
      actor.send({ type: 'selectInstance', selectedInstance });
    },
    [actor]
  );
  const onQuery = useCallback(
    (request: PaginatedApiRequest<KafkasQuery>) => {
      actor.send({ type: 'query', ...request });
    },
    [actor]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    onQuery,
  };
};
