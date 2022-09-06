import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { DialogDeleteConnector } from './DialogDeleteConnector';

export default {
  title: 'Connector Page/Components/DeleteConnector',
  component: DialogDeleteConnector,
  args: {
    connectorName: 'Example',
    showDialog: true,
  },
  parameters: {},
} as ComponentMeta<typeof DialogDeleteConnector>;

const Template: ComponentStory<typeof DialogDeleteConnector> = (args) => (
  <DialogDeleteConnector {...args} />
);

export const DeleteConnector = Template.bind({});
