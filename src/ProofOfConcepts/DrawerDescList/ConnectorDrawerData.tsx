import { getKafkaInstanceById, getNamespace } from '@apis/api';
import { useCos } from '@hooks/useCos';
import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { AlertVariant, Spinner } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { KafkaInstance, useAlert } from '@rhoas/app-services-ui-shared';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ConnectorDrawerContent } from './ConnectorDrawerContent';

export type ConnectorDrawerContentProps = {
  createdAt: string;
  currentState: string;
  errorStateMessage?: string;
  id: string;
  kafkaBootstrapServer: string;
  kafkaInstanceId: string;
  modifiedAt: string;
  name: string;
  namespaceId: string;
  onClose: () => void;
  onDuplicateConnector: (id: string) => void;
  owner: string;
};
export const ConnectorDrawerData: FunctionComponent<ConnectorDrawerContentProps> =
  ({
    createdAt,
    currentState,
    errorStateMessage,
    id,
    kafkaBootstrapServer,
    kafkaInstanceId,
    modifiedAt,
    name,
    namespaceId,
    onClose,
    onDuplicateConnector,
    owner,
  }) => {
    const { t } = useTranslation();
    const [namespaceData, setNamespaceData] =
      useState<ConnectorNamespace | null>(null);
    const [kafkaInstanceData, setKafkaInstanceData] = useState<
      KafkaInstance | string
    >('');

    const { connectorsApiBasePath, kafkaManagementApiBasePath, getToken } =
      useCos();

    const alert = useAlert();

    const getNamespaceData = useCallback((data) => {
      setNamespaceData(data as ConnectorNamespace);
    }, []);

    const getKIData = useCallback((data) => {
      setKafkaInstanceData(data as KafkaInstance);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [namespaceId]);

    useEffect(() => {
      setKafkaInstanceData('');
      getKafkaInstanceById({
        accessToken: getToken,
        kafkaManagementBasePath: kafkaManagementApiBasePath,
        KafkaInstanceId: kafkaInstanceId,
      })(getKIData, onKIError);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kafkaInstanceId]);

    React.useEffect(() => {
      if (currentState == 'deleted') {
        onClose();
      }
    }, [currentState, onClose]);

    return (
      <ConnectorDrawerContent
        createdAt={createdAt}
        currentState={currentState}
        errorStateMessage={errorStateMessage}
        id={id}
        kafkaBootstrapServer={kafkaBootstrapServer}
        kafkaInstanceData={kafkaInstanceData || <Spinner size="md" />}
        modifiedAt={modifiedAt}
        name={name}
        namespaceData={namespaceData || <Spinner size="md" />}
        onDuplicateConnector={onDuplicateConnector}
        owner={owner}
      />
    );
  };
