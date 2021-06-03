/* eslint-disable jsx-a11y/accessible-emoji */
import React, { FunctionComponent } from 'react';
import { useMachineService } from './Context';
import { useService, useActor } from '@xstate/react';
import {
  KafkaMachineActorRef,
  ClustersMachineActorRef,
  ConnectorTypesMachineActorRef,
} from '@cos-ui/machines';
import { ConnectorCluster, ConnectorType, KafkaRequest } from '@cos-ui/api';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';

export type SelectKafkaInstanceProps = {
  actor: KafkaMachineActorRef;
};

const SelectKafkaInstance: FunctionComponent<SelectKafkaInstanceProps> = ({
  actor,
}) => {
  const [state, send] = useActor(actor);

  const instanceToSelect = (instance: KafkaRequest) => ({
    value: instance.id!,
    label: instance.name!,
  });

  switch (true) {
    case state.matches('loading'):
      return <Spinner />;
    case state.matches('failure'):
      return <Text color="red">{state.context.error}</Text>;
    default:
      const items = state.context.response?.items?.map(instanceToSelect) || [];
      const initialIndex = state.context.selectedInstance
        ? items.findIndex(i => i.value === state.context.selectedInstance?.id)
        : undefined;
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold>Select a Kafka instance</Text>
          </Box>
          {items.length > 0 ? (
            <SelectInput<string>
              items={items}
              initialIndex={initialIndex}
              onSelect={item => {
                send({ type: 'selectInstance', selectedInstance: item.value });
                send({ type: 'confirm' });
              }}
            />
          ) : (
            <Box flexDirection="column">
              <Text color="red">No Kafka instance available</Text>
              <Text>
                Please visit
                https://cloud.redhat.com/beta/application-services/openshift-streams
                to create a new instance.
              </Text>
            </Box>
          )}
        </Box>
      );
  }
};

export type SelectClusterProps = {
  actor: ClustersMachineActorRef;
};

const SelectCluster: FunctionComponent<SelectClusterProps> = ({ actor }) => {
  const [state, send] = useActor(actor);

  const instanceToSelect = (instance: ConnectorCluster) => ({
    value: instance.id!,
    label: instance.metadata!.name!,
  });

  switch (true) {
    case state.matches('loading'):
      return <Spinner />;
    case state.matches('failure'):
      return <Text color="red">{state.context.error}</Text>;
    default:
      const items = state.context.response?.items.map(instanceToSelect) || [];
      const initialIndex = state.context.selectedCluster
        ? items.findIndex(i => i.value === state.context.selectedCluster?.id)
        : undefined;
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold>Select a OCM cluster</Text>
          </Box>
          <SelectInput<string>
            items={items}
            initialIndex={initialIndex}
            onSelect={item => {
              send({ type: 'selectCluster', selectedCluster: item.value });
              send({ type: 'confirm' });
            }}
          />
        </Box>
      );
  }
};

export type SelectConnectorProps = {
  actor: ConnectorTypesMachineActorRef;
};

const SelectConnector: FunctionComponent<SelectConnectorProps> = ({
  actor,
}) => {
  const [state, send] = useActor(actor);

  const instanceToSelect = (c: ConnectorType) => ({
    value: c.id!,
    label: c.name!,
  });

  switch (true) {
    case state.matches('loading'):
      return <Spinner />;
    case state.matches('failure'):
      return <Text color="red">{state.context.error}</Text>;
    default:
      const items = state.context.connectors?.items.map(instanceToSelect) || [];
      const initialIndex = state.context.selectedConnector
        ? items.findIndex(i => i.value === state.context.selectedConnector?.id)
        : undefined;
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold>Select a connector</Text>
          </Box>
          <SelectInput<string>
            items={items}
            initialIndex={initialIndex}
            onSelect={item => {
              send({
                type: 'selectConnector',
                selectedConnector: item.value,
              });
              send({ type: 'confirm' });
            }}
          />
        </Box>
      );
  }
};

export const App: FunctionComponent = () => {
  const { exit } = useApp();
  const service = useMachineService();
  const [state, send] = useService(service);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
    if (key.tab && key.shift) {
      send('prev');
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text italic>Managed Connector creation wizard</Text>
      </Box>

      <Box width={'100%'}>
        <Box width={'25%'} minWidth={'10'}>
          <Text bold color={state.matches('selectKafka') ? 'green' : undefined}>
            Kafka instance:
          </Text>
        </Box>
        <Box>
          <Text>{state.context.selectedKafkaInstance?.name}</Text>
        </Box>
      </Box>
      <Box width={'100%'}>
        <Box width={'25%'} minWidth={'10'}>
          <Text
            bold
            color={state.matches('selectCluster') ? 'green' : undefined}
          >
            Cluster:
          </Text>
        </Box>
        <Box>
          <Text>{state.context.selectedCluster?.metadata?.name}</Text>
        </Box>
      </Box>
      <Box width={'100%'}>
        <Box width={'25%'} minWidth={'10'}>
          <Text
            bold
            color={state.matches('selectConnector') ? 'green' : undefined}
          >
            Connector:
          </Text>
        </Box>
        <Box>
          <Text>{state.context.selectedConnector?.name}</Text>
        </Box>
      </Box>
      <Box width={'100%'}>
        <Box width={'25%'} minWidth={'10'}>
          <Text
            bold
            color={state.matches('configureConnector') ? 'green' : undefined}
          >
            Configuration:
          </Text>
        </Box>
        <Box>
          <Text>{JSON.stringify(state.context.connectorConfiguration)}</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        {state.matches('selectKafka') && (
          <SelectKafkaInstance
            actor={state.children.selectKafkaInstance as KafkaMachineActorRef}
          />
        )}
        {state.matches('selectCluster') && (
          <SelectCluster
            actor={state.children.selectCluster as ClustersMachineActorRef}
          />
        )}
        {state.matches('selectConnector') && (
          <SelectConnector
            actor={
              state.children.selectConnector as ConnectorTypesMachineActorRef
            }
          />
        )}
        {state.matches('configureConnector') && <Text>TODO 😅</Text>}
      </Box>
    </Box>
  );
};
