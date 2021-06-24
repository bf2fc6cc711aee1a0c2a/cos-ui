import { useCallback } from 'react';
import { ActorRefFrom, assign, createMachine, createSchema } from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@cos-ui/api';
import { useSelector } from '@xstate/react';

import { deleteConnector, startConnector, stopConnector } from './actors';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  connector: Connector;
};

const connectorMachineSchema = {
  context: createSchema<Context>(),
};

const connectorMachineModel = createModel(
  {
    accessToken: () => Promise.resolve(''),
    basePath: '',
    connector: {},
  } as Context,
  {
    events: {
      start: () => ({}),
      stop: () => ({}),
      remove: () => ({}),
      success: (payload: { connector: Connector }) => payload,
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
          src: context =>
            startConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
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
          src: context =>
            stopConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
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
        invoke: {
          id: 'deletingConnectorCb',
          src: context =>
            deleteConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
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
      isReady: context => context.connector.desired_state === 'ready',
      isStopped: context => context.connector.desired_state === 'stopped',
      isDeleted: context => context.connector.desired_state === 'deleted',
    },
    actions: {
      updateState: assign((_context, event) => {
        if (event.type !== 'success') return {};
        return {
          connector: event.connector,
        };
      }),
      notifySuccessToParent: sendParent('connector.action-success'),
      notifyErrorToParent: sendParent('connector.action-failure'),
    },
  }
);

export const makeConnectorMachine = (context: Context) =>
  connectorMachine.withContext(context);

export type ConnectorMachineActorRef = ActorRefFrom<typeof connectorMachine>;

export const useConnector = (ref: ConnectorMachineActorRef) => {
  return useSelector(
    ref,
    useCallback(
      (state: typeof ref.state) => ({
        connector: state.context.connector,
        canStart: connectorMachine.transition(state, 'start').changed === true,
        canStop: connectorMachine.transition(state, 'stop').changed === true,
        canDelete:
          connectorMachine.transition(state, 'remove').changed === true,
        onStart: () => ref.send({ type: 'start' }),
        onStop: () => ref.send({ type: 'stop' }),
        onDelete: () => ref.send({ type: 'remove' }),
      }),
      [ref]
    )
  );
};
