import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ExpandableAlerts } from './CommunicationErrorStatusNoSubscripton';

export default {
  title: "'Proof Of Concepts/Communication Error Status No Subscripton ",
  component: ExpandableAlerts,
  args: {},
} as ComponentMeta<typeof ExpandableAlerts>;

const Template: ComponentStory<typeof ExpandableAlerts> = (args) => (
  <ExpandableAlerts />
);

export const CommunicationErrorStatusNoSubscripton = Template.bind({});
