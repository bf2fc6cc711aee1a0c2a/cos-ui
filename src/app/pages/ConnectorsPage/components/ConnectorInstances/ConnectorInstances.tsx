import { ConnectorsOrderBy } from '@apis/api';
import { EmptyStateGenericError } from '@app/components/EmptyStateGenericError/EmptyStateGenericError';
import { Loading } from '@app/components/Loading/Loading';
import { ConnectorMachineActorRef } from '@app/machines/Connector.machine';
import { DEFAULT_PAGE_SIZE } from '@app/machines/PaginatedResponse.machine';
import { ConnectorDrawer } from '@app/pages/ConnectorsPage/components/ConnectorDrawer/ConnectorDrawer';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import {
  QuickStartContext,
  QuickStartContextValues,
} from '@patternfly/quickstarts';
import { Card, PageSection } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { useConnectorsMachine } from '../../ConnectorsPageContext';
import { ConnectorActionsMenu } from '../ConnectorActionsMenu/ConnectorActionsMenu';
import { ConnectorInstancesTable } from '../ConnectorInstancesTable/ConnectorInstancesTable';
import { ConnectorsPageTitle } from '../ConnectorsPageTitle/ConnectorsPageTitle';

export type ConnectorInstancesProps = {
  onCreateConnector: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorInstances: FunctionComponent<ConnectorInstancesProps> = ({
  onCreateConnector,
  onConnectorDetail,
  onDuplicateConnector,
}: ConnectorInstancesProps) => {
  const {
    error,
    firstRequest,
    loading,
    request,
    response,
    selectedConnector,
    deselectConnector,
    runQuery,
  } = useConnectorsMachine();
  const { page, size, search, orderBy } = request;
  const { total, items } = response || { total: 0, items: [] };
  const { t } = useTranslation();

  const qsContext: QuickStartContextValues = useContext(QuickStartContext);
  const onHelp = useCallback(() => {
    qsContext.setActiveQuickStart &&
      qsContext.setActiveQuickStart(t('connectors-getting-started'));
  }, [qsContext, t]);

  const namesChips = search && search.name ? [search.name] : [];

  const onClearAllFilters = useCallback(() => {
    runQuery({ page: 1, size: DEFAULT_PAGE_SIZE });
  }, [runQuery]);

  const onSearch = useCallback(
    (value: string) => {
      runQuery({
        page,
        size,
        search: { name: value },
      });
    },
    [runQuery, page, size]
  );

  const onSort = useCallback(
    (newOrderBy: ConnectorsOrderBy) => {
      runQuery({
        page,
        size,
        orderBy: newOrderBy,
        search,
      });
    },
    [runQuery, page, size, search]
  );

  const onPageChange = useCallback(
    (page: number, perPage: number) => {
      runQuery({
        page: perPage !== size ? 1 : page,
        size: perPage,
        orderBy,
        search,
      });
    },
    [runQuery, size, orderBy, search]
  );

  const onRemoveChip = useCallback(
    (_value: string) => {
      runQuery({ page, size, search: {}, orderBy });
    },
    [runQuery, page, size, orderBy]
  );

  const onRemoveGroup = onClearAllFilters;
  const isFiltered = namesChips.length > 0;

  const [[activeSortColumn, activeSortDirection]] = Object.entries(
    orderBy || { name: 'asc' }
  );

  switch (true) {
    case firstRequest:
    case loading:
      return <Loading />;
    case error:
      return <EmptyStateGenericError />;
    default:
      return (
        <ConnectorDrawer
          connector={selectedConnector}
          onDuplicateConnector={onDuplicateConnector}
          onClose={deselectConnector}
          actionsMenu={
            <ConnectorActionsMenu
              onDuplicateConnector={onDuplicateConnector}
              onConnectorDetail={onConnectorDetail}
              onClose={deselectConnector}
            />
          }
        >
          <PageSection variant={'light'}>
            <ConnectorsPageTitle />
          </PageSection>
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <Card className={'pf-u-pb-xl'}>
              <div className={'pf-u-p-md'}>
                <ConnectorInstancesTable
                  activeSortColumn={activeSortColumn}
                  activeSortDirection={activeSortDirection as string}
                  isFiltered={isFiltered}
                  itemCount={total || 0}
                  items={items as Array<ConnectorMachineActorRef>}
                  namesChips={namesChips}
                  onClearAllFilters={onClearAllFilters}
                  onConnectorDetail={onConnectorDetail}
                  onCreateConnector={onCreateConnector}
                  onDuplicateConnector={onDuplicateConnector}
                  onHelp={onHelp}
                  onPageChange={onPageChange}
                  onRemoveNameChip={onRemoveChip}
                  onRemoveNameChipGroup={onRemoveGroup}
                  onSearchName={onSearch}
                  onSort={onSort}
                  page={page}
                  selectedConnector={selectedConnector}
                  size={size}
                />
              </div>
            </Card>
          </PageSection>
        </ConnectorDrawer>
      );
  }
};
