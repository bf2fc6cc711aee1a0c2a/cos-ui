import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoNamespace } from './EmptyStateNoNamespace';

export default {
  title: 'UI/Empty states/No Namespace',
  component: EmptyStateNoNamespace,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateNoNamespace>;

const Template: ComponentStory<typeof EmptyStateNoNamespace> = (args) => (
  <EmptyStateNoNamespace {...args} />
);

export const NoOSDCluster = Template.bind({});
