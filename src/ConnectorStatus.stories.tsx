import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ConnectorStatus } from './ConnectorStatus';

export default {
  title: 'UI/Connector/Status',
  component: ConnectorStatus,
  args: {
    name: 'Sample name',
  },
} as ComponentMeta<typeof ConnectorStatus>;

const Template: ComponentStory<typeof ConnectorStatus> = (args) => (
  <ConnectorStatus {...args} />
);

export const Ready = Template.bind({});
Ready.args = {
  status: 'ready',
};
export const Failed = Template.bind({});
Failed.args = {
  status: 'failed',
};
export const Assigning = Template.bind({});
Assigning.args = {
  status: 'assigning',
};
export const Assigned = Template.bind({});
Assigned.args = {
  status: 'assigned',
};
export const Updating = Template.bind({});
Updating.args = {
  status: 'updating',
};
export const Provisioning = Template.bind({});
Provisioning.args = {
  status: 'provisioning',
};
export const Deleting = Template.bind({});
Deleting.args = {
  status: 'deleting',
};
export const Deleted = Template.bind({});
Deleted.args = {
  status: 'deleted',
};
