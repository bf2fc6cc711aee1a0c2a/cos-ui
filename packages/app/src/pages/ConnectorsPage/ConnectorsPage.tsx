import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ConnectorsMachineProvider,
  useConnectorsMachine,
  useConnectorsMachineIsReady,
  useConnectorsMachineService,
} from '@cos-ui/machines';
import {
  EmptyState,
  EmptyStateVariant,
  Loading,
  NoMatchFound,
} from '@cos-ui/utils';
import {
  ButtonVariant,
  Card,
  PageSection,
  TextContent,
  Title,
} from '@patternfly/react-core';

import { useAppContext } from '../../AppContext';
import { ConnectorDrawer } from './ConnectorDrawer';
import { ConnectorsTable } from './ConnectorsTable';
import { ConnectorsToolbar } from './ConnectorsToolbar';
import { AlertVariant, useAlert } from '@bf2/ui-shared';

type ConnectedConnectorsPageProps = {
  onCreateConnector: () => void;
};
export const ConnectedConnectorsPage: FunctionComponent<ConnectedConnectorsPageProps> = ({
  onCreateConnector,
}) => {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const { basePath, getToken } = useAppContext();
  const onError = useCallback(
    (description: string) => {
      addAlert({
        id: 'connectors-table-error',
        variant: AlertVariant.danger,
        title: t('common.something_went_wrong'),
        description,
      });
    },
    [addAlert, t]
  );

  return (
    <ConnectorsMachineProvider
      accessToken={getToken}
      basePath={basePath}
      onError={onError}
    >
      <ConnectorsPage onCreateConnector={onCreateConnector} />
    </ConnectorsMachineProvider>
  );
};

export type ConnectorsPageProps = {
  onCreateConnector: () => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  onCreateConnector,
}: ConnectorsPageProps) => {
  const service = useConnectorsMachineService();
  const isReady = useConnectorsMachineIsReady(service);
  return isReady ? (
    <ConnectorsPageBody onCreateConnector={onCreateConnector} />
  ) : (
    <Loading />
  );
};

export type ConnectorsPageBodyProps = {
  onCreateConnector: () => void;
};

const ConnectorsPageBody: FunctionComponent<ConnectorsPageBodyProps> = ({
  onCreateConnector,
}: ConnectorsPageBodyProps) => {
  const service = useConnectorsMachineService();
  const {
    loading,
    error,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
  } = useConnectorsMachine(service);

  switch (true) {
    case firstRequest:
      return <Loading />;
    case queryEmpty:
      return (
        <NoMatchFound
          onClear={() => service.send({ type: 'api.query', page: 1, size: 10 })}
        />
      );
    case loading:
      return (
        <>
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <Card>
              <ConnectorsToolbar />
              <Loading />
            </Card>
          </PageSection>
        </>
      );
    case noResults || error:
      return (
        <EmptyState
          emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
          titleProps={{ title: 'cos.welcome_to_cos' }}
          emptyStateBodyProps={{
            body: 'cos.welcome_empty_state_body',
          }}
          buttonProps={{
            title: 'cos.create_cos',
            variant: ButtonVariant.primary,
            onClick: onCreateConnector,
          }}
        />
      );
    default:
      return (
        <ConnectorDrawer>
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <ConnectorsTable />
          </PageSection>
        </ConnectorDrawer>
      );
  }
};

const ConnectorsPageTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Title headingLevel="h1">{t('managedConnectors')}</Title>
    </TextContent>
  );
};
