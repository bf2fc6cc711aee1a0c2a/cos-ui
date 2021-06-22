import { sendParent } from 'xstate/lib/actions';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  Sender,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { Configuration, ConnectorsApi } from '@cos-ui/api';
import axios from 'axios';

type ApiProps = {
  accessToken?: Promise<string>;
  basePath?: string;
  connectorId: string;
  desiredState: string;
};

const startConnector = ({ accessToken, basePath, connectorId }: ApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .patchConnector(
        connectorId,
        {
          desired_state: 'ready',
        },
        undefined,
        {
          cancelToken: source.token,
          headers: {
            'Content-type': 'application/merge-patch+json',
          },
        }
      )
      .then(response => {
        callback({
          type: 'success',
          desiredState: response.data.desired_state,
        });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'error',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

const stopConnector = ({ accessToken, basePath, connectorId }: ApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .patchConnector(
        connectorId,
        {
          desired_state: 'stopped',
        },
        undefined,
        {
          cancelToken: source.token,
          headers: {
            'Content-type': 'application/merge-patch+json',
          },
        }
      )
      .then(response => {
        console.log('success', response);
        callback({
          type: 'success',
          desiredState: response.data.desired_state,
        });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'error',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

const deleteConnector = ({ accessToken, basePath, connectorId }: ApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .deleteConnector(connectorId, undefined, {
        cancelToken: source.token,
      })
      .then(() => {
        callback({
          type: 'success',
          desiredState: 'deleted',
        });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'error',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

type Context = {
  accessToken?: Promise<string>;
  basePath?: string;
  connectorId: string;
  desiredState: string;
};

const connectorMachineSchema = {
  context: createSchema<Context>(),
};

const connectorMachineModel = createModel(
  {
    accessToken: undefined,
    basePath: undefined,
    connectorId: '',
    desiredState: '',
  } as Context,
  {
    events: {
      start: () => ({}),
      stop: () => ({}),
      remove: () => ({}),
      success: (payload: { desiredState: string }) => payload,
      error: (payload: { error: string }) => payload,
    },
  }
);

export const connectorMachine = createMachine<typeof connectorMachineModel>(
  {
    schema: connectorMachineSchema,
    id: 'connector',
    initial: 'verify',
    context: connectorMachineModel.initialContext,
    states: {
      verify: {
        always: [
          { target: 'ready', cond: 'isReady' },
          { target: 'stopped', cond: 'isStopped' },
          { target: 'deleted', cond: 'isDeleted' },
        ],
      },
      ready: {
        on: {
          stop: 'stoppingConnector',
          remove: 'deletingConnector',
        },
      },
      stopped: {
        on: {
          start: 'startingConnector',
          remove: 'deletingConnector',
        },
      },
      deleted: {},

      startingConnector: {
        invoke: {
          id: 'startingConnectorCb',
          src: context => startConnector(context),
        },
        on: {
          success: {
            target: 'verify',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          error: {
            target: 'verify',
            actions: 'notifyErrorToParent',
          },
        },
      },
      stoppingConnector: {
        invoke: {
          id: 'stoppingConnectorCb',
          src: context => stopConnector(context),
        },
        on: {
          success: {
            target: 'verify',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          error: {
            target: 'verify',
            actions: 'notifyErrorToParent',
          },
        },
      },
      deletingConnector: {
        entry: () => console.log('deletingConnector'),
        invoke: {
          id: 'deletingConnectorCb',
          src: context => deleteConnector(context),
        },
        on: {
          success: {
            target: 'deleted',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          error: {
            target: 'verify',
            actions: 'notifyErrorToParent',
          },
        },
      },
    },
  },
  {
    guards: {
      isReady: context => context.desiredState === 'ready',
      isStopped: context => context.desiredState === 'stopped',
      isDeleted: context => context.desiredState === 'deleted',
    },
    actions: {
      updateState: assign((_context, event) => {
        if (event.type !== 'success') return {};
        return {
          desiredState: event.desiredState,
        };
      }),
      notifySuccessToParent: sendParent('connector_action_success'),
      notifyErrorToParent: sendParent('connector_action_error'),
    },
  }
);

export const makeConnectorMachine = (context: Context) =>
  connectorMachine.withContext(context);

export type ConnectorMachineActorRef = ActorRefFrom<typeof connectorMachine>;
