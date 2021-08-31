import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorsTable, ConnectorsTableRow } from './ConnectorsTable';

export default {
  title: 'UI/Connectors/Table',
  component: ConnectorsTableRow,
  args: {
    connectorId: 'abc',
    name: 'Sample name',
    type: 'MariaDB',
    category: 'Source',
    status: 'running',
    isSelected: false,
    canStart: true,
    canStop: false,
    canDelete: true,
  },
  parameters: {},
  decorators: [
    (Story) => (
      <ConnectorsTable>
        <Story />
      </ConnectorsTable>
    ),
  ],
} as ComponentMeta<typeof ConnectorsTableRow>;

const Template: ComponentStory<typeof ConnectorsTableRow> = (args) => (
  <ConnectorsTableRow {...args} />
);

export const Default = Template.bind({});
export const Selected = Template.bind({});
Selected.args = {
  isSelected: true,
};
