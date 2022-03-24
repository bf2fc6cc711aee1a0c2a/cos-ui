import { saveConnector, UserProvidedServiceAccount } from '@apis/api';
import { mapToObject } from '@utils/shared';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  ConnectorCluster,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;

  kafka: KafkaRequest;
  cluster: ConnectorCluster;
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
  cluster: context.cluster,
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
          save: 'saving',
        },
      },
      saving: {
        invoke: {
          src: (context) =>
            saveConnector({
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafka: context.kafka,
              cluster: context.cluster,
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

function dataToPrettyString(data: unknown) {
  const dataVal = data instanceof Map ? mapToObject(data) : data;
  try {
    return JSON.stringify(dataVal, null, 2);
  } catch (e) {
    return '';
  }
}

export type ReviewMachineActorRef = ActorRefFrom<typeof reviewMachine>;
