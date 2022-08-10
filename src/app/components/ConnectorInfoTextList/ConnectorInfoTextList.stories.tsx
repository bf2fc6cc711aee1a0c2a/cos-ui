import { subDays, subMinutes } from 'date-fns';
import React from 'react';

import { Spinner } from '@patternfly/react-core';

import { ConnectorInfoTextList } from './ConnectorInfoTextList';

const namespace = {
  id: 'c95j6h66ar2c9mtr5vjg',
  kind: 'ConnectorNamespace',
  href: '/api/connector_mgmt/v1/kafka_connector_namespaces/c95j6h66ar2c9mtr5vjg',
  owner: 'John Doe',
  created_at: '2022-04-04T18:04:52.138453Z',
  modified_at: '2022-08-05T10:50:30.221969Z',
  name: 'default-connector-namespace',
  annotations: {
    'connector_mgmt.bf2.org/profile': 'default-profile',
  },
  resource_version: 743272,
  quota: {},
  cluster_id: 'c95j6gu6ar2c9mtr5vj0',
  tenant: {
    kind: 'organisation',
    id: '13888347',
  },
  status: {
    state: 'ready',
    version: '743272',
    connectors_deployed: 11,
  },
};

const PreviewNamespace = {
  id: 'cboa5ro7l5g6ed6u50p0',
  kind: 'ConnectorNamespace',
  href: '/api/connector_mgmt/v1/kafka_connector_namespaces/cboa5ro7l5g6ed6u50p0',
  owner: 'ishukla_kafka_supporting',
  created_at: '2022-08-08T05:45:19.824622Z',
  modified_at: '2022-08-08T05:46:15.133183Z',
  name: 'preview-namespace-pFpAksrBSa1oaKeHEC3HVX',
  annotations: {
    'connector_mgmt.bf2.org/profile': 'evaluation-profile',
  },
  resource_version: 743502,
  quota: {
    connectors: 4,
    memory_requests: '1Gi',
    memory_limits: '2Gi',
    cpu_requests: '1',
    cpu_limits: '2',
  },
  cluster_id: 'c95j6gu6ar2c9mtr5vj0',
  expiration: '2022-08-10T05:45:19.820885Z',
  tenant: {
    kind: 'user',
    id: 'ishukla_kafka_supporting',
  },
  status: {
    state: 'ready',
    version: '743502',
    connectors_deployed: 1,
  },
};

export default {
  title: 'UI/Components/ConnectorInfoTextList',
  component: ConnectorInfoTextList,
};

const Template = (args) => <ConnectorInfoTextList {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'ob-stable-prcs-f3005ba4-9ac6-407a-aad9-a26359d4e7aa',
  id: 'catidbdl8sff4d6vi11g',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'openbridge_kafka_supporting',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
};

export const Loading = Template.bind({});
Loading.args = {
  name: 'ob-stable-prcs-f3005ba4-9ac6-407a-aad9-a26359d4e7aa',
  id: 'catidbdl8sff4d6vi11g',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: <Spinner size="md" />,
  owner: 'openbridge_kafka_supporting',
  namespaceData: <Spinner size="md" />,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
};

export const WithExpiredKafkaInstance = Template.bind({});
WithExpiredKafkaInstance.args = {
  name: 'ob-stable-prcs-f3005ba4-9ac6-407a-aad9-a26359d4e7aa',
  id: 'catidbdl8sff4d6vi11g',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'openbridge_kafka_supporting',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
};

export const WithPreviewNamespace = Template.bind({});
WithPreviewNamespace.args = {
  name: 'ob-stable-prcs-f3005ba4-9ac6-407a-aad9-a26359d4e7aa',
  id: 'catidbdl8sff4d6vi11g',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'openbridge_kafka_supporting',
  namespaceData: { ...PreviewNamespace, expiration: subDays(new Date(), -2) },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
};
