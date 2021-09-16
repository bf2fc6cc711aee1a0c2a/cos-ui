import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';

import { useInterpret, useSelector } from '@xstate/react';
import { ActorRef } from 'xstate';

import {
  ConnectorCluster,
  ConnectorType,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import {
  CreationWizardMachineInterpreterFromType,
  creationWizardMachine,
} from './CreateConnectorWizard.machine';
import {
  usePagination,
  PaginatedApiActorType,
  PaginatedApiRequest,
} from './PaginatedResponse.machine';
import { ClustersMachineActorRef } from './StepClusters.machine';
import {
  ConnectorConfiguratorResponse,
  configuratorLoaderMachine,
} from './StepConfiguratorLoader.machine';
import { ConnectorTypesMachineActorRef } from './StepConnectorTypes.machine';
import { KafkaMachineActorRef } from './StepKafkas.machine';
import { ReviewMachineActorRef } from './StepReview.machine';
import {
  ConnectorTypesQuery,
  KafkasQuery,
  UserProvidedServiceAccount,
} from './api';
import { PAGINATED_MACHINE_ID } from './constants';

export type EmittedFrom<T> = T extends ActorRef<any, infer TEmitted>
  ? TEmitted
  : never;

const CreateConnectorWizardMachineService =
  createContext<CreationWizardMachineInterpreterFromType | null>(null);

type CreateConnectorWizardProviderProps = {
  accessToken: () => Promise<string>;
  basePath: string;
  fetchConfigurator: (
    connector: ConnectorType
  ) => Promise<ConnectorConfiguratorResponse>;
  onSave: () => void;
};

export const CreateConnectorWizardProvider: FunctionComponent<CreateConnectorWizardProviderProps> =
  ({ children, accessToken, basePath, fetchConfigurator, onSave }) => {
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
        basePath,
        onSave,
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
  clusterRef: ClustersMachineActorRef;
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
        clusterRef: state.children.selectClusterRef as ClustersMachineActorRef,
        reviewRef: state.children.reviewRef as ReviewMachineActorRef,
      }),
      []
    )
  );
};

export const useClustersMachineIsReady = () => {
  const { clusterRef } = useCreateConnectorWizard();
  return useSelector(
    clusterRef,
    useCallback(
      (state: EmittedFrom<typeof clusterRef>) => {
        return state.matches({ root: { api: 'ready' } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [clusterRef]
    )
  );
};

export const useClustersMachine = () => {
  const { clusterRef } = useCreateConnectorWizard();
  const api = usePagination<ConnectorCluster, {}, ConnectorCluster>(
    clusterRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<ConnectorCluster, {}, ConnectorCluster>
  );
  const { selectedId } = useSelector(
    clusterRef,
    useCallback(
      (state: EmittedFrom<typeof clusterRef>) => ({
        selectedId: state.context.selectedCluster?.id,
      }),
      []
    )
  );
  const onSelect = useCallback(
    (selectedCluster: string) => {
      clusterRef.send({ type: 'selectCluster', selectedCluster });
    },
    [clusterRef]
  );
  const onQuery = useCallback(
    (request: PaginatedApiRequest<{}>) => {
      clusterRef.send({ type: 'api.query', ...request });
    },
    [clusterRef]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    onQuery,
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
  const api = usePagination<ConnectorType, ConnectorTypesQuery, ConnectorType>(
    connectorTypeRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<
      ConnectorType,
      ConnectorTypesQuery,
      ConnectorType
    >
  );
  const { selectedId } = useSelector(
    connectorTypeRef,
    useCallback(
      (state: EmittedFrom<typeof connectorTypeRef>) => ({
        selectedId: state.context.selectedConnector?.id,
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
  const onQuery = useCallback(
    (request: PaginatedApiRequest<ConnectorTypesQuery>) => {
      connectorTypeRef.send({ type: 'api.query', ...request });
    },
    [connectorTypeRef]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    onQuery,
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
  const api = usePagination<KafkaRequest, KafkasQuery, KafkaRequest>(
    kafkaRef.getSnapshot()?.children[
      PAGINATED_MACHINE_ID
    ] as PaginatedApiActorType<KafkaRequest, KafkasQuery, KafkaRequest>
  );
  const { selectedId } = useSelector(
    kafkaRef,
    useCallback(
      (state: EmittedFrom<typeof kafkaRef>) => ({
        selectedId: state.context.selectedInstance?.id,
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
  const onQuery = useCallback(
    (request: PaginatedApiRequest<KafkasQuery>) => {
      kafkaRef.send({ type: 'api.query', ...request });
    },
    [kafkaRef]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    onQuery,
  };
};

export const useReviewMachine = () => {
  const { reviewRef } = useCreateConnectorWizard();
  const {
    name,
    serviceAccount,
    configString,
    configStringError,
    configStringWarnings,
    isSaving,
    savingError,
  } = useSelector(
    reviewRef,
    useCallback(
      (state: EmittedFrom<typeof reviewRef>) => ({
        name: state.context.name,
        serviceAccount: state.context.userServiceAccount,
        configString: state.context.configString,
        configStringError: state.context.configStringError,
        configStringWarnings: state.context.configStringWarnings,
        isSaving: state.hasTag('saving'),
        savingError: state.context.savingError,
      }),
      []
    )
  );
  const onSetName = useCallback(
    (name: string) => {
      reviewRef.send({ type: 'setName', name });
    },
    [reviewRef]
  );
  const onSetServiceAccount = useCallback(
    (serviceAccount: UserProvidedServiceAccount | undefined) => {
      reviewRef.send({ type: 'setServiceAccount', serviceAccount });
    },
    [reviewRef]
  );
  const onUpdateConfiguration = useCallback(
    (data?: string) => {
      reviewRef.send({ type: 'updateConfiguration', data: data || '' });
    },
    [reviewRef]
  );
  return {
    name,
    serviceAccount,
    configString,
    configStringError,
    configStringWarnings,
    isSaving,
    savingError,
    onSetName,
    onSetServiceAccount,
    onUpdateConfiguration,
  };
};
