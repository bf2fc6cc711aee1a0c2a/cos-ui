import { KafkasSearch, fetchKafkaInstances } from '@apis/api';
import { PAGINATED_MACHINE_ID } from '@constants/constants';

import { ActorRefFrom, send } from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import {
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PaginatedApiResponse,
  PlaceholderOrderBy,
} from './PaginatedResponse.machine';

type Context = {
  accessToken: () => Promise<string>;
  kafkaManagementBasePath: string;
  response?: PaginatedApiResponse<KafkaRequest>;
  selectedInstance?: KafkaRequest;
  error?: Object;
  connectorData?: Connector;
  duplicateMode?: boolean | undefined;
};

const model = createModel(
  {
    accessToken: () => Promise.resolve(''),
    kafkaManagementBasePath: '',
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
        PlaceholderOrderBy,
        KafkasSearch,
        KafkaRequest
      >(),
    },
  }
);

const success = model.assign((_context, event) => {
  const { type, ...response } = event;
  return {
    response,
  };
}, 'api.success');
const selectInstance = model.assign(
  {
    selectedInstance: (context, event) => {
      return context.response?.items?.find(
        (i) => i.id === event.selectedInstance
      );
    },
  },
  'selectInstance'
);
const deselectInstance = model.assign(
  {
    selectedInstance: undefined,
  },
  'deselectInstance'
);

export const kafkasMachine = model.createMachine(
  {
    id: 'kafkas',
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
                  KafkaRequest,
                  PlaceholderOrderBy,
                  KafkasSearch,
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
              'api.success': { actions: success },
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
                    actions: selectInstance,
                  },
                },
              },
              valid: {
                entry: sendParent('isValid'),
                on: {
                  selectInstance: {
                    target: 'verify',
                    actions: selectInstance,
                    cond: (_, event) => event.selectedInstance !== undefined,
                  },
                  deselectInstance: {
                    target: 'verify',
                    actions: deselectInstance,
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
          duplicateMode: (context: Context) => context.duplicateMode,
        },
      },
    },
  },
  {
    guards: {
      instanceSelected: (context) => context.selectedInstance !== undefined,
      noInstanceSelected: (context) => context.selectedInstance === undefined,
    },
  }
);

export type KafkaMachineActorRef = ActorRefFrom<typeof kafkasMachine>;
