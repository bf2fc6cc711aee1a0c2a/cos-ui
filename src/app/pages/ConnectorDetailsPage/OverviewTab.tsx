import { getKafkaInstanceById, getNamespace } from '@apis/api';
import { ConnectorInfoTextList } from '@app/components/ConnectorInfoTextList/ConnectorInfoTextList';
import { useCos } from '@context/CosContext';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  AlertVariant,
  ClipboardCopy,
  Hint,
  HintBody,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';

import { KafkaInstance, useAlert } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorNamespace } from '@rhoas/connector-management-sdk';

export interface OverviewTabProps {
  connectorData: Connector;
  onDuplicateConnector: (id: string) => void;
}

export const OverviewTab: FC<OverviewTabProps> = ({
  connectorData,
  onDuplicateConnector,
}) => {
  const [namespaceData, setNamespaceData] = useState<ConnectorNamespace>();
  const [kafkaInstanceData, setKafkaInstanceData] = useState<
    KafkaInstance | string
  >();

  const { connectorsApiBasePath, kafkaManagementApiBasePath, getToken } =
    useCos();
  const alert = useAlert();
  const { t } = useTranslation();

  const getNamespaceData = useCallback((data) => {
    setNamespaceData(data as ConnectorNamespace);
  }, []);

  const getKIData = useCallback((data) => {
    setKafkaInstanceData(data as KafkaInstance);
  }, []);

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connector-overview-page',
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
        setKafkaInstanceData(t('KafkaInstanceExpired'));
      } else {
        alert?.addAlert({
          id: 'connector-drawer',
          variant: AlertVariant.danger,
          title: t('somethingWentWrong'),
          description: response.data.reason,
        });
      }
    },
    [alert, t]
  );

  useEffect(() => {
    getNamespace({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      namespaceId: connectorData?.namespace_id!,
    })(getNamespaceData, onError);

    getKafkaInstanceById({
      accessToken: getToken,
      kafkaManagementBasePath: kafkaManagementApiBasePath,
      KafkaInstanceId: connectorData?.kafka?.id,
    })(getKIData, onKIError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorData]);

  return (
    <PageSection variant={PageSectionVariants.light}>
      {connectorData?.status?.state === 'failed' && (
        <Hint className="pf-u-mb-md">
          <HintBody>
            <p>{t('previewModeMsg')}</p>
            <Trans i18nKey={'supportEmailMsg'}>
              You can still get help by emailing us at
              <ClipboardCopy
                hoverTip="Copy"
                clickTip="Copied"
                variant="inline-compact"
              >
                rhosak-eval-support@redhat.com
              </ClipboardCopy>
              . This mailing list is monitored by the Red Hat OpenShift
              Application Services team.
            </Trans>
          </HintBody>
        </Hint>
      )}

      <ConnectorInfoTextList
        onDuplicateConnector={onDuplicateConnector}
        name={connectorData?.name}
        id={connectorData?.id!}
        type={connectorData?.connector_type_id}
        bootstrapServer={connectorData?.kafka?.url}
        kafkaInstanceData={kafkaInstanceData || <Spinner size="md" />}
        namespaceData={namespaceData || <Spinner size="md" />}
        owner={connectorData?.owner!}
        createdAt={new Date(connectorData?.created_at!)}
        modifiedAt={new Date(connectorData?.modified_at!)}
        error={connectorData?.status?.error}
      />
    </PageSection>
  );
};
