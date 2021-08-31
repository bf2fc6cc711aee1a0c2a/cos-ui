import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoMatchesFound } from './EmptyStateNoMatchesFound';

export default {
  title: 'UI/Empty states/No Matches Found',
  component: EmptyStateNoMatchesFound,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateNoMatchesFound>;

const Template: ComponentStory<typeof EmptyStateNoMatchesFound> = (args) => (
  <EmptyStateNoMatchesFound {...args} />
);

export const NoMatchesFound = Template.bind({});
