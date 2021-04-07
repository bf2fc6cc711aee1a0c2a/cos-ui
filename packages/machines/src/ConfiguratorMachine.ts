import { createElement, FunctionComponent } from 'react';
import { ComponentType } from 'react';
import { ConnectorType } from '@kas-connectors/api';
import { assign, createMachine, DoneInvokeEvent, sendParent } from 'xstate';

export type ConnectorConfiguratorProps = {
  activeStep: number;
  connector: ConnectorType;
  // internalState: any; // ???
  configuration: any;
  onChange: (configuration: any, isValid: boolean) => void;
};

type ConnectorConfigurator = {
  steps: string[];
  configurator: ComponentType<ConnectorConfiguratorProps>;
};

type ConnectorConfiguratorType = ConnectorConfigurator | null;

const fetchConfigurator = (
  connector: ConnectorType
): Promise<ConnectorConfiguratorType> => {
  const SampleMultiStepConfigurator: FunctionComponent<ConnectorConfiguratorProps> = props =>
    createElement('p', null, "Active step ", `${props.activeStep}`, " of ", props.connector.id);

  switch (connector.id) {
    case 'aws-kinesis-source':
      // this will come from a remote entry point, eg. debezium
      return Promise.resolve({
        steps: ['First step', 'Second step', 'Third step'],
        configurator: SampleMultiStepConfigurator,
      });
    default:
      return Promise.resolve(null);
  }
};

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  connector: ConnectorType;
  configuration?: any;
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
        configuration: any;
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
  configuration: any;
  isValid: boolean;
};

type configurationChangedEvent = {
  type: 'configurationChange';
  configuration: any;
};

type Event = configurationChangeEvent;

const fetchSuccess = assign<
  Context,
  DoneInvokeEvent<ConnectorConfiguratorType>
>((_context, event) =>
  event.data
    ? {
        steps: event.data.steps,
        Configurator: event.data.configurator,
        activeStep: 0
      }
    : { steps: false, Configurator: false }
);
const fetchFailure = assign<Context, DoneInvokeEvent<string>>({
  error: (_context, event) => event.data,
});
const configurationChange = assign<Context, configurationChangeEvent>(
  (_context, event) => ({
    configuration: event.configuration,
    isValid: event.isValid
  })
);

const notifyChangeToParent = sendParent<
  Context,
  configurationChangeEvent,
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
          src: context => fetchConfigurator(context.connector),
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
          steps: context.steps
        }))
      },
      success: {
        entry: sendParent(context => ({
          type: 'loaded',
          steps: context.steps
        })),
        on: {
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
  }
);
