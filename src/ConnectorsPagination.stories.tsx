import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorsPagination } from './ConnectorsPagination';

export default {
  title: 'UI/Connectors/Pagination',
  component: ConnectorsPagination,
  args: {
    itemCount: 1567,
    page: 3,
    perPage: 10,
    isCompact: true,
  },
  parameters: {},
} as ComponentMeta<typeof ConnectorsPagination>;

const Template: ComponentStory<typeof ConnectorsPagination> = (args) => (
  <ConnectorsPagination {...args} />
);

export const Pagination = Template.bind({});
