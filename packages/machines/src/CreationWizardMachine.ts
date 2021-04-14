import {
  KafkaRequest,
  ConnectorCluster,
  ConnectorType,
} from '@kas-connectors/api';
import { createMachine, assign, send, createSchema } from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorsMachine } from './ConnectorsMachine';
import { configuratorMachine } from './ConfiguratorMachine';
import { createModel } from 'xstate/lib/model';

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

const creationWizardMachineSchema = {
  context: createSchema<Context>(),
};

const creationWizardMachineModel = createModel(
  {
  } as Context,
  {
    events: {
      prev: (payload: {}) => ({ ...payload}),
      next: (payload: {}) => ({ ...payload}),
      selectedInstanceChange: (payload: { selectedInstance: KafkaRequest }) => ({ ...payload}),
      selectedClusterChange: (payload: { selectedCluster: ConnectorCluster }) => ({ ...payload}),
      selectedConnectorChange: (payload: { selectedConnector: ConnectorType }) => ({ ...payload}),
      loaded: (payload: { steps: string[] | false;
        activeStep?: number;
        isValid: boolean; }) => ({ ...payload}),
      configurationChange: (payload: { configuration: unknown; }) => ({ ...payload}),
      jumpToSelectKafka: (payload: {}) => ({ ...payload}),
      jumpToSelectCluster: (payload: {}) => ({ ...payload}),
      jumpToSelectConnector: (payload: {}) => ({ ...payload}),
      jumpToConfigureConnector: (payload: { subStep?: number; }) => ({ ...payload}),
      jumpToReviewConfiguration: (payload: {}) => ({ ...payload}),
    },
  }
);

export const creationWizardMachine = createMachine<typeof creationWizardMachineModel>(
  {
    schema: creationWizardMachineSchema,
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
              activeConfigurationStep: 0,
              isConfigurationValid: false,
              configurationSteps: false
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
            configuration: context.connectorData
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
        actions: assign((_, event) => ({
          activeConfigurationStep: event.subStep || 0
        }))
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
      isConnectorSelected: (context, event) => {
        const subStep = (event as { subStep?: number}).subStep;
        if (subStep) {
          return context.selectedConnector !== undefined && (context.connectorData !== undefined || subStep <= context.activeConfigurationStep!);
        }
        return context.selectedConnector !== undefined;
      },
      isConnectorConfigured: context => {
        if (!context.configurationSteps) {
          return context.connectorData !== undefined;
        }
        return (
          context.connectorData !== undefined ||
          (context.activeConfigurationStep ===
            context.configurationSteps.length - 1 &&
            context.isConfigurationValid === true)
        );
      },
      areThereSubsteps: context =>
        context.configurationSteps && context.activeConfigurationStep
          ? context.activeConfigurationStep > 0
          : false,
    },
    services: {
      makeConfiguratorMachine: () => configuratorMachine,
    },
  }
);
