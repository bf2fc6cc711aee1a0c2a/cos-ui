import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateFetchError } from './EmptyStateFetchError';

export default {
  title: 'UI/Empty states/Fetch Error',
  component: EmptyStateFetchError,
  args: {
    message: '403 Unauthorized',
  },
} as ComponentMeta<typeof EmptyStateFetchError>;

const Template: ComponentStory<typeof EmptyStateFetchError> = (args) => (
  <EmptyStateFetchError {...args} />
);

export const FetchError = Template.bind({});
