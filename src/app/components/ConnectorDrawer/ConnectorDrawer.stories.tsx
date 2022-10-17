import { ComponentStory, ComponentMeta } from '@storybook/react';
import {
  startOfTomorrow,
  startOfYesterday,
  subDays,
  subMinutes,
} from 'date-fns';
import { subHours } from 'date-fns/esm';
import React from 'react';

import { Drawer, DrawerContent, Spinner } from '@patternfly/react-core';

import {
  Connector,
  ConnectorDesiredState,
} from '@rhoas/connector-management-sdk';

import { ConnectorStatus } from '../ConnectorStatus/ConnectorStatus';
import { ConnectorStatusValues } from '../ConnectorStatus/ConnectorStatus.stories';
import { ConnectorDrawerContent } from './ConnectorDrawer';

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
  title: 'Pages/Connector Instances Page/components/Drawer',
  component: ConnectorDrawerContent,
  decorators: [
    (Story) => (
      <Drawer isExpanded={true}>
        <DrawerContent panelContent={<Story />}></DrawerContent>
      </Drawer>
    ),
  ],
  argTypes: {
    status: {
      options: Object.values(ConnectorStatusValues),
      control: 'radio',
    },
  },
} as ComponentMeta<typeof ConnectorDrawerContent>;

const Template: ComponentStory<typeof ConnectorDrawerContent> = (args) => (
  <ConnectorDrawerContent {...args} />
);

export const Default = Template.bind({});
Default.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'ready'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const Loading = Template.bind({});
Loading.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: <Spinner size="md" />,
  owner: 'John Doe',
  namespaceData: <Spinner size="md" />,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'ready'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const FailedConnector = Template.bind({});
FailedConnector.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'failed',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'failed'}
      name={'Test Connector'}
      state={'failed'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error:
    'Error: Authentication failed: credentials for user could not be verified',
};

export const WithLongFailedMsg = Template.bind({});
WithLongFailedMsg.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'failed',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'failed'}
      name={'Test Connector'}
      state={'failed'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error:
    'Error: Authentication failed: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
};

export const WithExpiredKafkaInstance = Template.bind({});
WithExpiredKafkaInstance.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'ready'}
    />
  ),
  connectorActions: <div id="connector-action" />,
};

export const WithPreviewNamespaceInfo = Template.bind({});
WithPreviewNamespaceInfo.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subDays(new Date(), -2) },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'assigned'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const WithPreviewNamespaceWarning = Template.bind({});
WithPreviewNamespaceWarning.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subHours(new Date(), -15) },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subHours(new Date(), 24),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'ready'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error:
    'Error: ReplicaSet "mctr-cbtn9ke45ncr6gs6rfo0-f6574dd8" has timed out progressing.',
};

export const WithPreviewNamespaceDanger = Template.bind({});
WithPreviewNamespaceDanger.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subHours(new Date(), -1) },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'ready'}
      name={'Test Connector'}
      state={'assigned'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const ConnectorDeleting = Template.bind({});
ConnectorDeleting.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: {
    ...PreviewNamespace,
    expiration: '2022-08-08T00:10:19.820885Z',
  },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={ConnectorDesiredState.Deleted}
      name={'Test Connector'}
      state={'deleting'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const ConnectorDeleted = Template.bind({});
ConnectorDeleted.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: {
    ...PreviewNamespace,
    expiration: '2022-08-08T00:10:19.820885Z',
  },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'ready',
  connectorStatus: (
    <ConnectorStatus
      desiredState={ConnectorDesiredState.Deleted}
      name={'Test Connector'}
      state={ConnectorDesiredState.Deleted}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error: undefined,
};

export const FailedConnectorWithExpiredKafkaAndPreviewNamespace = Template.bind(
  {}
);
FailedConnectorWithExpiredKafkaAndPreviewNamespace.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  bootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subDays(new Date(), -2) },
  createdAt: subDays(new Date(), 120),
  modifiedAt: subMinutes(new Date(), 28),
  status: 'failed',
  connectorStatus: (
    <ConnectorStatus
      desiredState={'failed'}
      name={'Test Connector'}
      state={'failed'}
    />
  ),
  connectorActions: <div id="connector-action" />,
  error:
    'Error: ReplicaSet "mctr-cbtn9ke45ncr6gs6rfo0-f6574dd8" has timed out progressing.',
};
