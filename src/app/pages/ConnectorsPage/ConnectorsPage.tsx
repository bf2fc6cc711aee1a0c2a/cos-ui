import { ConnectorDrawer } from '@app/components/ConnectorDrawer/ConnectorDrawer';
import {
  ConnectorsTable,
  ConnectorsTableRow,
} from '@app/components/ConnectorsTable/ConnectorsTable';
import { ConnectorsToolbar } from '@app/components/ConnectorsToolbar/ConnectorsToolbar';
import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import { EmptyStateGenericError } from '@app/components/EmptyStateGenericError/EmptyStateGenericError';
import { EmptyStateGettingStarted } from '@app/components/EmptyStateGettingStarted/EmptyStateGettingStarted';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import { Pagination } from '@app/components/Pagination/Pagination';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import { useCos } from '@context/CosContext';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, PageSection, TextContent, Title } from '@patternfly/react-core';

import { AlertVariant, useAlert } from '@rhoas/app-services-ui-shared';
import { Connector } from '@rhoas/connector-management-sdk';

import {
  ConnectorsPageProvider,
  useConnectorsMachine,
  useConnectorsPageIsReady,
} from './ConnectorsPageContext';

type ConnectedConnectorsPageProps = {
  onCreateConnector: () => void;
  onEditConnector: (id: string, name: string, currentState: string) => void;
};
export const ConnectedConnectorsPage: FunctionComponent<ConnectedConnectorsPageProps> =
  ({ onCreateConnector, onEditConnector }) => {
    const { t } = useTranslation();
    const alert = useAlert();
    const { connectorsApiBasePath, getToken } = useCos();
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
        connectorsApiBasePath={connectorsApiBasePath}
        onError={onError}
      >
        <ConnectorsPage
          onCreateConnector={onCreateConnector}
          onEditConnector={onEditConnector}
        />
      </ConnectorsPageProvider>
    );
  };

export type ConnectorsPageProps = {
  onCreateConnector: () => void;
  onEditConnector: (id: string, name: string, currentState: string) => void;
};

export const ConnectorsPage: FunctionComponent<ConnectorsPageProps> = ({
  onCreateConnector,
  onEditConnector,
}: ConnectorsPageProps) => {
  const isReady = useConnectorsPageIsReady();
  return isReady ? (
    <ConnectorsPageBody
      onCreateConnector={onCreateConnector}
      onEditConnector={onEditConnector}
    />
  ) : (
    <Loading />
  );
};

export type ConnectorsPageBodyProps = {
  onCreateConnector: () => void;
  onEditConnector: (id: string, name: string, currentState: string) => void;
};

export const ConnectorsPageBody: FunctionComponent<ConnectorsPageBodyProps> = ({
  onCreateConnector,
  onEditConnector,
}: ConnectorsPageBodyProps) => {
  const {
    loading,
    error,
    noResults,
    queryEmpty,
    firstRequest,
    request,
    response,
    selectedConnector,
    deselectConnector,
    query,
  } = useConnectorsMachine();

  switch (true) {
    case firstRequest:
      return <Loading />;
    case queryEmpty:
      return (
        <EmptyStateNoMatchesFound
          onClear={() => query({ page: 1, size: 10 })}
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
              <ConnectorsToolbar
                itemCount={response?.total || 0}
                page={request.page}
                perPage={request.size}
                onChange={(page, size) => query({ page, size })}
              />
              <Loading />
            </Card>
          </PageSection>
        </>
      );
    case noResults:
      return (
        <EmptyStateGettingStarted
          onCreate={onCreateConnector}
          onHelp={function (): void {
            throw new Error('Function not implemented.');
          }}
        />
      );
    case error:
      return <EmptyStateGenericError />;
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
            <ConnectedTable onEditConnector={onEditConnector} />
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
export type ConnectorsTableProps = {
  onEditConnector: (id: string, name: string, currentState: string) => void;
};

export const ConnectedTable: FunctionComponent<ConnectorsTableProps> = ({
  onEditConnector,
}) => {
  const { request, response, selectedConnector, query } =
    useConnectorsMachine();
  return (
    <Card className={'pf-u-pb-xl'}>
      <ConnectorsToolbar
        itemCount={response?.total || 0}
        page={request.page}
        perPage={request.size}
        onChange={(page, size) => query({ page, size })}
      />
      <div className={'pf-u-p-md'}>
        <ConnectorsTable>
          {response?.items?.map((ref) => (
            <ConnectedRow
              connectorRef={ref}
              key={ref.id}
              selectedConnector={selectedConnector}
              onEditConnector={onEditConnector}
            />
          ))}
        </ConnectorsTable>
      </div>
      <Pagination
        itemCount={response?.total || 0}
        page={request.page}
        perPage={request.size}
        onChange={(page, size) => query({ page, size })}
        isCompact={false}
      />
    </Card>
  );
};

type ConnectedRowProps = {
  connectorRef: ConnectorMachineActorRef;
  selectedConnector?: Connector;
  onEditConnector: (id: string, name: string, currentState: string) => void;
};
const ConnectedRow: FunctionComponent<ConnectedRowProps> = ({
  connectorRef,
  selectedConnector,
  onEditConnector,
}) => {
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

  const editConnector = () => {
    console.log('Edit Connectors');
    onEditConnector(connector.id!, connector.name, connector?.status?.state!);
  };

  const doCancelDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
  };

  const doDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
    onDelete();
  };

  return (
    <>
      <DialogDeleteConnector
        connectorName={connector.name}
        showDialog={showDeleteConnectorConfirm}
        onCancel={doCancelDeleteConnector}
        onConfirm={doDeleteConnector}
      />
      <ConnectorsTableRow
        connectorId={connector.id!}
        name={connector.name!}
        type={connector.connector_type_id!}
        category={'TODO: MISSING'}
        status={connector.status?.state!}
        isSelected={selectedConnector?.id === connector.id}
        canStart={canStart}
        canStop={canStop}
        canDelete={canDelete}
        onStart={onStart}
        onStop={onStop}
        onSelect={onSelect}
        onEdit={editConnector}
        onDelete={() => setShowDeleteConnectorConfirm(true)}
      />
    </>
  );
};
