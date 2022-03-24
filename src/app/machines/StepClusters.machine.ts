import { fetchClusters } from '@apis/api';
import { PAGINATED_MACHINE_ID } from '@constants/constants';

import { ActorRefFrom, send, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorCluster } from '@rhoas/connector-management-sdk';

import {
  ApiSuccessResponse,
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
} from './PaginatedResponse.machine';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  response?: ApiSuccessResponse<ConnectorCluster>;
  selectedCluster?: ConnectorCluster;
  error?: Object;
  duplicateMode?: boolean;
};

const model = createModel(
  {
    accessToken: () => Promise.resolve(''),
    connectorsApiBasePath: '',
    clusters: undefined,
    selectedCluster: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectCluster: (payload: { selectedCluster: string }) => ({
        ...payload,
      }),
      deselectCluster: () => ({}),
      confirm: () => ({}),
      ...getPaginatedApiMachineEvents<ConnectorCluster, {}, ConnectorCluster>(),
    },
  }
);

const success = model.assign((_context, event) => {
  const { type, ...response } = event;
  return {
    response,
  };
}, 'api.success');
const selectCluster = model.assign(
  {
    selectedCluster: (context, event) => {
      return context.response?.items?.find(
        (i) => i.id === event.selectedCluster
      );
    },
  },
  'selectCluster'
);
const reset = model.assign(
  {
    selectedCluster: undefined,
  },
  'deselectCluster'
);

export const clustersMachine = model.createMachine(
  {
    id: 'clusters',
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
                makePaginatedApiMachine<ConnectorCluster, {}, ConnectorCluster>(
                  fetchClusters(context),
                  (i) => i
                ),
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
                  { target: 'selecting', cond: 'noClusterSelected' },
                  { target: 'valid', cond: 'clusterSelected' },
                ],
              },
              selecting: {
                entry: sendParent('isInvalid'),
                on: {
                  selectCluster: {
                    target: 'valid',
                    actions: selectCluster,
                  },
                },
              },
              valid: {
                entry: sendParent('isValid'),
                on: {
                  selectCluster: {
                    target: 'verify',
                    actions: selectCluster,
                    cond: (_, event) => event.selectedCluster !== undefined,
                  },
                  deselectCluster: {
                    target: 'verify',
                    actions: reset,
                  },
                  confirm: {
                    target: '#done',
                    cond: 'clusterSelected',
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
          selectedCluster: (context: Context) => context.selectedCluster,
          duplicateMode: (context: Context) => context.duplicateMode,
        },
      },
    },
  },
  {
    guards: {
      clusterSelected: (context) => context.selectedCluster !== undefined,
      noClusterSelected: (context) => context.selectedCluster === undefined,
    },
  }
);

export type ClustersMachineActorRef = ActorRefFrom<typeof clustersMachine>;
