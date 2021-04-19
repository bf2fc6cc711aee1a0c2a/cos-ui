/* eslint-disable camelcase */
/* eslint-disable no-undef */
import React from 'react';

export type FederatedConfiguratorConfig = { steps: string[], Configurator: React.LazyExoticComponent<React.ComponentType<any>>};
type FederatedConfigurationConfigModule = { default: FederatedConfiguratorConfig }

export async function loadFederatedConfigurator(scope: string, module: string): Promise<FederatedConfiguratorConfig> {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');
  const container = window[scope]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  const federatedConfigurationConfig = factory() as FederatedConfigurationConfigModule;
  console.log(`loaded federated configurator configuration from ${scope}`, federatedConfigurationConfig);
  return federatedConfigurationConfig.default;
}