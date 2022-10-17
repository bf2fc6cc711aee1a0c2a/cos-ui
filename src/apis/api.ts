import { ApiCallback } from '@app/machines/PaginatedResponse.machine';
import axios from 'axios';
import _ from 'lodash';

import { Sender } from 'xstate';

import { KafkaInstance } from '@rhoas/app-services-ui-shared';
import {
  Channel,
  Configuration,
  Connector,
  ConnectorDesiredState,
  ConnectorNamespace,
  ConnectorNamespacesApi,
  ConnectorsApi,
  ConnectorType,
  ConnectorTypesApi,
  ObjectReference,
  ServiceAccount,
} from '@rhoas/connector-management-sdk';
import {
  KafkaRequest,
  DefaultApi,
  SecurityApi,
} from '@rhoas/kafka-management-sdk';

import { PlaceholderOrderBy } from './../app/machines/PaginatedResponse.machine';

export enum SortOrderValue {
  asc = 'asc',
  desc = 'desc',
}

export type SortOrder = keyof typeof SortOrderValue;

type CommonApiProps = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
};

type ConnectorApiProps = {
  connector: Connector;
} & CommonApiProps;

type EvalNamespaceApiProps = {
  evalName: string;
} & CommonApiProps;

type ConnectorEditProps = {
  connectorUpdate: { [key: string]: any };
  connectorId: string;
  updatedName?: string | undefined;
  updatedServiceAccount?: ServiceAccount | undefined;
} & CommonApiProps;

type ConnectorDetailProps = {
  connectorId: string;
} & CommonApiProps;

