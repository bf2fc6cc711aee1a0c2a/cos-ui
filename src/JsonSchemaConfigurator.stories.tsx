import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';
import { withFixtures } from 'storybook-fixtures';

import aws_kinesis_sink from '../cypress/fixtures/connectors/aws_kinesis_sink_0.1.json';
import aws_kinesis_source from '../cypress/fixtures/connectors/aws_kinesis_source_0.1.json';
import aws_s3_sink from '../cypress/fixtures/connectors/aws_s3_sink_0.1.json';
import aws_s3_source from '../cypress/fixtures/connectors/aws_s3_source_0.1.json';
import aws_sns_sink from '../cypress/fixtures/connectors/aws_sns_sink_0.1.json';
import aws_sqs_sink from '../cypress/fixtures/connectors/aws_sqs_sink_0.1.json';
import aws_sqs_source from '../cypress/fixtures/connectors/aws_sqs_source_0.1.json';
import injector_source from '../cypress/fixtures/connectors/injector_source_0.1.json';
import log_sink from '../cypress/fixtures/connectors/log_sink_0.1.json';
import mariadb_sink from '../cypress/fixtures/connectors/mariadb_sink_0.1.json';
import mariadb_source from '../cypress/fixtures/connectors/mariadb_source_0.1.json';
import mongodb_sink from '../cypress/fixtures/connectors/mongodb_sink_0.1.json';
import mongodb_source from '../cypress/fixtures/connectors/mongodb_source_0.1.json';
import mysql_sink from '../cypress/fixtures/connectors/mysql_sink_0.1.json';
import mysql_source from '../cypress/fixtures/connectors/mysql_source_0.1.json';
import postgresql_sink from '../cypress/fixtures/connectors/postgresql_sink_0.1.json';
import postgresql_source from '../cypress/fixtures/connectors/postgresql_source_0.1.json';
import sqlserver_sink from '../cypress/fixtures/connectors/sqlserver_sink_0.1.json';
import sqlserver_source from '../cypress/fixtures/connectors/sqlserver_source_0.1.json';
import { JsonSchemaConfigurator } from './JsonSchemaConfigurator';

export default {
  title: 'Wizard/JsonSchemaConfigurator',
  component: JsonSchemaConfigurator,
  args: {
    configuration: {},
  },
  decorators: [
    withFixtures({
      // override the default setting and show single fixture tab
      __singleTab: true,
    }),
  ],
} as ComponentMeta<typeof JsonSchemaConfigurator>;

const Template: ComponentStory<typeof JsonSchemaConfigurator> = (
  args,
  { fixture }
) => {
  console.log(args, fixture);
  return (
    <JsonSchemaConfigurator
      {...args}
      schema={fixture.connector_type.json_schema}
    />
  );
};

export const Aws_kinesis_sink = Template.bind({});
Aws_kinesis_sink.parameters = {
  fixtures: {
    aws_kinesis_sink: { aws_kinesis_sink },
  },
};
export const Aws_kinesis_source = Template.bind({});
Aws_kinesis_source.parameters = {
  fixtures: {
    aws_kinesis_source: { aws_kinesis_source },
  },
};
export const Aws_s3_sink = Template.bind({});
Aws_s3_sink.parameters = {
  fixtures: {
    aws_s3_sink: { aws_s3_sink },
  },
};
export const Aws_s3_source = Template.bind({});
Aws_s3_source.parameters = {
  fixtures: {
    aws_s3_source: { aws_s3_source },
  },
};
export const Aws_sns_sink = Template.bind({});
Aws_sns_sink.parameters = {
  fixtures: {
    aws_sns_sink: { aws_sns_sink },
  },
};
export const Aws_sqs_sink = Template.bind({});
Aws_sqs_sink.parameters = {
  fixtures: {
    aws_sqs_sink: { aws_sqs_sink },
  },
};
export const Aws_sqs_source = Template.bind({});
Aws_sqs_source.parameters = {
  fixtures: {
    aws_sqs_source: { aws_sqs_source },
  },
};
export const Injector_source = Template.bind({});
Injector_source.parameters = {
  fixtures: {
    injector_source: { injector_source },
  },
};
export const Log_sink = Template.bind({});
Log_sink.parameters = {
  fixtures: {
    log_sink: { log_sink },
  },
};
export const Mariadb_sink = Template.bind({});
Mariadb_sink.parameters = {
  fixtures: {
    mariadb_sink: { mariadb_sink },
  },
};
export const Mariadb_source = Template.bind({});
Mariadb_source.parameters = {
  fixtures: {
    mariadb_source: { mariadb_source },
  },
};
export const Mongodb_sink = Template.bind({});
Mongodb_sink.parameters = {
  fixtures: {
    mongodb_sink: { mongodb_sink },
  },
};
export const Mongodb_source = Template.bind({});
Mongodb_source.parameters = {
  fixtures: {
    mongodb_source: { mongodb_source },
  },
};
export const Mysql_sink = Template.bind({});
Mysql_sink.parameters = {
  fixtures: {
    mysql_sink: { mysql_sink },
  },
};
export const Mysql_source = Template.bind({});
Mysql_source.parameters = {
  fixtures: {
    mysql_source: { mysql_source },
  },
};
export const Postgresql_sink = Template.bind({});
Postgresql_sink.parameters = {
  fixtures: {
    postgresql_sink: { postgresql_sink },
  },
};
export const Postgresql_source = Template.bind({});
Postgresql_source.parameters = {
  fixtures: {
    postgresql_source: { postgresql_source },
  },
};
export const Sqlserver_sink = Template.bind({});
Sqlserver_sink.parameters = {
  fixtures: {
    sqlserver_sink: { sqlserver_sink },
  },
};
export const Sqlserver_source = Template.bind({});
Sqlserver_source.parameters = {
  fixtures: {
    sqlserver_source: { sqlserver_source },
  },
};
