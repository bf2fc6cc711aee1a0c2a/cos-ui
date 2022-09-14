import { ERROR_HANDLING } from '@constants/constants';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorType } from '@rhoas/connector-management-sdk';

type Context = {
  connector: ConnectorType;
  topic: string;
  userErrorHandler?: any;
  duplicateMode?: boolean;
};

const model = createModel(
  {
    topic: '',
    userErrorHandler: '',
  } as Context,
  {
    events: {
      setTopic: (payload: { topic: string }) => payload,
      setErrorHandler: (payload: { errorHandler: any | undefined }) => payload,
      confirm: () => ({}),
    },
  }
);

const setTopic = model.assign(
  {
    topic: (_, event) => event.topic,
  },
  'setTopic'
);

const setErrorHandler = model.assign(
  (_, event) => ({
    userErrorHandler: event.errorHandler,
  }),
  'setErrorHandler'
);

export const errorHandlingMachine = model.createMachine(
  {
    id: 'configureErrorHandler',
    initial: 'verify',
    states: {
      verify: {
        always: [
          { target: 'valid', cond: 'isErrorHandlerConfigured' },
          { target: 'typing' },
        ],
      },
      typing: {
        entry: sendParent('isInvalid'),
        on: {
          setTopic: {
            target: 'verify',
            actions: setTopic,
          },
          setErrorHandler: {
            target: 'verify',
            actions: setErrorHandler,
          },
        },
      },
      valid: {
        id: 'valid',
        entry: [
          sendParent('isValid'),
          sendParent(({ userErrorHandler }) => ({
            analyticsEventName: `${ERROR_HANDLING} selection`,
            errorHandler: userErrorHandler,
            type: 'sendAnalytics',
          })),
        ],
        on: {
          setTopic: {
            target: 'verify',
            actions: setTopic,
          },
          setErrorHandler: {
            target: 'verify',
            actions: setErrorHandler,
          },
          confirm: {
            target: '#done',
            actions: sendParent(({ userErrorHandler }) => ({
              analyticsEventName: `${ERROR_HANDLING} next`,
              errorHandler: userErrorHandler,
              type: 'sendAnalytics',
            })),
            cond: 'isErrorHandlerConfigured',
          },
        },
      },
      done: {
        id: 'done',
        type: 'final',
        data: {
          topic: (context: Context) => context.topic,
          userErrorHandler: (context: Context) => context.userErrorHandler,
          duplicateMode: (context: Context) => context.duplicateMode,
        },
      },
    },
  },
  {
    guards: {
      isErrorHandlerConfigured: (context) =>
        context.userErrorHandler !== undefined &&
        context.userErrorHandler === 'dead_letter_queue'
          ? context.topic !== undefined && context.topic.length > 0
          : (context.topic !== undefined && context.topic.length > 0) ||
            context.userErrorHandler !== undefined,
    },
  }
);

export type ErrorHandlingMachineActorRef = ActorRefFrom<
  typeof errorHandlingMachine
>;
