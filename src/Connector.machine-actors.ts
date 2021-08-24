import axios from 'axios';
import { Sender } from 'xstate';

import {
  Configuration,
  Connector,
  ConnectorsApi,
} from '@rhoas/connector-management-sdk';

import { ApiCallback } from './PaginatedResponse.machine';

type ApiProps = {
  accessToken: () => Promise<string>;
  basePath: string;
  connector: Connector;
};
export const startConnector = ({
  accessToken,
  basePath,
  connector,
}: ApiProps) => {
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
}: ApiProps) => {
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
}: ApiProps) => {
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

export const fetchConnectors = (
  accessToken: () => Promise<string>,
  basePath: string
): ApiCallback<Connector, {}> => {
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
