import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { SomethingWentWrongInlineSubscription } from './SomethingWentWrongInlineSubscription';

export default {
  title: 'UI/Components/Something Went Wrong Inline Subscription',
  component: SomethingWentWrongInlineSubscription,
  args: {
    errorMessage: 'API Error',
  },
} as ComponentMeta<typeof SomethingWentWrongInlineSubscription>;

const Template: ComponentStory<typeof SomethingWentWrongInlineSubscription> = (
  args
) => <SomethingWentWrongInlineSubscription {...args} />;

export const Default = Template.bind({});
