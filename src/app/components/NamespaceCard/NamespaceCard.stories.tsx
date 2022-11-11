import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';

import { Gallery } from '@patternfly/react-core';

import { ConnectorNamespaceState } from '@rhoas/connector-management-sdk';

import { ConnectorTypeCard } from '../ConnectorTypeCard/ConnectorTypeCard';
import { NamespaceCard } from './NamespaceCard';

const API_HOST = 'https://dummy.server';
const CLUSTER_ID = 'cc6ae6o7764p8lrcfbj0';

export default {
  title: 'Wizard Step 3/Components/Namespace cards',
  component: NamespaceCard,
  decorators: [(Story) => <Story />],
  args: {
    state: ConnectorNamespaceState.Ready,
    id: CLUSTER_ID,
    name: 'default-connector-namespace',
    clusterId: 'ca34tqpnnj5k851srhjg',
    createdAt: '2021-09-01T12:00:00Z',
    selectedNamespace: '',
    onSelect: () => {},
    connectorsApiBasePath: API_HOST,
    getToken: () => Promise.resolve(''),
  },
} as ComponentMeta<typeof ConnectorTypeCard>;

const Template: ComponentStory<typeof NamespaceCard> = (args) => (
  <Gallery hasGutter>
    <NamespaceCard {...args} />
  </Gallery>
);

export const NamespaceCardReady = Template.bind({});

export const NamespaceCardProvisioning = Template.bind({});
NamespaceCardProvisioning.args = {
  state: ConnectorNamespaceState.Disconnected,
} as ComponentMeta<typeof NamespaceCard>;

export const NamespaceCardDeleting = Template.bind({});
NamespaceCardDeleting.args = {
  state: ConnectorNamespaceState.Deleting,
} as ComponentMeta<typeof NamespaceCard>;

export const NamespaceCardDeleted = Template.bind({});
NamespaceCardDeleted.args = {
  state: ConnectorNamespaceState.Deleted,
} as ComponentMeta<typeof NamespaceCard>;
