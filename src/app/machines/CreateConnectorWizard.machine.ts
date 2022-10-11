import { UserProvidedServiceAccount } from '@apis/api';
import { configuratorMachine } from '@app/machines/StepConfigurator.machine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorType,
} from '@app/machines/StepConfiguratorLoader.machine';
import { coreConfigurationMachine } from '@app/machines/StepCoreConfiguration.machine';
import { errorHandlingMachine } from '@app/machines/StepErrorHandling.machine';
import { reviewMachine } from '@app/machines/StepReview.machine';
import { selectConnectorTypeMachine } from '@app/machines/StepSelectConnectorType.machine';
import { selectKafkaMachine } from '@app/machines/StepSelectKafka.machine';
import { selectNamespaceMachine } from '@app/machines/StepSelectNamespace.machine';
import {
  SELECT_CONNECTOR_TYPE,
  SELECT_KAFKA_INSTANCE,
  SELECT_NAMESPACE,
  CORE_CONFIGURATION,
  CONNECTOR_SPECIFIC,
  ERROR_HANDLING,
  REVIEW_CONFIGURATION,
} from '@constants/constants';

import { assign, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  Connector,
  ConnectorNamespace,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import { ConnectorWithErrorHandler } from './../pages/ConnectorDetailsPage/ConfigurationTab/ErrorHandlerStep';

type Context = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  kafkaManagementApiBasePath: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedNamespace?: ConnectorNamespace;
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
  onSave?: (name: string) => void;
  connectorData?: Connector;
  connectorTypeDetails?: ConnectorType;
  connectorId?: string;
  duplicateMode?: boolean;
};

export type JumpEvent = {
  fromStep?: string;
};

