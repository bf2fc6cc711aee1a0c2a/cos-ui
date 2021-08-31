import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorStatus, ConnectorStatuses } from './ConnectorStatus';

export default {
  title: 'UI/Connector/Statuses',
  component: ConnectorStatus,
  args: {
    name: 'Sample name',
  },
} as ComponentMeta<typeof ConnectorStatus>;

const Template: ComponentStory<typeof ConnectorStatus> = (args) => (
  <div>
    {Object.values(ConnectorStatuses).map((s, idx) => (
      <ConnectorStatus key={idx} {...args} status={s} />
    ))}
  </div>
);

export const Statuses = Template.bind({});
