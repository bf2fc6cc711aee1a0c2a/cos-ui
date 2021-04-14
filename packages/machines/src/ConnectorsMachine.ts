import { AxiosResponse } from 'axios';
import {
  Configuration,
  DefaultApi,
  ConnectorTypeList,
  ConnectorType
} from '@kas-connectors/api';
import { assign, createMachine, createSchema, DoneInvokeEvent, sendParent } from 'xstate';
import { escalate } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

const fetchConnectors = (accessToken?: Promise<string>, basePath?: string): Promise<AxiosResponse<ConnectorTypeList>> => {
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

const connectorsMachineSchema = {
  context: createSchema<Context>(),
};

const connectorsMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    connectors: undefined,
    selectedConnector: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectConnector: (payload: { selectedConnector: string }) => ({
        ...payload,
      }),
      selectedConnectorChanged: (payload: {
        selectedConnector: ConnectorType;
      }) => ({ ...payload }),
    },
  }
);

export const connectorsMachine = createMachine<typeof connectorsMachineModel>(
  {
    schema: connectorsMachineSchema,
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
            actions: assign<
            Context,
            DoneInvokeEvent<AxiosResponse<ConnectorTypeList>>
          >({
            connectors: (_context, event) => event.data.data,
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
      selectConnector: assign({
        selectedConnector: (context, event) =>
          context.connectors?.items?.find(i => i.id == event.selectedConnector),
      }),
      notifyParent: sendParent(context => ({
        type: 'selectedConnectorChange',
        selectedConnector: context.selectedConnector,
      }))
    },
  }
);
