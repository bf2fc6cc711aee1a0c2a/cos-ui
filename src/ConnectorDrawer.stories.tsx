import { ComponentStory, ComponentMeta } from '@storybook/react';
import { subDays, subMinutes } from 'date-fns';
import React from 'react';

import { Drawer, DrawerContent } from '@patternfly/react-core';

import { ConnectorDrawerPanelContent } from './ConnectorDrawer';

export default {
  title: 'UI/ConnectorDrawer',
  component: ConnectorDrawerPanelContent,
  decorators: [
    (Story) => (
      <Drawer isExpanded={true}>
        <DrawerContent panelContent={<Story />}></DrawerContent>
      </Drawer>
    ),
  ],
  args: {
    name: 'Example name',
    bootstrapServer: 'foo.bar.baz.com',
    kafkaId: 'ahf234zxd',
    owner: 'John Doe',
    cluster: 'foo-bar-123',
    createdAt: subDays(new Date(), 120),
    updatedAt: subMinutes(new Date(), 28),
    status: 'ready',
  },
} as ComponentMeta<typeof ConnectorDrawerPanelContent>;

const Template: ComponentStory<typeof ConnectorDrawerPanelContent> = (args) => (
  <ConnectorDrawerPanelContent {...args} />
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
