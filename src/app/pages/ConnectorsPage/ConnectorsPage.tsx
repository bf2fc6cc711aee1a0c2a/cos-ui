import { ConnectorDrawer } from '@app/components/ConnectorDrawer/ConnectorDrawer';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import {
  ConnectorsToolbar,
  ConnectorsToolbarFilter,
} from '@app/components/ConnectorsToolbar/ConnectorsToolbar';
import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import { EmptyStateGenericError } from '@app/components/EmptyStateGenericError/EmptyStateGenericError';
import { EmptyStateGettingStarted } from '@app/components/EmptyStateGettingStarted/EmptyStateGettingStarted';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import { useCos } from '@hooks/useCos';
import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useState,
} from 'react';

import {
  QuickStartContext,
  QuickStartContextValues,
} from '@patternfly/quickstarts';
import {
  Card,
  ClipboardCopy,
  PageSection,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import {
  ActionsColumn as ActionsColumnType,
  IActions,
  Td as TdType,
} from '@patternfly/react-table';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';
import { TableView } from '@rhoas/app-services-ui-components';
import { AlertVariant, useAlert } from '@rhoas/app-services-ui-shared';
import { ConnectorDesiredState } from '@rhoas/connector-management-sdk';

import {
  ConnectorsPageProvider,
  useConnectorsMachine,
  useConnectorsPageIsReady,
} from './ConnectorsPageContext';

const columns = ['name', 'connector_type_id', 'state'] as const;

type ConnectedConnectorsPageProps = {
  onCreateConnector: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};
export const ConnectedConnectorsPage: FunctionComponent<ConnectedConnectorsPageProps> =
  ({ onCreateConnector, onConnectorDetail, onDuplicateConnector }) => {
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
        <ConnectorsPage
          onCreateConnector={onCreateConnector}
          onConnectorDetail={onConnectorDetail}
          onDuplicateConnector={onDuplicateConnector}
        />
      </ConnectorsPageProvider>
    );
  };

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
  const isReady = useConnectorsPageIsReady();
  return isReady ? (
    <ConnectorsPageBody
      onCreateConnector={onCreateConnector}
      onConnectorDetail={onConnectorDetail}
      onDuplicateConnector={onDuplicateConnector}
    />
  ) : (
    <Loading />
  );
};

