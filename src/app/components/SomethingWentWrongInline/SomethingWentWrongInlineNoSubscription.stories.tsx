import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SomethingWentWrongInlineNoSubscription } from './SomethingWentWrongInlineNoSubscription';

export default {
  title: 'UI/Components/Something Went Wrong Inline No Subscription',
  component: SomethingWentWrongInlineNoSubscription,
  args: {
    errorMessage: 'API Error',
  },
} as ComponentMeta<typeof SomethingWentWrongInlineNoSubscription>;

const Template: ComponentStory<
  typeof SomethingWentWrongInlineNoSubscription
> = (args) => <SomethingWentWrongInlineNoSubscription {...args} />;

export const Default = Template.bind({});
