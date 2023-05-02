import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { ConnectorInstanceOverview } from './ConnectorInstanceOverview';
import { TransformationDiagram } from './TransformationDiagram';

export default {
  title: 'ProofOfConcepts/Instance Overview/Full Example',
  component: ConnectorInstanceOverview,
  args: {},
} as ComponentMeta<typeof ConnectorInstanceOverview>;

const Template: ComponentStory<typeof ConnectorInstanceOverview> = (args) => (
  <ConnectorInstanceOverview {...args} />
);

export const Story = Template.bind({});
Story.args = {
  name: 'notifications-overnight-shipments',
  connectorName: 'Slack sink connector',
  instanceId: '-------------',
  desiredState: 'ready',
  instanceState: 'ready',
  kafkaId: '-------------',
  kafkaInstanceName: 'outgoing-shipments',
  kafkaTopics: ['orders-processed-overnight'],
  kafkaClientId: 'acme-shipping1188',
  kafkaClientSecret: 'thisissecret',
  errorHandler: { dead_letter_queue: { topic: 'my-kafka-topic2' } },
  sent: 359,
  notSent: 12,
  slackWorkspace: 'notifications-orderreturns',
  slackChannel: 'fraud_detection',
  owner: 'jbradshaw1',
  dateCreated: 'DD MMM YYYY',
  dateModified: 'DD MMM YYYY',
  namespaceName: 'default-namespace',
  namespaceTags: ['ROSA'],
  clusterName: 'order-processing',
  clusterId: 'skjw083200754376de',
  clusterOwner: 'jbradshaw1',
  transformationDiagram: (
    <>
      <TransformationDiagram />
    </>
  ),
};
