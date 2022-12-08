import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  ConnectorNamespaceSearch,
  KafkasSearch,
  UserProvidedServiceAccount,
} from '@apis/api';
import {
  CreationWizardMachineInterpreterFromType,
  creationWizardMachine,
  JumpEvent,
} from '@app/machines/CreateConnectorWizard.machine';
import {
  usePagination,
  PaginatedApiActorType,
  PaginatedApiRequest,
  PlaceholderOrderBy,
} from '@app/machines/PaginatedResponse.machine';
import {
  ConnectorConfiguratorResponse,
  configuratorLoaderMachine,
} from '@app/machines/StepConfiguratorLoader.machine';
import { CoreConfigurationActorRef } from '@app/machines/StepCoreConfiguration.machine';
import { ErrorHandlingMachineActorRef } from '@app/machines/StepErrorHandling.machine';
import { ReviewMachineActorRef } from '@app/machines/StepReview.machine';
import { ConnectorTypesMachineActorRef } from '@app/machines/StepSelectConnectorType.machine';
import { KafkaMachineActorRef } from '@app/machines/StepSelectKafka.machine';
import { NamespaceMachineActorRef } from '@app/machines/StepSelectNamespace.machine';
import { PAGINATED_MACHINE_ID } from '@constants/constants';
import { useAnalytics } from '@hooks/useAnalytics';
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';
import { ActorRef } from 'xstate';

import {
  Connector,
  ConnectorNamespace,
  ConnectorType,
  ObjectReference,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export type EmittedFrom<T> = T extends ActorRef<any, infer TEmitted>
  ? TEmitted
  : never;

const CreateConnectorWizardMachineService =
  createContext<CreationWizardMachineInterpreterFromType | null>(null);

type CreateConnectorWizardProviderProps = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  kafkaManagementApiBasePath: string;
  fetchConfigurator: (
    connector: ConnectorType
  ) => Promise<ConnectorConfiguratorResponse>;
  connectorData?: Connector;
  connectorTypeDetails?: ConnectorType;
  connectorId?: string;
  duplicateMode?: boolean;
  onSave: (name: string) => void;
};

export const CreateConnectorWizardProvider: FunctionComponent<CreateConnectorWizardProviderProps> =
  ({
    children,
    accessToken,
    connectorsApiBasePath,
    kafkaManagementApiBasePath,
    fetchConfigurator,
    onSave,
    connectorData,
    connectorTypeDetails,
    connectorId,
    duplicateMode,
  }) => {
    const { onActivity } = useAnalytics();
    const makeConfiguratorLoaderMachine = useCallback(
      () =>
        configuratorLoaderMachine.withConfig({
          services: {
            fetchConfigurator: (context) =>
              fetchConfigurator(context.connector),
          },
        }),
      [fetchConfigurator]
    );
    const service = useInterpret(creationWizardMachine, {
      devTools: true,
      context: {
        accessToken,
        connectorsApiBasePath,
        kafkaManagementApiBasePath,
        onSave,
        connectorId,
        connectorData,
        connectorTypeDetails,
        duplicateMode,
      },
      services: {
        makeConfiguratorLoaderMachine,
      },
    });
    const onUserActivity = (event: string, properties?: unknown) => {
      onActivity(
        `${duplicateMode ? 'Duplicate' : 'Create'}-${event}`,
        properties
      );
    };
    // Map state machine transitions to user activity events
    service.onTransition((state) => {
      const { selectConnectorRef, selectKafkaInstanceRef, selectNamespaceRef } =
        state.children as {
          selectConnectorRef: ConnectorTypesMachineActorRef;
          selectKafkaInstanceRef: KafkaMachineActorRef;
          selectNamespaceRef: NamespaceMachineActorRef;
        };
      const { type } = state.event;
      // this actually also carries child events
      switch (type as string) {
        case 'isValid':
          switch (true) {
            case !!selectConnectorRef:
              const { selectedConnector } =
                selectConnectorRef.getSnapshot()!.context;
              onUserActivity('Connector-Select-Connector-Selection', {
                name: selectedConnector!.name,
                id: selectedConnector!.id,
                type:
                  (selectedConnector!.labels || []).find(
                    (label: string) => label === 'source'
                  ) !== undefined
                    ? 'source'
                    : 'sink',
              });
              break;
            case !!selectKafkaInstanceRef:
              const { selectedInstance } =
                selectKafkaInstanceRef.getSnapshot()!.context;
              onUserActivity('Kafka-Select-Kafka-Selection', {
                name: selectedInstance!.name,
                createdAt: selectedInstance!.created_at,
                expiresAt: selectedInstance!.expires_at,
              });
              break;
            case !!selectNamespaceRef:
              const { selectedNamespace } =
                selectNamespaceRef.getSnapshot()!.context;
              onUserActivity('Namespace-Select-Namespace-Selection', {
                name: selectedNamespace?.name,
                expiration: selectedNamespace!.expiration
                  ? selectedNamespace!.expiration
                  : 'No Expiration',
              });
              break;
            default:
              // nothing to do
              break;
          }
          break;
        case 'next':
          onUserActivity('Connector-Next');
          break;
        case 'prev':
          onUserActivity('Connector-Back');
          break;
        case 'done.invoke.coreConfigurationRef': {
          const { data } = state.event as {
            type: string;
            data: { name: string; sACreated: boolean };
          };
          onUserActivity('Connector-Core-Complete', {
            name: data.name,
            serviceAccountCreated: data.sACreated ? 'yes' : 'no',
          });
          break;
        }
        case 'done.invoke.configuratorRef':
          onUserActivity('Connector-Specific-Complete');
          break;
        case 'done.invoke.errorRef': {
          const { data } = state.event as {
            type: string;
            data: { userErrorHandler: string };
          };
          onUserActivity('Connector-Error-Handler-Complete', {
            errorHandler: data.userErrorHandler,
          });
          break;
        }
        case 'done.invoke.reviewRef':
          onUserActivity('Connector-Final');
          break;
        case 'jumpToSelectConnector':
        case 'jumpToSelectKafka':
        case 'jumpToSelectNamespace':
        case 'jumpToCoreConfiguration':
        case 'jumpToErrorConfiguration':
        case 'jumpToReviewConfiguration': {
          const { fromStep } = state.event as JumpEvent;
          onUserActivity(type, { fromStep });
          break;
        }
        case 'jumpToConfigureConnector': {
          const { fromStep, subStep } = state.event as JumpEvent & {
            subStep?: number;
          };
          onUserActivity(type, { fromStep, subStep });
          break;
        }
        default:
          // nothing to do
          break;
      }
    });
    return (
      <CreateConnectorWizardMachineService.Provider value={service}>
        {children}
      </CreateConnectorWizardMachineService.Provider>
    );
  };

