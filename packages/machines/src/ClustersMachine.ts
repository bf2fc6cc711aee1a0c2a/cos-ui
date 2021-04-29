import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  ConnectorClusterList,
  ConnectorCluster,
} from '@cos-ui/api';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  DoneInvokeEvent,
  sendParent,
} from 'xstate';
import { escalate } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

const fetchClusters = (
  accessToken?: Promise<string>,
  basePath?: string
): Promise<AxiosResponse<ConnectorClusterList>> => {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return apisService.listConnectorClusters('???');
};

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  clusters?: ConnectorClusterList;
  selectedCluster?: ConnectorCluster;
  error?: Object;
};

const clustersMachineSchema = {
  context: createSchema<Context>(),
};

const clustersMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
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
    },
  }
);

export const clustersMachine = createMachine<typeof clustersMachineModel>(
  {
    schema: clustersMachineSchema,
    id: 'clusters',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchClusters',
          src: context => fetchClusters(context.authToken, context.basePath),
          onDone: {
            target: 'verify',
            actions: assign<
              Context,
              DoneInvokeEvent<AxiosResponse<ConnectorClusterList>>
            >({
              clusters: (_context, event) => event.data.data,
            }),
          },
          onError: {
            target: 'failure',
            actions: assign<Context, DoneInvokeEvent<string>>({
              error: (_context, event) => event.data,
            }),
          },
        },
      },
      failure: {
        entry: escalate(context => ({ message: context.error })),
      },
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
            actions: 'selectCluster',
          },
        },
      },
      valid: {
        entry: sendParent('isValid'),
        on: {
          selectCluster: {
            target: 'verify',
            actions: 'selectCluster',
            cond: (_, event) => event.selectedCluster !== undefined,
          },
          deselectCluster: {
            target: 'verify',
            actions: 'reset',
          },
          confirm: {
            target: 'done',
            cond: 'clusterSelected',
          },
        },
      },
      done: {
        type: 'final',
        data: {
          selectedCluster: (context: Context) => context.selectedCluster,
        },
      },
    },
  },
  {
    actions: {
      selectCluster: assign({
        selectedCluster: (context, event) => {
          if (event.type === 'selectCluster') {
            return context.clusters?.items?.find(
              i => i.id === event.selectedCluster
            );
          }
          return context.selectedCluster;
        },
      }),
      reset: assign({
        selectedCluster: (context, event) =>
          event.type === 'deselectCluster'
            ? undefined
            : context.selectedCluster,
      }),
    },
    guards: {
      clusterSelected: context => context.selectedCluster !== undefined,
      noClusterSelected: context => context.selectedCluster === undefined,
    },
  }
);

export type ClusterMachineActorRef = ActorRefFrom<typeof clustersMachine>;
