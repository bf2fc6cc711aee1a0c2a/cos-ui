import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Pagination } from './Pagination';

export default {
  title: 'UI/Connectors/Pagination',
  component: Pagination,
  args: {
    itemCount: 1567,
    page: 3,
    perPage: 10,
    isCompact: false,
  },
  parameters: {},
} as ComponentMeta<typeof Pagination>;

const Template: ComponentStory<typeof Pagination> = (args) => (
  <Pagination {...args} />
);

export const Default = Template.bind({});
export const Compact = Template.bind({});
Compact.args = {
  isCompact: true,
};
