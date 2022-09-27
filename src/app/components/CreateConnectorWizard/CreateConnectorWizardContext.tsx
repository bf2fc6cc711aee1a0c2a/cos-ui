import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  KafkasSearch,
  UserProvidedServiceAccount,
} from '@apis/api';
import {
  CreationWizardMachineInterpreterFromType,
  creationWizardMachine,
} from '@app/machines/CreateConnectorWizard.machine';
import {
  usePagination,
  PaginatedApiActorType,
  PaginatedApiRequest,
  PlaceholderOrderBy,
  PlaceholderSearch,
} from '@app/machines/PaginatedResponse.machine';
import {
  ConnectorConfiguratorResponse,
  configuratorLoaderMachine,
} from '@app/machines/StepConfiguratorLoader.machine';
import { BasicMachineActorRef } from '@app/machines/StepCoreConfiguration.machine';
import { ErrorHandlingMachineActorRef } from '@app/machines/StepErrorHandling.machine';
import { ReviewMachineActorRef } from '@app/machines/StepReview.machine';
import { ConnectorTypesMachineActorRef } from '@app/machines/StepSelectConnectorType.machine';
import { KafkaMachineActorRef } from '@app/machines/StepSelectKafka.machine';
import { NamespaceMachineActorRef } from '@app/machines/StepSelectNamespace.machine';
import { PAGINATED_MACHINE_ID } from '@constants/constants';
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
      `useCreationWizardMachineService() must be used in a child of <CreationWizardMachineProvider>`
    );
  }
  return service;
};

export const useCreateConnectorWizard = (): {
  connectorTypeRef: ConnectorTypesMachineActorRef;
  kafkaRef: KafkaMachineActorRef;
  namespaceRef: NamespaceMachineActorRef;
  basicRef: BasicMachineActorRef;
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
        basicRef: state.children.basicRef as BasicMachineActorRef,
        errorRef: state.children.errorRef as ErrorHandlingMachineActorRef,
        reviewRef: state.children.reviewRef as ReviewMachineActorRef,
      }),
      []
    )
  );
};

export const useNamespaceMachineIsReady = () => {
  const { namespaceRef } = useCreateConnectorWizard();
  return useSelector(
    namespaceRef,
    useCallback(
      (state: EmittedFrom<typeof namespaceRef>) => {
        return state.matches({ root: { api: 'ready' } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [namespaceRef]
    )
  );
};

export const useNamespaceMachine = () => {
  const { namespaceRef } = useCreateConnectorWizard();
  const api = usePagination<
    ConnectorNamespace,
    PlaceholderOrderBy,
    PlaceholderSearch,
    ConnectorNamespace
  >(
    namespaceRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<
      ConnectorNamespace,
      PlaceholderOrderBy,
      PlaceholderSearch,
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
  const onSelect = useCallback(
    (selectedNamespace: string) => {
      namespaceRef.send({ type: 'selectNamespace', selectedNamespace });
    },
    [namespaceRef]
  );

  const onDeselect = useCallback(() => {
    namespaceRef.send({ type: 'deselectNamespace' });
  }, [namespaceRef]);

  const runQuery = useCallback(
    (request: PaginatedApiRequest<PlaceholderOrderBy, PlaceholderSearch>) => {
      namespaceRef.send({ type: 'api.query', ...request });
    },
    [namespaceRef]
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

  const onSelect = useCallback(
    (selectedConnector: string) => {
      connectorTypeRef.send({ type: 'selectConnector', selectedConnector });
    },
    [connectorTypeRef]
  );
  const runQuery = useCallback(
    (
      request: PaginatedApiRequest<ConnectorTypesOrderBy, ConnectorTypesSearch>
    ) => {
      connectorTypeRef.send({ type: 'api.query', ...request });
    },
    [connectorTypeRef]
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
  const onSelect = useCallback(
    (selectedInstance: string) => {
      kafkaRef.send({ type: 'selectInstance', selectedInstance });
    },
    [kafkaRef]
  );

  const onDeselect = useCallback(() => {
    kafkaRef.send({ type: 'deselectInstance' });
  }, [kafkaRef]);

  const runQuery = useCallback(
    (request: PaginatedApiRequest<PlaceholderOrderBy, KafkasSearch>) => {
      kafkaRef.send({ type: 'api.query', ...request });
    },
    [kafkaRef]
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

export const useBasicMachine = () => {
  const { basicRef } = useCreateConnectorWizard();
  const { name, sACreated, serviceAccount, duplicateMode } = useSelector(
    basicRef,
    useCallback(
      (state: EmittedFrom<typeof basicRef>) => ({
        name: state.context.name,
        sACreated: state.context.sACreated,
        serviceAccount: state.context.userServiceAccount,
        duplicateMode: state.context.duplicateMode,
      }),
      []
    )
  );
  const onSetName = useCallback(
    (name: string) => {
      basicRef.send({ type: 'setName', name });
    },
    [basicRef]
  );

  const onSetSaCreated = useCallback(
    (sACreated: boolean) => {
      basicRef.send({ type: 'setSaCreated', sACreated });
    },
    [basicRef]
  );

  const onSetServiceAccount = useCallback(
    (serviceAccount: UserProvidedServiceAccount) => {
      basicRef.send({ type: 'setServiceAccount', serviceAccount });
    },
    [basicRef]
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
