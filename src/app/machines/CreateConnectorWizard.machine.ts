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

import { assign, Event, InterpreterFrom, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

import {
  Connector,
  ConnectorNamespace,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import { ConnectorWithErrorHandler } from '../pages/ConnectorDetailsPage/components/ConfigurationTab/ErrorHandlerStep';

/**
 * The data produced by the wizard
 */
export type CreateWizardContextData = {
  connectorData?: Connector;
  connectorTypeDetails?: ConnectorType;
  connectorId?: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedNamespace?: ConnectorNamespace;
  selectedConnector?: ConnectorType;
  activeConfigurationStep?: number;
  isConfigurationValid?: boolean;
  connectorConfiguration?: unknown;
  name: string;
  sACreated: boolean;
  sAConfiguredConfirmed: boolean;
  topic?: string;
  userServiceAccount: UserProvidedServiceAccount;
  userErrorHandler?: string;
};

/**
 * Data that's only used by an instance of a wizard
 */
export type CreateWizardContextInstanceData = {
  Configurator?: ConnectorConfiguratorType;
  configurationSteps?: string[] | false;
};

/**
 * Data supplied to the wizard externally that's global to the wizard
 */
export type CreateWizardContext = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  kafkaManagementApiBasePath: string;
  onSave?: (name: string) => void;
  duplicateMode?: boolean;
} & CreateWizardContextInstanceData &
  CreateWizardContextData;

export type JumpEvent = {
  fromStep?: string;
};

type WizardGuard = (context: CreateWizardContext, event: Event<any>) => boolean;

// model
const model = createModel({} as CreateWizardContext, {
  events: {
    isValid: ({ data }: { data?: any }) => ({ data }),
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
    notifyUserUpdate: () => ({}),
  },
});

// Guards
const isConnectorSelected: WizardGuard = (context, event) => {
  const subStep = (event as { subStep?: number }).subStep;
  if (subStep) {
    return (
      context.selectedConnector !== undefined &&
      (context.connectorConfiguration !== undefined ||
        subStep <= context.activeConfigurationStep!)
    );
  }
  return context.selectedConnector !== undefined;
};

const isKafkaInstanceSelected: WizardGuard = (context, _event) =>
  context.selectedKafkaInstance !== undefined;

const isNamespaceSelected: WizardGuard = (context, _event) =>
  context.selectedNamespace !== undefined;

const isCoreConfigurationConfigured: WizardGuard = (context, _event) => {
  return (
    context.name !== undefined &&
    context.name.length > 0 &&
    context.userServiceAccount !== undefined &&
    context.userServiceAccount.clientId.length > 0 &&
    context.userServiceAccount.clientSecret.length > 0
  );
};

const isErrorHandlerConfigured: WizardGuard = (context, _event) => {
  // Currently the error_handler field is only for Camel based connectors, for
  // now we'll short circuit this for Debezium based connectors
  if (
    context.activeConfigurationStep! > 0 &&
    context.selectedConnector &&
    context.selectedConnector!.labels &&
    context.selectedConnector!.labels!.find((val) =>
      val.startsWith('debezium')
    ) !== undefined
  ) {
    return true;
  }
  return context.userErrorHandler !== undefined &&
    context.userErrorHandler === 'dead_letter_queue'
    ? context.topic !== undefined && context.topic.length > 0
    : (context.topic !== undefined && context.topic.length > 0) ||
        context.userErrorHandler !== undefined;
};

const isConnectorConfigured: WizardGuard = (context, _event) => {
  if (!context.configurationSteps) {
    return (
      context.connectorConfiguration !== undefined &&
      context.connectorConfiguration !== false &&
      isErrorHandlerConfigured(context, _event)
    );
  }
  return (
    (context.connectorConfiguration !== undefined &&
      context.connectorConfiguration !== false) ||
    (context.activeConfigurationStep ===
      context.configurationSteps.length - 1 &&
      context.isConfigurationValid === true)
  );
};

const canConfigurationBeSaved: WizardGuard = (context, event) => {
  return (
    isConnectorSelected(context, event) &&
    isKafkaInstanceSelected(context, event) &&
    isNamespaceSelected(context, event) &&
    isConnectorConfigured(context, event) &&
    isCoreConfigurationConfigured(context, event) &&
    isErrorHandlerConfigured(context, event)
  );
};

// Machine
export const creationWizardMachine = model.createMachine(
  {
    id: 'creationWizard',
    initial: 'selectConnector',
    predictableActionArguments: true,
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
              selectedConnector: context.connectorTypeDetails,
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
            always: [
              { target: 'valid', cond: 'duplicateMode' },
              {
                target: 'valid',
                cond: 'isConnectorSelected',
              },
            ],
          },
          valid: {
            entry: ['notifyUserUpdate'],
            on: {
              isValid: { actions: 'notifyUserUpdate' },
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
            entry: ['notifyUserUpdate'],
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
            entry: ['notifyUserUpdate'],
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
          id: 'coreConfigurationRef',
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
              sAConfiguredConfirmed:
                context.duplicateMode || context.sAConfiguredConfirmed,
            };
          },
          onDone: {
            target: 'configureConnector',
            actions: assign((context, event) => ({
              name: event.data.name,
              sACreated: event.data.sACreated,
              sAConfiguredConfirmed: event.data.sAConfiguredConfirmed,
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
                actions: send('confirm', { to: 'coreConfigurationRef' }),
              },
            },
          },
          invalid: {
            entry: ['notifyUserUpdate'],
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
                entry: ['notifyUserUpdate'],
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
            entry: ['notifyUserUpdate'],
            on: {
              isInvalid: 'invalid',
              next: {
                actions: send('confirm', { to: 'errorRef' }),
              },
            },
          },
          invalid: {
            entry: ['notifyUserUpdate'],
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
            always: [{ target: 'valid', cond: 'canConfigurationBeSaved' }],
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
      isConnectorSelected,
      isKafkaInstanceSelected,
      isNamespaceSelected,
      isConnectorConfigured,
      isCoreConfigurationConfigured,
      isErrorHandlerConfigured,
      canConfigurationBeSaved,
      areThereSubsteps: (context) => context.activeConfigurationStep! > 0,
      duplicateMode: (context) => context.duplicateMode === true,
    },
    actions: {
      notifySave: (context) => {
        if (context.onSave) {
          context.onSave(context.name);
        }
      },
      notifyUserUpdate: (context, event: any) => {
        const { updatedValue, updatedStep } = event.data || {};
        if (updatedValue && updatedStep) {
          switch (updatedStep) {
            case SELECT_CONNECTOR_TYPE:
              context.selectedConnector = updatedValue;
              context.connectorTypeDetails = event.data.connectorTypeDetails;
              context.connectorConfiguration = false;
              context.activeConfigurationStep = 0;
              context.isConfigurationValid = false;
              context.configurationSteps = false;
              context.userErrorHandler = undefined;
              context.topic = undefined;
              break;
            case SELECT_KAFKA_INSTANCE:
              context.selectedKafkaInstance = updatedValue;
              break;
            case SELECT_NAMESPACE:
              context.selectedNamespace = updatedValue;
              break;
            case CORE_CONFIGURATION:
              context.userServiceAccount = updatedValue;
              context.name = event.data.name;
              break;
            case CONNECTOR_SPECIFIC:
              context.connectorConfiguration = updatedValue;
              break;
            case ERROR_HANDLING:
              context.userErrorHandler = updatedValue;
              context.topic = event.data.topic;
              break;
          }
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
