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
    predictableActionArguments: true,
    states: {
      verify: {
        entry: sendParent((context) => ({
          type: 'isInvalid',
          data: {
            updatedValue: context.userErrorHandler,
            updatedStep: 'errorHandler',
            topic: context.topic,
          },
        })),
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
        entry: sendParent((context) => ({
          type: 'isValid',
          data: {
            updatedValue: context.userErrorHandler,
            updatedStep: 'errorHandler',
            topic: context.topic,
          },
        })),
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
      isErrorHandlerConfigured: (context) => {
        const { userErrorHandler, topic } = context;
        return userErrorHandler !== undefined &&
          userErrorHandler === 'dead_letter_queue'
          ? topic !== undefined && topic.length > 0
          : userErrorHandler !== undefined;
      },
    },
  }
);

export type ErrorHandlingMachineActorRef = ActorRefFrom<
  typeof errorHandlingMachine
>;
