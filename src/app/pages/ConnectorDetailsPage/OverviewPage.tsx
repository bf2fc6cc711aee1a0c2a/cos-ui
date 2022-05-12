import { getNamespace } from '@apis/api';
import { ConnectorInfoTextList } from '@app/components/ConnectorInfoTextList/ConnectorInfoTextList';
import { useCos } from '@context/CosContext';
import { getPendingTime, warningType } from '@utils/shared';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  AlertVariant,
  Hint,
  HintBody,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import { ClockIcon } from '@patternfly/react-icons';

import { useAlert } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorNamespace } from '@rhoas/connector-management-sdk';

export interface OverviewPageProps {
  connectorData: Connector;
}

export const OverviewPage: FC<OverviewPageProps> = ({ connectorData }) => {
  const [namespaceData, setNamespaceData] = useState<ConnectorNamespace>();

  const { connectorsApiBasePath, getToken } = useCos();

  const alert = useAlert();
  const { t } = useTranslation();

  const getNamespaceData = useCallback((data) => {
    setNamespaceData(data as ConnectorNamespace);
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

  const getConnectorExpireAlert = (expiration: string): string => {
    const { hours, min } = getPendingTime(new Date(expiration));
    if (hours < 0 || min < 0) {
      return t('connectorExpiredMsg');
    }
    return t('connectorExpire', { hours, min });
  };

  const getConnectorExpireInlineAlert = (expiration: string): string => {
    const { hours, min } = getPendingTime(new Date(expiration));
    if (hours < 0 || min < 0) {
      return t('connectorExpiredInline');
    }
    return t('connectorExpireInline', { hours, min });
  };

  useEffect(() => {
    getNamespace({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      namespaceId: connectorData?.namespace_id!,
    })(getNamespaceData, onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorData]);
  return (
    <PageSection variant={PageSectionVariants.light}>
      {namespaceData?.expiration && (
        <Alert
          customIcon={<ClockIcon />}
          className="pf-u-mb-md"
          variant={warningType(new Date(namespaceData?.expiration!))}
          isInline
          title={getConnectorExpireAlert(namespaceData?.expiration!)}
        />
      )}

      {connectorData?.status?.error && (
        <Hint className="pf-u-mb-md">
          <HintBody>
            You can still get help by emailing us at{' '}
            <i>rhosak-eval-support@redhat.com</i>. This mailing list is
            monitored by the Red Hat OpenShift Application Services team.
          </HintBody>
        </Hint>
      )}

      <ConnectorInfoTextList
        name={connectorData?.name}
        id={connectorData?.id!}
        type={connectorData?.connector_type_id}
        bootstrapServer={connectorData?.kafka?.url}
        kafkaId={connectorData?.kafka?.id}
        namespaceId={
          namespaceData ? namespaceData.name : connectorData?.namespace_id!
        }
        namespaceMsg={
          namespaceData?.expiration &&
          getConnectorExpireInlineAlert(namespaceData?.expiration!)
        }
        namespaceMsgVariant={
          namespaceData?.expiration
            ? warningType(new Date(namespaceData?.expiration!))
            : undefined
        }
        owner={connectorData?.owner!}
        createdAt={new Date(connectorData?.created_at!)}
        modifiedAt={new Date(connectorData?.modified_at!)}
        error={connectorData?.status?.error}
      />
    </PageSection>
  );
};
