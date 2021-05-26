import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { ConnectorType, KafkaRequest } from '@cos-ui/api';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorResponse,
} from './ConfiguratorLoaderMachine';
import { KafkaMachineActorRef } from './types';
import {
  creationWizardMachine,
  CreationWizardMachineInterpreterFromType,
} from './CreationWizardMachine';
import {
  PaginatedApiActorType,
  PaginatedApiRequest,
  usePagination,
} from '../shared';
import { PAGINATED_MACHINE_ID } from '../ConnectorsMachine';

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

export const useCreationWizardMachineKafkasActor = () => {
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

export const useKafkasMachineIsReady = () => {
  const actor = useCreationWizardMachineKafkasActor();
  return useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => {
        return state.matches({ root: { api: 'ready' } });
      },
      [actor]
    )
  );
};

export const useKafkasMachine = () => {
  const actor = useCreationWizardMachineKafkasActor();
  const api = usePagination<KafkaRequest>(
    actor.state.children[PAGINATED_MACHINE_ID] as PaginatedApiActorType
  );
  const { selectedId } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        selectedId: state.context.selectedInstance?.id,
      }),
      [actor]
    )
  );
  const onSelect = useCallback(
    (selectedInstance: string) => {
      actor.send({ type: 'selectInstance', selectedInstance });
    },
    [actor]
  );
  const onQuery = useCallback(
    (request: PaginatedApiRequest) => {
      actor.send({ type: 'query', ...request });
    },
    [actor]
  );
  return {
    ...api,
    selectedId,
    onSelect,
    onQuery,
  };
};
