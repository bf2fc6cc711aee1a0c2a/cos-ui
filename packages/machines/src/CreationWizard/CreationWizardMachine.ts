import { KafkaRequest, ConnectorCluster, ConnectorType } from '@cos-ui/api';
import {
  createMachine,
  assign,
  send,
  createSchema,
  InterpreterFrom,
} from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorTypesMachine } from './ConnectorTypesMachine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorType,
} from './ConfiguratorLoaderMachine';
import { configuratorMachine } from './ConfiguratorMachine';
import { createModel } from 'xstate/lib/model';
import { reviewMachine } from './ReviewMachine';

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
  connectorConfiguration?: unknown;
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
    initial: 'selectConnector',
    context: {},
    states: {
      selectConnector: {
        initial: 'selecting',
        invoke: {
          id: 'selectConnector',
          src: connectorTypesMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedConnector: context.selectedConnector,
          }),
          onDone: {
            target: 'selectKafka',
            actions: assign((_context, event) => ({
              selectedConnector: event.data.selectedConnector,
              connectorConfiguration: false,
              activeConfigurationStep: 0,
              isConfigurationValid: false,
              configurationSteps: false,
            })),
          },
          onError: '.error',
        },
        states: {
          error: {},
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
      },
      selectKafka: {
        initial: 'selecting',
        invoke: {
          id: 'selectKafkaInstance',
          src: kafkasMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedInstance: context.selectedKafkaInstance,
            request: {
              page: 1,
              size: 10,
            },
          }),
          onDone: {
            target: 'selectCluster',
            actions: assign({
              selectedKafkaInstance: (_, event) => event.data.selectedInstance,
            }),
          },
          onError: '.error',
        },
        states: {
          error: {},
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
        on: {
          prev: 'selectConnector',
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
            target: 'configureConnector',
            actions: assign({
              selectedCluster: (_, event) => event.data.selectedCluster,
            }),
          },
          onError: '.error',
        },
        states: {
          error: {},
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
                target: 'configure',
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
          configure: {
            id: 'configure',
            initial: 'configuring',
            invoke: {
              id: 'configuratorRef',
              src: configuratorMachine,
              data: context => ({
                connector: context.selectedConnector,
                configuration: context.connectorConfiguration,
                steps: context.configurationSteps || ['single step'],
                activeStep: context.activeConfigurationStep || 0,
                isActiveStepValid: context.connectorConfiguration !== false,
              }),
              onDone: {
                target: '#creationWizard.reviewConfiguration',
                actions: assign((_, event) => ({
                  connectorConfiguration: event.data.configuration || true,
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
                    actions: send('next', { to: 'configuratorRef' }),
                  },
                },
              },
            },
            on: {
              prev: [
                {
                  actions: send('prev', { to: 'configuratorRef' }),
                  cond: 'areThereSubsteps',
                },
                { target: '#creationWizard.selectCluster' },
              ],
              changedStep: {
                actions: assign({
                  activeConfigurationStep: (_, event) => event.step,
                }),
              },
            },
          },
        },
      },
      reviewConfiguration: {
        id: 'review',
        initial: 'reviewing',
        invoke: {
          id: 'review',
          src: reviewMachine,
          data: context => ({
            connector: context.selectedConnector,
            initialData: context.connectorConfiguration,
          }),
          onDone: {
            target: '#creationWizard.saved',
            actions: assign((_, event) => ({
              connectorConfiguration: event.data,
            })),
          },
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        states: {
          reviewing: {
            on: {
              isValid: 'valid',
            },
          },
          valid: {
            on: {
              isInvalid: 'reviewing',
              next: {
                actions: send('next', { to: 'reviewRef' }),
              },
            },
          },
        },
        on: {
          prev: 'configureConnector',
        },
      },
      saved: {
        id: 'saved',
        type: 'final',
      },
    },
    on: {
      jumpToSelectConnector: {
        target: 'selectConnector',
      },
      jumpToSelectKafka: {
        target: 'selectKafka',
        cond: 'isConnectorSelected',
      },
      jumpToSelectCluster: {
        target: 'selectCluster',
        cond: 'isKafkaInstanceSelected',
      },
      jumpToConfigureConnector: {
        target: 'configureConnector',
        cond: 'isClusterSelected',
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
            (context.connectorConfiguration !== undefined ||
              subStep <= context.activeConfigurationStep!)
          );
        }
        return context.selectedConnector !== undefined;
      },
      isConnectorConfigured: context => {
        if (!context.configurationSteps) {
          return context.connectorConfiguration !== undefined;
        }
        return (
          context.connectorConfiguration !== undefined ||
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

export type CreationWizardMachineInterpreterFromType = InterpreterFrom<
  typeof creationWizardMachine
> | null;
