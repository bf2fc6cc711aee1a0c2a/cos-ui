import { fetchConnectorNamespaces } from '@apis/api';
import { PAGINATED_MACHINE_ID } from '@constants/constants';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ActorRefFrom, send, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';


import {
  ApiSuccessResponse,
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
} from './PaginatedResponse.machine';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  response?: ApiSuccessResponse<ConnectorNamespace>;
  selectedNamespace?: ConnectorNamespace;
  error?: Object;
};

const model = createModel(
  {
    accessToken: () => Promise.resolve(''),
    connectorsApiBasePath: '',
    clusters: undefined,
    selectedNamespace: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectNamespace: (payload: { selectedNamespace: string }) => ({
        ...payload,
      }),
      deselectCluster: () => ({}),
      confirm: () => ({}),
      ...getPaginatedApiMachineEvents<
        ConnectorNamespace,
        {},
        ConnectorNamespace
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
const selectNamespace = model.assign(
  {
    selectedNamespace: (context, event) => {
      return context.response?.items?.find(
        (i) => i.id === event.selectedNamespace
      );
    },
  },
  'selectNamespace'
);
const reset = model.assign(
  {
    selectedNamespace: undefined,
  },
  'deselectCluster'
);

export const namespacesMachine = model.createMachine(
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
                makePaginatedApiMachine<
                  ConnectorNamespace,
                  {},
                  ConnectorNamespace
                >(fetchConnectorNamespaces(context), (i) => i),
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
                  selectNamespace: {
                    target: 'valid',
                    actions: selectNamespace,
                  },
                },
              },
              valid: {
                entry: sendParent('isValid'),
                on: {
                  selectNamespace: {
                    target: 'verify',
                    actions: selectNamespace,
                    cond: (_, event) => event.selectedNamespace !== undefined,
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
          selectedNamespace: (context: Context) => context.selectedNamespace,
        },
      },
    },
  },
  {
    guards: {
      clusterSelected: (context) => context.selectedNamespace !== undefined,
      noClusterSelected: (context) => context.selectedNamespace === undefined,
    },
  }
);

export type NamespaceMachineActorRef = ActorRefFrom<typeof namespacesMachine>;
