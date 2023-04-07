import { getKafkaInstanceById, getNamespace } from '@apis/api';
import { useAlert } from '@hooks/useAlert';
import { useCos } from '@hooks/useCos';
import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { AlertVariant } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export type ConnectorDrawerContentProps = {
  kafkaInstanceId: string;
  namespaceId: string;
  renderData: (
    namespaceData: ConnectorNamespace | null,
    kafkaInstanceData: KafkaInstance | string
  ) => React.ReactElement;
};
export const ConnectorDrawerData: FunctionComponent<
  ConnectorDrawerContentProps
> = ({ kafkaInstanceId, namespaceId, renderData }) => {
  const { t } = useTranslation();
  const [namespaceData, setNamespaceData] = useState<ConnectorNamespace | null>(
    null
  );
  const [kafkaInstanceData, setKafkaInstanceData] = useState<
    KafkaRequest | string
  >('');

  const { connectorsApiBasePath, kafkaManagementApiBasePath, getToken } =
    useCos();

  const alert = useAlert();

  const getNamespaceData = useCallback((data) => {
    setNamespaceData(data as ConnectorNamespace);
  }, []);

  const getKIData = useCallback((data) => {
    setKafkaInstanceData(data as KafkaRequest);
  }, []);

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connector-drawer',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );

  const onKIError = useCallback(
    (response: any) => {
      if (response.status === 404) {
        setKafkaInstanceData(t('noLongerExists'));
      } else {
        alert?.addAlert({
          id: 'connector-drawer',
          variant: AlertVariant.danger,
          title: t('somethingWentWrong'),
          description: response?.data?.reason,
        });
      }
    },
    [alert, t]
  );

  useEffect(() => {
    setNamespaceData(null);
    getNamespace({
      accessToken: getToken,
      connectorsApiBasePath,
      namespaceId,
    })(getNamespaceData, onError);
  }, [
    namespaceId,
    getNamespaceData,
    getToken,
    connectorsApiBasePath,
    onError,
    setNamespaceData,
  ]);

  useEffect(() => {
    setKafkaInstanceData('');
    getKafkaInstanceById({
      accessToken: getToken,
      kafkaManagementBasePath: kafkaManagementApiBasePath,
      KafkaInstanceId: kafkaInstanceId,
    })(getKIData, onKIError);
  }, [
    kafkaInstanceId,
    getKIData,
    getToken,
    kafkaManagementApiBasePath,
    onKIError,
    setKafkaInstanceData,
  ]);

  return renderData(namespaceData, kafkaInstanceData);
};