export const useCreateConnectorWizardService = () => {
  const service = useContext(CreateConnectorWizardMachineService);
  if (!service) {
    throw new Error(
      `useCreateConnectorWizardService() must be used as a child of <CreateConnectorWizardProvider>`
    );
  }
  return service;
};

export const useCreateConnectorWizard = (): {
  connectorTypeRef: ConnectorTypesMachineActorRef;
  kafkaRef: KafkaMachineActorRef;
  namespaceRef: NamespaceMachineActorRef;
  coreConfigurationRef: CoreConfigurationActorRef;
  errorRef: ErrorHandlingMachineActorRef;
  reviewRef: ReviewMachineActorRef;
} => {
  const service = useCreateConnectorWizardService();
  return useSelector(
    service,
    useCallback(
      (state: EmittedFrom<typeof service>) => ({
        connectorTypeRef: state.children
          .selectConnectorRef as ConnectorTypesMachineActorRef,
        kafkaRef: state.children.selectKafkaInstanceRef as KafkaMachineActorRef,
        namespaceRef: state.children
          .selectNamespaceRef as NamespaceMachineActorRef,
        coreConfigurationRef: state.children
          .coreConfigurationRef as CoreConfigurationActorRef,
        errorRef: state.children.errorRef as ErrorHandlingMachineActorRef,
        reviewRef: state.children.reviewRef as ReviewMachineActorRef,
      }),
      []
    )
  );
};

