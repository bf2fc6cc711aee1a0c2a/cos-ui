import { ComponentType } from 'react';
import { ConnectorType } from '@kas-connectors/api';
import {
  assign,
  sendParent,
  createMachine,
  createSchema,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

export type ConnectorConfiguratorProps = {
  activeStep: number;
  connector: ConnectorType;
  // internalState: unknown; // ???
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
};

export type ConnectorConfigurator = {
  steps: string[];
  configurator: ComponentType<ConnectorConfiguratorProps>;
  isValid: boolean;
};

export type ConnectorConfiguratorType = ConnectorConfigurator | null;

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  connector: ConnectorType;
  configuration?: unknown;
  isValid?: boolean;
  Configurator: ComponentType<ConnectorConfiguratorProps> | false;
  steps?: string[] | false;
  activeStep?: number;
  error?: string;
};

const configuratorMachineSchema = {
  context: createSchema<Context>(),
};

const configuratorMachineModel = createModel(
  {
    authToken: undefined,
    basePath: undefined,
    connector: { id: 'something', name: 'something', version: '0.1' },
    configuration: undefined,
    isValid: undefined,
    Configurator: false,
    steps: undefined,
    activeStep: undefined,
    error: undefined,
  } as Context,
  {
    events: {
      prev: () => ({}),
      next: () => ({}),
      configurationChange: (payload: {
        configuration: unknown;
        isValid: boolean;
      }) => ({ ...payload }),
    },
  }
);

export const configuratorMachine = createMachine<
  typeof configuratorMachineModel
>(
  {
    schema: configuratorMachineSchema,
    id: 'configurator',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchConfigurator',
          src: 'fetchConfigurator',
          onDone: {
            target: 'success',
            actions: assign((_context, event) =>
              event.data
                ? {
                    steps: event.data.steps,
                    Configurator: event.data.configurator,
                    isValid: event.data.isValid,
                  }
                : { steps: false, Configurator: false }
            ),
          },
          onError: {
            target: 'failure',
            actions: assign({
              error: (_context, event) => event.data,
            }),
          },
        },
      },
      failure: {
        entry: sendParent(context => ({
          type: 'loaded',
          steps: context.steps,
          activeStep: context.activeStep,
        })),
      },
      success: {
        entry: [
          assign(context => ({
            activeStep: context.activeStep || 0,
          })),
          sendParent(context => ({
            type: 'loaded',
            steps: context.steps,
            activeStep: context.activeStep,
            isValid: context.isValid,
          })),
        ],
        on: {
          prev: {
            target: 'success',
            cond: 'areThereSubsteps',
            actions: [
              assign(ctx => ({
                activeStep: ctx.activeStep! - 1,
                isValid: false,
              })),
            ],
          },
          next: {
            target: 'success',
            cond: 'canGoNextStep',
            actions: [
              assign(ctx => ({
                activeStep: ctx.activeStep! + 1,
                isValid: false,
              })),
            ],
          },
          configurationChange: {
            target: 'success',
            actions: [
              assign((_context, event) => ({
                configuration: event.configuration,
                isValid: event.isValid,
              })),
              sendParent(context => ({
                type: 'configurationChange',
                configuration: context.isValid
                  ? context.configuration
                  : undefined,
              })),
            ],
          },
        },
      },
    },
  },
  {
    guards: {
      canGoNextStep: context => context.isValid === true,
      areThereSubsteps: context =>
        context.activeStep && context.steps
          ? context.activeStep > 0
          : false,

    },
  }
);
