import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rest } from 'msw';
import Prando from 'prando';
import React from 'react';

import manyConnectorsData from '../../../../cypress/fixtures/connectorsPolling.json';
import noConnectorsData from '../../../../cypress/fixtures/noConnectors.json';
import { CosContextProvider } from '../../../hooks/useCos';
import { AlertsProvider } from '../../components/Alerts/Alerts';
import { ConnectorsPage } from './ConnectorsPage';

const API_BASE = 'https://dummy.server';
const rng = new Prando('story-connectors-page');

export default {
  title: 'Pages/Connector Instances Page',
  component: ConnectorsPage,
  decorators: [
    (Story) => (
      <CosContextProvider
        getToken={() => Promise.resolve('')}
        connectorsApiBasePath={API_BASE}
        kafkaManagementApiBasePath={API_BASE}
      >
        <AlertsProvider>
          <Story />
        </AlertsProvider>
      </CosContextProvider>
    ),
  ],
  args: {},
  parameters: {
    xstate: true,
  },
} as ComponentMeta<typeof ConnectorsPage>;

const Template: ComponentStory<typeof ConnectorsPage> = (args) => (
  <ConnectorsPage {...args} />
);

const GET_CONNECTORS_API = `${API_BASE}/api/connector_mgmt/v1/kafka_connectors`;
const GET_CONNECTOR_NAMESPACE_API = `${API_BASE}/api/connector_mgmt/v1/kafka_connector_namespaces/:id`;
const GET_KAFKA_API = `${API_BASE}/api/kafkas_mgmt/v1/kafkas/:id`;

export const InitialLoading = Template.bind({});
InitialLoading.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      return res(ctx.delay('infinite'));
    }),
  ],
};

export const WithNoConnectors = Template.bind({});
WithNoConnectors.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      return res(ctx.json(noConnectorsData));
    }),
  ],
};

export const WithConnectors = Template.bind({});
WithConnectors.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      return res(ctx.delay(), ctx.json(manyConnectorsData));
    }),
    rest.get(GET_KAFKA_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryKafkaInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(GET_CONNECTOR_NAMESPACE_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryNamespaceInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithOneConnector = Template.bind({});
WithOneConnector.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      const searchParams = req.url.searchParams;
      const page = +(searchParams.get('page') || 1);
      const size = +(searchParams.get('size') || 20);
      const search = searchParams.get('search') || '';
      const response = generateStoryConnectorInstances(page, size, search, 1);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(GET_KAFKA_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryKafkaInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(GET_CONNECTOR_NAMESPACE_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryNamespaceInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithLotsOfConnectors = Template.bind({});
WithLotsOfConnectors.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      const searchParams = req.url.searchParams;
      const page = +(searchParams.get('page') || 1);
      const size = +(searchParams.get('size') || 20);
      const search = searchParams.get('search') || '';
      const response = generateStoryConnectorInstances(page, size, search, 200);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(GET_KAFKA_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryKafkaInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(GET_CONNECTOR_NAMESPACE_API, (req, res, ctx) => {
      const id = req.params.id as string;
      const response = generateStoryNamespaceInstance(id);
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithError = Template.bind({});
WithError.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      return res(ctx.status(403));
    }),
  ],
};

export const WithErrorAfterPolling = Template.bind({});
WithErrorAfterPolling.parameters = {
  msw: [
    rest.get(GET_CONNECTORS_API, (req, res, ctx) => {
      const count = +(sessionStorage.getItem('count') || 1);
      sessionStorage.setItem('count', `${count + 1}`);
      if (count % 4 === 0) {
        sessionStorage.removeItem('count');
        console.log('Sending an error response');
        return res(ctx.status(403));
      }
      const searchParams = req.url.searchParams;
      const page = +(searchParams.get('page') || 1);
      const size = +(searchParams.get('size') || 20);
      const search = searchParams.get('search') || '';
      const response = generateStoryConnectorInstances(page, size, search, 200);
      return res(ctx.json(response));
    }),
  ],
};

const generateStoryKafkaInstance = (id: string) => {
  return {
    id,
    name: `${id} Kafka`,
  };
};

const generateStoryNamespaceInstance = (id: string) => {
  return {
    cluster_id: id,
    name: `${id} Namespace`,
    ...(id.startsWith('baz')
      ? {
          expiration: `${new Date(
            Date.now() + rng.nextInt(2400000, 4800000)
          ).toISOString()}`,
        }
      : {}),
  };
};

// generate a deterministic set of connectors
const generateStoryConnectorInstances = (page, size, search, total) => {
  function getNameBit(index) {
    if (index % 4) {
      return 'foo';
    }
    if (index % 5) {
      return 'bar';
    }
    if (index % 6) {
      return 'baz';
    }
    return 'meep';
  }

  function genConnectorTypeId(index) {
    return `${getNameBit(index)}_1.0`;
  }

  function genConnectorName(index) {
    return `${getNameBit(index)} connector ${index + 1}`;
  }

  function genConnectorId(index) {
    return `${getNameBit(index)}-${index}`;
  }

  function genConnectorDesiredState(index) {
    switch (getNameBit(index)) {
      case 'foo':
        if (index % 2) {
          return 'ready';
        }
        return 'stopped';
      case 'bar':
        if (index % 2) {
          return 'stopped';
        }
        return 'ready';
      case 'baz':
        if (index % 2) {
          return 'deleting';
        }
        return 'stopped';
      default:
        if (index % 2) {
          return 'ready';
        }
        return 'stopped';
    }
  }

  function genConnectorState(index) {
    switch (getNameBit(index)) {
      case 'foo':
        if (index % 2) {
          return { state: 'ready' };
        }
        return { state: 'stopped' };
      case 'bar':
        if (index % 2) {
          return { state: 'stopped' };
        }
        return { state: 'ready' };
      case 'baz':
        if (index % 2) {
          return { state: 'deleting' };
        }
        return { state: 'stopped' };
      default:
        if (index % 2) {
          return { state: 'ready' };
        }
        return { state: 'stopped' };
    }
  }

  function genErrorHandler(index) {
    switch (getNameBit(index)) {
      case 'foo':
        return { stop: {} };
      case 'bar':
        return { log: {} };
      default:
        return { dead_letter_queue: { topic: 'dlq-topic' } };
    }
  }

  const fullSet = Array.from({ length: total }, (_, index) => ({
    name: genConnectorName(index),
    id: genConnectorId(index),
    connector_type_id: genConnectorTypeId(index),
    desired_state: genConnectorDesiredState(index),
    status: genConnectorState(index),
    created_at: new Date(Date.now() - 1200000).toISOString(),
    modified_at: new Date(Date.now() - 120000).toISOString(),
    kafka: {
      id: genConnectorId(index),
      url: 'https://teh-internets:443',
    },
    namespace_id: genConnectorId(index),
    owner: 'somebody',
    connector: {
      error_handler: genErrorHandler(index),
    },
  }));
  const start = (page - 1) * size;
  const end = start + size;
  return {
    page,
    size,
    items: fullSet
      .slice(start, end)
      .filter(({ name }) => name.includes(search)),
    total,
  };
};
