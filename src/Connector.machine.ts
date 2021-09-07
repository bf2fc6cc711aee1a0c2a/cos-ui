import { useCallback } from 'react';

import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { sendParent } from 'xstate/lib/actions';
import { createModel } from 'xstate/lib/model';

import { Connector } from '@rhoas/connector-management-sdk';

import { deleteConnector, startConnector, stopConnector } from './api';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;
  connector: Connector;
};

const model = createModel(
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
      'connector.actionSuccess': (payload: { connector: Connector }) => payload,
      'connector.actionError': (payload: { error: string }) => payload,
    },
    actions: {
      notifySuccess: () => ({}),
      notifyError: () => ({}),
      notifySelect: ({ connector }: { connector: Connector }) => ({
        connector,
      }),
    },
  }
);

const updateState = model.assign(
  (_context, event) => ({
    connector: event.connector,
  }),
  'connector.actionSuccess'
);

export const connectorMachine = model.createMachine(
  {
    id: 'connector',
    initial: 'verify',
    context: model.initialContext,
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
          src: (context) =>
            startConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
        },
        on: {
          'connector.actionSuccess': {
            target: 'verify',
            actions: [updateState, 'notifySuccess'],
          },
          'connector.actionError': {
            target: 'verify',
            actions: 'notifyError',
          },
        },
      },
      stoppingConnector: {
        invoke: {
          id: 'stoppingConnectorCb',
          src: (context) =>
            stopConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
        },
        on: {
          'connector.actionSuccess': {
            target: 'verify',
            actions: ['updateState', 'notifySuccess'],
          },
          'connector.actionError': {
            target: 'verify',
            actions: 'notifyError',
          },
        },
      },
      deletingConnector: {
        invoke: {
          id: 'deletingConnectorCb',
          src: (context) =>
            deleteConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              connector: context.connector,
            }),
        },
        on: {
          'connector.actionSuccess': {
            target: 'deleted',
            actions: ['updateState', 'notifySuccess'],
          },
          'connector.actionError': {
            target: 'verify',
            actions: 'notifyError',
          },
        },
      },
    },
    on: {
      'connector.select': {
        actions: 'notifySelect',
      },
    },
  },
  {
    guards: {
      isReady: (context) => context.connector.desired_state === 'ready',
      isStopped: (context) => context.connector.desired_state === 'stopped',
      isDeleted: (context) => context.connector.desired_state === 'deleted',
    },
    actions: {
      notifySuccess: sendParent('actionSuccess'),
      notifyError: sendParent('actionFailure'),
      notifySelect: sendParent(({ connector }) => ({
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
  connector: Connector;
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
  const onStart = useCallback(
    () => ref.send({ type: 'connector.start' }),
    [ref]
  );
  const onStop = useCallback(() => ref.send({ type: 'connector.stop' }), [ref]);
  const onDelete = useCallback(
    () => ref.send({ type: 'connector.remove' }),
    [ref]
  );
  const onSelect = useCallback(
    () => ref.send({ type: 'connector.select' }),
    [ref]
  );
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
