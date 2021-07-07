import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** a JSON encoded object */
  JSON: any;
};

/** A addon parameter */
export type AddonParameterResult = {
  __typename?: 'AddonParameterResult';
  id?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type ClusterTargetInput = {
  cloud_provider?: Maybe<Scalars['String']>;
  cluster_id?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  multi_az?: Maybe<Scalars['Boolean']>;
  region?: Maybe<Scalars['String']>;
};

export type ClusterTargetResult = {
  __typename?: 'ClusterTargetResult';
  cloud_provider?: Maybe<Scalars['String']>;
  cluster_id?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  multi_az?: Maybe<Scalars['Boolean']>;
  region?: Maybe<Scalars['String']>;
};

/** Schema for the request to update a data plane cluster's status */
export type ConnectorClusterInput = {
  href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  metadata?: Maybe<ConnectorClusterMetadataInput>;
  status?: Maybe<Scalars['String']>;
};

export type ConnectorClusterListResult = {
  __typename?: 'ConnectorClusterListResult';
  items?: Maybe<Array<Maybe<ConnectorClusterResult>>>;
  kind?: Maybe<Scalars['String']>;
  page?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type ConnectorClusterMetadataInput = {
  created_at?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['String']>;
};

export type ConnectorClusterMetadataResult = {
  __typename?: 'ConnectorClusterMetadataResult';
  created_at?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['String']>;
};

/** Schema for the request to update a data plane cluster's status */
export type ConnectorClusterResult = {
  __typename?: 'ConnectorClusterResult';
  href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  metadata?: Maybe<ConnectorClusterMetadataResult>;
  status?: Maybe<Scalars['String']>;
};

/** A connector holds the configuration to connect a Kafka topic to another system. */
export type ConnectorInput = {
  channel?: Maybe<Scalars['String']>;
  connector_spec?: Maybe<Scalars['JSON']>;
  connector_type_id?: Maybe<Scalars['String']>;
  deployment_location?: Maybe<ClusterTargetInput>;
  desired_state?: Maybe<Scalars['String']>;
  href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  kafka?: Maybe<KafkaConnectionSettingsInput>;
  kind?: Maybe<Scalars['String']>;
  metadata?: Maybe<ConnectorMetadataInput>;
  status?: Maybe<Scalars['String']>;
};

export type ConnectorListResult = {
  __typename?: 'ConnectorListResult';
  items?: Maybe<Array<Maybe<ConnectorResult>>>;
  kind?: Maybe<Scalars['String']>;
  page?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type ConnectorMetadataInput = {
  created_at?: Maybe<Scalars['String']>;
  kafka_id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  resource_version?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['String']>;
};

export type ConnectorMetadataResult = {
  __typename?: 'ConnectorMetadataResult';
  created_at?: Maybe<Scalars['String']>;
  kafka_id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  resource_version?: Maybe<Scalars['Int']>;
  updated_at?: Maybe<Scalars['String']>;
};

/** A connector holds the configuration to connect a Kafka topic to another system. */
export type ConnectorResult = {
  __typename?: 'ConnectorResult';
  channel?: Maybe<Scalars['String']>;
  connector_spec?: Maybe<Scalars['JSON']>;
  connector_type_id?: Maybe<Scalars['String']>;
  deployment_location?: Maybe<ClusterTargetResult>;
  desired_state?: Maybe<Scalars['String']>;
  href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  kafka?: Maybe<KafkaConnectionSettingsResult>;
  kind?: Maybe<Scalars['String']>;
  metadata?: Maybe<ConnectorMetadataResult>;
  status?: Maybe<Scalars['String']>;
};

export type ConnectorTypeListResult = {
  __typename?: 'ConnectorTypeListResult';
  items?: Maybe<Array<Maybe<ConnectorTypeResult>>>;
  kind?: Maybe<Scalars['String']>;
  page?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

/** Represents a connector type supported by the API */
export type ConnectorTypeResult = {
  __typename?: 'ConnectorTypeResult';
  /** Version of the connector type. */
  channels?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** A description of the connector. */
  description?: Maybe<Scalars['String']>;
  href?: Maybe<Scalars['String']>;
  /** URL to an icon of the connector. */
  icon_href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  /** A json schema that can be used to validate a connectors connector_spec field. */
  json_schema?: Maybe<Scalars['JSON']>;
  kind?: Maybe<Scalars['String']>;
  /** labels used to categorize the connector */
  labels?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Name of the connector type. */
  name?: Maybe<Scalars['String']>;
  /** Version of the connector type. */
  version?: Maybe<Scalars['String']>;
};

export type ErrorResult = {
  __typename?: 'ErrorResult';
  code?: Maybe<Scalars['String']>;
  href?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  operation_id?: Maybe<Scalars['String']>;
  reason?: Maybe<Scalars['String']>;
};


export type KafkaConnectionSettingsInput = {
  bootstrap_server?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  client_secret?: Maybe<Scalars['String']>;
};

export type KafkaConnectionSettingsResult = {
  __typename?: 'KafkaConnectionSettingsResult';
  bootstrap_server?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  client_secret?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Create a new connector
   *
   * **endpoint:** `POST /api/connector_mgmt/v1/kafka_connectors`
   */
  createConnector?: Maybe<ConnectorResult>;
  /**
   * Create a new connector cluster
   *
   * **endpoint:** `POST /api/connector_mgmt/v1/kafka_connector_clusters`
   */
  createConnectorCluster?: Maybe<ConnectorClusterResult>;
  /**
   * Delete a connector
   *
   * **endpoint:** `DELETE /api/connector_mgmt/v1/kafka_connectors/{id}`
   */
  deleteConnector?: Maybe<ErrorResult>;
  /**
   * Delete a connector cluster
   *
   * **endpoint:** `DELETE /api/connector_mgmt/v1/kafka_connector_clusters/{connector_cluster_id}`
   */
  deleteConnectorCluster?: Maybe<ErrorResult>;
  /**
   * patch a connector
   *
   * **endpoint:** `PATCH /api/connector_mgmt/v1/kafka_connectors/{id}`
   */
  patchConnector?: Maybe<ConnectorResult>;
};


export type MutationCreateConnectorArgs = {
  body: ConnectorInput;
  async: Scalars['Boolean'];
};


export type MutationCreateConnectorClusterArgs = {
  body: ConnectorClusterInput;
  async: Scalars['Boolean'];
};


export type MutationDeleteConnectorArgs = {
  id: Scalars['String'];
};


export type MutationDeleteConnectorClusterArgs = {
  connector_cluster_id: Scalars['String'];
};


export type MutationPatchConnectorArgs = {
  body: ConnectorInput;
  id: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Get a connector
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connectors/{id}`
   */
  getConnector?: Maybe<ConnectorResult>;
  /**
   * Get a connector cluster
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connector_clusters/{connector_cluster_id}`
   */
  getConnectorCluster?: Maybe<ConnectorClusterResult>;
  /**
   * Get a connector cluster's addon parameters
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connector_clusters/{connector_cluster_id}/addon_parameters`
   */
  getConnectorClusterAddonParameters?: Maybe<Array<Maybe<AddonParameterResult>>>;
  /**
   * Get a connector type by id
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connector_types/{connector_type_id}`
   */
  getConnectorTypeByID?: Maybe<ConnectorTypeResult>;
  /**
   * Returns a list of connector clusters
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connector_clusters`
   */
  listConnectorClusters?: Maybe<ConnectorClusterListResult>;
  /**
   * Returns a list of connector types
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connector_types`
   */
  listConnectorTypes?: Maybe<ConnectorTypeListResult>;
  /**
   * Returns a list of connector types
   *
   * **endpoint:** `GET /api/connector_mgmt/v1/kafka_connectors`
   */
  listConnectors?: Maybe<ConnectorListResult>;
};


export type QueryGetConnectorArgs = {
  id: Scalars['String'];
};


export type QueryGetConnectorClusterArgs = {
  connector_cluster_id: Scalars['String'];
};


export type QueryGetConnectorClusterAddonParametersArgs = {
  connector_cluster_id: Scalars['String'];
};


export type QueryGetConnectorTypeByIdArgs = {
  connector_type_id: Scalars['String'];
};


export type QueryListConnectorClustersArgs = {
  page?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['String']>;
};


export type QueryListConnectorTypesArgs = {
  page?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['String']>;
};


export type QueryListConnectorsArgs = {
  page?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['String']>;
  kafka_id?: Maybe<Scalars['String']>;
};

export type ListConnectorsQueryVariables = Exact<{
  page?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['String']>;
}>;


export type ListConnectorsQuery = (
  { __typename?: 'Query' }
  & { listConnectors?: Maybe<(
    { __typename?: 'ConnectorListResult' }
    & Pick<ConnectorListResult, 'page' | 'size' | 'total'>
    & { items?: Maybe<Array<Maybe<(
      { __typename?: 'ConnectorResult' }
      & Pick<ConnectorResult, 'channel' | 'connector_type_id' | 'desired_state' | 'id' | 'kind' | 'status'>
      & { deployment_location?: Maybe<(
        { __typename?: 'ClusterTargetResult' }
        & Pick<ClusterTargetResult, 'cloud_provider' | 'kind' | 'region'>
      )>, kafka?: Maybe<(
        { __typename?: 'KafkaConnectionSettingsResult' }
        & Pick<KafkaConnectionSettingsResult, 'bootstrap_server'>
      )>, metadata?: Maybe<(
        { __typename?: 'ConnectorMetadataResult' }
        & Pick<ConnectorMetadataResult, 'name' | 'owner' | 'created_at' | 'updated_at'>
      )> }
    )>>> }
  )> }
);


export const ListConnectorsDocument = gql`
    query listConnectors($page: String, $size: String) {
  listConnectors(page: $page, size: $size) {
    page
    size
    items {
      channel
      connector_type_id
      deployment_location {
        cloud_provider
        kind
        region
      }
      desired_state
      id
      kafka {
        bootstrap_server
      }
      kind
      metadata {
        name
        owner
        created_at
        updated_at
      }
      status
    }
    total
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    listConnectors(variables?: ListConnectorsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ListConnectorsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ListConnectorsQuery>(ListConnectorsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'listConnectors');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;