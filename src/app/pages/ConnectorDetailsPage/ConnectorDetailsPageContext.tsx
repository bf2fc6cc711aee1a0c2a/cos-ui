import { getConnector, getConnectorTypeDetail } from '@apis/api';
import { useCos } from '@hooks/useCos';
import _ from 'lodash';
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { KafkaInstance } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorType } from '@rhoas/connector-management-sdk';

type ConnectorDetailsPageContextType = {
  connectorData?: Connector;
  kafkaInstanceDetails: KafkaInstance | string;
  connectorTypeDetails?: ConnectorType;
  fetchError: string | boolean;
  setKafkaInstanceDetails: React.Dispatch<
    React.SetStateAction<string | KafkaInstance>
  >;
};

const ConnectorDetailsPageContext =
  createContext<ConnectorDetailsPageContextType | null>(null);

export const ConnectorDetailsPageProvider: FunctionComponent = ({
  children,
}) => {
  const { id } = useParams<{ id: string }>();
  const { connectorsApiBasePath, getToken } = useCos();
  const [connectorData, setConnectorData] = useState<Connector>();
  const [kafkaInstanceDetails, setKafkaInstanceDetails] = useState<
    KafkaInstance | string
  >('');
  const [connectorTypeDetails, setConnectorTypeDetails] =
    useState<ConnectorType>();
  const [fetchError, setFetchError] = useState<string | boolean>(false);

  const onError = useCallback(
    (description: string) => {
      console.log('Description: ', description);
      setFetchError(description);
    },
    [setFetchError]
  );
  /**
   * React callback to set connector data from fetch response
   */
  const getConnectorData = useCallback(
    (data) => {
      _.isEqual(data, connectorData) || setConnectorData(data);
    },
    [connectorData]
  );

  /**
   * React callback to set connector type details from fetch response
   */
  const getConnectorTypeInfo = useCallback((data) => {
    setConnectorTypeDetails(data as ConnectorType);
  }, []);

  const fetchConnector = useCallback(async () => {
    await getConnector({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connectorId: id,
    })(getConnectorData, onError);
  }, [getToken, connectorsApiBasePath, id, getConnectorData, onError]);

  useEffect(() => {
    fetchConnector();
    const timer = setInterval(fetchConnector, 5000);
    return () => clearInterval(timer);
  }, [fetchConnector]);

  useEffect(() => {
    if (connectorData?.connector_type_id) {
      getConnectorTypeDetail({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        connectorTypeId: connectorData?.connector_type_id,
      })(getConnectorTypeInfo);
    }
  }, [
    connectorData?.connector_type_id,
    connectorsApiBasePath,
    getConnectorTypeInfo,
    getToken,
  ]);
  return (
    <ConnectorDetailsPageContext.Provider
      value={{
        connectorData,
        kafkaInstanceDetails,
        connectorTypeDetails,
        fetchError,
        setKafkaInstanceDetails,
      }}
    >
      {children}
    </ConnectorDetailsPageContext.Provider>
  );
};

export const useConnectorDetails = (): ConnectorDetailsPageContextType => {
  const service = useContext(ConnectorDetailsPageContext);
  if (!service) {
    throw new Error(
      `useConnectorDetails() must be used in a child of <ConnectorDetailsPageProvider>`
    );
  }
  return service;
};
