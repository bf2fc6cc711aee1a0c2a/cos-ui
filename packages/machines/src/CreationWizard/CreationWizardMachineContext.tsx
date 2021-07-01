import { ConnectorType } from '@cos-ui/api';
import { useInterpret, useSelector } from '@xstate/react';
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';
import { ClustersMachineActorRef } from './ClustersMachine';
import { AlertVariant, useAlert } from '@bf2/ui-shared';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorResponse,
} from './ConfiguratorLoaderMachine';
import {
  creationWizardMachine,
  CreationWizardMachineInterpreterFromType,
} from './CreationWizardMachine';
import { KafkaMachineActorRef } from './KafkasMachine';
import { ReviewMachineActorRef } from './ReviewMachine';
import { ConnectorTypesMachineActorRef } from './ConnectorTypesMachine';

const CreationWizardMachineService = createContext<CreationWizardMachineInterpreterFromType | null>(
  null
);

type CreationWizardMachineProviderPropsType = {
  accessToken: () => Promise<string>;
  basePath: string;
  fetchConfigurator: (
    connector: ConnectorType
  ) => Promise<ConnectorConfiguratorResponse>;
  onSave: () => void;
};

export const CreationWizardMachineProvider: FunctionComponent<CreationWizardMachineProviderPropsType> = ({
  children,
  accessToken,
  basePath,
  fetchConfigurator,
  onSave,
}) => {
  const { addAlert } = useAlert();
  const makeConfiguratorLoaderMachine = useCallback(
    () =>
      configuratorLoaderMachine.withConfig({
        services: {
          fetchConfigurator: context => fetchConfigurator(context.connector),
        },
      }),
    [fetchConfigurator]
  );
  const service = useInterpret(
    creationWizardMachine,
    {
      devTools: true,
      context: {
        accessToken,
        basePath,
      },
      services: {
        makeConfiguratorLoaderMachine,
      },
    },
    state => {
      if (state.done) {
        debugger;
        onSave();
        addAlert({
          title: `${state.context.connectorName} connector created successfully.`,
          variant: AlertVariant.success,
        });
      }
    }
  );
  return (
    <CreationWizardMachineService.Provider value={service}>
      {children}
    </CreationWizardMachineService.Provider>
  );
};

export const useCreationWizardMachineService = () => {
  const service = useContext(CreationWizardMachineService);
  if (!service) {
    throw new Error(
      `useCreationWizardMachineService() must be used in a child of <CreationWizardMachineProvider>`
    );
  }
  return service;
};

export const useCreationWizardMachineConnectorTypesActor = (): ConnectorTypesMachineActorRef => {
  const service = useCreationWizardMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) =>
        state.children.selectConnectorRef as ConnectorTypesMachineActorRef,
      [service]
    )
  );
};

export const useCreationWizardMachineKafkasActor = (): KafkaMachineActorRef => {
  const service = useCreationWizardMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) =>
        state.children.selectKafkaInstanceRef as KafkaMachineActorRef,
      [service]
    )
  );
};

export const useCreationWizardMachineClustersActor = (): ClustersMachineActorRef => {
  const service = useCreationWizardMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) =>
        state.children.selectClusterRef as ClustersMachineActorRef,
      [service]
    )
  );
};

export const useCreationWizardMachineReviewActor = (): ReviewMachineActorRef => {
  const service = useCreationWizardMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) =>
        state.children.reviewRef as ReviewMachineActorRef,
      [service]
    )
  );
};
