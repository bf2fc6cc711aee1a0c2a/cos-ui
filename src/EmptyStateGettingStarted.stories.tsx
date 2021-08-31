import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateGettingStarted } from './EmptyStateGettingStarted';

export default {
  title: 'UI/Empty states/Getting Started',
  component: EmptyStateGettingStarted,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateGettingStarted>;

const Template: ComponentStory<typeof EmptyStateGettingStarted> = (args) => (
  <EmptyStateGettingStarted {...args} />
);

export const GettingStarted = Template.bind({});
