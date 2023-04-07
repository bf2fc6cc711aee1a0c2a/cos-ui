// The route within the console.redhat.com environment that this app sits at
export const APP_ROUTE = '/application-services/connectors';
// The preview/beta route within console.redhat.com
export const PREVIEW_APP_ROUTE = '/beta/application-services/connectors';
// the root URL for the connectors management API

export const DEBEZIUM_CONFIGURATOR =
  'https://console.redhat.com/apps/dbz-ui-build/dbz-connector-configurator.remoteEntry.js';
// The entry point for the beta build of the debezium federated module
export const DEBEZIUM_CONFIGURATOR_PREVIEW =
  'https://console.redhat.com/beta/apps/dbz-ui-build/dbz-connector-configurator.remoteEntry.js';

export const COS_MANAGEMENT_DEV_BASE_PATH =
  'https://cos-fleet-manager-managed-connectors-dev.rhoc-dev-153f1de160110098c1928a6c05e19444-0000.eu-de.containers.appdomain.cloud' as const;
export const STAGE_BASE_PATH = 'https://api.stage.openshift.com' as const;
export const PROD_BASE_PATH = 'https://api.openshift.com' as const;

// Map our client-side hostname to the correct backend
export const ENDPOINT_MAPPINGS = [
  // Development
  {
    hostnames: ['prod.foo.redhat.com'] as const,
    cosManagementApiBasePath: COS_MANAGEMENT_DEV_BASE_PATH,
    kafkaManagementApiBasePath: PROD_BASE_PATH,
  },
  // Staging
  {
    hostnames: [
      'qaprodauth.cloud.redhat.com',
      'qaprodauth.console.redhat.com',
    ] as const,
    cosManagementApiBasePath: STAGE_BASE_PATH,
    kafkaManagementApiBasePath: PROD_BASE_PATH,
  },
  // Otherwise production is used
] as const;
