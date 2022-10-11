import { fetchConnectorNamespaces } from '@apis/api';
import { PAGINATED_MACHINE_ID } from '@constants/constants';

import { ActorRefFrom, send, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import {
  ApiSuccessResponse,
  getPaginatedApiMachineEvents,
  makePaginatedApiMachine,
  PlaceholderOrderBy,
  PlaceholderSearch,
} from './PaginatedResponse.machine';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  response?: ApiSuccessResponse<ConnectorNamespace>;
  selectedNamespace?: ConnectorNamespace;
  error?: Object;
  duplicateMode?: boolean | undefined;
};

const model = createModel(
  {
    accessToken: () => Promise.resolve(''),
    connectorsApiBasePath: '',
    selectedNamespace: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectNamespace: (payload: { selectedNamespace: string }) => ({
        ...payload,
      }),
      deselectNamespace: () => ({}),
      confirm: () => ({}),
      ...getPaginatedApiMachineEvents<
        ConnectorNamespace,
        PlaceholderOrderBy,
        PlaceholderSearch,
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
const deselectNamespace = model.assign(
  {
    selectedNamespace: undefined,
  },
  'deselectNamespace'
);

export const selectNamespaceMachine = model.createMachine(
  {
    id: 'selectNamespace',
    initial: 'root',
    predictableActionArguments: true,
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
                  PlaceholderOrderBy,
                  PlaceholderSearch,
                  ConnectorNamespace
                >(fetchConnectorNamespaces(context), (i) => i, {
                  pollingEnabled: true,
                }),
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
                  { target: 'selecting', cond: 'noNamespaceSelected' },
                  { target: 'valid', cond: 'namespaceSelected' },
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
                  deselectNamespace: {
                    target: 'verify',
                    actions: deselectNamespace,
                  },
                  confirm: {
                    target: '#done',
                    cond: 'namespaceSelected',
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
          duplicateMode: (context: Context) => context.duplicateMode,
        },
      },
    },
  },
  {
    guards: {
      namespaceSelected: (context) => context.selectedNamespace !== undefined,
      noNamespaceSelected: (context) => context.selectedNamespace === undefined,
    },
  }
);

export type NamespaceMachineActorRef = ActorRefFrom<
  typeof selectNamespaceMachine
>;
