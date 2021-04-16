import {
  KafkaRequest,
  ConnectorCluster,
  ConnectorType,
} from '@kas-connectors/api';
import { createMachine, assign, send, createSchema } from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorsMachine } from './ConnectorsMachine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorType,
} from './ConfiguratorLoaderMachine';
import { multistepConfiguratorMachine } from './MultistepConfiguratorMachine';
import { createModel } from 'xstate/lib/model';

type Context = {
  authToken?: Promise<string>;
  basePath?: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedCluster?: ConnectorCluster;
  selectedConnector?: ConnectorType;
  Configurator?: ConnectorConfiguratorType;
  configurationSteps?: string[] | false;
  activeConfigurationStep?: number;
  isConfigurationValid?: boolean;
  connectorData?: unknown;
};

const creationWizardMachineSchema = {
  context: createSchema<Context>(),
};

const creationWizardMachineModel = createModel({} as Context, {
  events: {
    isValid: () => ({}),
    isInvalid: () => ({}),
    prev: () => ({}),
    next: () => ({}),
    changedStep: ({ step }: { step: number }) => ({ step }),
    jumpToSelectKafka: () => ({}),
    jumpToSelectCluster: () => ({}),
    jumpToSelectConnector: () => ({}),
    jumpToConfigureConnector: ({ subStep }: { subStep?: number }) => ({
      subStep,
    }),
    jumpToReviewConfiguration: () => ({}),
  },
});

export const creationWizardMachine = createMachine<
  typeof creationWizardMachineModel
>(
  {
    schema: creationWizardMachineSchema,
    id: 'creationWizard',
    initial: 'selectKafka',
    context: {},
    states: {
      selectKafka: {
        initial: 'selecting',
        invoke: {
          id: 'selectKafkaInstance',
          src: kafkasMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedInstance: context.selectedKafkaInstance,
          }),
          onDone: {
            target: 'selectCluster',
            actions: assign({
              selectedKafkaInstance: (_, event) => event.data.selectedInstance,
            }),
          },
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        states: {
          selecting: {
            on: {
              isValid: 'valid',
            },
          },
          valid: {
            on: {
              isInvalid: 'selecting',
              next: {
                actions: send('confirm', { to: 'selectKafkaInstance' }),
              },
            },
          },
        },
      },
      selectCluster: {
        initial: 'selecting',
        invoke: {
          id: 'selectCluster',
          src: clustersMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedCluster: context.selectedCluster,
          }),
          onDone: {
            target: 'selectConnector',
            actions: assign({
              selectedCluster: (_, event) => event.data.selectedCluster,
            }),
          },
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        states: {
          selecting: {
            on: {
              isValid: 'valid',
            },
          },
          valid: {
            on: {
              isInvalid: 'selecting',
              next: {
                actions: send('confirm', { to: 'selectCluster' }),
              },
            },
          },
        },
        on: {
          prev: 'selectKafka',
        },
      },
      selectConnector: {
        initial: 'selecting',
        invoke: {
          id: 'selectConnector',
          src: connectorsMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedConnector: context.selectedConnector,
          }),
          onDone: {
            target: 'configureConnector',
            actions: assign((_context, event) => ({
              selectedConnector: event.data.selectedConnector,
              connectorData: false,
              activeConfigurationStep: 0,
              isConfigurationValid: false,
              configurationSteps: false,
            })),
          },
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        states: {
          selecting: {
            on: {
              isValid: 'valid',
            },
          },
          valid: {
            on: {
              isInvalid: 'selecting',
              next: {
                actions: send('confirm', { to: 'selectConnector' }),
              },
            },
          },
        },
        on: {
          prev: 'selectCluster',
        },
      },
      configureConnector: {
        initial: 'loadConfigurator',
        states: {
          loadConfigurator: {
            invoke: {
              id: 'configuratorLoader',
              src: 'makeConfiguratorLoaderMachine',
              data: context => ({
                connector: context.selectedConnector,
              }),
              onDone: {
                target: 'selectConfigurator',
                actions: assign((_context, event) => ({
                  Configurator: event.data.Configurator,
                  configurationSteps: event.data.steps,
                })),
              },
              onError: {
                actions: (_context, event) => console.error(event.data.message),
              },
            },
          },
          selectConfigurator: {
            always: [
              {
                target: 'multistepConfigurator',
                cond: context => context.configurationSteps !== false,
              },
              { target: 'simpleConfigurator' },
            ],
          },
          multistepConfigurator: {
            id: 'multistepConfigurator',
            initial: 'configuring',
            invoke: {
              id: 'multistepConfiguratorRef',
              src: multistepConfiguratorMachine,
              data: context => ({
                connector: context.selectedConnector,
                steps: context.configurationSteps,
                activeStep: context.activeConfigurationStep,
              }),
              onDone: {
                target: '#creationWizard.reviewConfiguration',
                actions: assign((_, event) => ({
                  connectorData: event.data.configuration || true,
                })),
              },
              onError: {
                actions: (_context, event) => console.error(event.data.message),
              },
            },
            states: {
              configuring: {
                on: {
                  isValid: 'valid',
                },
              },
              valid: {
                on: {
                  isInvalid: 'configuring',
                  next: {
                    actions: send('next', { to: 'multistepConfiguratorRef' }),
                  },
                },
              },
            },
            on: {
              prev: [
                {
                  actions: send('prev', { to: 'multistepConfiguratorRef' }),
                  cond: 'areThereSubsteps',
                },
                { target: '#creationWizard.selectConnector' },
              ],
              changedStep: {
                actions: assign({
                  activeConfigurationStep: (_, event) => event.step,
                }),
              },
            },
          },
          simpleConfigurator: {
            on: {
              prev: [
                // {
                //   actions: send('prev', { to: 'configureConnector' }),
                //   cond: 'areThereSubsteps',
                // },
                { target: '#creationWizard.selectConnector' },
              ],
            },
          },
        },
      },
      reviewConfiguration: {
        on: {
          prev: 'configureConnector',
        },
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
          activeConfigurationStep: event.subStep || 0,
        })),
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
        const subStep = (event as { subStep?: number }).subStep;
        if (subStep) {
          return (
            context.selectedConnector !== undefined &&
            (context.connectorData !== undefined ||
              subStep <= context.activeConfigurationStep!)
          );
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
      areThereSubsteps: context => context.activeConfigurationStep! > 0,
    },
    services: {
      makeConfiguratorLoaderMachine: () => configuratorLoaderMachine,
    },
  }
);
