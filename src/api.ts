import axios from 'axios';

import { Sender } from 'xstate';

import {
  Configuration,
  Connector,
  ConnectorCluster,
  ConnectorClustersApi,
  ConnectorsApi,
  ConnectorType,
  ConnectorTypesApi,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest, DefaultApi } from '@rhoas/kafka-management-sdk';

import { ApiCallback } from './PaginatedResponse.machine';

type CommonApiProps = {
  accessToken: () => Promise<string>;
  basePath: string;
};

type ConnectorApiProps = {
  connector: Connector;
} & CommonApiProps;

export const startConnector = ({
  accessToken,
  basePath,
  connector,
}: ConnectorApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .patchConnector(
        connector.id!,
        {
          desired_state: 'ready',
        },
        undefined,
        {
          cancelToken: source.token,
          headers: {
            'Content-type': 'application/merge-patch+json',
          },
        }
      )
      .then((response) => {
        callback({
          type: 'connector.actionSuccess',
          connector: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'connector.actionError',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const stopConnector = ({
  accessToken,
  basePath,
  connector,
}: ConnectorApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .patchConnector(
        connector.id!,
        {
          desired_state: 'stopped',
        },
        undefined,
        {
          cancelToken: source.token,
          headers: {
            'Content-type': 'application/merge-patch+json',
          },
        }
      )
      .then((response) => {
        callback({
          type: 'connector.actionSuccess',
          connector: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'connector.actionError',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const deleteConnector = ({
  accessToken,
  basePath,
  connector,
}: ConnectorApiProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    apisService
      .deleteConnector(connector.id!, undefined, {
        cancelToken: source.token,
      })
      .then(() => {
        callback({
          type: 'connector.actionSuccess',
          connector: {
            ...connector,
            status: 'deleting',
            desired_state: 'deleted',
          },
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'connector.actionError',
            error: error.response.data.reason,
          });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const fetchConnectors = ({
  accessToken,
  basePath,
}: CommonApiProps): ApiCallback<Connector, {}> => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size /*, name = '' */ } = request;
    // const query = name.length > 0 ? `name LIKE ${name}` : undefined;
    apisService
      .listConnectors(`${page}`, `${size}`, undefined, {
        cancelToken: source.token,
      })
      .then((response) => {
        onSuccess({
          items: response.data.items || [],
          total: response.data.total,
          page: response.data.page,
          size: response.data.size,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError({ error: error.message, page: request.page });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const fetchClusters = ({
  accessToken,
  basePath,
}: CommonApiProps): ApiCallback<ConnectorCluster, {}> => {
  const apisService = new ConnectorClustersApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size } = request;
    apisService
      .listConnectorClusters(`${page}`, `${size}`, {
        cancelToken: source.token,
      })
      .then((response) => {
        onSuccess({
          items: response.data.items || [],
          total: response.data.total,
          page: response.data.page,
          size: response.data.size,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError({ error: error.message, page: request.page });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export type ConnectorTypesQuery = {
  name?: string;
  categories?: string[];
};

export const fetchConnectorTypes = ({
  accessToken,
  basePath,
}: CommonApiProps): ApiCallback<ConnectorType, ConnectorTypesQuery> => {
  const apisService = new ConnectorTypesApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, query } = request;
    const { name, categories = [] } = query || {};
    apisService
      .listConnectorTypes('1', '1000', {
        cancelToken: source.token,
      })
      .then((response) => {
        const lcName = name ? name.toLowerCase() : undefined;
        const rawItems = response.data.items || [];
        let filteredItems = lcName
          ? rawItems?.filter((c) => c.name?.toLowerCase().includes(lcName))
          : rawItems;
        filteredItems =
          categories.length > 0
            ? filteredItems?.filter(
                (c) =>
                  (c.labels?.filter((l) => categories.includes(l)) || [])
                    .length > 0
              )
            : filteredItems;
        const total = filteredItems.length;
        const offset = (page - 1) * size;
        const items = filteredItems.slice(offset, offset + size);
        onSuccess({
          items,
          total,
          page,
          size,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError({ error: error.message, page: request.page });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export type KafkasQuery = {
  name?: string;
  owner?: string;
  statuses?: string[];
  cloudProviders?: string[];
  regions?: string[];
};

export const fetchKafkaInstances = ({
  accessToken,
  basePath,
}: CommonApiProps): ApiCallback<KafkaRequest, KafkasQuery> => {
  // TODO: remove after demo
  basePath = 'https://api.openshift.com';
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, query } = request;
    const { name, statuses, owner, cloudProviders, regions } = query || {};
    const nameSearch =
      name && name.length > 0 ? ` name LIKE ${name}` : undefined;
    const ownerSearch =
      owner && owner.length > 0 ? ` owner LIKE ${owner}` : undefined;
    const statusSearch =
      statuses && statuses.length > 0
        ? statuses.map((s) => `status = ${s}`).join(' OR ')
        : undefined;
    const cloudProviderSearch =
      cloudProviders && cloudProviders.length > 0
        ? cloudProviders.map((s) => `cloud_provider = ${s}`).join(' OR ')
        : undefined;
    const regionSearch =
      regions && regions.length > 0
        ? regions.map((s) => `region = ${s}`).join(' OR ')
        : undefined;
    const search = [
      nameSearch,
      ownerSearch,
      statusSearch,
      cloudProviderSearch,
      regionSearch,
    ]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    apisService
      .getKafkas(
        `${page}`,
        `${size}`,
        undefined,
        search as string | undefined,
        {
          cancelToken: source.token,
        }
      )
      .then((response) => {
        onSuccess({
          items: response.data.items || [],
          total: response.data.total,
          page: response.data.page,
          size: response.data.size,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError({ error: error.message, page: request.page });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export type UserProvidedServiceAccount = {
  clientId: string;
  clientSecret: string;
};

export type SaveConnectorProps = {
  kafka: KafkaRequest;
  cluster: ConnectorCluster;
  connectorType: ConnectorType;

  configuration: object;

  name: string;
  userServiceAccount?: UserProvidedServiceAccount;
} & CommonApiProps;

export const saveConnector = ({
  accessToken,
  basePath,
  kafka,
  cluster,
  connectorType,
  configuration,
  name,
  userServiceAccount,
}: SaveConnectorProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const async = true;
    const connector: Connector = {
      kind: 'Connector',
      metadata: {
        name,
        kafka_id: kafka.id,
      },
      deployment_location: {
        kind: 'addon',
        cluster_id: cluster.id,
      },
      connector_type_id: connectorType.id,
      kafka: {
        bootstrap_server: kafka.bootstrap_server_host || 'demo',
        client_id: userServiceAccount?.clientId,
        client_secret: userServiceAccount?.clientSecret,
      },
      connector_spec: configuration,
    };
    apisService
      .createConnector(async, connector, {
        cancelToken: source.token,
      })
      .then(() => {
        callback({ type: 'success' });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          callback({ type: 'failure', message: error.response.data.reason });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};
