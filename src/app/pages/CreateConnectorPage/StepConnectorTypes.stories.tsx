import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';

import { CreateConnectorWizardProvider } from '../../components/CreateConnectorWizard/CreateConnectorWizardContext';
import { SelectConnectorType } from './StepConnectorTypes';

const API_HOST = 'https://dummy.server';
const API = `${API_HOST}/api/connector_mgmt/v1/kafka_connector_types`;

export default {
  title: 'Wizard Step 1/Connector Type Step',
  component: SelectConnectorType,
  decorators: [
    (Story) => (
      <CreateConnectorWizardProvider
        accessToken={() => Promise.resolve('')}
        connectorsApiBasePath={API_HOST}
        kafkaManagementApiBasePath={''}
        fetchConfigurator={() => Promise.resolve(undefined)}
        onSave={(name: string) => console.debug('onSave, name: ', name)}
      >
        <Story />
      </CreateConnectorWizardProvider>
    ),
  ],
  args: {},
  parameters: {
    xstate: true,
  },
} as ComponentMeta<typeof SelectConnectorType>;

const Template: ComponentStory<typeof SelectConnectorType> = () => (
  <SelectConnectorType />
);

export const InitialLoading = Template.bind({});
InitialLoading.parameters = {
  msw: [
    rest.get(API, (_req, res, ctx) => {
      return res(ctx.delay('infinite'));
    }),
  ],
};

export const WithConnectorTypes = Template.bind({});
WithConnectorTypes.parameters = {
  msw: [
    rest.get(`${API}*`, (req, res, ctx) => {
      const searchParams = req.url.searchParams;
      const page = +(searchParams.get('page') || 1);
      const size = +(searchParams.get('size') || 20);
      const search = searchParams.get('search') || '';
      const response = generateStoryConnectorTypes(page, size, search, 60);
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithError = Template.bind({});
WithError.parameters = {
  msw: [
    rest.get(API, (_req, res, ctx) => {
      return res(ctx.status(403));
    }),
  ],
};

// generate a deterministic set of connector types
const generateStoryConnectorTypes = (page, size, search, total) => {
  const fullSet = Array.from(
    {
      length: total,
    },
    (_, index) => ({
      name: `Some Connector ${index}`,
      id: `connector_${index}`,
      version: `some_version_${index}`,
      description: `This is a fancy connector description for Some Connector ${index}`,
      labels: index % 2 ? ['source'] : ['sink'],
    })
  );
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
