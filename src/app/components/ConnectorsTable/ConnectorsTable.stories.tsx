import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorStatuses } from '../ConnectorStatus/ConnectorStatus';
import { ConnectorsTable, ConnectorsTableRow } from './ConnectorsTable';

const RowStory = {
  component: ConnectorsTableRow,
  args: {
    connectorId: 'abc',
    name: 'Sample name',
    type: 'MariaDB',
    category: 'Source',
    status: 'ready',
    isSelected: false,
    canStart: true,
    canStop: false,
    canDelete: true,
  },
} as ComponentMeta<typeof ConnectorsTableRow>;

export default {
  title: 'UI/Connectors/Table',
  component: ConnectorsTable,
} as ComponentMeta<typeof ConnectorsTable>;

const Template: ComponentStory<typeof ConnectorsTable> = (args) => (
  <ConnectorsTable {...args} />
);

export const Table = Template.bind({});
Table.args = {
  children: [
    <ConnectorsTableRow
      key={1}
      {...RowStory.args}
      status={ConnectorStatuses.Deleting}
    />,
    <ConnectorsTableRow key={2} {...RowStory.args} isSelected={true} />,
    <ConnectorsTableRow
      key={3}
      {...RowStory.args}
      status={ConnectorStatuses.Failed}
    />,
  ],
};
