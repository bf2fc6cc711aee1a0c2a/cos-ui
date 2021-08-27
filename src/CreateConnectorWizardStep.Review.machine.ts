import { ActorRefFrom, assign, createSchema, sendParent } from 'xstate';
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

const reviewMachineSchema = {
  context: createSchema<Context>(),
};

const reviewMachineModel = createModel(
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

export const reviewMachine = reviewMachineModel.createMachine(
  {
    schema: reviewMachineSchema,
    id: 'review',
    initial: 'verify',
    context: reviewMachineModel.initialContext,
    entry: 'initialize',
    states: {
      verify: {
        entry: 'verifyConfigString',
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
            actions: 'setName',
          },
          setServiceAccount: {
            target: 'verify',
            actions: 'setServiceAccount',
          },
          updateConfiguration: {
            target: 'verify',
            actions: 'updateConfiguration',
          },
        },
      },
      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          setName: {
            target: 'verify',
            actions: 'setName',
          },
          setServiceAccount: {
            target: 'verify',
            actions: 'setServiceAccount',
          },
          updateConfiguration: {
            target: 'verify',
            actions: 'updateConfiguration',
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
            actions: 'setSavingError',
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
    actions: {
      initialize: assign((context) => ({
        configString: dataToPrettyString(context.initialConfiguration),
        validator: createValidator(context.connectorType.json_schema!),
      })),
      setName: assign((_, event) =>
        event.type === 'setName'
          ? {
              name: event.name,
            }
          : {}
      ),
      setServiceAccount: assign((_, event) =>
        event.type === 'setServiceAccount'
          ? {
              userServiceAccount: event.serviceAccount,
            }
          : {}
      ),
      updateConfiguration: assign((_, event) =>
        event.type === 'updateConfiguration'
          ? {
              configString: event.data,
            }
          : {}
      ),
      verifyConfigString: assign((context) => {
        const { warnings, error } = verifyData(
          context.configString,
          context.validator!
        );
        return { configStringWarnings: warnings, configStringError: error };
      }),
      setSavingError: assign((_, event) => {
        if (event.type !== 'failure') return {};
        return {
          savingError: event.message,
        };
      }),
    },
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
