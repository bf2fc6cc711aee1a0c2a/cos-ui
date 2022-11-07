import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ErrorHandler } from './ErrorHandler';

export default {
  title: 'Wizard Step 4.3/Error handler Step',
  component: ErrorHandler,
};

const Template = (args) => <ErrorHandler {...args} />;

export const Default = Template.bind({});
Default.args = {
  errorHandlersList: ['stop', 'log', 'dead_letter_queue'],
  errorHandler: 'stop',
  topic: '',
  onSetTopic: () => {},
  selectErrorHandler: () => {},
};

export const WithDLQSelected = Template.bind({});
WithDLQSelected.args = {
  errorHandlersList: ['stop', 'log', 'dead_letter_queue'],
  errorHandler: 'dead_letter_queue',
  topic: 'Topic 2',
  onSetTopic: () => {},
  selectErrorHandler: () => {},
};
