import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';
import { MemoryRouter as Router, Route } from 'react-router-dom';

import { CosContextProvider } from '../../../hooks/useCos';
import { AlertsProvider } from '../../components/Alerts/Alerts';
import { ConnectorDetailsPage } from './ConnectorDetailsPage';

const API_BASE = 'https://dummy.server';
const CONNECTOR_ID = 'cheese';

const KAFKA_ID = 'some_kafka';
const NAMESPACE_ID = 'some_namespace';
const CONNECTOR_TYPE_ID = 'milk_source_1.0';
const GET_CONNECTOR_API = `${API_BASE}/api/connector_mgmt/v1/kafka_connectors/${CONNECTOR_ID}`;
const GET_KAFKA_API = `${API_BASE}/api/kafkas_mgmt/v1/kafkas/${KAFKA_ID}`;
const GET_NAMESPACE_API = `${API_BASE}/api/connector_mgmt/v1/kafka_connector_namespaces/${NAMESPACE_ID}`;
const GET_CONNECTOR_TYPE_API = `${API_BASE}/api/connector_mgmt/v1/kafka_connector_types/${CONNECTOR_TYPE_ID}`;

const connectorResponse = {
  id: CONNECTOR_ID,
  owner: 'some_person',
  created_at: '2022-08-22T14:25:59.65854Z',
  modified_at: '2022-08-22T16:49:22.505238Z',
  name: 'Cheese Conversion Acceptor',
  connector_type_id: CONNECTOR_TYPE_ID,
  namespace_id: NAMESPACE_ID,
  desired_state: 'ready',
  kafka: {
    id: KAFKA_ID,
  },
  service_account: { client_id: 'Some client ID', client_secret: '' },
  connector: {
    data_shape: { produces: { format: 'application/json' } },
    error_handler: { stop: {} },
  },
  status: {
    state: 'ready',
  },
};

const ConnectorType = {
  id: CONNECTOR_TYPE_ID,
  schema: {
    $defs: {
      data_shape: {
        consumes: {
          type: 'object',
          additionalProperties: false,
          required: ['format'],
          properties: {
            format: {
              type: 'string',
              default: 'application/octet-stream',
              enum: ['application/octet-stream'],
            },
          },
        },
      },
      error_handler: {
        log: {
          type: 'object',
          additionalProperties: false,
        },
        stop: {
          type: 'object',
          additionalProperties: false,
        },
        dead_letter_queue: {
          type: 'object',
          additionalProperties: false,
          required: ['topic'],
          properties: {
            topic: {
              type: 'string',
              title: 'Dead Letter Topic Name',
              description:
                'The name of the Kafka topic used as dead letter queue',
            },
          },
        },
      },
    },
    required: [],
    properties: {
      data_shape: {
        type: 'object',
        additionalProperties: false,
        properties: {
          consumes: {
            $ref: '#/$defs/data_shape/consumes',
          },
        },
      },
      error_handler: {
        type: 'object',
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            required: ['log'],
            properties: {
              log: {
                $ref: '#/$defs/error_handler/log',
              },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['stop'],
            properties: {
              stop: {
                $ref: '#/$defs/error_handler/stop',
              },
            },
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['dead_letter_queue'],
            properties: {
              dead_letter_queue: {
                $ref: '#/$defs/error_handler/dead_letter_queue',
              },
            },
          },
        ],
        default: {
          stop: {},
        },
      },
    },
  },
};

export default {
  title: 'Pages/Connector Details Page/Overview',
  component: ConnectorDetailsPage,
  decorators: [
    (Story) => (
      <CosContextProvider
        getToken={() => Promise.resolve('')}
        connectorsApiBasePath={API_BASE}
        kafkaManagementApiBasePath={API_BASE}
      >
        <Router initialEntries={[`/${CONNECTOR_ID}`]}>
          <Route path="/:id">
            <AlertsProvider>
              <Story />
            </AlertsProvider>
          </Route>
        </Router>
      </CosContextProvider>
    ),
  ],
  args: {
    onSave: () => {
      console.log('On save');
    },
    onDuplicateConnector: () => {
      console.log('On Duplicate Connector');
    },
  },
} as ComponentMeta<typeof ConnectorDetailsPage>;

const Template: ComponentStory<typeof ConnectorDetailsPage> = (args) => (
  <ConnectorDetailsPage {...args} />
);

export const InitialLoading = Template.bind({});
InitialLoading.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(ctx.delay('infinite'));
    }),
  ],
};

export const WithCamelConnector = Template.bind({});
WithCamelConnector.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(ctx.json(connectorResponse));
    }),
    rest.get(GET_NAMESPACE_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: NAMESPACE_ID,
          name: 'Preview-namespace-jxki1e3x',
          expiration: new Date(Date.now() + 86400000).toLocaleString(),
        })
      );
    }),
    rest.get(GET_KAFKA_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: KAFKA_ID,
          name: 'Some Kafka',
        })
      );
    }),
    rest.get(GET_CONNECTOR_TYPE_API, (_req, res, ctx) => {
      return res(ctx.json(ConnectorType));
    }),
  ],
};

export const WithExpiredKI = Template.bind({});
WithExpiredKI.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(ctx.json(connectorResponse));
    }),
    rest.get(GET_NAMESPACE_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: NAMESPACE_ID,
          name: 'default-connector-namespace',
        })
      );
    }),
    rest.get(GET_KAFKA_API, (_req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'KAFKAS-MGMT-7',
          href: '/api/kafkas_mgmt/v1/errors/7',
          id: '7',
          kind: 'Error',
          operation_id: 'cdqs10mp1tqq7knoe3t0',
          reason:
            "KafkaResource for user ishukla_kafka_supporting with id='cdka63j27d6rvlh8hvlg' not found",
        })
      );
    }),
    rest.get(GET_CONNECTOR_TYPE_API, (_req, res, ctx) => {
      return res(ctx.json(ConnectorType));
    }),
  ],
};

