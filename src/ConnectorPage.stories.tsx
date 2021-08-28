import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';

import connectorsData from '../cypress/fixtures/connectors.json';
import noConnectorsData from '../cypress/fixtures/noConnectors.json';
import { ConnectorsPage } from './ConnectorsPage';
import { ConnectorsPageProvider } from './ConnectorsPageContext';

export default {
  title: 'UI/ConnectorPage',
  component: ConnectorsPage,
  decorators: [
    (Story) => (
      <ConnectorsPageProvider
        accessToken={() => Promise.resolve('')}
        basePath={'https://dummy.server'}
        onError={() => false}
      >
        <Story />
      </ConnectorsPageProvider>
    ),
  ],
  args: {},
  parameters: {
    chromatic: { delay: 300 },
  },
} as ComponentMeta<typeof ConnectorsPage>;

const Template: ComponentStory<typeof ConnectorsPage> = (args) => (
  <ConnectorsPage {...args} />
);

const API = 'https://dummy.server/api/connector_mgmt/v1/kafka_connectors';

export const InitialLoading = Template.bind({});
InitialLoading.parameters = {
  msw: [
    rest.get(API, (req, res, ctx) => {
      return res(ctx.delay(80000), ctx.status(403));
    }),
  ],
};

export const WithNoConnectors = Template.bind({});
WithNoConnectors.parameters = {
  msw: [
    rest.get(API, (req, res, ctx) => {
      return res(ctx.json(noConnectorsData));
    }),
  ],
};

export const WithConnectors = Template.bind({});
WithConnectors.parameters = {
  msw: [
    rest.get(API, (req, res, ctx) => {
      const page = req.params.page || 1;
      const size = req.params.size || 10;
      const manyConnectors = {
        kind: 'ConnectorList',
        page: page,
        size: size,
        total: 100,
        items: Array(size).fill(connectorsData.items[0]),
      };
      return res(ctx.delay(300), ctx.json(manyConnectors));
    }),
  ],
};

export const WithError = Template.bind({});
WithError.parameters = {
  msw: [
    rest.get(API, (req, res, ctx) => {
      return res(ctx.status(403));
    }),
  ],
};
