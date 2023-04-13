import React from 'react';

import {
  Card,
  CardBody,
  Split,
  SplitItem,
  CardTitle,
} from '@patternfly/react-core';

import { ErrorHandlerInfo } from './ErrorHandlerInfo';

export default {
  title: 'UI/Components/Error handler Info',
  component: ErrorHandlerInfo,
};

const Template = (args) => (
  <Split hasGutter>
    <SplitItem>
      <Card>
        <CardTitle>Normal</CardTitle>
        <CardBody>
          <ErrorHandlerInfo {...args} />
        </CardBody>
      </Card>
    </SplitItem>
    <SplitItem isFilled>
      <Card>
        <CardTitle>Horizontal</CardTitle>
        <CardBody>
          <ErrorHandlerInfo isHorizontal {...args} />
        </CardBody>
      </Card>
    </SplitItem>
    <SplitItem>
      <Card>
        <CardTitle>As Form</CardTitle>
        <CardBody>
          <ErrorHandlerInfo asForm {...args} />
        </CardBody>
      </Card>
    </SplitItem>
  </Split>
);

export const Stop = Template.bind({});
Stop.args = {
  kafkaId: 'foo',
  errorHandler: { stop: {} },
};

export const Ignore = Template.bind({});
Ignore.args = {
  kafkaId: 'foo',
  errorHandler: { log: {} },
};

export const DLQ = Template.bind({});
DLQ.args = {
  kafkaId: 'foo',
  errorHandler: { dead_letter_queue: { topic: 'foo' } },
};

export const DLQ_NoKafka = Template.bind({});
DLQ_NoKafka.args = {
  kafkaId: undefined,
  errorHandler: { dead_letter_queue: { topic: 'foo' } },
};