export type ConnectorsPageBodyProps = {
  onCreateConnector: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorsPageBody: FunctionComponent<ConnectorsPageBodyProps> = ({
  onCreateConnector,
  onConnectorDetail,
  onDuplicateConnector,
}: ConnectorsPageBodyProps) => {
  const { t } = useTranslation();
  const qsContext: QuickStartContextValues = useContext(QuickStartContext);
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
    runQuery,
  } = useConnectorsMachine();
  const currentConnectorRef = response?.items?.filter((ref) => {
    return ref.id == `connector-${selectedConnector?.id}`;
  })[0];
  const columnLabels = {
    name: t('name'),
    connector_type_id: t('connector'),
    state: t('status'),
  } as { [key in typeof columns[number]]: string };
  switch (true) {
    case firstRequest:
      return <Loading />;
    case queryEmpty:
      return (
        <>
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <Card className={'pf-u-pb-xl'}>
              <ConnectorsToolbar>
                <ConnectorsToolbarFilter
                  itemCount={response?.total || 0}
                  page={request.page}
                  perPage={request.size}
                  search={request.search}
                  orderBy={request.orderBy}
                  onChange={runQuery}
                />
              </ConnectorsToolbar>
              <EmptyStateNoMatchesFound
                onClear={() => runQuery({ page: 1, size: 10 })}
              />
            </Card>
          </PageSection>
        </>
      );
    case loading:
      return (
        <>
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <Card className={'pf-u-pb-xl'}>
              <ConnectorsToolbar>
                <ConnectorsToolbarFilter
                  itemCount={response?.total || 0}
                  page={request.page}
                  perPage={request.size}
                  search={request.search}
                  orderBy={request.orderBy}
                  onChange={runQuery}
                />
              </ConnectorsToolbar>
              <Loading />
            </Card>
          </PageSection>
        </>
      );
    case noResults:
      return (
        <EmptyStateGettingStarted
          onCreate={onCreateConnector}
          onHelp={() =>
            qsContext.setActiveQuickStart &&
            qsContext.setActiveQuickStart(t('connectors-getting-started'))
          }
        />
      );
    case error:
      return <EmptyStateGenericError />;
    default:
      // First pass is implementing a simple sort on the table
      const [[activeSortColumn, activeSortDirection]] = Object.entries(
        request.orderBy || { name: 'asc' }
      );
      return (
        <ConnectorDrawer
          currentConnectorRef={currentConnectorRef as ConnectorMachineActorRef}
          onConnectorDetail={onConnectorDetail}
          onDuplicateConnector={onDuplicateConnector}
          onClose={deselectConnector}
        >
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <Card className={'pf-u-pb-xl'}>
              <div className={'pf-u-p-md'}>
                <TableView
                  ariaLabel="Sortable Connectors Instance Table"
                  columns={columns}
                  data={response?.items!}
                  renderHeader={({ column, Th, key }) => (
                    <Th
                      key={key}
                      sort={{
                        sortBy: {
                          index:
                            columns.indexOf(
                              activeSortColumn as typeof columns[number]
                            ) || 0,
                          direction: (activeSortDirection as 'asc') || 'desc',
                          defaultDirection: 'asc',
                        },
                        onSort: (_event, index, direction) =>
                          runQuery({
                            page: request.page,
                            size: request.size,
                            orderBy: { [columns[index]]: direction },
                            search: request.search,
                          }),
                        columnIndex: columns.indexOf(column),
                      }}
                    >
                      {columnLabels[column]}
                    </Th>
                  )}
                  renderActions={({ row, ActionsColumn }) => (
                    <ConnectorActions
                      ActionsColumn={ActionsColumn}
                      connectorRef={row as any}
                      onConnectorDetail={onConnectorDetail}
                      onDuplicateConnector={onDuplicateConnector}
                    />
                  )}
                  renderCell={({ column, row, key, Td }) => (
                    <ConnectorCell
                      key={key}
                      Td={Td}
                      column={column}
                      columnLabels={columnLabels}
                      tdKey={key}
                      connectorRef={row}
                      onConnectorDetail={onConnectorDetail}
                    />
                  )}
                  onRowClick={({ row }) => row.send('connector.select')}
                  isRowSelected={({ row }) =>
                    selectedConnector
                      ? selectedConnector.id ===
                        row.getSnapshot()?.context.connector.id
                      : false
                  }
                  setActionCellOuiaId={({ row }) =>
                    `actions-for-${row.getSnapshot()?.context.connector.id}`
                  }
                  toolbarContent={
                    <ConnectorsToolbarFilter
                      itemCount={response?.total || 0}
                      page={request.page}
                      perPage={request.size}
                      search={request.search}
                      orderBy={request.orderBy}
                      onChange={runQuery}
                    />
                  }
                  itemCount={response?.total || 0}
                  page={request.page}
                  perPage={request.size}
                  onPageChange={(page, perPage) =>
                    runQuery({
                      page: perPage !== request.size ? 1 : page,
                      size: perPage,
                      orderBy: request.orderBy,
                      search: request.search,
                    })
                  }
                />
              </div>
            </Card>
          </PageSection>
        </ConnectorDrawer>
      );
  }
};

const ConnectorsPageTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Title headingLevel="h1">{t('connectorsInstances')}</Title>
    </TextContent>
  );
};

