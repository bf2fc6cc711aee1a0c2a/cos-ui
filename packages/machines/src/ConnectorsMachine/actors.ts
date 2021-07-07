import axios from 'axios';
import { Sender } from 'xstate';
import { Configuration, ConnectorsApi } from '@cos-ui/api';
import { GraphQLClient } from 'graphql-request';
import { getSdk, ConnectorResult } from '@cos-ui/graphql';

import { ApiCallback } from '../shared';

type ApiProps = {
  accessToken: () => Promise<string>;
  basePath: string;
  connector: ConnectorResult;
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
      .then(response => {
        callback({
          type: 'connector.actionSuccess',
          connector: response.data,
        });
      })
      .catch(error => {
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
      .then(response => {
        callback({
          type: 'connector.actionSuccess',
          connector: response.data,
        });
      })
      .catch(error => {
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
      .catch(error => {
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
): ApiCallback<ConnectorResult, {}> => {
  const url = `${basePath}/api/connector_mgmt/v1/graphql`;
  const client = new GraphQLClient(url);
  const sdk = getSdk(client);
  return (request, onSuccess, onError) => {
    const { page, size /*, name = '' */ } = request;
    // const query = name.length > 0 ? `name LIKE ${name}` : undefined;
    accessToken().then(token =>
      sdk
        .listConnectors(
          { page: `${page}`, size: `${size}` },
          {
            // eslint-disable-next-line prettier/prettier
            'Authorization': `Bearer ${token}`,
          }
        )
        .then(response => {
          onSuccess({
            items: response.listConnectors!.items as ConnectorResult[],
            total: response.listConnectors!.total!,
            page: response.listConnectors!.page!,
            size: response.listConnectors!.size!,
          });
        })
        .catch(error => {
          onError(error);
        })
    );
    return () => {};
  };
};