type ConnectorNamespaceProps = {
  namespaceId: string;
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
            desired_state: ConnectorDesiredState.Deleted,
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
          onError(error.response.data.reason || error.message);
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
          console.log(
            'error response fetching connector type:',
            error.response.data.reason
          );
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

export type ConnectorsOrderBy = {
  connector_type_id?: SortOrder;
  name?: SortOrder;
  state?: SortOrder;
};

export type ConnectorsSearch = {
  name?: string;
  description?: string;
  version?: string;
  label?: string[];
  channel?: string;
};

export const fetchConnectors = ({
  accessToken,
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<
  Connector,
  ConnectorsOrderBy,
  ConnectorsSearch
> => {
  const connectorsAPI = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, orderBy, search } = request;
    const { name } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name ILIKE '%${name}%'` : undefined;
    const searchString: string = [nameSearch]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    const orderByString = Object.entries(orderBy || {})
      .filter((val) => val[0] !== undefined && val[1] !== undefined)
      .map((val) => ` ${val[0]} ${val[1]}`)
      .join(',');
    connectorsAPI
      .listConnectors(`${page}`, `${size}`, orderByString, searchString, {
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

export const registerEvalNamespace = ({
  accessToken,
  connectorsApiBasePath,
  evalName,
}: EvalNamespaceApiProps): FetchCallbacks<string> => {
  const namespacesAPI = new ConnectorNamespacesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    namespacesAPI
      .createEvaluationNamespace(
        {
          name: evalName,
        },
        {
          cancelToken: source.token,
        }
      )
      .then((response) => {
        onSuccess(response.data.name || '');
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

export const getNamespace = ({
  accessToken,
  connectorsApiBasePath,
  namespaceId,
}: ConnectorNamespaceProps): FetchCallbacks<ConnectorNamespace> => {
  const namespacesAPI = new ConnectorNamespacesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );

  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    namespacesAPI
      .getConnectorNamespace(namespaceId!, {
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

export type ConnectorNamespaceSearch = {
  name?: string;
};

export const fetchConnectorNamespaces = ({
  accessToken,
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<
  ConnectorNamespace,
  PlaceholderOrderBy,
  ConnectorNamespaceSearch
> => {
  const namespacesAPI = new ConnectorNamespacesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, search } = request;
    const { name } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name ILIKE '%${name}%'` : undefined;
    const searchString: string = [nameSearch]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    namespacesAPI
      .listConnectorNamespaces(`${page}`, `${size}`, undefined, searchString)
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

export type ConnectorTypesSearch = {
  name?: string;
  categories?: string[];

  description?: string;
  version?: string;
  label?: string[];
  channel?: string;
};

export type ConnectorTypesOrderBy = {
  name?: SortOrder;
};

export const fetchConnectorTypes = ({
  accessToken,
  connectorsApiBasePath,
}: CommonApiProps): ApiCallback<
  ConnectorType,
  PlaceholderOrderBy,
  ConnectorTypesSearch
> => {
  const connectorsAPI = new ConnectorTypesApi(
    new Configuration({
      accessToken,
      basePath: connectorsApiBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, search } = request;
    const { name, categories = [] } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name ILIKE '%${name}%'` : undefined;
    const labelSearch =
      categories && categories.length > 0
        ? categories.map((s) => `label = ${s}`).join(' OR ')
        : undefined;
    const searchString: string = [nameSearch, labelSearch]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    connectorsAPI
      .getConnectorTypes(`${page}`, `${size}`, undefined, searchString, {
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

type KafkaManagementApiProps = {
  accessToken: () => Promise<string>;
  kafkaManagementBasePath: string;
};

type KafkaInstanceDetailProps = {
  KafkaInstanceId: string;
} & KafkaManagementApiProps;

export type KafkasSearch = {
  name?: string;
  owner?: string;
  statuses?: string[];
  cloudProviders?: string[];
  regions?: string[];
};

export const fetchKafkaInstances = ({
  accessToken,
  kafkaManagementBasePath,
}: KafkaManagementApiProps): ApiCallback<
  KafkaRequest,
  PlaceholderOrderBy,
  KafkasSearch
> => {
  const connectorsAPI = new DefaultApi(
    new Configuration({
      accessToken,
      basePath: kafkaManagementBasePath,
    })
  );
  return (request, onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { page, size, search } = request;
    const { name, statuses, owner, cloudProviders, regions } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name LIKE '%${name}%'` : undefined;
    const ownerSearch =
      owner && owner.length > 0 ? ` owner LIKE '%${owner}%'` : undefined;
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
    const searchString = [
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
      .getKafkas(`${page}`, `${size}`, undefined, searchString, {
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

export const getKafkaInstanceById = ({
  accessToken,
  kafkaManagementBasePath,
  KafkaInstanceId,
}: KafkaInstanceDetailProps): FetchCallbacks<KafkaInstance> => {
  const connectorsAPI = new DefaultApi(
    new Configuration({
      accessToken,
      basePath: kafkaManagementBasePath,
    })
  );

  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    connectorsAPI
      .getKafkaById(KafkaInstanceId, {
        cancelToken: source.token,
      })
      .then((response) => {
        onSuccess(response.data);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          console.log(
            'error response fetching kafka: ',
            error.response.data.reason
          );
          onError(error.response);
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

export const createServiceAccount = ({
  accessToken,
  kafkaManagementApiBasePath,
  sortDesc,
}: createNewServiceAccountProps): FetchCallbacks<ServiceAccount> => {
  const securityAPI = new SecurityApi(
    new Configuration({
      accessToken,
      basePath: kafkaManagementApiBasePath,
    })
  );
  return (onSuccess, onError) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    securityAPI
      .createServiceAccount(
        {
          name: `connector-${sortDesc}`,
        },
        {
          cancelToken: source.token,
        }
      )
      .then((response) => {
        onSuccess(response.data as ServiceAccount);
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

export type SaveConnectorProps = {
  kafka: KafkaRequest;
  namespace: ConnectorNamespace;
  connectorType: ConnectorType;

  configuration: object;
  configurationSteps?: string[] | false;
  name: string;
  userServiceAccount: UserProvidedServiceAccount;

  topic?: string;
  userErrorHandler?: string;
} & CommonApiProps;

export const saveConnector = ({
  accessToken,
  connectorsApiBasePath,
  kafka,
  namespace,
  connectorType,
  configuration,
  name,
  userServiceAccount,
  userErrorHandler,
  topic,
  configurationSteps,
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
    if (userErrorHandler && !configurationSteps) {
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
      namespace_id: namespace.id!,
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
  updatedServiceAccount,
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
          ...(updatedServiceAccount && {
            service_account: updatedServiceAccount,
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