export const WithFailedConnectorState = Template.bind({});
WithFailedConnectorState.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: CONNECTOR_ID,
          owner: 'some_person',
          created_at: '2022-08-22T14:25:59.65854Z',
          modified_at: '2022-08-22T16:49:22.505238Z',
          name: 'Cheese Conversion Acceptor',
          connector_type_id: CONNECTOR_TYPE_ID,
          namespace_id: NAMESPACE_ID,
          desired_state: 'ready',
          kafka: {
            id: KAFKA_ID,
          },
          service_account: { client_id: 'Some client ID', client_secret: '' },
          connector: {
            data_shape: { produces: { format: 'application/json' } },
            error_handler: { stop: {} },
          },
          status: {
            state: 'failed',
            error:
              'Error: Unknown error: ReplicaSet "mctr-cdl60k5ajgdagid3bp00-d69fbdbdd" has timed out progressing.',
          },
        })
      );
    }),
    rest.get(GET_NAMESPACE_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: NAMESPACE_ID,
          name: 'default-connector-namespace',
        })
      );
    }),
    rest.get(GET_KAFKA_API, (_req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'KAFKAS-MGMT-7',
          href: '/api/kafkas_mgmt/v1/errors/7',
          id: '7',
          kind: 'Error',
          operation_id: 'cdqs10mp1tqq7knoe3t0',
          reason:
            "KafkaResource for user ishukla_kafka_supporting with id='cdka63j27d6rvlh8hvlg' not found",
        })
      );
    }),
    rest.get(GET_CONNECTOR_TYPE_API, (_req, res, ctx) => {
      return res(ctx.json(ConnectorType));
    }),
  ],
};

export const WithDQLErrorHandler = Template.bind({});
WithDQLErrorHandler.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: CONNECTOR_ID,
          owner: 'some_person',
          created_at: '2022-08-22T14:25:59.65854Z',
          modified_at: '2022-08-22T16:49:22.505238Z',
          name: 'Cheese Conversion Acceptor',
          connector_type_id: CONNECTOR_TYPE_ID,
          namespace_id: NAMESPACE_ID,
          desired_state: 'ready',
          kafka: {
            id: KAFKA_ID,
          },
          service_account: { client_id: 'Some client ID', client_secret: '' },
          connector: {
            data_shape: { produces: { format: 'application/json' } },
            error_handler: { dead_letter_queue: { topic: 'my-topic' } },
          },
          status: {
            state: 'failed',
            error:
              'Error: Unknown error: ReplicaSet "mctr-cdl60k5ajgdagid3bp00-d69fbdbdd" has timed out progressing.',
          },
        })
      );
    }),
    rest.get(GET_NAMESPACE_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: NAMESPACE_ID,
          name: 'default-connector-namespace',
        })
      );
    }),
    rest.get(GET_KAFKA_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: KAFKA_ID,
          name: 'Some Kafka',
        })
      );
    }),
    rest.get(GET_CONNECTOR_TYPE_API, (_req, res, ctx) => {
      return res(ctx.json(ConnectorType));
    }),
  ],
};

export const WithDQLForExpiredKI = Template.bind({});
WithDQLForExpiredKI.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: CONNECTOR_ID,
          owner: 'some_person',
          created_at: '2022-08-22T14:25:59.65854Z',
          modified_at: '2022-08-22T16:49:22.505238Z',
          name: 'Cheese Conversion Acceptor',
          connector_type_id: CONNECTOR_TYPE_ID,
          namespace_id: NAMESPACE_ID,
          desired_state: 'ready',
          kafka: {
            id: KAFKA_ID,
          },
          service_account: { client_id: 'Some client ID', client_secret: '' },
          connector: {
            data_shape: { produces: { format: 'application/json' } },
            error_handler: { dead_letter_queue: { topic: 'my-topic' } },
          },
          status: {
            state: 'failed',
            error:
              'Error: Unknown error: ReplicaSet "mctr-cdl60k5ajgdagid3bp00-d69fbdbdd" has timed out progressing.',
          },
        })
      );
    }),
    rest.get(GET_NAMESPACE_API, (_req, res, ctx) => {
      return res(
        ctx.json({
          id: NAMESPACE_ID,
          name: 'default-connector-namespace',
        })
      );
    }),
    rest.get(GET_KAFKA_API, (_req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'KAFKAS-MGMT-7',
          href: '/api/kafkas_mgmt/v1/errors/7',
          id: '7',
          kind: 'Error',
          operation_id: 'cdqs10mp1tqq7knoe3t0',
          reason:
            "KafkaResource for user ishukla_kafka_supporting with id='cdka63j27d6rvlh8hvlg' not found",
        })
      );
    }),
    rest.get(GET_CONNECTOR_TYPE_API, (_req, res, ctx) => {
      return res(ctx.json(ConnectorType));
    }),
  ],
};

export const WithUnknownError = Template.bind({});
WithUnknownError.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (req, res, ctx) => {
      return res(ctx.delay(300), ctx.status(500));
    }),
  ],
};

export const WithNotFoundError = Template.bind({});
WithNotFoundError.parameters = {
  msw: [
    rest.get(GET_CONNECTOR_API, (req, res, ctx) => {
      return res(ctx.delay(300), ctx.status(410));
    }),
  ],
};
