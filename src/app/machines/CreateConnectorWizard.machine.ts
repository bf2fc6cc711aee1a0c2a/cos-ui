import { UserProvidedServiceAccount } from '@apis/api';
import { clustersMachine } from '@app/machines/StepClusters.machine';
import { basicMachine } from '@app/machines/StepCommon.machine';
import { configuratorMachine } from '@app/machines/StepConfigurator.machine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorType,
} from '@app/machines/StepConfiguratorLoader.machine';
import { connectorTypesMachine } from '@app/machines/StepConnectorTypes.machine';
import { errorHandlingMachine } from '@app/machines/StepErrorHandling.machine';
import { kafkasMachine } from '@app/machines/StepKafkas.machine';
import { reviewMachine } from '@app/machines/StepReview.machine';

import { assign, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  ConnectorCluster,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

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
  sACreated: boolean;
  topic: string;
  userServiceAccount: UserProvidedServiceAccount;
  userErrorHandler: string;
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
    jumpToErrorConfiguration: () => ({}),
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
              onDone: [
                {
                  target: '#creationWizard.reviewConfiguration',
                  actions: assign((_, event) => ({
                    connectorConfiguration: event.data.configuration || true,
                  })),
                  cond: (context) => {
                    if (context.configurationSteps) {
                      return true;
                    } else {
                      return false;
                    }
                  },
                },
                {
                  target: '#creationWizard.errorConfiguration',
                  actions: assign((_, event) => ({
                    connectorConfiguration: event.data.configuration || true,
                  })),
                },
              ],
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
            sACreated: context.sACreated,
            userServiceAccount: context.userServiceAccount,
            topic: context.topic,
            userErrorHandler: context.userErrorHandler,
          }),
          onDone: {
            target: 'configureConnector',
            actions: [
              assign((_, event) => ({
                name: event.data.name,
                sACreated: event.data.sACreated,
                userServiceAccount: event.data.userServiceAccount,
              })),
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
      errorConfiguration: {
        id: 'configureErrorHandler',
        initial: 'submittable',
        invoke: {
          id: 'errorRef',
          src: errorHandlingMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
            kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
            kafka: context.selectedKafkaInstance,
            cluster: context.selectedCluster,
            connector: context.selectedConnector,
            initialConfiguration: context.connectorConfiguration,
            topic: context.topic,
            userErrorHandler: context.userErrorHandler,
          }),
          onDone: {
            target: 'reviewConfiguration',
            actions: [
              assign((_, event) => ({
                topic: event.data.topic,
                userErrorHandler: event.data.userErrorHandler,
              })),
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
                actions: send('confirm', { to: 'errorRef' }),
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
          prev: 'configureConnector',
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
            topic: context.topic,
            userErrorHandler: context.userErrorHandler,
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
          prev: [
            {
              target: '#creationWizard.configureConnector',
              cond: (context) => {
                if (context.configurationSteps) {
                  return true;
                } else {
                  return false;
                }
              },
            },
            { target: '#creationWizard.errorConfiguration' },
          ],
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
      jumpToErrorConfiguration: {
        target: 'errorConfiguration',
        cond: 'isConnectorConfigured',
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
      isBasicConfigured: (context) =>
        context.name !== undefined &&
        context.name.length > 0 &&
        context.userServiceAccount !== undefined &&
        context.userServiceAccount.clientId.length > 0 &&
        context.userServiceAccount.clientSecret.length > 0,

      isErrorHandlerConfigured: (context) =>
        context.userErrorHandler !== undefined &&
        context.userErrorHandler === 'dead_letter_queue'
          ? context.topic !== undefined && context.topic.length > 0
          : (context.topic !== undefined && context.topic.length > 0) ||
            context.userErrorHandler !== undefined,

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
