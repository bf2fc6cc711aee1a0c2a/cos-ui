import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Gallery } from '@patternfly/react-core';

import {
  ConnectorTypeAllOf,
  ObjectReference,
} from '@rhoas/connector-management-sdk';

import connectorTypeData from '../../../../cypress/fixtures/connectorTypes2.json';
import aws_kinesis_source from '../../../../cypress/fixtures/connectors/aws_kinesis_source_0.1.json';
import aws_s3_sink from '../../../../cypress/fixtures/connectors/aws_s3_sink_0.1.json';
import debezium_postgres from '../../../../cypress/fixtures/connectors/debezium-postgres-1.9.4.Alpha1.json';
import { ConnectorTypeCard } from './ConnectorTypeCard';

export default {
  title: 'Wizard Step 1/Connector cards',
  component: ConnectorTypeCard,
  decorators: [(Story) => <Story />],
  args: {},
} as ComponentMeta<typeof ConnectorTypeCard>;

const Template: ComponentStory<typeof ConnectorTypeCard> = (args) => (
  <Gallery hasGutter>
    <ConnectorTypeCard {...args} />
  </Gallery>
);

export const SourceConnectorCard = Template.bind({});
SourceConnectorCard.args = {
  id: 'aws_kinesis_source_0.1',
  labels: ['source'],
  name: 'Amazon Kinesis source',
  description: 'Receive data from Amazon Kinesis.',
  version: '0.1',
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const SinkConnectorCard = Template.bind({});
SinkConnectorCard.args = {
  id: 'aws_s3_sink_0.1',
  labels: ['sink'],
  name: 'Amazon S3 sink',
  description: 'Send data to an Amazon S3 bucket.',
  version: '0.1',
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const DebeziumConnectorCard = Template.bind({});
DebeziumConnectorCard.args = {
  id: 'debezium-postgres-1.9.4.Final',
  labels: ['1.9.4.Final', 'debezium', 'postgres', 'source'],
  name: 'Debezium PostgreSQL Connector',
  version: '1.9.4.Final',
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const SelectedCard = Template.bind({});
SelectedCard.args = {
  id: 'aws_kinesis_source_0.1',
  labels: ['source'],
  name: 'Amazon Kinesis source',
  description: 'Receive data from Amazon Kinesis.',
  version: '0.1',
  selectedId: 'aws_kinesis_source_0.1',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

const TemplateList: ComponentStory<typeof ConnectorTypeCard> = (args) => (
  <Gallery hasGutter>
    {(connectorTypeData as any).items?.map((c) => {
      return (
        <ConnectorTypeCard
          id={(c as ObjectReference).id!}
          labels={(c as ConnectorTypeAllOf).labels!}
          name={(c as ConnectorTypeAllOf).name!}
          description={(c as ConnectorTypeAllOf)?.description}
          version={(c as ConnectorTypeAllOf).version!}
          selectedId={''}
          onSelect={() => {}}
          isDuplicate={false}
        />
      );
    })}
  </Gallery>
);

export const ConnectorList = TemplateList.bind({});
