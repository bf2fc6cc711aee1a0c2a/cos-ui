import { Machine, assign } from 'xstate';
import { kafkaInstancesMachine } from './KafkaInstancesMachine';

type ConfiguratorContext = {
  authToken?: string;
  selectedKafkaInstance?: string;
  selectedCluster?: string;
  connectorType?: any;
  connectorData?: any;
};

export const configuratorMachine = Machine<ConfiguratorContext>(
  {
    id: 'connector-configurator',
    initial: 'selectKafka',
    context: {
      authToken: 'asdasdasd',
      selectedKafkaInstance: undefined,
    },
    states: {
      selectKafka: {
        invoke: {
          id: 'selectKafkaInstance',
          src: kafkaInstancesMachine,
          data: context => ({
            authToken: context.authToken,
            selectedInstance: context.selectedKafkaInstance,
          }),
        },
        on: {
          selectedKafkaInstance: {
            actions: assign({
              selectedKafkaInstance: (_context, event) =>
                event.selectedInstance,
            }),
          },
          next: {
            target: 'selectCluster',
            cond: 'isKafkaInstanceSelected',
          },
        },
      },
      selectCluster: {
        on: {
          next: { target: 'selectConnector', cond: 'isClusterSelected' },
          prev: 'selectKafka',
        },
      },
      selectConnector: {
        on: {
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
      isConnectorSelected: context => context.connectorType !== undefined,
      isConnectorConfigured: context => context.connectorData !== undefined,
    },
  }
);
