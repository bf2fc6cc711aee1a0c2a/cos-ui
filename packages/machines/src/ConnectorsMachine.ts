import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  ConnectorTypeList,
  ConnectorType
} from '@kas-connectors/api';
import { assign, createMachine, DoneInvokeEvent, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';

const fetchConnectors = (accessToken?: Promise<string>, basePath?: string): Promise<AxiosResponse<ConnectorTypeList>> => {
  // new Promise(resolve =>
  //   setTimeout(() => resolve([{ id: 1, name: 'test' }]), 1000)
  // );
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return apisService.listConnectorTypes()
};

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  connectors?: ConnectorTypeList;
  selectedConnector?: ConnectorType;
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
        connectors: ConnectorTypeList;
        error: undefined;
      };
    }
  | {
      value: 'failure';
      context: Context & {
        connectors: undefined;
        error: string;
      };
    };

type selectConnectorEvent = {
  type: 'selectConnector';
  selectedConnector: string;
};

type selectedConnectorChangedEvent = {
  type: 'selectedConnectorChange';
  selectedConnector: ConnectorType;
};

type Event = selectConnectorEvent;

const fetchSuccess = assign<
  Context,
  DoneInvokeEvent<AxiosResponse<ConnectorTypeList>>
>({
  connectors: (_context, event) => event.data.data,
});
const fetchFailure = assign<Context, DoneInvokeEvent<string>>({
  error: (_context, event) => event.data,
});
const selectConnector = assign<Context, selectConnectorEvent>({
  selectedConnector: (context, event) =>
    context.connectors?.items?.find(i => i.id == event.selectedConnector),
});
const notifyParent = sendParent<Context, selectConnectorEvent, selectedConnectorChangedEvent>(context => ({
  type: 'selectedConnectorChange',
  selectedConnector: context.selectedConnector!,
}))

export const connectorsMachine = createMachine<Context, Event, State>(
  {
    id: 'connectors',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchConnectors',
          src: context =>
            fetchConnectors(context.authToken, context.basePath),
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
          selectConnector: {
            target: 'success',
            actions: [
              'selectConnector',
              'notifyParent',
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      selectConnector,
      notifyParent
    },
  }
);
