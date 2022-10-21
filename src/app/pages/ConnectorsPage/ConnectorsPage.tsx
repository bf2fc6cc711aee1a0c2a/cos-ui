import { useCos } from '@hooks/useCos';
import React, { FunctionComponent, useCallback } from 'react';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { AlertVariant, useAlert } from '@rhoas/app-services-ui-shared';

import { ConnectorsPageProvider } from './ConnectorsPageContext';
import { ConnectorInstances } from './components/ConnectorInstances/ConnectorInstances';

export type ConnectorsPageProps = {
  onCreateConnector: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  onCreateConnector,
  onConnectorDetail,
  onDuplicateConnector,
}: ConnectorsPageProps) => {
  const { t } = useTranslation();
  const alert = useAlert();
  const { connectorsApiBasePath, getToken } = useCos();
  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connectors-table-error',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );
  return (
    <ConnectorsPageProvider
      accessToken={getToken}
      connectorsApiBasePath={connectorsApiBasePath}
      onError={onError}
    >
      <ConnectorInstances
        onCreateConnector={onCreateConnector}
        onConnectorDetail={onConnectorDetail}
        onDuplicateConnector={onDuplicateConnector}
      />
    </ConnectorsPageProvider>
  );
};
