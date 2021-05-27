import { ConnectorType } from '@cos-ui/api';
import { useInterpret, useSelector } from '@xstate/react';
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';
import { ClustersMachineActorRef } from './ClustersMachine';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorResponse,
} from './ConfiguratorLoaderMachine';
import {
  creationWizardMachine,
  CreationWizardMachineInterpreterFromType,
} from './CreationWizardMachine';
import { KafkaMachineActorRef } from './KafkasMachine';

const CreationWizardMachineService = createContext<
  CreationWizardMachineInterpreterFromType
>(null);

type CreationWizardMachineProviderPropsType = {
  authToken?: Promise<string>;
  basePath?: string;
  fetchConfigurator: (
    connector: ConnectorType
  ) => Promise<ConnectorConfiguratorResponse>;
};

export const CreationWizardMachineProvider: FunctionComponent<CreationWizardMachineProviderPropsType> = ({
  children,
  authToken,
  basePath,
  fetchConfigurator,
}) => {
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
        authToken,
        basePath,
      },
      services: {
        makeConfiguratorLoaderMachine,
      },
    }
    // state => {
    //   // subscribes to state changes
    //   console.log(state.value);
    // }
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

export const useCreationWizardMachineKafkasActor = (): KafkaMachineActorRef => {
  const service = useCreationWizardMachineService();
  return useSelector(
    service,
    useCallback(
      (state: typeof service.state) =>
        state.children.selectKafkaInstance as KafkaMachineActorRef,
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
        state.children.selectCluster as ClustersMachineActorRef,
      [service]
    )
  );
};
