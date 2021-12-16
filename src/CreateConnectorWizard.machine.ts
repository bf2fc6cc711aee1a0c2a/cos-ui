import { assign, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  ConnectorCluster,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import { clustersMachine } from './StepClusters.machine';
import { configuratorMachine } from './StepConfigurator.machine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorType,
} from './StepConfiguratorLoader.machine';
import { connectorTypesMachine } from './StepConnectorTypes.machine';
import { kafkasMachine } from './StepKafkas.machine';
import { reviewMachine } from './StepReview.machine';
import { basicMachine } from './StepBasic.machine';
import { UserProvidedServiceAccount } from './api';
type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  kafkaManagementApiBasePath: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedCluster?: ConnectorCluster;
  selectedConnector?: ConnectorType;
  Configurator?: ConnectorConfiguratorType;
  configurationSteps?: string[] | false;
  activeConfigurationStep?: number;
  isConfigurationValid?: boolean;
  connectorConfiguration?: unknown;
  name: string;
  userServiceAccount: UserProvidedServiceAccount;
  onSave?: () => void;
};

const model = createModel({} as Context, {
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
    jumpToBasicConfiguration: () => ({}),
    jumpToReviewConfiguration: () => ({}),
  },
  actions: {
    notifySave: () => ({}),
  },
});

export const creationWizardMachine = model.createMachine(
  {
    id: 'creationWizard',
    initial: 'selectConnector',
    context: model.initialContext,
    states: {
      selectConnector: {
        initial: 'selecting',
        invoke: {
          id: 'selectConnectorRef',
          src: connectorTypesMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
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
                actions: send('confirm', { to: 'selectConnectorRef' }),
              },
            },
          },
        },
      },
      selectKafka: {
        initial: 'selecting',
        invoke: {
          id: 'selectKafkaInstanceRef',
          src: kafkasMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
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
                actions: send('confirm', { to: 'selectKafkaInstanceRef' }),
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
          id: 'selectClusterRef',
          src: clustersMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
            selectedCluster: context.selectedCluster,
          }),
          onDone: {
            target: 'basicConfiguration',
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
                actions: send('confirm', { to: 'selectClusterRef' }),
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
              data: (context) => ({
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
            initial: 'submittable',
            invoke: {
              id: 'configuratorRef',
              src: configuratorMachine,
              data: (context) => ({
                connector: context.selectedConnector,
                configuration: context.connectorConfiguration,
                steps: context.configurationSteps || ['single step'],
                activeStep: context.activeConfigurationStep || 0,
                isActiveStepValid: context.connectorConfiguration !== false,
              }),
              onDone: {
                target: '#creationWizard.reviewConfiguration', // incase of Basic 
                actions: assign((_, event) => ({
                  connectorConfiguration: event.data.configuration || true,
                })),
              },
              onError: {
                actions: (_context, event) => console.error(event.data.message),
              },
            },
            states: {
              submittable: {
                on: {
                  isInvalid: 'invalid',
                  next: {
                    actions: send('next', { to: 'configuratorRef' }),
                  },
                },
              },
              invalid: {
                on: {
                  isValid: 'submittable',
                },
              },
            },
            on: {
              prev: [
                {
                  actions: send('prev', { to: 'configuratorRef' }),
                  cond: 'areThereSubsteps',
                },
                { target: '#creationWizard.basicConfiguration' },
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
      basicConfiguration: {
        id: 'configureBasic',
        initial: 'submittable',
        invoke: {
          id: 'basicRef',
          src: basicMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
            kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
            kafka: context.selectedKafkaInstance,
            cluster: context.selectedCluster,
            connectorType: context.selectedConnector,
            initialConfiguration: context.connectorConfiguration,            
            name: context.name,
            userServiceAccount: context.userServiceAccount,
          }),
          onDone: {
            target: 'configureConnector',
            actions: [
              assign((_, event) => ({
                name: event.data.name,
                userServiceAccount: event.data.userServiceAccount,
              }))
            ],
          },
          onError: {
            actions: (_context, event) => console.error(event.data.message),
          },
        },
        states: {
          submittable: {
            on: {
              isInvalid: 'invalid',
              next: {
                actions: send('confirm', { to: 'basicRef' }),
              },
            },
          },
          invalid: {
            on: {
              isValid: 'submittable',
            },
          },
        },
        on: {
          prev: 'selectCluster',
        },
      },
      reviewConfiguration: {
        id: 'review',
        initial: 'reviewing',
        invoke: {
          id: 'reviewRef',
          src: reviewMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
            kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
            kafka: context.selectedKafkaInstance,
            cluster: context.selectedCluster,
            connectorType: context.selectedConnector,
            initialConfiguration: context.connectorConfiguration,
            name: context.name,
            userServiceAccount: context.userServiceAccount,
          }),
          onDone: {
            target: '#creationWizard.saved',
            actions: [
              assign((_, event) => ({
                connectorConfiguration: event.data,
              })),
              'notifySave',
            ],
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
                actions: send('save', { to: 'reviewRef' }),
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
      jumpToBasicConfiguration: {
        target: 'basicConfiguration',
        cond: 'isClusterSelected',
      },
      jumpToConfigureConnector: {
        target: 'configureConnector',
        cond: 'isBasicConfigured',
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
      isKafkaInstanceSelected: (context) =>
        context.selectedKafkaInstance !== undefined,
      isClusterSelected: (context) => context.selectedCluster !== undefined,
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
      isConnectorConfigured: (context) => {
        if (!context.configurationSteps) {
          return (
            context.connectorConfiguration !== undefined &&
            context.connectorConfiguration !== false
          );
        }
        return (
          (context.connectorConfiguration !== undefined &&
            context.connectorConfiguration !== false) ||
          (context.activeConfigurationStep ===
            context.configurationSteps.length - 1 &&
            context.isConfigurationValid === true)
        );
      },
      isBasicConfigured: (context) => (
        context.userServiceAccount === undefined ? 
        context.name !== undefined && context.name.length > 0 : 
        context.name !== undefined && context.name.length > 0 && 
          (context.userServiceAccount.clientId?.length > 0 && 
            context.userServiceAccount.clientSecret?.length > 0
          )
        ),
      areThereSubsteps: (context) => context.activeConfigurationStep! > 0,
    },
    actions: {
      notifySave: (context) => {
        if (context.onSave) {
          context.onSave();
        }
      },
    },
    services: {
      makeConfiguratorLoaderMachine: () => configuratorLoaderMachine,
    },
  }
);

export type CreationWizardMachineInterpreterFromType = InterpreterFrom<
  typeof creationWizardMachine
>;
