import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ExpandableAlerts } from './CommunicationErrorStatusSubscripton';

export default {
  title: "'Proof Of Concepts/Communication Error Status Subscripton ",
  component: ExpandableAlerts,
  args: {},
} as ComponentMeta<typeof ExpandableAlerts>;

const Template: ComponentStory<typeof ExpandableAlerts> = (args) => (
  <ExpandableAlerts />
);

export const CommunicationErrorStatusSubscripton = Template.bind({});
