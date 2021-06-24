import { AxiosResponse } from 'axios';
import {
  Configuration,
  ConnectorTypesApi,
  ConnectorTypeList,
  ConnectorType,
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

const fetchConnectorTypes = (
  accessToken: () => Promise<string>,
  basePath: string
): Promise<AxiosResponse<ConnectorTypeList>> => {
  const apisService = new ConnectorTypesApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return apisService.listConnectorTypes();
};

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  connectors?: ConnectorTypeList;
  selectedConnector?: ConnectorType;
  error?: string;
};

const connectorTypesMachineSchema = {
  context: createSchema<Context>(),
};

const connectorTypesMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
    connectors: undefined,
    selectedConnector: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      selectConnector: (payload: { selectedConnector: string }) => ({
        ...payload,
      }),
      deselectConnector: () => ({}),
      confirm: () => ({}),
    },
  }
);

export const connectorTypesMachine = createMachine<
  typeof connectorTypesMachineModel
>(
  {
    schema: connectorTypesMachineSchema,
    id: 'connectors',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchConnectors',
          src: context =>
            fetchConnectorTypes(context.accessToken, context.basePath),
          onDone: {
            target: 'verify',
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
      verify: {
        always: [
          { target: 'selecting', cond: 'noConnectorSelected' },
          { target: 'valid', cond: 'connectorSelected' },
        ],
      },
      selecting: {
        entry: sendParent('isInvalid'),
        on: {
          selectConnector: {
            target: 'valid',
            actions: 'selectConnector',
            cond: (_, event) => event.selectedConnector !== undefined,
          },
        },
      },
      valid: {
        entry: sendParent('isValid'),
        on: {
          selectConnector: {
            target: 'verify',
            actions: 'selectConnector',
          },
          deselectConnector: {
            target: 'verify',
            actions: 'reset',
          },
          confirm: {
            target: 'done',
            cond: 'connectorSelected',
          },
        },
      },
      done: {
        type: 'final',
        data: {
          selectedConnector: (context: Context) => context.selectedConnector,
        },
      },
    },
  },
  {
    actions: {
      selectConnector: assign({
        selectedConnector: (context, event) => {
          if (event.type === 'selectConnector') {
            return context.connectors?.items?.find(
              i => i.id === event.selectedConnector
            );
          }
          return context.selectedConnector;
        },
      }),
      reset: assign({
        selectedConnector: (context, event) =>
          event.type === 'deselectConnector'
            ? undefined
            : context.selectedConnector,
      }),
    },
    guards: {
      connectorSelected: context => context.selectedConnector !== undefined,
      noConnectorSelected: context => context.selectedConnector === undefined,
    },
  }
);

export type ConnectorTypesMachineActorRef = ActorRefFrom<
  typeof connectorTypesMachine
>;
