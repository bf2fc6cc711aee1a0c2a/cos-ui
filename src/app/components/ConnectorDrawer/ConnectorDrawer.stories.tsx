import { ComponentStory, ComponentMeta } from '@storybook/react';
import { subDays, subMinutes } from 'date-fns';
import React from 'react';

import { Drawer, DrawerContent } from '@patternfly/react-core';

import { ConnectorStatusValues } from '../ConnectorStatus/ConnectorStatus.stories';
import { ConnectorDrawerPanelContent } from './ConnectorDrawer';

export default {
  title: 'UI/Connector/Drawer',
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
    modifiedAt: subMinutes(new Date(), 28),
    status: 'ready',
  },
  argTypes: {
    status: {
      options: Object.values(ConnectorStatusValues),
      control: 'radio',
    },
  },
} as ComponentMeta<typeof ConnectorDrawerPanelContent>;

const Template: ComponentStory<typeof ConnectorDrawerPanelContent> = (args) => (
  <ConnectorDrawerPanelContent {...args} />
);

export const ConnectorDrawer = Template.bind({});
ConnectorDrawer.storyName = 'Drawer';
