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
  return async (
    request: FetchConnectorTypeLabelsRequest,
    onSuccess: FetchConnectorTypeLabelsOnSuccess,
    onError: FetchConnectorTypeLabelsOnError
  ) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { search } = request;
    const { name, label = [], pricing_tier } = search || {};
    const nameSearch =
      name && name.length > 0 ? ` name ILIKE '%${name}%'` : undefined;
    const pricingTierSearch =
      pricing_tier && pricing_tier.length > 0
        ? ` pricing_tier ILIKE '${pricing_tier}'`
        : undefined;
    const labelSearch =
      label && label.length > 0
        ? [
            label
              .filter((s) => !s.startsWith('!!'))
              .map((s) => `label like ${s}`)
              .join(' OR '),
            label
              .filter((s) => s.startsWith('!!'))
              .map((s) => `label like ${s.slice(2, s.length)}`)
              .join(' AND '),
          ]
            .filter(Boolean)
            .join(' AND ')
        : undefined;
    /*
        * label searches could probably use the IN operator
        label && label.length > 0
          ? `label IN (${label
              .map((s) => `'${s.startsWith('!!') ? s.slice(2, s.length) : s}'`)
              .join(', ')})`
          : undefined;
      */
    const searchString: string = [nameSearch, labelSearch, pricingTierSearch]
      .filter(Boolean)
      .map((s) => `(${s})`)
      .join(' AND ');
    const token = await accessToken();
    axios
      .get(
        `${connectorsApiBasePath}/api/connector_mgmt/v1/kafka_connector_types/labels?search=${searchString}`,
        {
          cancelToken: source.token,
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
