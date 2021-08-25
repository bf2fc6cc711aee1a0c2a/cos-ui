import { useCallback } from 'react';

import { useSelector } from '@xstate/react';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  send,
} from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import {
  getPaginatedApiMachineEvents,
  getPaginatedApiMachineEventsHandlers,
  makePaginatedApiMachine,
  PaginatedApiActorType,
  PaginatedApiRequest,
  PaginatedApiResponse,
  usePagination,
} from './PaginatedResponse.machine';
import { KafkasQuery, fetchKafkaInstances } from './api';
import { PAGINATED_MACHINE_ID } from './constants';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  response?: PaginatedApiResponse<KafkaRequest>;
  selectedInstance?: KafkaRequest;
  error?: Object;
};

const kafkasMachineSchema = {
  context: createSchema<Context>(),
};

const kafkasMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
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
              src: (context) =>
                makePaginatedApiMachine<
                  KafkaRequest,
                  KafkasQuery,
                  KafkaRequest
                >(fetchKafkaInstances(context), (i) => i),
            },
            states: {
              idle: {
                entry: send('api.query', { to: PAGINATED_MACHINE_ID }),
                on: {
                  'api.ready': 'ready',
                },
              },
              ready: {},
            },
            on: {
              ...getPaginatedApiMachineEventsHandlers(PAGINATED_MACHINE_ID),
              'api.success': { actions: 'success' },
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
        if (event.type !== 'api.success') return {};
        const { type, ...response } = event;
        return {
          response,
        };
      }),
      selectInstance: assign({
        selectedInstance: (context, event) => {
          if (event.type === 'selectInstance') {
            return context.response?.items?.find(
              (i) => i.id === event.selectedInstance
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
      instanceSelected: (context) => context.selectedInstance !== undefined,
      noInstanceSelected: (context) => context.selectedInstance === undefined,
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
      actor.send({ type: 'api.query', ...request });
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