type ConnectorCellProps = {
  Td: typeof TdType;
  column: typeof columns[number];
  columnLabels: { [key in typeof columns[number]]: string };
  connectorRef: ConnectorMachineActorRef;
  tdKey: string;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
};
const ConnectorCell: FunctionComponent<ConnectorCellProps> = ({
  Td,
  column,
  columnLabels,
  connectorRef,
  tdKey,
  onConnectorDetail,
}) => {
  const { t } = useTranslation();
  const { connector } = useConnector(connectorRef);
  const { connector_type_id, desired_state, id, name, status } = connector;
  const { state } = status!;
  switch (column) {
    case 'name':
      return (
        <Td key={tdKey} dataLabel={columnLabels[column]}>
          {desired_state === ConnectorDesiredState.Deleted ? (
            <Text component={TextVariants.p}>{name}</Text>
          ) : (
            <Text
              component={TextVariants.a}
              isVisitedLink
              onClick={() => onConnectorDetail(id!, 'overview')}
            >
              {name}
            </Text>
          )}
        </Td>
      );
    case 'connector_type_id':
      return (
        <Td key={tdKey} dataLabel={columnLabels[column]}>
          {connector_type_id}
        </Td>
      );
    case 'state':
      return (
        <Td key={tdKey} dataLabel={columnLabels[column]}>
          {state?.toLowerCase() === 'failed' ? (
            <ConnectorStatus
              desiredState={desired_state}
              name={name}
              state={state}
              clickable={true}
              popoverBody={
                <div>
                  <p>{t('previewModeMsg')}</p>
                  <Trans i18nKey={'supportEmailMsg'}>
                    You can still get help by emailing us at
                    <ClipboardCopy
                      hoverTip="Copy"
                      clickTip="Copied"
                      variant="inline-compact"
                      onClick={(e) => e.stopPropagation()}
                    >
                      rhosak-eval-support@redhat.com
                    </ClipboardCopy>
                    . This mailing list is monitored by the Red Hat OpenShift
                    Application Services team.
                  </Trans>
                </div>
              }
              popoverHeader={
                <h1 className="connectors-failed_pop_over">
                  <ExclamationCircleIcon /> {t('failed')}
                </h1>
              }
            />
          ) : (
            <ConnectorStatus
              desiredState={desired_state}
              name={name}
              state={state!}
            />
          )}
        </Td>
      );
  }
  throw `No way to render column ${column}`;
};

type ConnectorActionsProps = {
  ActionsColumn: typeof ActionsColumnType;
  connectorRef: ConnectorMachineActorRef;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};
const ConnectorActions: FunctionComponent<ConnectorActionsProps> = ({
  ActionsColumn,
  connectorRef,
  onConnectorDetail,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();
  const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
    useState(false);
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
  const { id, name } = connector;
  const doCancelDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
  };

  const doDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
    onDelete();
  };

  const actions: IActions = [
    {
      title: t('startInstance'),
      onClick: onStart,
      isDisabled: !canStart,
    },
    {
      title: t('stopInstance'),
      onClick: onStop,
      isDisabled: !canStop,
    },
    {
      isSeparator: true,
    },
    {
      title: t('details'),
      onClick: onSelect,
    },
    {
      isSeparator: true,
    },
    {
      title: t('editInstance'),
      onClick: () => onConnectorDetail(id!, 'configuration'),
      isDisabled: false,
    },
    {
      title: t('duplicateInstance'),
      onClick: () => onDuplicateConnector(id!),
      isDisabled: false,
    },
    {
      isSeparator: true,
    },
    {
      title: t('deleteInstance'),
      onClick: () => setShowDeleteConnectorConfirm(true),
      isDisabled: !canDelete,
    },
  ];
  return (
    <>
      <DialogDeleteConnector
        connectorName={name}
        showDialog={showDeleteConnectorConfirm}
        onCancel={doCancelDeleteConnector}
        onConfirm={doDeleteConnector}
      />
      <ActionsColumn
        items={actions}
        isDisabled={connector.desired_state === ConnectorDesiredState.Deleted}
        rowData={{ actionProps: { menuAppendTo: document.body } }}
        data-testid={`actions-for-${id!}`}
      />
    </>
  );
};
