import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Drawer, DrawerContent } from '@patternfly/react-core';

import { ConnectorDrawerPanelContent } from './ConnectorDrawer';
import { ConnectorStatus } from './useConnectorStatusLabel';

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
  argTypes: {
    status: {
      options: Object.values(ConnectorStatus),
      control: { type: 'radio' },
    },
  },
  args: {
    name: 'Example name',
    bootstrapServer: 'foo.bar.baz.com',
    kafkaId: 'ahf234zxd',
    owner: 'John Doe',
    cluster: 'foo-bar-123',
    createdAt: Date.parse('2021-03-12T12:03:56').toString(),
    updatedAt: Date.parse('2021-03-17T08:31:23').toString(),
    status: 'ready',
  },
} as ComponentMeta<typeof ConnectorDrawerPanelContent>;

const Template: ComponentStory<typeof ConnectorDrawerPanelContent> = (args) => (
  <ConnectorDrawerPanelContent {...args} />
);

export const Running = Template.bind({});
Running.args = {};
