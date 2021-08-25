import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ButtonVariant,
  Card,
  PageSection,
  TextContent,
  Title,
} from '@patternfly/react-core';

import { AlertVariant, useAlert } from '@bf2/ui-shared';

import { useAppContext } from './AppContext';
import { ConnectorDrawer } from './ConnectorDrawer';
import { useConnectorsMachine } from './ConnectorsPage.machine';
import {
  ConnectorsPageProvider,
  useConnectorsPageIsReady,
  useConnectorsPageMachineService,
} from './ConnectorsPageContext';
import { ConnectorsTable } from './ConnectorsTable';
import { ConnectorsToolbar } from './ConnectorsToolbar';
import { EmptyState, EmptyStateVariant } from './EmptyState';
import { Loading } from './Loading';
import { NoMatchFound } from './NoMatchFound';

type ConnectedConnectorsPageProps = {
  onCreateConnector: () => void;
};
export const ConnectedConnectorsPage: FunctionComponent<ConnectedConnectorsPageProps> =
  ({ onCreateConnector }) => {
    const { t } = useTranslation();
    const alert = useAlert();
    const { basePath, getToken } = useAppContext();
    const onError = useCallback(
      (description: string) => {
        alert?.addAlert({
          id: 'connectors-table-error',
          variant: AlertVariant.danger,
          title: t('common.something_went_wrong'),
          description,
        });
      },
      [alert, t]
    );

    return (
      <ConnectorsPageProvider
        accessToken={getToken}
        basePath={basePath}
        onError={onError}
      >
        <ConnectorsPage onCreateConnector={onCreateConnector} />
      </ConnectorsPageProvider>
    );
  };

export type ConnectorsPageProps = {
  onCreateConnector: () => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  onCreateConnector,
}: ConnectorsPageProps) => {
  const isReady = useConnectorsPageIsReady();
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
  const service = useConnectorsPageMachineService();
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
