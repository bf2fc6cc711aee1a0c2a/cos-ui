import { ComponentMeta, ComponentStory } from '@storybook/react';
import { subHours } from 'date-fns/esm';
import _ from 'lodash';
import React from 'react';

import { CosContextProvider } from '../../../hooks/useCos';
import { AlertsProvider } from '../../components/Alerts/Alerts';
import { DeploymentGallery } from './StepDeployment';

const API_HOST = 'https://dummy.server';

const response = {
  error: undefined,
  total: 2,
  items: [
    {
      id: 'cdl1esihpipg6b0rlukg',
      kind: 'ConnectorNamespace',
      href: '/api/connector_mgmt/v1/kafka_connector_namespaces/cdl1esihpipg6b0rlukg',
      owner: 'lgarciaa_kafka_supporting',
      created_at: '2022-11-08T08:46:42.806385Z',
      modified_at: '2022-11-08T08:46:42.806385Z',
      name: 'default-connector-namespace',
      annotations: {
        'cos.bf2.org/profile': 'default-profile',
      },
      resource_version: 744099,
      quota: {},
      cluster_id: 'cdl1esihpipg6b0rluk0',
      tenant: {
        kind: 'organisation',
        id: '13888347',
      },
      status: {
        state: 'disconnected',
        connectors_deployed: 0,
      },
    },
    {
      id: 'cc6ae6o7764p8lrcfbk0',
      kind: 'ConnectorNamespace',
      href: '/api/connector_mgmt/v1/kafka_connector_namespaces/cc6ae6o7764p8lrcfbk0',
      owner: 'abrianik_kafka_supporting',
      created_at: '2022-08-29T11:46:35.641943Z',
      modified_at: '2023-03-20T13:02:44.885489Z',
      name: 'default-connector-namespace',
      annotations: {
        'cos.bf2.org/profile': 'default-profile',
      },
      resource_version: 743578,
      quota: {},
      cluster_id: 'cc6ae6o7764p8lrcfbj0',
      tenant: {
        kind: 'organisation',
        id: '13888347',
      },
      status: {
        state: 'ready',
        version: '743578',
        connectors_deployed: 2,
      },
    },
  ],
};

const previewObject = {
  id: 'cgbug6ebk4qjq2bti1j0',
  kind: 'ConnectorNamespace',
  href: '/api/connector_mgmt/v1/kafka_connector_namespaces/cgbug6ebk4qjq2bti1j0',
  owner: 'ishukla_kafka_supporting',
  created_at: '2023-03-20T04:59:05.470923Z',
  modified_at: '2023-03-20T04:59:44.889086Z',
  name: 'preview-namespace-8jSfxM3KKNjiGQkua7jXLr',
  annotations: {
    'cos.bf2.org/profile': 'evaluation-profile',
  },
  resource_version: 745023,
  quota: {
    connectors: 4,
    memory_requests: '1Gi',
    memory_limits: '2Gi',
    cpu_requests: '1',
    cpu_limits: '2',
  },
  cluster_id: 'cc6ae6o7764p8lrcfbj0',
  expiration: subHours(new Date(), -36).toISOString(),
  tenant: {
    kind: 'user',
    id: 'ishukla_kafka_supporting',
  },
  status: {
    state: 'ready',
    version: '745023',
    connectors_deployed: 0,
  },
};

const responseWithPreview = _.cloneDeep(response);
responseWithPreview.items.push(previewObject);

const responseWithPreviewWarning = _.cloneDeep(response);
responseWithPreviewWarning.items.push({
  ...previewObject,
  ...{ expiration: subHours(new Date(), -12).toISOString() },
});

const responseWithPreviewDanger = _.cloneDeep(response);
responseWithPreviewDanger.items.push({
  ...previewObject,
  ...{ expiration: subHours(new Date(), -1).toISOString() },
});

export default {
  title: 'Wizard Step 3/DeploymentStep',
  component: DeploymentGallery,
  decorators: [
    (Story) => (
      <>
        <CosContextProvider
          getToken={() => Promise.resolve('')}
          connectorsApiBasePath={API_HOST}
          kafkaManagementApiBasePath={API_HOST}
        >
          <AlertsProvider>
            <Story />
          </AlertsProvider>
        </CosContextProvider>
      </>
    ),
  ],
  args: {
    response: {},
    request: {},
    selectedId: '',
    duplicateMode: false,
    loading: false,
    error: false,
    noResults: false,
    queryEmpty: false,
    firstRequest: false,
    onSelect: () => undefined,
    onDeselect: () => undefined,
    onRefresh: () => undefined,
    runQuery: () => undefined,
  },
} as ComponentMeta<typeof DeploymentGallery>;

const Template: ComponentStory<typeof DeploymentGallery> = (args) => (
  <DeploymentGallery {...args} />
);

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const EmptyState = Template.bind({});

export const EmptySearchResult = Template.bind({});
EmptySearchResult.args = {
  queryEmpty: true,
};

export const WithNamespace = Template.bind({});
WithNamespace.args = {
  response: response,
};

export const WithPreviewNamespace = Template.bind({});
WithPreviewNamespace.args = {
  response: responseWithPreview,
};

export const WithPreviewNamespaceSelectedInfoAlert = Template.bind({});
WithPreviewNamespaceSelectedInfoAlert.args = {
  response: responseWithPreview,
  selectedId: 'cgbug6ebk4qjq2bti1j0',
};

export const WithPreviewNamespaceSelectedWarningAlert = Template.bind({});
WithPreviewNamespaceSelectedWarningAlert.args = {
  response: responseWithPreviewWarning,
  selectedId: 'cgbug6ebk4qjq2bti1j0',
};

export const WithPreviewNamespaceSelectedDangerAlert = Template.bind({});
WithPreviewNamespaceSelectedDangerAlert.args = {
  response: responseWithPreviewDanger,
  selectedId: 'cgbug6ebk4qjq2bti1j0',
};

export const WithNamespaceSelected = Template.bind({});
WithNamespaceSelected.args = {
  response: response,
  selectedId: 'cc6ae6o7764p8lrcfbk0',
};
