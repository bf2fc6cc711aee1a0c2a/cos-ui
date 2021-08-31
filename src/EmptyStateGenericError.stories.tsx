import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateGenericError } from './EmptyStateGenericError';

export default {
  title: 'UI/Empty states/Generic Error',
  component: EmptyStateGenericError,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateGenericError>;

const Template: ComponentStory<typeof EmptyStateGenericError> = (args) => (
  <EmptyStateGenericError {...args} />
);

export const GenericError = Template.bind({});
