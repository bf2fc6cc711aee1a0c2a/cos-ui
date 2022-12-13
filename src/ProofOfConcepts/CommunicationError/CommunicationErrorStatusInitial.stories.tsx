import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ExpandableAlerts } from './CommunicationErrorStatusInitial';

export default {
  title: "'Proof Of Concepts/Communication Error Status Initial ",
  component: ExpandableAlerts,
  args: {},
} as ComponentMeta<typeof ExpandableAlerts>;

const Template: ComponentStory<typeof ExpandableAlerts> = (args) => (
  <ExpandableAlerts />
);

export const CommunicationErrorStatusInitial = Template.bind({});
