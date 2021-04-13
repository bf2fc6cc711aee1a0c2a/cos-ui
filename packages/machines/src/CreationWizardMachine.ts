import {
  KafkaRequest,
  ConnectorCluster,
  ConnectorType,
} from '@kas-connectors/api';
import { Machine, assign, send } from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorsMachine } from './ConnectorsMachine';
import { configuratorMachine } from './ConfiguratorMachine';

type CreationWizardContext = {
  authToken?: Promise<string>;
  basePath?: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedCluster?: ConnectorCluster;
  selectedConnector?: ConnectorType;
  configurationSteps?: string[] | false;
  activeConfigurationStep?: number;
  isConfigurationValid?: boolean;
  connectorData?: any;
};

export const creationWizardMachine = Machine<CreationWizardContext>(
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
              connectorData: undefined
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
            { actions: send('prev', { to: 'configureConnector'}), cond: 'areThereSubsteps' },
            { target: 'selectConnector' }
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
        return context.connectorData !== undefined && context.activeConfigurationStep === (context.configurationSteps.length - 1) && context.isConfigurationValid === true;
      },
      areThereSubsteps: context => context.configurationSteps ? context.activeConfigurationStep! > 0 : false
    },
    services: {
      makeConfiguratorMachine: () => configuratorMachine
    }
  }
);
