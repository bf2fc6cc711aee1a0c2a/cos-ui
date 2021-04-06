import { KafkaRequest, ConnectorCluster, ConnectorType } from '@kas-connectors/api';
import { Machine, assign } from 'xstate';
import { kafkasMachine } from './KafkasMachine';
import { clustersMachine } from './ClustersMachine';
import { connectorsMachine } from './ConnectorsMachine';

type ConfiguratorContext = {
  authToken?: Promise<string>;
  basePath?: string;
  selectedKafkaInstance?: KafkaRequest;
  selectedCluster?: ConnectorCluster;
  selectedConnector?: ConnectorType;
  connectorData?: any;
};

export const configuratorMachine = Machine<ConfiguratorContext>(
  {
    id: 'connector-configurator',
    initial: 'selectKafka',
    context: {},
    states: {
      selectKafka: {
        invoke: {
          id: 'selectKafkaInstance',
          src: kafkasMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedInstance: context.selectedKafkaInstance,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message)
          }
        },
        on: {
          selectedInstanceChange: {
            actions: assign({
              selectedKafkaInstance: (_context, event) => event.selectedInstance
            }),
          },
          next: {
            target: 'selectCluster',
            cond: 'isKafkaInstanceSelected',
          },
        },
      },
      selectCluster: {
        invoke: {
          id: 'selectCluster',
          src: clustersMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedCluster: context.selectedCluster,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message)
          }
        },
        on: {
          selectedClusterChange: {
            actions: assign({
              selectedCluster: (_context, event) => event.selectedCluster
            }),
          },
          next: { target: 'selectConnector', cond: 'isClusterSelected' },
          prev: 'selectKafka',
        },
      },
      selectConnector: {
        invoke: {
          id: 'selectConnector',
          src: connectorsMachine,
          data: context => ({
            authToken: context.authToken,
            basePath: context.basePath,
            selectedConnector: context.selectedConnector,
          }),
          onError: {
            actions: (_context, event) => console.error(event.data.message)
          }
        },
        on: {
          selectedConnectorChange: {
            actions: assign({
              selectedConnector: (_context, event) => event.selectedConnector
            }),
          },
          next: { target: 'configureConnector', cond: 'isConnectorSelected' },
          prev: 'selectCluster',
        },
      },
      configureConnector: {
        on: {
          next: { target: 'reviewConfiguration', cond: 'isConnectorConfigured' },
          prev: 'selectConnector',
        },
      },
      reviewConfiguration: {
        on: {
          next: 'complete',
          prev: 'configureConnector',
        },
      },
      complete: {
        type: 'final',
      },
    },
    on: {
      jumpToSelectKafka: 'selectKafka',
      jumpToSelectCluster: {
        target: 'selectCluster',
        cond: 'isKafkaInstanceSelected',
      },
      jumpToSelectConnector: {
        target: 'selectConnector',
        cond: 'isClusterSelected',
      },
      jumpToConfigureConnector: { target: 'configureConnector', cond: 'isConnectorSelected' },
      jumpToReviewConfiguration: { target: 'reviewConfiguration', cond: 'isConnectorConfigured' },
    },
  },
  {
    guards: {
      isKafkaInstanceSelected: context =>
        context.selectedKafkaInstance !== undefined,
      isClusterSelected: context => context.selectedCluster !== undefined,
      isConnectorSelected: context => context.selectedConnector !== undefined,
      isConnectorConfigured: context => context.connectorData !== undefined,
    },
  }
);
