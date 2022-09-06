import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { Gallery } from '@patternfly/react-core';

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
  connector: aws_kinesis_source,
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const SinkConnectorCard = Template.bind({});
SinkConnectorCard.args = {
  connector: aws_s3_sink,
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const DebeziumConnectorCard = Template.bind({});
DebeziumConnectorCard.args = {
  connector: debezium_postgres,
  selectedId: '',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

export const SelectedCard = Template.bind({});
SelectedCard.args = {
  connector: aws_kinesis_source,
  selectedId: 'aws_kinesis_source_0.1',
  isDuplicate: false,
} as ComponentMeta<typeof ConnectorTypeCard>;

const TemplateList: ComponentStory<typeof ConnectorTypeCard> = (args) => (
  <Gallery hasGutter>
    {(connectorTypeData as any).items?.map((c) => {
      return (
        <ConnectorTypeCard
          connector={c}
          selectedId={''}
          onSelect={() => {}}
          isDuplicate={false}
        />
      );
    })}
  </Gallery>
);

export const ConnectorList = TemplateList.bind({});
