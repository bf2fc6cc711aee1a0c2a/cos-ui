import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  ConnectorCluster,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import { CreateValidatorType, createValidator } from './JsonSchemaConfigurator';
import { saveConnector, UserProvidedServiceAccount } from './api';

type Context = {
  accessToken: () => Promise<string>;
  basePath: string;

  kafka: KafkaRequest;
  cluster: ConnectorCluster;
  connectorType: ConnectorType;

  initialConfiguration: unknown;

  name: string;
  userServiceAccount?: UserProvidedServiceAccount;
  configString: string;
  configStringError?: string;
  configStringWarnings?: string[];
  savingError?: string;
  validator: CreateValidatorType;
};

const model = createModel(
  {
    initialConfiguration: undefined,
    configString: '',
    name: '',
    validator: createValidator({}),
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setServiceAccount: (payload: {
        serviceAccount: UserProvidedServiceAccount | undefined;
      }) => payload,
      updateConfiguration: (payload: { data: string }) => payload,
      save: () => ({}),
      success: () => ({}),
      failure: (payload: { message: string }) => payload,
    },
  }
);

const initialize = model.assign((context) => ({
  configString: dataToPrettyString(context.initialConfiguration),
  validator: createValidator(context.connectorType.json_schema!),
}));
const setName = model.assign(
  {
    name: (_, event) => event.name,
  },
  'setName'
);
const setServiceAccount = model.assign(
  (_, event) => ({
    userServiceAccount: event.serviceAccount,
  }),
  'setServiceAccount'
);
const updateConfiguration = model.assign(
  (_, event) => ({
    configString: event.data,
  }),
  'updateConfiguration'
);
const verifyConfigString = model.assign((context) => {
  const { warnings, error } = verifyData(
    context.configString,
    context.validator!
  );
  return { configStringWarnings: warnings, configStringError: error };
});
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
        entry: verifyConfigString,
        always: [
          { target: 'valid', cond: 'isAllConfigured' },
          { target: 'reviewing' },
        ],
      },
      reviewing: {
        entry: sendParent('isInvalid'),
        on: {
          setName: {
            target: 'verify',
            actions: setName,
          },
          setServiceAccount: {
            target: 'verify',
            actions: setServiceAccount,
          },
          updateConfiguration: {
            target: 'verify',
            actions: updateConfiguration,
          },
        },
      },
      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          setName: {
            target: 'verify',
            actions: setName,
          },
          setServiceAccount: {
            target: 'verify',
            actions: setServiceAccount,
          },
          updateConfiguration: {
            target: 'verify',
            actions: updateConfiguration,
          },
          save: 'saving',
        },
      },
      saving: {
        invoke: {
          src: (context) =>
            saveConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              kafka: context.kafka,
              cluster: context.cluster,
              connectorType: context.connectorType,
              configuration: JSON.parse(context.configString),
              name: context.name,
              userServiceAccount: context.userServiceAccount,
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
      isAllConfigured: (context) =>
        context.configString !== undefined &&
        context.configStringError === undefined &&
        context.name.length > 0,
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

function mapToObject(inputMap: Map<string, unknown>) {
  const obj = {} as { [key: string]: unknown };
  inputMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function verifyData(
  data: string,
  validator: ReturnType<typeof createValidator>
) {
  try {
    const parsedData = JSON.parse(data);
    const validationResult = validator(parsedData);
    return {
      warnings: validationResult
        ? validationResult.details.map((d) => `${d.instancePath} ${d.message}`)
        : undefined,
      error: undefined,
    };
  } catch (e) {
    const maybeMessage = (e as any)?.message;
    return {
      warnings: undefined,
      error: `Invalid JSON: ${maybeMessage || JSON.stringify(e)}`,
    };
  }
}

export type ReviewMachineActorRef = ActorRefFrom<typeof reviewMachine>;
