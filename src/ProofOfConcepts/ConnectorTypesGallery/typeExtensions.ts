import {
  ConnectorTypeAllOf,
  ObjectReference,
} from '@rhoas/connector-management-sdk';

export type SortEntry = {
  label: string;
  value: string;
};

export type FeaturedConnectorType = ConnectorTypeAllOf &
  ObjectReference & { featured_rank: number };

export type ConnectorTypeLabelCount = {
  label: string;
  count: number;
};

export type ConnectorTypeApiResponse = {
  page: number;
  size: number;
  items: Array<FeaturedConnectorType>;
  total: number;
};

export type ConnectorTypeLabelsApiResponse = {
  items: Array<ConnectorTypeLabelCount>;
};
