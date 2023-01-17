// Constants used across the app
export const PAGINATED_MACHINE_ID = 'paginatedApi';
export const FETCH_MACHINE_ID = 'fetchApi';

export const SELECT_CONNECTOR_TYPE = 'Select Connector Type';
export const SELECT_KAFKA_INSTANCE = 'Select Kafka Instance';
export const SELECT_NAMESPACE = 'Select Namespace';
export const CORE_CONFIGURATION = 'Core Configuration';
export const CONNECTOR_SPECIFIC = 'Connector Specific';
export const ERROR_HANDLING = 'Error Handling';
export const REVIEW_CONFIGURATION = 'Review Configuration';

export enum CONNECTOR_DETAILS_TABS {
  Overview = 'overview',
  Configuration = 'configuration',
}

export enum ERROR_HANDLING_STRATEGY {
  Log = 'log',
  Stop = 'stop',
  DeadLetterQueue = 'dead_letter_queue',
}

export const ADDON_INSTALLATION_GUIDE_URL =
  'https://access.redhat.com/documentation/en-us/openshift_connectors/1/guide/15a79de0-8827-4bf1-b445-8e3b3eef7b01';
export const RHOC_SUBSCRIPTION_URL =
  'https://www.redhat.com/en/technologies/cloud-computing/openshift/connectors';
