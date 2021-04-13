import {
  KafkaRequest,
  ConnectorCluster,
  ConnectorType,
} from '@kas-connectors/api';
import { createMachine, assign, send } from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorsMachine } from './ConnectorsMachine';
import { configuratorMachine } from './ConfiguratorMachine';

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedCluster?: ConnectorCluster;
  selectedConnector?: ConnectorType;
  configurationSteps?: string[] | false;
  activeConfigurationStep?: number;
  isConfigurationValid?: boolean;
  connectorData?: unknown;
};

type State =
  | {
      value: 'selectKafka';
      context: Context;
    } & {
      selectedKafkaInstance: undefined;
      selectedCluster: undefined;
      selectedConnector: undefined;
      configurationSteps: undefined;
      activeConfigurationStep: undefined;
      isConfigurationValid: undefined;
      connectorData: undefined;
    }
  | {
      value: 'selectCluster';
      context: Context & {
        selectedKafkaInstance: KafkaRequest;
        selectedCluster: undefined;
        selectedConnector: undefined;
        configurationSteps: undefined;
        activeConfigurationStep: undefined;
        isConfigurationValid: undefined;
        connectorData: undefined;
      };
    }
  | {
      value: 'selectConnector';
      context: Context & {
        selectedKafkaInstance: KafkaRequest;
        selectedCluster: ConnectorCluster;
        selectedConnector: undefined;
        configurationSteps: undefined;
        activeConfigurationStep: undefined;
        isConfigurationValid: undefined;
        connectorData: undefined;
      };
    }
  | {
      value: 'configureConnector';
      context: Context & {
        selectedKafkaInstance: KafkaRequest;
        selectedCluster: ConnectorCluster;
        selectedConnector: ConnectorType;
        configurationSteps: string[] | false;
        activeConfigurationStep?: number;
        isConfigurationValid: boolean;
        connectorData: undefined;
      };
    }
  | {
      value: 'reviewConfiguration';
      context: Context & {
        selectedKafkaInstance: KafkaRequest;
        selectedCluster: ConnectorCluster;
        selectedConnector: ConnectorType;
        configurationSteps: string[] | false;
        activeConfigurationStep?: number;
        isConfigurationValid: true;
        connectorData: unknown;
      };
    }
  ;

type prevStepEvent = {
  type: 'prev';
};

type nextStepEvent = {
  type: 'next';
};

type selectedInstanceChangeEvent = {
  type: 'selectedInstanceChange';
  selectedInstance: KafkaRequest;
};

type selectedClusterChangeEvent = {
  type: 'selectedClusterChange';
  selectedCluster: ConnectorCluster;
};

type selectedConnectorChangeEvent = {
  type: 'selectedConnectorChange';
  selectedConnector: ConnectorType;
};

type configuratorLoadedEvent = {
  type: 'loaded';
  steps: string[] | false;
  activeStep?: number;
  isValid: boolean;
};

type configurationChangedEvent = {
  type: 'configurationChange';
  configuration: unknown;
};

type jumpToSelectKafkaEvent = { type: 'jumpToSelectKafka' };
type jumpToSelectClusterEvent = { type: 'jumpToSelectCluster' };
type jumpToSelectConnectorEvent = { type: 'jumpToSelectConnector' };
type jumpToConfigureConnectorEvent = { type: 'jumpToConfigureConnector' };
type jumpToReviewConfigurationEvent = { type: 'jumpToReviewConfiguration' };

type Event =
  | prevStepEvent
  | nextStepEvent
  | selectedInstanceChangeEvent
  | selectedClusterChangeEvent
  | selectedConnectorChangeEvent
  | configuratorLoadedEvent
  | configurationChangedEvent
  | jumpToSelectKafkaEvent
  | jumpToSelectClusterEvent
  | jumpToSelectConnectorEvent
  | jumpToConfigureConnectorEvent
  | jumpToReviewConfigurationEvent;

export const creationWizardMachine = createMachine<Context, Event, State>(
  {
    id: 'creationWizard',
    initial: 'selectKafka',
    context: {},
    states: {
      selectKafka: {
        invoke: {
          id: 'selectKafkaInstance',
          src: kafkasMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedInstance: context.selectedKafkaInstance,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        on: {
          selectedInstanceChange: {
            actions: assign({
              selectedKafkaInstance: (_context, event) =>
                event.selectedInstance,
            }),
          },
          next: {
            target: 'selectCluster',
            cond: 'isKafkaInstanceSelected',
          },
        },
      },
      selectCluster: {
        invoke: {
          id: 'selectCluster',
          src: clustersMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedCluster: context.selectedCluster,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        on: {
          selectedClusterChange: {
            actions: assign({
              selectedCluster: (_context, event) => event.selectedCluster,
            }),
          },
          next: { target: 'selectConnector', cond: 'isClusterSelected' },
          prev: 'selectKafka',
        },
      },
      selectConnector: {
        invoke: {
          id: 'selectConnector',
          src: connectorsMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedConnector: context.selectedConnector,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        on: {
          selectedConnectorChange: {
            actions: assign((_context, event) => ({
              selectedConnector: event.selectedConnector,
              connectorData: undefined,
            })),
          },
          next: { target: 'configureConnector', cond: 'isConnectorSelected' },
          prev: 'selectCluster',
        },
      },
      configureConnector: {
        invoke: {
          id: 'configureConnector',
          src: 'makeConfiguratorMachine',
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            connector: context.selectedConnector,
            activeStep: context.activeConfigurationStep,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        on: {
          loaded: {
            actions: assign((_context, event) => ({
              configurationSteps: event.steps,
              activeConfigurationStep: event.activeStep,
              isConfigurationValid: event.isValid,
            })),
          },
          configurationChange: {
            actions: assign({
              connectorData: (_context, event) => event.configuration,
            }),
          },
          next: [
            { target: 'reviewConfiguration', cond: 'isConnectorConfigured' },
            {
              actions: send('next', { to: 'configureConnector' }),
            },
          ],
          prev: [
            {
              actions: send('prev', { to: 'configureConnector' }),
              cond: 'areThereSubsteps',
            },
            { target: 'selectConnector' },
          ],
        },
      },
      reviewConfiguration: {
        on: {
          next: 'complete',
          prev: 'configureConnector',
        },
      },
      complete: {
        type: 'final',
      },
    },
    on: {
      jumpToSelectKafka: 'selectKafka',
      jumpToSelectCluster: {
        target: 'selectCluster',
        cond: 'isKafkaInstanceSelected',
      },
      jumpToSelectConnector: {
        target: 'selectConnector',
        cond: 'isClusterSelected',
      },
      jumpToConfigureConnector: {
        target: 'configureConnector',
        cond: 'isConnectorSelected',
      },
      jumpToReviewConfiguration: {
        target: 'reviewConfiguration',
        cond: 'isConnectorConfigured',
      },
    },
  },
  {
    guards: {
      isKafkaInstanceSelected: context =>
        context.selectedKafkaInstance !== undefined,
      isClusterSelected: context => context.selectedCluster !== undefined,
      isConnectorSelected: context => context.selectedConnector !== undefined,
      isConnectorConfigured: context => {
        if (!context.configurationSteps) {
          return context.connectorData !== undefined;
        }
        return (
          context.connectorData !== undefined &&
          context.activeConfigurationStep ===
            context.configurationSteps.length - 1 &&
          context.isConfigurationValid === true
        );
      },
      areThereSubsteps: context =>
        context.configurationSteps
          ? context.activeConfigurationStep! > 0
          : false,
    },
    services: {
      makeConfiguratorMachine: () => configuratorMachine,
    },
  }
);
