import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  ConnectorClusterList,
  ConnectorCluster,
} from '@kas-connectors/api';
import { assign, createMachine, createSchema, DoneInvokeEvent, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

const fetchClusters = (accessToken?: Promise<string>, basePath?: string): Promise<AxiosResponse<ConnectorClusterList>> => {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return apisService.listConnectorClusters("???");
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
      selectedClusterChanged: (payload: {
        selectedCluster: ConnectorCluster;
      }) => ({ ...payload }),
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
          src: context =>
            fetchClusters(context.authToken, context.basePath),
          onDone: {
            target: 'success',
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
      success: {
        on: {
          selectCluster: {
            target: 'success',
            actions: [
              'selectCluster',
              'notifyParent',
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      selectCluster: assign({
        selectedCluster: (context, event) =>
          context.clusters?.items?.find(i => i.id == event.selectedCluster),
      }),
      notifyParent: sendParent(context => ({
        type: 'selectedClusterChange',
        selectedCluster: context.selectedCluster,
      }))
    },
  }
);
