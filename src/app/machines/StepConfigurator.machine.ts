import { CONNECTOR_SPECIFIC } from '@constants/constants';
import {
  CreateValidatorType,
  validateAgainstSchema,
} from '@utils/createValidator';

import { ActorRefFrom, sendParent } from 'xstate';
import { createModel } from 'xstate/lib/model';

import { ConnectorType, Connector } from '@rhoas/connector-management-sdk';

type Context = {
  connector: ConnectorType;
  steps: string[];
  activeStep: number;
  isActiveStepValid: boolean;
  configuration: unknown;
  connectorData?: Connector;
  validator: CreateValidatorType;
};

const model = createModel(
  {
    connector: {
      id: 'something',
      name: 'something',
      version: '0.1',
      schema: {},
    },
    steps: [],
    activeStep: 0,
    isActiveStepValid: false,
    configuration: undefined,
    validator: () => ({ details: [] }),
  } as Context,
  {
    events: {
      entry: () => ({}),
      change: ({
        configuration,
        isValid,
      }: {
        configuration: unknown;
        isValid: boolean;
      }) => ({ configuration, isValid }),
      next: () => ({}),
      prev: () => ({}),
      complete: () => ({}),
      isValid: () => ({}),
      isInvalid: () => ({}),
    },
    actions: {
      changedStep: () => ({}),
    },
  }
);

const nextStep = model.assign(
  (context) => ({
    activeStep: Math.min(context.activeStep + 1, context.steps.length - 1),
    isActiveStepValid: false,
  }),
  'next'
);
const prevStep = model.assign(
  (context) => ({
    activeStep: Math.max(context.activeStep - 1, 0),
    isActiveStepValid: false,
  }),
  'prev'
);
const change = model.assign(
  (_, event) => ({
    configuration: event.configuration,
    isActiveStepValid: event.isValid,
  }),
  'change'
);

export const configuratorMachine = model.createMachine(
  {
    id: 'configurator',
    initial: 'pending',
    predictableActionArguments: true,
    context: {
      connector: {
        id: 'something',
        name: 'something',
        version: '0.1',
        schema: {},
      },
      steps: ['one', 'two', 'three'],
      activeStep: 0,
      isActiveStepValid: false,
      configuration: undefined,
      validator: () => ({ details: [] }),
    },
    states: {
      pending: {
        invoke: {
          id: 'validateConfiguration',
          src: (context) => (callback) => {
            if (context.configuration === false) {
              callback('isInvalid');
            } else {
              const isConfigValid =
                context.connector.schema &&
                validateAgainstSchema(
                  context.validator,
                  context.connector.schema,
                  context.configuration
                );
              callback(isConfigValid ? 'isValid' : 'isInvalid');
            }
          },
        },
        on: {
          isValid: {
            target: 'valid',
          },
          isInvalid: {
            target: 'configuring',
          },
        },
      },
      configuring: {
        entry: sendParent((context) => ({
          type: 'isInvalid',
          data: {
            updatedValue: context.configuration,
            updatedStep: CONNECTOR_SPECIFIC,
          },
        })),
        always: [{ target: 'valid', cond: 'activeStepValid' }],
      },
      valid: {
        id: 'valid',
        initial: 'determineStep',
        entry: sendParent('isValid'),
        states: {
          determineStep: {
            always: [
              { target: '#valid.lastStep', cond: 'isLastStep' },
              { target: '#valid.hasNextStep' },
            ],
          },
          hasNextStep: {
            on: {
              next: {
                target: '#configurator.configuring',
                actions: [nextStep, 'changedStep'],
              },
            },
          },
          lastStep: {
            on: {
              next: {
                target: '#configurator.configured',
              },
            },
          },
        },
      },
      configured: {
        type: 'final',
        data: ({ configuration }) => ({ configuration }),
      },
    },
    on: {
      change: {
        target: 'configuring',
        actions: change,
      },
      prev: {
        target: 'configuring',
        actions: [prevStep, 'changedStep'],
      },
    },
  },
  {
    actions: {
      changedStep: sendParent((context) => ({
        type: 'changedStep',
        step: context.activeStep,
      })),
    },
    guards: {
      isLastStep: (context) => context.activeStep === context.steps.length - 1,
      activeStepValid: (context) => context.isActiveStepValid,
    },
  }
);

export type ConfiguratorActorRef = ActorRefFrom<typeof configuratorMachine>;
