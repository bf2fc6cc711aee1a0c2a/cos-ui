import { ConnectorTypesOrderBy, ConnectorTypesSearch } from '@apis/api';
import axios from 'axios';

import { ConnectorTypeLabelCount } from './typeExtensions';

type CommonApiProps = {
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
};

type FetchConnectorTypeLabelsRequest = {
  search?: ConnectorTypesSearch;
  orderBy?: ConnectorTypesOrderBy;
};

type FetchConnectorTypeLabelsOnSuccess = (payload: {
  items: Array<ConnectorTypeLabelCount>;
}) => void;
type FetchConnectorTypeLabelsOnError = (payload: string) => void;

export const fetchConnectorTypeLabels = ({
  accessToken,
  connectorsApiBasePath,
}: CommonApiProps) => {
  console.log('Access token', accessToken, ' path: ', connectorsApiBasePath);
  return (
    request: FetchConnectorTypeLabelsRequest,
    onSuccess: FetchConnectorTypeLabelsOnSuccess,
    onError: FetchConnectorTypeLabelsOnError
  ) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { orderBy, search } = request;
    const { name, label = [] } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name ILIKE '%${name}%'` : undefined;
    const labelSearch =
      label && label.length > 0
        ? label.map((s) => `label = ${s}`).join(' OR ')
        : undefined;
    const searchString: string = [nameSearch, labelSearch]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    const orderByString = Object.entries(orderBy || {})
      .filter((val) => val[0] !== undefined && val[1] !== undefined)
      .map((val) => ` ${val[0]} ${val[1]}`)
      .join(',');
    axios
      .get(
        `${connectorsApiBasePath}/api/connector_mgmt/v1/kafka_connector_types/labels?search=${searchString}&orderBy=${orderByString}`,
        {
          cancelToken: source.token,
        }
      )
      .then((response) => {
        onSuccess({
          items: response.data.items,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          onError(error.message);
        }
      });
    return () => {
      source.cancel('Operation canceled by the user');
    };
  };
};
