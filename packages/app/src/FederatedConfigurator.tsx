/* eslint-disable camelcase */
/* eslint-disable no-undef */
import React, { ComponentType, LazyExoticComponent } from 'react';
import { ConnectorType } from '@kas-connectors/api';
import { ConnectorConfiguratorResponse } from '@kas-connectors/machines';

export type FederatedConfiguratorConfig = { steps: string[], Configurator: LazyExoticComponent<ComponentType<any>>};
type FederatedConfigurationConfigModule = { default: FederatedConfiguratorConfig }

export async function loadFederatedConfigurator(scope: string, module: string): Promise<FederatedConfiguratorConfig> {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  const container = (window as any)[scope]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await (window as any)[scope].get(module);
  const federatedConfigurationConfig = factory() as FederatedConfigurationConfigModule;
  console.log(`loaded federated configurator configuration from ${scope}`, federatedConfigurationConfig);
  return federatedConfigurationConfig.default;
}

export const loadFederatedModule = async (url: string) => {
  return new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic federated module Loaded: ${url}`);
      document.head.removeChild(element);
      resolve();
    };

    element.onerror = () => {
      console.error(`Dynamic federated module Error: ${url}`);
      console.log(`Dynamic federated module Removed: ${url}`);
      document.head.removeChild(element);
      reject();
    };

    document.head.appendChild(element);
  });
};

export const fetchConfigurator = async (
  connector: ConnectorType
): Promise<ConnectorConfiguratorResponse> => {
  switch (connector.id) {
    case 'aws-kinesis-source':
      await loadFederatedModule(
        'http://localhost:3002/foo-connector-configurator.remoteEntry.js'
      );
      return loadFederatedConfigurator(
        'someProject_FooConnectorConfigurator',
        './config'
      );
    default:
      return Promise.resolve({
        steps: false,
        Configurator: () => <p>TODO: json-schema based configurator</p>,
      });
  }
};
