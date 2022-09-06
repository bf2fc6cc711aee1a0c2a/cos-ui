import { ComponentStory, ComponentMeta } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';

import manyConnectorsData from '../../../../cypress/fixtures/connectorsPolling.json';
import noConnectorsData from '../../../../cypress/fixtures/noConnectors.json';
import { ConnectorsPage } from './ConnectorsPage';
import { ConnectorsPageProvider } from './ConnectorsPageContext';

export default {
  title: 'Connector Page/Connectors',
  component: ConnectorsPage,
  decorators: [
    (Story) => (
      <ConnectorsPageProvider
        accessToken={() => Promise.resolve('')}
        connectorsApiBasePath={'https://dummy.server'}
        onError={() => false}
      >
        <Story />
      </ConnectorsPageProvider>
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
      return res(ctx.delay(300), ctx.json(manyConnectorsData));
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
