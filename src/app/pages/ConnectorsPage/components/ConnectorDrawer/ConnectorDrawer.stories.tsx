import { ComponentStory, ComponentMeta } from '@storybook/react';
import { subDays, subMinutes } from 'date-fns';
import { subHours } from 'date-fns/esm';
import React from 'react';

import { Drawer, DrawerContent, Spinner } from '@patternfly/react-core';

import { ConnectorDrawerContent } from './ConnectorDrawerContent';
import { DrawerHeader } from './DrawerHeader';

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
  title: 'Pages/Connector Instances Page/components/Drawer Content',
  component: ConnectorDrawerContent,
  /*
  decorators: [
    (Story) => (

      <Drawer isExpanded={true}>
        <DrawerContent panelContent={<Story />} />
      </Drawer>
    ),
  ],
  */
} as ComponentMeta<typeof ConnectorDrawerContent>;

const Template: ComponentStory<typeof ConnectorDrawerContent> = (args) => (
  <>
    <DrawerHeader
      drawerHeading={args.name}
      status={<></>}
      actionsMenu={<></>}
      onClose={() => {
        console.log('On close');
      }}
    />
    <ConnectorDrawerContent {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const Loading = Template.bind({});
Loading.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: <Spinner size="md" />,
  owner: 'John Doe',
  namespaceData: <Spinner size="md" />,
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const FailedConnector = Template.bind({});
FailedConnector.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'failed',
  errorStateMessage:
    'Error: Authentication failed: credentials for user could not be verified',
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const WithLongFailedMsg = Template.bind({});
WithLongFailedMsg.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'failed',
  errorStateMessage:
    'Error: Authentication failed: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const WithExpiredKafkaInstance = Template.bind({});
WithExpiredKafkaInstance.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: namespace,
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const WithPreviewNamespaceInfo = Template.bind({});
WithPreviewNamespaceInfo.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subDays(new Date(), -2) },
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const WithPreviewNamespaceWarning = Template.bind({});
WithPreviewNamespaceWarning.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subHours(new Date(), -15) },
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subHours(new Date(), 24).toISOString(),
  currentState: 'ready',
  errorStateMessage:
    'Error: ReplicaSet "mctr-cbtn9ke45ncr6gs6rfo0-f6574dd8" has timed out progressing.',
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const WithPreviewNamespaceDanger = Template.bind({});
WithPreviewNamespaceDanger.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: {
    name: 'ishukla-test-kafka',
    id: 'catidbdl8sff4d6vi11g',
  },
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subHours(new Date(), -1) },
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const ConnectorDeleting = Template.bind({});
ConnectorDeleting.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
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
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const ConnectorDeleted = Template.bind({});
ConnectorDeleted.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: {
    ...PreviewNamespace,
    expiration: '2022-08-08T00:10:19.820885Z',
  },
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'ready',
  errorStateMessage: undefined,
  onDuplicateConnector: () => console.log('On duplicate connector'),
};

export const FailedConnectorWithExpiredKafkaAndPreviewNamespace = Template.bind(
  {}
);
FailedConnectorWithExpiredKafkaAndPreviewNamespace.args = {
  id: 'caup1ell8sff4d70r3pg',
  name: 'Test Connector',
  kafkaBootstrapServer:
    'https://openbridge-c--ajhf-ek--ri--ifea.bf2.kafka.rhcloud.com:443',
  kafkaInstanceData: 'No longer exists',
  owner: 'John Doe',
  namespaceData: { ...PreviewNamespace, expiration: subDays(new Date(), -2) },
  createdAt: subDays(new Date(), 120).toISOString(),
  modifiedAt: subMinutes(new Date(), 28).toISOString(),
  currentState: 'failed',
  errorStateMessage:
    'Error: ReplicaSet "mctr-cbtn9ke45ncr6gs6rfo0-f6574dd8" has timed out progressing.',
  onDuplicateConnector: () => console.log('On duplicate connector'),
};
