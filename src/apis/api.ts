import { ApiCallback } from '@app/machines/PaginatedResponse.machine';
import axios from 'axios';
import _ from 'lodash';

import { Sender } from 'xstate';

import {
  Channel,
  Configuration,
  Connector,
  ConnectorCluster,
  ConnectorClustersApi,
  ConnectorDesiredState,
  ConnectorsApi,
  ConnectorType,
  ConnectorTypeAllOf,
  ConnectorTypesApi,
  ObjectReference,
} from '@rhoas/connector-management-sdk';
import {
  KafkaRequest,
  DefaultApi,
  SecurityApi,
} from '@rhoas/kafka-management-sdk';

type CommonApiProps = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
};

type ConnectorApiProps = {
  connector: Connector;
} & CommonApiProps;

type ConnectorEditProps = {
  connectorUpdate: { [key: string]: any };
  connectorId: string;
  updatedName?: string;
} & CommonApiProps;

type ConnectorDetailProps = {
  connectorId: string;
} & CommonApiProps;

type ConnectorTypeProps = {
  connectorTypeId: string;
} & CommonApiProps;

export type FetchCallbacks<RawDataType> = (
  onSuccess: (payload?: RawDataType) => void,
  onError: (errorMsg: string) => void
) => () => void;

export const startConnector = ({
  accessToken,
  connectorsApiBasePath,
  connector,
}: ConnectorApiProps) => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .patchConnector(
        connector.id!,
        {
          desired_state: ConnectorDesiredState.Ready,
        },
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
  connectorsApiBasePath,
  connector,
}: ConnectorApiProps) => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .patchConnector(
        connector.id!,
        {
          desired_state: ConnectorDesiredState.Stopped,
        },
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
  connectorsApiBasePath,
  connector,
}: ConnectorApiProps) => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .deleteConnector(connector.id!, {
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

export const getConnector = ({
  accessToken,
  connectorsApiBasePath,
  connectorId,
}: ConnectorDetailProps): FetchCallbacks<Connector> => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );

  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .getConnector(connectorId!, {
        cancelToken: source.token,
      })
      .then((response) => {
        onSuccess(response.data);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError(error.response.data.reason);
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const getConnectorTypeDetail = ({
  accessToken,
  connectorsApiBasePath,
  connectorTypeId,
}: ConnectorTypeProps) => {
  const connectorsAPI = new ConnectorTypesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (callback: any) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .getConnectorTypeByID(connectorTypeId, {
        cancelToken: source.token,
      })
      .then((response) => {
        callback(response.data);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          console.log('Error:', error.response.data.reason);
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const fetchConnectors = ({
  accessToken,
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<Connector, {}> => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size /*, name = '' */ } = request;
    // const query = name.length > 0 ? `name LIKE ${name}` : undefined;
    connectorsAPI
      .listConnectors(`${page}`, `${size}`, {
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
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<ConnectorCluster, {}> => {
  const connectorsAPI = new ConnectorClustersApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size } = request;
    connectorsAPI
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
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<ConnectorType, ConnectorTypesQuery> => {
  const connectorsAPI = new ConnectorTypesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, query } = request;
    const { name, categories = [] } = query || {};
    connectorsAPI
      .getConnectorTypes('1', '1000', undefined, undefined, {
        cancelToken: source.token,
      })
      .then((response) => {
        const lcName = name ? name.toLowerCase() : undefined;
        const rawItems = response.data.items || [];
        let filteredItems = lcName
          ? rawItems?.filter((c) =>
              (c as ConnectorTypeAllOf).name?.toLowerCase().includes(lcName)
            )
          : rawItems;
        filteredItems =
          categories.length > 0
            ? filteredItems?.filter(
                (c) =>
                  (
                    (c as ConnectorTypeAllOf).labels?.filter((l) =>
                      categories.includes(l)
                    ) || []
                  ).length > 0
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

type KafkaManagementApiProps = {
  accessToken: () => Promise<string>;
  kafkaManagementBasePath: string;
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
  kafkaManagementBasePath,
}: KafkaManagementApiProps): ApiCallback<KafkaRequest, KafkasQuery> => {
  const connectorsAPI = new DefaultApi(
    new Configuration({
      accessToken,
      basePath: kafkaManagementBasePath,
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
    connectorsAPI
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

export type createNewServiceAccountProps = {
  accessToken: () => Promise<string>;
  sortDesc: string;
  kafkaManagementApiBasePath: string;
};

export const createNewServiceAccount = async ({
  accessToken,
  kafkaManagementApiBasePath,
  sortDesc,
}: createNewServiceAccountProps) => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const securityAPI = new SecurityApi(
    new Configuration({
      accessToken,
      basePath: kafkaManagementApiBasePath,
    })
  );

  const response = await securityAPI.createServiceAccount(
    {
      name: `connector-${sortDesc}`,
    },
    {
      cancelToken: source.token,
    }
  );
  return {
    clientId: response.data.client_id!,
    clientSecret: response.data.client_secret!,
  };
};

export type SaveConnectorProps = {
  kafka: KafkaRequest;
  cluster: ConnectorCluster;
  connectorType: ConnectorType;

  configuration: object;

  name: string;
  userServiceAccount: UserProvidedServiceAccount;

  topic?: string;
  userErrorHandler?: string;
} & CommonApiProps;

export const saveConnector = ({
  accessToken,
  connectorsApiBasePath,
  kafka,
  cluster,
  connectorType,
  configuration,
  name,
  userServiceAccount,
  userErrorHandler,
  topic,
}: SaveConnectorProps) => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );

  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const async = true;

    let connectorConfiguration = {};
    if (userErrorHandler) {
      connectorConfiguration = {
        ...configuration,
        ...{
          error_handler: {
            [userErrorHandler]: topic ? { topic: topic } : {},
          },
        },
      };
    } else {
      connectorConfiguration = configuration;
    }
    const connector: Connector = {
      kind: 'Connector',
      name: name,
      channel: Channel.Stable,
      deployment_location: {
        kind: 'addon',
        cluster_id: cluster.id,
      },
      desired_state: ConnectorDesiredState.Ready,
      connector_type_id: (connectorType as ObjectReference).id!,
      kafka: {
        id: kafka.id!,
        url: kafka.bootstrap_server_host || 'demo',
      },
      service_account: {
        client_id: userServiceAccount.clientId,
        client_secret: userServiceAccount.clientSecret,
      },
      connector: connectorConfiguration,
    };
    connectorsAPI
      .createConnector(async, connector, {
        cancelToken: source.token,
      })
      .then(() => {
        callback({ type: 'success' });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          callback({
            type: 'failure',
            message: error.response.data.reason,
          });
        }
      });

    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export const updateConnector = ({
  accessToken,
  connectorsApiBasePath,
  connectorUpdate,
  connectorId,
  updatedName,
}: ConnectorEditProps): FetchCallbacks<undefined> => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .patchConnector(
        connectorId,
        {
          ...(updatedName && { name: updatedName }),
          ...(!_.isEmpty(connectorUpdate) && {
            connector: {
              ...connectorUpdate,
            },
          }),
        },
        {
          cancelToken: source.token,
          headers: {
            'Content-type': 'application/merge-patch+json',
          },
        }
      )
      .then(() => {
        onSuccess();
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError(error.response.data.reason);
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};