const model = createModel({} as Context, {
  events: {
    isValid: () => ({}),
    isInvalid: () => ({}),
    prev: () => ({}),
    next: () => ({}),
    changedStep: ({ step }: { step: number }) => ({ step }),
    jumpToSelectKafka: () => ({} as JumpEvent),
    jumpToSelectNamespace: () => ({} as JumpEvent),
    jumpToSelectConnector: () => ({} as JumpEvent),
    jumpToConfigureConnector: ({ subStep }: { subStep?: number }) =>
      ({
        subStep,
      } as JumpEvent & { subStep?: number }),
    jumpToCoreConfiguration: () => ({} as JumpEvent),
    jumpToErrorConfiguration: () => ({} as JumpEvent),
    jumpToReviewConfiguration: () => ({} as JumpEvent),
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
        tags: [SELECT_CONNECTOR_TYPE],
        invoke: {
          id: 'selectConnectorRef',
          src: selectConnectorTypeMachine,
          data: (context) => {
            return {
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              selectedConnector: context.duplicateMode
                ? context.connectorTypeDetails
                : context.selectedConnector,
              connectorData: context.connectorData,
              connectorTypeDetails: context.connectorTypeDetails,
              duplicateMode: context.duplicateMode,
            };
          },
          onDone: {
            target: 'selectKafka',
            actions: assign((context, event) => ({
              selectedConnector: context.duplicateMode
                ? context.connectorTypeDetails
                : event.data.selectedConnector,
              connectorData: context.connectorData,
              connectorTypeDetails: context.connectorTypeDetails,
              duplicateMode: context.duplicateMode,
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
        tags: [SELECT_KAFKA_INSTANCE],
        invoke: {
          id: 'selectKafkaInstanceRef',
          src: selectKafkaMachine,
          data: (context) => {
            return {
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafkaManagementBasePath: context.kafkaManagementApiBasePath,
              selectedInstance: context.duplicateMode
                ? context.connectorData?.kafka
                : context.selectedKafkaInstance,
              connectorData: context.connectorData,
              connectorTypeDetails: context.connectorTypeDetails,
              duplicateMode: context.duplicateMode,
              request: {
                page: 1,
                size: 10,
              },
            };
          },
          onDone: {
            target: 'selectNamespace',
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
          prev: {
            target: 'selectConnector',
          },
        },
      },
      selectNamespace: {
        initial: 'selecting',
        tags: [SELECT_NAMESPACE],
        invoke: {
          id: 'selectNamespaceRef',
          src: selectNamespaceMachine,
          data: (context) => ({
            accessToken: context.accessToken,
            connectorsApiBasePath: context.connectorsApiBasePath,
            selectedNamespace: context.duplicateMode
              ? {
                  id: context.connectorData?.namespace_id,
                }
              : context.selectedNamespace,
            connectorData: context.connectorData,
            connectorTypeDetails: context.connectorTypeDetails,
            duplicateMode: context.duplicateMode,
          }),
          onDone: {
            target: 'coreConfiguration',
            actions: assign({
              selectedNamespace: (_, event) => event.data.selectedNamespace,
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
                actions: send('confirm', { to: 'selectNamespaceRef' }),
              },
            },
          },
        },
        on: {
          prev: {
            target: 'selectKafka',
          },
        },
      },
      coreConfiguration: {
        id: 'coreConfiguration',
        initial: 'submittable',
        tags: [CORE_CONFIGURATION],
        invoke: {
          id: 'basicRef',
          src: coreConfigurationMachine,
          data: (context) => {
            return {
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
              kafka: context.selectedKafkaInstance,
              namespace: context.selectedNamespace,
              connectorType: context.selectedConnector,
              initialConfiguration: context.connectorConfiguration,
              name: context.duplicateMode
                ? context.name !== undefined
                  ? context.name
                  : context.connectorData?.name
                : context.name,

              userServiceAccount: context.duplicateMode
                ? context.userServiceAccount !== undefined
                  ? context.userServiceAccount
                  : {
                      clientId:
                        context.connectorData?.service_account.client_id,
                      clientSecret: '',
                    }
                : context.userServiceAccount,
              topic: context.topic,
              userErrorHandler: context.userErrorHandler,
              duplicateMode: context.duplicateMode,
              sACreated: context.sACreated,
            };
          },
          onDone: {
            target: 'configureConnector',
            actions: assign((context, event) => ({
              name: event.data.name,
              sACreated: event.data.sACreated,
              userServiceAccount: event.data.userServiceAccount,
              duplicateMode: context.duplicateMode,
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
          prev: {
            target: 'selectNamespace',
          },
        },
      },
      configureConnector: {
        initial: 'loadConfigurator',
        tags: [CONNECTOR_SPECIFIC],
        states: {
          loadConfigurator: {
            invoke: {
              id: 'configuratorLoader',
              src: 'makeConfiguratorLoaderMachine',
              data: (context) => {
                return {
                  connector: context.duplicateMode
                    ? context.connectorTypeDetails
                    : context.selectedConnector,
                  duplicateMode: context.duplicateMode,
                };
              },
              onDone: {
                target: 'configure',
                actions: assign((context, event) => ({
                  Configurator: event.data.Configurator,
                  configurationSteps: event.data.steps,
                  duplicateMode: context.duplicateMode,
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
              data: (context) => {
                return {
                  connector: context.duplicateMode
                    ? context.connectorTypeDetails
                    : context.selectedConnector,
                  configuration: context.duplicateMode
                    ? context.connectorConfiguration
                      ? context.connectorConfiguration
                      : context.connectorData?.connector
                    : context.connectorConfiguration,
                  name: context.name,
                  steps: context.configurationSteps || ['single step'],
                  activeStep: context.activeConfigurationStep || 0,
                  isActiveStepValid:
                    context.duplicateMode ||
                    context.connectorConfiguration !== false,
                  duplicateMode: context.duplicateMode,
                  connectorData: context.connectorData,
                };
              },
              onDone: [
                {
                  target: '#creationWizard.reviewConfiguration',
                  actions: assign((context, event) => ({
                    connectorConfiguration: event.data.configuration || true,
                    duplicateMode: context.duplicateMode,
                    connectorData: context.connectorData,
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
                {
                  target: '#creationWizard.coreConfiguration',
                },
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
      errorConfiguration: {
        id: 'configureErrorHandler',
        initial: 'submittable',
        tags: [ERROR_HANDLING],
        invoke: {
          id: 'errorRef',
          src: errorHandlingMachine,
          data: (context) => {
            return {
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
              kafka: context.selectedKafkaInstance,
              namespace: context.selectedNamespace,
              connector: context.selectedConnector,
              configuration: context.connectorConfiguration,
              initialConfiguration: context.connectorConfiguration,
              topic: context.topic,
              name: context.name,
              duplicateMode: context.duplicateMode,
              userErrorHandler: context.duplicateMode
                ? context.userErrorHandler
                  ? context.userErrorHandler
                  : (
                      context.connectorData
                        ?.connector as ConnectorWithErrorHandler
                    )?.error_handler
                : context.userErrorHandler,
            };
          },
          onDone: {
            target: 'reviewConfiguration',
            actions: assign((context, event) => ({
              topic: event.data.topic,
              userErrorHandler: event.data.userErrorHandler,
              duplicateMode: context.duplicateMode,
              name: context.name,
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
          prev: {
            target: 'configureConnector',
          },
        },
      },
      reviewConfiguration: {
        id: 'review',
        initial: 'reviewing',
        tags: [REVIEW_CONFIGURATION],
        invoke: {
          id: 'reviewRef',
          src: reviewMachine,
          data: (context) => {
            return {
              accessToken: context.accessToken,
              connectorsApiBasePath: context.connectorsApiBasePath,
              kafkaManagementApiBasePath: context.kafkaManagementApiBasePath,
              kafka: context.selectedKafkaInstance,
              namespace: context.selectedNamespace,
              connectorType: context.selectedConnector,
              configuration: context.connectorConfiguration,
              initialConfiguration: context.connectorConfiguration,
              name: context.name,
              userServiceAccount: context.userServiceAccount,
              topic: context.topic,
              userErrorHandler: context.userErrorHandler,
              duplicateMode: context.duplicateMode,
              configurationSteps: context.configurationSteps,
            };
          },
          onDone: {
            target: '#creationWizard.saved',
            actions: [
              assign((context, event) => ({
                connectorConfiguration: event.data,
                duplicateMode: context.duplicateMode,
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
            {
              target: '#creationWizard.errorConfiguration',
            },
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
      jumpToSelectNamespace: {
        target: 'selectNamespace',
        cond: 'isKafkaInstanceSelected',
      },
      jumpToCoreConfiguration: {
        target: 'coreConfiguration',
        cond: 'isNamespaceSelected',
      },
      jumpToConfigureConnector: {
        target: 'configureConnector',
        cond: 'isCoreConfigurationConfigured',
        actions: assign((_, event) => ({
          activeConfigurationStep: event.subStep || 0,
        })),
      },
      jumpToErrorConfiguration: {
        target: 'errorConfiguration',
        cond: 'isErrorHandlerConfigured',
      },
      jumpToReviewConfiguration: {
        target: 'reviewConfiguration',
        cond: 'isConnectorConfigured',
      },
    },
  },
  {
    guards: {
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
      isKafkaInstanceSelected: (context) =>
        context.selectedKafkaInstance !== undefined,
      isNamespaceSelected: (context) => context.selectedNamespace !== undefined,
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
      isCoreConfigurationConfigured: (context) => {
        return (
          context.name !== undefined &&
          context.name.length > 0 &&
          context.userServiceAccount !== undefined &&
          context.userServiceAccount.clientId.length > 0 &&
          context.userServiceAccount.clientSecret.length > 0
        );
      },
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
          context.onSave(context.name);
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
