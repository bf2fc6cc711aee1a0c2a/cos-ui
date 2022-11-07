import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import aws_kinesis_source from '../../../../cypress/fixtures/connectors/aws_kinesis_source_0.1.json';
import aws_s3_sink from '../../../../cypress/fixtures/connectors/aws_s3_sink_0.1.json';
import debezium_postgres from '../../../../cypress/fixtures/connectors/debezium-postgres-1.9.4.Alpha1.json';
import { StepReviewComponent } from './StepReview';

const kafka_instance_test = {
  id: 'cc88cn3diejt4m3u5rsg',
  kind: 'Kafka',
  href: '/api/kafkas_mgmt/v1/kafkas/cc88cn3diejt4m3u5rsg',
  status: 'ready',
  cloud_provider: 'aws',
  multi_az: false,
  region: 'eu-west-1',
  owner: 'ishukla_kafka_supporting',
  name: 'ishukla-test',
  bootstrap_server_host:
    'ishukla-te-cc--cn-diejt-m-u-rsg.bf2.kafka.rhcloud.com:443',
  admin_api_server_url:
    'https://admin-server-ishukla-te-cc--cn-diejt-m-u-rsg.bf2.kafka.rhcloud.com',
  created_at: '2022-09-01T10:15:57.090053Z',
  expires_at: '2022-09-03T10:15:57.090053Z',
  updated_at: '2022-09-01T10:42:17.296618Z',
  version: '3.0.1',
  instance_type: 'developer',
  instance_type_name: 'Trial',
  reauthentication_enabled: true,
  kafka_storage_size: '10Gi',
  max_data_retention_size: {
    bytes: 10737418240,
  },
  browser_url:
    'https://console.redhat.com/application-services/streams/kafkas/cc88cn3diejt4m3u5rsg/dashboard',
  size_id: 'x1',
  ingress_throughput_per_sec: '1Mi',
  egress_throughput_per_sec: '1Mi',
  total_max_connections: 100,
  max_partitions: 100,
  max_data_retention_period: 'P14D',
  max_connection_attempts_per_sec: 50,
  billing_model: 'standard',
};

const namespace_test = {
  id: 'cc88bv85q3a79e0g8agg',
  kind: 'ConnectorNamespace',
  href: '/api/connector_mgmt/v1/kafka_connector_namespaces/cc88bv85q3a79e0g8agg',
  owner: 'ishukla_kafka_supporting',
  created_at: '2022-09-01T10:14:21.083828Z',
  modified_at: '2022-09-01T10:15:07.21635Z',
  name: 'preview-namespace-m2Eq5cdgKHfUb4wY1Zjp5N',
  annotations: {
    'connector_mgmt.bf2.org/profile': 'evaluation-profile',
  },
  resource_version: 743592,
  quota: {
    connectors: 4,
    memory_requests: '1Gi',
    memory_limits: '2Gi',
    cpu_requests: '1',
    cpu_limits: '2',
  },
  cluster_id: 'cc6ae6o7764p8lrcfbj0',
  expiration: '2022-09-03T10:14:21.079933Z',
  tenant: {
    kind: 'user',
    id: 'ishukla_kafka_supporting',
  },
  status: {
    state: 'ready',
    version: '743592',
    connectors_deployed: 0,
  },
};

export default {
  title: 'Wizard step 5/Review Step',
  component: StepReviewComponent,
  decorators: [(Story) => <Story />],
  args: {},
} as ComponentMeta<typeof StepReviewComponent>;

const Template: ComponentStory<typeof StepReviewComponent> = (args) => (
  <StepReviewComponent {...args} />
);

