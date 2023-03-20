import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';

import { Gallery } from '@patternfly/react-core';

import { ConnectorNamespaceState } from '@rhoas/connector-management-sdk';

import { ConnectorTypeCard } from '../ConnectorTypeCard/ConnectorTypeCard';
import { NamespaceCard } from './NamespaceCard';

export default {
  title: 'Wizard Step 3/Cards/NamespaceCards',
  component: NamespaceCard,
  decorators: [
    (Story) => (
      <div className={'pf-l-stack__item pf-m-fill'}>
        <Gallery hasGutter>
          <Story />
        </Gallery>
      </div>
    ),
  ],
  args: {
    state: ConnectorNamespaceState.Ready,
    id: 'cdc626c1u302el1rp090',
    name: 'default-connector-namespace',
    clusterId: 'ca34tqpnnj5k851srhjg',
    clusterName: 'rhoc-stage',
    selectedNamespace: '',
    onSelect: () => {},
    isEval: false,
    owner: 'ishukla_kafka_supporting',
  },
} as ComponentMeta<typeof ConnectorTypeCard>;

const Template: ComponentStory<typeof NamespaceCard> = (args) => (
  <NamespaceCard {...args} />
);

export const Namespace = Template.bind({});

export const SelectedNamespace = Template.bind({});
SelectedNamespace.args = {
  selectedNamespace: 'cdc626c1u302el1rp090',
};

export const NamespaceProvisioning = Template.bind({});
NamespaceProvisioning.args = {
  state: ConnectorNamespaceState.Disconnected,
};

export const NamespaceDeleting = Template.bind({});
NamespaceDeleting.args = {
  state: ConnectorNamespaceState.Deleting,
};

export const NamespaceDeleted = Template.bind({});
NamespaceDeleted.args = {
  state: ConnectorNamespaceState.Deleted,
};

export const PreviewNamespace = Template.bind({});
PreviewNamespace.args = {
  isEval: true,
};

export const PreviewNamespaceProvisioning = Template.bind({});
PreviewNamespaceProvisioning.args = {
  isEval: true,
  state: ConnectorNamespaceState.Disconnected,
};
