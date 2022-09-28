import { saveConnector, UserProvidedServiceAccount } from '@apis/api';
import { dataToPrettyString } from '@utils/shared';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  ConnectorNamespace,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;

  kafka: KafkaRequest;
  namespace: ConnectorNamespace;
  connectorType: ConnectorType;

  initialConfiguration: unknown;

  name: string;
  userServiceAccount: UserProvidedServiceAccount;

  topic: string;
  userErrorHandler: string;

  configString: string;
  configStringError?: string;
  configStringWarnings?: string[];
  savingError?: string;
  duplicateMode: boolean | undefined;
};

const model = createModel(
  {
    initialConfiguration: undefined,
    configString: '',
    name: '',
  } as Context,
  {
    events: {
      save: () => ({}),
      success: () => ({}),
      failure: (payload: { message: string }) => payload,
    },
  }
);

const initialize = model.assign((context) => ({
  kafka: context.kafka,
  namespace: context.namespace,
  connectorType: context.connectorType,

  name: context.name,
  userServiceAccount: context.userServiceAccount,

  topic: context.topic,
  userErrorHandler: context.userErrorHandler,

  configString: dataToPrettyString(context.initialConfiguration),
}));

const setSavingError = model.assign(
  (_, event) => ({
    savingError: event.message,
  }),
  'failure'
);

export const reviewMachine = model.createMachine(
  {
    id: 'review',
    initial: 'verify',
    context: model.initialContext,
    entry: initialize,
    states: {
      verify: {
        always: [{ target: 'valid', cond: 'isAllConfigured' }],
      },

      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          save: {
            target: 'saving',
          },
        },
      },
      saving: {
        invoke: {
          src: (context) =>
            saveConnector({
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafka: context.kafka,
              namespace: context.namespace,
              connectorType: context.connectorType,
              configuration: JSON.parse(context.configString),
              name: context.name,
              userServiceAccount: context.userServiceAccount,
              topic: context.topic,
              userErrorHandler: context.userErrorHandler,
            }),
        },
        on: {
          success: 'saved',
          failure: {
            target: 'valid',
            actions: setSavingError,
          },
        },
        tags: ['saving'],
      },
      saved: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      isAllConfigured: (context) => context.configString !== undefined,
    },
  }
);

export type ReviewMachineActorRef = ActorRefFrom<typeof reviewMachine>;
