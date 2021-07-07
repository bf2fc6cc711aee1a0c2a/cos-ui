import { useCallback } from 'react';
import { ActorRefFrom, assign, createMachine, createSchema } from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { ConnectorResult } from '@cos-ui/graphql';
import { useSelector } from '@xstate/react';

import { deleteConnector, startConnector, stopConnector } from './actors';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  connector: ConnectorResult;
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
      'connector.start': () => ({}),
      'connector.stop': () => ({}),
      'connector.remove': () => ({}),
      'connector.select': () => ({}),
      'connector.actionSuccess': (payload: { connector: ConnectorResult }) =>
        payload,
      'connector.actionError': (payload: { error: string }) => payload,
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
          'connector.stop': 'stoppingConnector',
          'connector.remove': 'deletingConnector',
        },
      },
      stopped: {
        on: {
          'connector.start': 'startingConnector',
          'connector.remove': 'deletingConnector',
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
          'connector.actionSuccess': {
            target: 'verify',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          'connector.actionError': {
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
          'connector.actionSuccess': {
            target: 'verify',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          'connector.actionError': {
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
          'connector.actionSuccess': {
            target: 'deleted',
            actions: ['updateState', 'notifySuccessToParent'],
          },
          'connector.actionError': {
            target: 'verify',
            actions: 'notifyErrorToParent',
          },
        },
      },
    },
    on: {
      'connector.select': {
        actions: 'notifySelectToParent',
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
        if (event.type !== 'connector.actionSuccess') return {};
        return {
          connector: event.connector,
        };
      }),
      notifySuccessToParent: sendParent('actionSuccess'),
      notifyErrorToParent: sendParent('actionFailure'),
      notifySelectToParent: sendParent(({ connector }) => ({
        type: 'selectConnector',
        connector,
      })),
    },
  }
);

export const makeConnectorMachine = (context: Context) =>
  connectorMachine.withContext(context);

export type ConnectorMachineActorRef = ActorRefFrom<typeof connectorMachine>;

export type useConnectorReturnType = {
  connector: ConnectorResult;
  canStart: boolean;
  canStop: boolean;
  canDelete: boolean;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onSelect: () => void;
};
export const useConnector = (
  ref: ConnectorMachineActorRef
): useConnectorReturnType => {
  const { connector, canStart, canStop, canDelete } = useSelector(
    ref,
    useCallback(
      (state: typeof ref.state) => ({
        connector: state.context.connector,
        canStart:
          connectorMachine.transition(state, 'connector.start').changed ===
          true,
        canStop:
          connectorMachine.transition(state, 'connector.stop').changed === true,
        canDelete:
          connectorMachine.transition(state, 'connector.remove').changed ===
          true,
      }),
      [ref]
    )
  );
  const onStart = useCallback(() => ref.send({ type: 'connector.start' }), [
    ref,
  ]);
  const onStop = useCallback(() => ref.send({ type: 'connector.stop' }), [ref]);
  const onDelete = useCallback(() => ref.send({ type: 'connector.remove' }), [
    ref,
  ]);
  const onSelect = useCallback(() => ref.send({ type: 'connector.select' }), [
    ref,
  ]);
  return {
    connector,
    canStart,
    canStop,
    canDelete,
    onStart,
    onStop,
    onDelete,
    onSelect,
  };
};
