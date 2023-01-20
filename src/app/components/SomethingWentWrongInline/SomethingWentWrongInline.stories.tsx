import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SomethingWentWrongInline } from './SomethingWentWrongInline';

export default {
  title: 'UI/Components/Something Went Wrong Inline',
  component: SomethingWentWrongInline,
  args: {
    errorMessage: 'Something pretty unfortunate happened, sorry.',
  },
} as ComponentMeta<typeof SomethingWentWrongInline>;

const Template: ComponentStory<typeof SomethingWentWrongInline> = (args) => (
  <SomethingWentWrongInline {...args} />
);

export const Default = Template.bind({});