export const Default = Template.bind({});
Default.args = {
  kafka: kafka_instance_test,
  namespace: namespace_test,
  connectorType: aws_s3_sink.connector_type,
  name: 'test',
  topic: undefined,
  userErrorHandler: 'stop',
  userServiceAccount: {
    clientId: 'indra-5bb611b1-837c-4fe6-820a-af3bc4c0aa09',
    clientSecret: 'indra-5bb611b1-837c-4fe6-820a-sceret',
  },
  configString:
    '{\n  "data_shape": {\n    "consumes": {\n      "format": "application/octet-stream"\n    }\n  },\n  "aws_access_key": "Access Key",\n  "aws_bucket_name_or_arn": "Bucket Name",\n  "aws_key_name": "Key Name",\n  "aws_region": "af-south-1",\n  "aws_secret_key": "Secret Key",\n  "kafka_topic": "Topic Names"\n}',
  savingError: undefined,
} as ComponentMeta<typeof StepReviewComponent>;

export const WithDLQErrorHandling = Template.bind({});
WithDLQErrorHandling.args = {
  kafka: kafka_instance_test,
  namespace: namespace_test,
  connectorType: aws_s3_sink.connector_type,
  name: 'test',
  topic: 'Dead_letter_topic_name',
  userErrorHandler: 'dead_letter_queue',
  userServiceAccount: {
    clientId: 'indra-5bb611b1-837c-4fe6-820a-af3bc4c0aa09',
    clientSecret: 'indra-5bb611b1-837c-4fe6-820a-sceret',
  },
  configString:
    '{\n  "data_shape": {\n    "consumes": {\n      "format": "application/octet-stream"\n    }\n  },\n  "aws_access_key": "Access Key",\n  "aws_bucket_name_or_arn": "Bucket Name",\n  "aws_key_name": "Key Name",\n  "aws_region": "af-south-1",\n  "aws_secret_key": "Secret Key",\n  "kafka_topic": "Topic Names"\n}',
  savingError: undefined,
} as ComponentMeta<typeof StepReviewComponent>;

export const WithDataShapeConsumesAndProduces = Template.bind({});
WithDataShapeConsumesAndProduces.args = {
  kafka: kafka_instance_test,
  namespace: namespace_test,
  connectorType: aws_kinesis_source.connector_type,
  name: 'test',
  topic: 'Dead_letter_topic_name',
  userErrorHandler: 'dead_letter_queue',
  userServiceAccount: {
    clientId: 'indra-5bb611b1-837c-4fe6-820a-af3bc4c0aa09',
    clientSecret: 'indra-5bb611b1-837c-4fe6-820a-sceret',
  },
  configString:
    '{\n  "data_shape": {\n    "consumes": {\n      "format": "application/octet-stream"\n    },\n    "produces": {\n      "format": "application/octet-stream"\n    }\n  },\n  "aws_access_key": "access_key",\n  "aws_region": "aws_region",\n  "aws_secret_key": "secret_key",\n  "aws_stream": "stream_name",\n  "kafka_topic": "topic_names"\n}',
  savingError: undefined,
} as ComponentMeta<typeof StepReviewComponent>;

export const ForDebeziumConnector = Template.bind({});
ForDebeziumConnector.args = {
  kafka: kafka_instance_test,
  namespace: namespace_test,
  connectorType: debezium_postgres.connector_type,
  name: 'test',
  topic: undefined,
  userErrorHandler: undefined,
  userServiceAccount: {
    clientId: 'indra-5bb611b1-837c-4fe6-820a-af3bc4c0aa09',
    clientSecret: 'indra-5bb611b1-837c-4fe6-820a-sceret',
  },
  configString:
    '{\n  "database.dbname": "postgres",\n  "database.hostname": "dbzui-db-pg",\n  "database.user": "postgres",\n  "database.password": "postgres",\n  "database.server.name": "fullfilment",\n  "schema.include.list": "inventory",\n  "table.exclude.list": "inventory.geom",\n  "data_shape": {\n    "key": "JSON",\n    "value": "JSON without schema"\n  },\n  "snapshot.mode": "always"\n}',
  savingError: undefined,
} as ComponentMeta<typeof StepReviewComponent>;
