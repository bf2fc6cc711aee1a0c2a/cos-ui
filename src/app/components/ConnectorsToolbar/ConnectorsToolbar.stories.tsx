import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorsToolbar } from './ConnectorsToolbar';

export default {
  title: 'UI/Connectors/Toolbar',
  component: ConnectorsToolbar,
  args: {
    itemCount: 1567,
    page: 3,
    perPage: 10,
  },
  parameters: {},
} as ComponentMeta<typeof ConnectorsToolbar>;

const Template: ComponentStory<typeof ConnectorsToolbar> = (args) => (
  <ConnectorsToolbar {...args} />
);

export const Toolbar = Template.bind({});