export const useConnectorTypesMachineIsReady = () => {
  const { connectorTypeRef } = useCreateConnectorWizard();
  return useSelector(
    connectorTypeRef,
    useCallback(
      (state: EmittedFrom<typeof connectorTypeRef>) => {
        return state.matches({ root: { api: 'ready' } });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [connectorTypeRef]
    )
  );
};

export const useConnectorTypesMachine = () => {
  const { connectorTypeRef } = useCreateConnectorWizard();
  const { onActivity } = useAnalytics();

  const api = usePagination<
    ConnectorType,
    ConnectorTypesOrderBy,
    ConnectorTypesSearch,
    ConnectorType
  >(
    connectorTypeRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<
      ConnectorType,
      ConnectorTypesOrderBy,
      ConnectorTypesSearch,
      ConnectorType
    >
  );
  const { selectedId, connectorTypeDetails, duplicateMode } = useSelector(
    connectorTypeRef,
    useCallback(
      (state: EmittedFrom<typeof connectorTypeRef>) => ({
        selectedId: (state.context.selectedConnector as ObjectReference)?.id,
        duplicateMode: state.context.duplicateMode,
        connectorTypeDetails: state.context.connectorTypeDetails,
      }),
      []
    )
  );
  const onDeselect = useCallback(() => {
    connectorTypeRef.send({ type: 'deselectConnector' });
  }, [connectorTypeRef]);

  const onSelect = useCallback(
    (selectedConnector: string) => {
      onDeselect();
      connectorTypeRef.send({ type: 'selectConnector', selectedConnector });
    },
    [connectorTypeRef, onDeselect]
  );

  const runQuery = useCallback(
    (
      request: PaginatedApiRequest<ConnectorTypesOrderBy, ConnectorTypesSearch>
    ) => {
      onActivity(
        `${duplicateMode ? 'Duplicate' : 'Create'}-Search-Connectors`,
        request
      );
      connectorTypeRef.send({ type: 'api.query', ...request });
    },
    [connectorTypeRef, duplicateMode, onActivity]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    runQuery,
    connectorTypeDetails,
    duplicateMode,
  };
};

export const useKafkasMachineIsReady = () => {
  const { kafkaRef } = useCreateConnectorWizard();
  return useSelector(
    kafkaRef,
    useCallback(
      (state: EmittedFrom<typeof kafkaRef>) => {
        return state.matches({ root: { api: 'ready' } });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [kafkaRef]
    )
  );
};

export const useKafkasMachine = () => {
  const { kafkaRef } = useCreateConnectorWizard();
  const { onActivity } = useAnalytics();
  const api = usePagination<
    KafkaRequest,
    PlaceholderOrderBy,
    KafkasSearch,
    KafkaRequest
  >(
    kafkaRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<
      KafkaRequest,
      PlaceholderOrderBy,
      KafkasSearch,
      KafkaRequest
    >
  );
  const { selectedId, duplicateMode } = useSelector(
    kafkaRef,
    useCallback(
      (state: EmittedFrom<typeof kafkaRef>) => ({
        selectedId: state.context.selectedInstance?.id,
        duplicateMode: state.context.duplicateMode,
      }),
      []
    )
  );

  const onDeselect = useCallback(() => {
    kafkaRef.send({ type: 'deselectInstance' });
  }, [kafkaRef]);

  const onSelect = useCallback(
    (selectedInstance: string) => {
      onDeselect();
      kafkaRef.send({ type: 'selectInstance', selectedInstance });
    },
    [kafkaRef, onDeselect]
  );

  const runQuery = useCallback(
    (request: PaginatedApiRequest<PlaceholderOrderBy, KafkasSearch>) => {
      onActivity(
        `${duplicateMode ? 'Duplicate' : 'Create'}-Search-Kafkas`,
        request
      );
      kafkaRef.send({ type: 'api.query', ...request });
    },
    [kafkaRef, duplicateMode, onActivity]
  );
  return {
    ...api,
    selectedId,
    duplicateMode,
    onSelect,
    onDeselect,
    runQuery,
  };
};

export const useNamespaceMachineIsReady = () => {
  const { namespaceRef } = useCreateConnectorWizard();
  return useSelector(
    namespaceRef,
    useCallback((state: EmittedFrom<typeof namespaceRef>) => {
      return state.matches({ root: { api: 'ready' } });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );
};

export const useNamespaceMachine = () => {
  const { namespaceRef } = useCreateConnectorWizard();
  const { onActivity } = useAnalytics();
  const api = usePagination<
    ConnectorNamespace,
    PlaceholderOrderBy,
    ConnectorNamespaceSearch,
    ConnectorNamespace
  >(
    namespaceRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<
      ConnectorNamespace,
      PlaceholderOrderBy,
      ConnectorNamespaceSearch,
      ConnectorNamespace
    >
  );
  const { selectedId, duplicateMode } = useSelector(
    namespaceRef,
    useCallback(
      (state: EmittedFrom<typeof namespaceRef>) => ({
        selectedId: state.context.selectedNamespace?.id,
        duplicateMode: state.context.duplicateMode,
      }),
      []
    )
  );
  const onDeselect = useCallback(() => {
    namespaceRef.send({ type: 'deselectNamespace' });
  }, [namespaceRef]);

  const onSelect = useCallback(
    (selectedNamespace: string) => {
      onDeselect();
      namespaceRef.send({ type: 'selectNamespace', selectedNamespace });
    },
    [namespaceRef, onDeselect]
  );

  const runQuery = useCallback(
    (
      request: PaginatedApiRequest<PlaceholderOrderBy, ConnectorNamespaceSearch>
    ) => {
      onActivity(
        `${duplicateMode ? 'Duplicate' : 'Create'}-Search-Namespaces`,
        request
      );
      namespaceRef.send({ type: 'api.query', ...request });
    },
    [namespaceRef, duplicateMode, onActivity]
  );

  const onRefresh = useCallback(() => {
    namespaceRef.send({ type: 'api.refresh' });
  }, [namespaceRef]);
  return {
    ...api,
    selectedId,
    duplicateMode,
    onSelect,
    onDeselect,
    onRefresh,
    runQuery,
  };
};

export const useCoreConfigurationMachine = () => {
  const { coreConfigurationRef: coreConfigurationRef } =
    useCreateConnectorWizard();
  const { name, sACreated, serviceAccount, duplicateMode } = useSelector(
    coreConfigurationRef,
    useCallback((state: EmittedFrom<typeof coreConfigurationRef>) => {
      return {
        name: state.context.name,
        sACreated: state.context.sACreated,
        serviceAccount: state.context.userServiceAccount,
        duplicateMode: state.context.duplicateMode,
      };
    }, [])
  );
  const onSetName = useCallback(
    (name: string) => {
      coreConfigurationRef.send({ type: 'setName', name });
    },
    [coreConfigurationRef]
  );

  const onSetSaCreated = useCallback(
    (sACreated: boolean) => {
      coreConfigurationRef.send({ type: 'setSaCreated', sACreated });
    },
    [coreConfigurationRef]
  );

  const onSetServiceAccount = useCallback(
    (serviceAccount: UserProvidedServiceAccount) => {
      coreConfigurationRef.send({ type: 'setServiceAccount', serviceAccount });
    },
    [coreConfigurationRef]
  );
  return {
    serviceAccount,
    name,
    sACreated,
    onSetSaCreated,
    onSetName,
    onSetServiceAccount,
    duplicateMode,
  };
};

export const useReviewMachine = () => {
  const { reviewRef } = useCreateConnectorWizard();
  const {
    kafka,
    namespace,
    connectorType,
    topic,
    userErrorHandler,
    name,
    userServiceAccount,
    configString,
    isSaving,
    savingError,
    duplicateMode,
    configurationSteps,
  } = useSelector(
    reviewRef,
    useCallback(
      (state: EmittedFrom<typeof reviewRef>) => ({
        kafka: state.context.kafka,
        namespace: state.context.namespace,
        connectorType: state.context.connectorType,
        name: state.context.name,
        userServiceAccount: state.context.userServiceAccount,
        topic: state.context.topic,
        userErrorHandler: state.context.userErrorHandler,
        configString: state.context.configString,
        isSaving: state.hasTag('saving'),
        savingError: state.context.savingError,
        duplicateMode: state.context.duplicateMode,
        configurationSteps: state.context.configurationSteps,
      }),
      []
    )
  );

  return {
    kafka,
    namespace,
    connectorType,
    topic,
    userErrorHandler,
    name,
    userServiceAccount,
    configString,
    isSaving,
    savingError,
    duplicateMode,
    configurationSteps,
  };
};

export const useErrorHandlingMachine = () => {
  const { errorRef } = useCreateConnectorWizard();

  const { connector, topic, errorHandler, duplicateMode } = useSelector(
    errorRef,
    useCallback(
      (state: EmittedFrom<typeof errorRef>) => ({
        topic: state.context.topic,
        errorHandler: state.context.userErrorHandler,
        connector: state.context.connector,
        duplicateMode: state.context.duplicateMode,
      }),
      []
    )
  );

  const onSetTopic = useCallback(
    (topic: string) => {
      errorRef.send({ type: 'setTopic', topic });
    },
    [errorRef]
  );

  const onSetErrorHandler = useCallback(
    (errorHandler: string) => {
      errorRef.send({ type: 'setErrorHandler', errorHandler });
    },
    [errorRef]
  );

  return {
    errorHandler,
    topic,
    onSetErrorHandler,
    onSetTopic,
    connector,
    duplicateMode,
  };
};
