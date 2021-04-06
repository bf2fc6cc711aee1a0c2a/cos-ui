import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  ConnectorClusterList,
  ConnectorCluster
} from '@kas-connectors/api';
import { assign, createMachine, DoneInvokeEvent, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';

const fetchClusters = (accessToken?: Promise<string>, basePath?: string): Promise<AxiosResponse<ConnectorClusterList>> => {
  // new Promise(resolve =>
  //   setTimeout(() => resolve([{ id: 1, name: 'test' }]), 1000)
  // );
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

type State =
  | {
      value: 'loading';
      context: Context;
    }
  | {
      value: 'success';
      context: Context & {
        clusters: ConnectorClusterList;
        error: undefined;
      };
    }
  | {
      value: 'failure';
      context: Context & {
        clusters: undefined;
        error: string;
      };
    };

type selectClusterEvent = {
  type: 'selectCluster';
  selectedCluster: string;
};

type selectedClusterChangedEvent = {
  type: 'selectedClusterChange';
  selectedCluster: ConnectorCluster;
};

type Event = selectClusterEvent;

const fetchSuccess = assign<
  Context,
  DoneInvokeEvent<AxiosResponse<ConnectorClusterList>>
>({
  clusters: (_context, event) => event.data.data,
});
const fetchFailure = assign<Context, DoneInvokeEvent<string>>({
  error: (_context, event) => event.data,
});
const selectCluster = assign<Context, selectClusterEvent>({
  selectedCluster: (context, event) =>
    context.clusters?.items?.find(i => i.id == event.selectedCluster),
});
const notifyParent = sendParent<Context, selectClusterEvent, selectedClusterChangedEvent>(context => ({
  type: 'selectedClusterChange',
  selectedCluster: context.selectedCluster!,
}))

export const clustersMachine = createMachine<Context, Event, State>(
  {
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
            actions: fetchSuccess,
          },
          onError: {
            target: 'failure',
            actions: fetchFailure,
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
      selectCluster,
      notifyParent
    },
  }
);
