import { ComponentType } from 'react';
import { ConnectorType } from '@kas-connectors/api';
import { assign, DoneInvokeEvent, sendParent, createMachine } from 'xstate';

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

type State =
  | {
      value: 'loading';
      context: Context;
    }
  | {
      value: 'success';
      context: Context & {
        steps: string[] | false;
        Configurator: ComponentType<ConnectorConfiguratorProps> | false;
        activeStep: number;
        configuration: unknown;
        isValid: boolean;
        error: undefined;
      };
    }
  | {
      value: 'failure';
      context: Context & {
        error: string;
      };
    };

type configurationChangeEvent = {
  type: 'configurationChange';
  configuration: unknown;
  isValid: boolean;
};

type prevStepEvent = {
  type: 'prev';
};

type nextStepEvent = {
  type: 'next';
};

type configurationChangedEvent = {
  type: 'configurationChange';
  configuration: unknown;
};

type Event = prevStepEvent | nextStepEvent | configurationChangeEvent;

const fetchSuccess = assign<
  Context,
  DoneInvokeEvent<ConnectorConfiguratorType>
>((_context, event) =>
  event.data
    ? {
        steps: event.data.steps,
        Configurator: event.data.configurator,
        isValid: event.data.isValid,
      }
    : { steps: false, Configurator: false }
);
const fetchFailure = assign<Context, DoneInvokeEvent<string>>({
  error: (_context, event) => event.data,
});
const configurationChange = assign<Context, Event>(
  (_context, event) => ({
    configuration: (event as configurationChangeEvent).configuration,
    isValid: (event as configurationChangeEvent).isValid
  })
);

const notifyChangeToParent = sendParent<
  Context,
  Event,
  configurationChangedEvent
>(context => ({
  type: 'configurationChange',
  configuration: context.isValid ? context.configuration : undefined,
}));

export const configuratorMachine = createMachine<Context, Event, State>(
  {
    id: 'configurator',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'fetchConfigurator',
          src: 'fetchConfigurator',
          onDone: {
            target: 'success',
            actions: fetchSuccess,
          },
          onError: {
            target: 'failure',
            actions: fetchFailure,
          },
        },
      },
      failure: {
        entry: sendParent(context => ({
          type: 'loaded',
          steps: context.steps,
          activeStep: context.activeStep
        }))
      },
      success: {
        entry: [
          assign(context => ({
            activeStep: context.activeStep || 0
          })),
          sendParent(context => ({
            type: 'loaded',
            steps: context.steps,
            activeStep: context.activeStep,
            isValid: context.isValid,
          }))
        ],
        on: {
          prev: {
            target: 'success',
            actions: [
              assign(ctx => ({
                activeStep: ctx.activeStep! - 1,
                isValid: false
              }))
            ]
          },
          next: {
            target: 'success',
            cond: 'canGoNextStep',
            actions: [
              assign(ctx => ({
                activeStep: ctx.activeStep! + 1,
                isValid: false
              }))
            ]
          },
          configurationChange: {
            target: 'success',
            actions: ['configurationChange', 'notifyChangeToParent'],
          },
        },
      },
    },
  },
  {
    actions: {
      configurationChange,
      notifyChangeToParent
    },
    guards: {
      canGoNextStep: context => context.isValid === true
    }
  }
);
