import React, { FunctionComponent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ButtonVariant,
  Card,
  PageSection,
  TextContent,
  Title,
} from '@patternfly/react-core';

import { AlertVariant, useAlert } from '@bf2/ui-shared';

import { Connector } from '@rhoas/connector-management-sdk';

import { ConnectorMachineActorRef, useConnector } from './Connector.machine';
import { ConnectorDrawer } from './ConnectorDrawer';
import {
  ConnectorsPageProvider,
  useConnectorsMachine,
  useConnectorsPageIsReady,
  useConnectorsPageMachineService,
} from './ConnectorsPageContext';
import { ConnectorsPagination } from './ConnectorsPagination';
import { ConnectorsTable, ConnectorsTableRow } from './ConnectorsTable';
import { ConnectorsToolbar } from './ConnectorsToolbar';
import { useCos } from './CosContext';
import { DeleteDialog } from './DeleteDialog';
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
    const { basePath, getToken } = useCos();
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

export const ConnectorsPageBody: FunctionComponent<ConnectorsPageBodyProps> = ({
  onCreateConnector,
}: ConnectorsPageBodyProps) => {
  const service = useConnectorsPageMachineService();
  const {
    loading,
    error,
    noResults,
    queryEmpty,
    // queryResults,
    firstRequest,
    response,
    selectedConnector,
    deselectConnector,
  } = useConnectorsMachine();

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
        <ConnectorDrawer
          connector={selectedConnector}
          onClose={deselectConnector}
        >
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <ConnectedTable
              connectors={response!.items!}
              selectedConnector={selectedConnector}
            />
          </PageSection>
        </ConnectorDrawer>
      );
  }
};

const ConnectorsPageTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Title headingLevel="h1">{t('Connectors')}</Title>
    </TextContent>
  );
};

type ConnectedTableProps = {
  connectors: Array<ConnectorMachineActorRef>;
  selectedConnector?: Connector;
};

export const ConnectedTable: FunctionComponent<ConnectedTableProps> = ({
  connectors,
  selectedConnector,
}) => {
  return (
    <Card className={'pf-u-pb-xl'}>
      <ConnectorsToolbar />
      <div className={'pf-u-p-md'}>
        <ConnectorsTable>
          {connectors.map((ref) => (
            <ConnectedRow
              connectorRef={ref}
              key={ref.id}
              selectedConnector={selectedConnector}
            />
          ))}
        </ConnectorsTable>
      </div>
      <ConnectorsPagination isCompact={false} />
    </Card>
  );
};

type ConnectedRowProps = {
  connectorRef: ConnectorMachineActorRef;
  selectedConnector?: Connector;
};
const ConnectedRow: FunctionComponent<ConnectedRowProps> = ({
  connectorRef,
  selectedConnector,
}) => {
  const { t } = useTranslation();
  const {
    connector,
    canStart,
    canStop,
    canDelete,
    onStart,
    onStop,
    onDelete,
    onSelect,
  } = useConnector(connectorRef);

  const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
    useState(false);

  const doCancelDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
  };

  const doDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
    onDelete();
  };

  return (
    <>
      <DeleteDialog
        connectorName={connector.metadata?.name}
        i18nCancel={t('cancel')}
        i18nDelete={t('delete')}
        i18nTitle={t('deleteConnector')}
        showDialog={showDeleteConnectorConfirm}
        onCancel={doCancelDeleteConnector}
        onConfirm={doDeleteConnector}
      />
      <ConnectorsTableRow
        connectorId={connector.id!}
        name={connector.metadata!.name!}
        type={connector.connector_type_id!}
        category={'TODO: MISSING'}
        status={connector.status!}
        isSelected={selectedConnector?.id === connector.id}
        canStart={canStart}
        canStop={canStop}
        canDelete={canDelete}
        onStart={onStart}
        onStop={onStop}
        onSelect={onSelect}
        onDelete={() => setShowDeleteConnectorConfirm(true)}
      />
    </>
  );
};
