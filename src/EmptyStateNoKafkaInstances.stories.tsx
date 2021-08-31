import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoKafkaInstances } from './EmptyStateNoKafkaInstances';

export default {
  title: 'UI/Empty states/No Kafka Instances',
  component: EmptyStateNoKafkaInstances,
  args: {},
  parameters: {},
} as ComponentMeta<typeof EmptyStateNoKafkaInstances>;

const Template: ComponentStory<typeof EmptyStateNoKafkaInstances> = (args) => (
  <EmptyStateNoKafkaInstances {...args} />
);

export const NoKafkaInstances = Template.bind({});
