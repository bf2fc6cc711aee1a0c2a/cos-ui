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

export const defaultPerPageOptions = [
  {
    title: '1',
    value: 1,
  },
  {
    title: '5',
    value: 5,
  },
  {
    title: '10',
    value: 10,
  },
];
