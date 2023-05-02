import React from 'react';

import { ErrorHandlerSelector } from './ErrorHandlerSelector';

export default {
  title: 'Wizard Step 4.3/Error handler Step',
  component: ErrorHandlerSelector,
};

const Template = (args) => <ErrorHandlerSelector {...args} />;

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
