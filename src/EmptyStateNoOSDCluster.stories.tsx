import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoOSDCluster } from './EmptyStateNoOSDCluster';

export default {
  title: 'UI/Empty states/No OSD Cluster',
  component: EmptyStateNoOSDCluster,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateNoOSDCluster>;

const Template: ComponentStory<typeof EmptyStateNoOSDCluster> = (args) => (
  <EmptyStateNoOSDCluster {...args} />
);

export const NoOSDCluster = Template.bind({});
