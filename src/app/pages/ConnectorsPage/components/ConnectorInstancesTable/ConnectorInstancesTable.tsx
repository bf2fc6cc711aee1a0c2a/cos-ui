import { ConnectorsOrderBy } from '@apis/api';
import { EmptyStateGettingStarted } from '@app/components/EmptyStateGettingStarted/EmptyStateGettingStarted';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { ConnectorMachineActorRef } from '@app/machines/Connector.machine';
import React, { FunctionComponent } from 'react';
import { NavLink } from 'react-router-dom';

import { Card, PageSection } from '@patternfly/react-core';

import { TableView } from '@rhoas/app-services-ui-components';
import { useTranslation } from '@rhoas/app-services-ui-components';
import { Connector } from '@rhoas/connector-management-sdk';

import { CONNECTOR_INSTANCES_COLUMNS } from '../../constants';
import { ConnectorActions } from '../ConnectorActions/ConnectorActions';
import { ConnectorCell } from '../ConnectorCell/ConnectorCell';
import './ConnectorInstancesTable.css';

export type ConnectorInstancesTableProps = {
  activeSortColumn: string;
  activeSortDirection: string;
  isFiltered: boolean;
  itemCount: number;
  items: Array<ConnectorMachineActorRef>;
  namesChips: string[];
  onClearAllFilters: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onCreateConnector: () => void;
  onDuplicateConnector: (id: string) => void;
  onHelp: () => void;
  onPageChange: (page: number, perPage: number) => void;
  onRemoveNameChip: (value: string) => void;
  onRemoveNameChipGroup: () => void;
  onSearchName: (value: string) => void;
  onSort: (orderBy: ConnectorsOrderBy) => void;
  page: number;
  selectedConnector?: Connector;
  size: number;
  onDelete: (row: Connector) => void;
};

export const ConnectorInstancesTable: FunctionComponent<ConnectorInstancesTableProps> =
  ({
    activeSortColumn,
    activeSortDirection,
    isFiltered,
    itemCount,
    items,
    namesChips,
    onClearAllFilters,
    onConnectorDetail,
    onCreateConnector,
    onDuplicateConnector,
    onHelp,
    onPageChange,
    onRemoveNameChip,
    onRemoveNameChipGroup,
    onSearchName,
    onSort,
    page,
    selectedConnector,
    size,
    onDelete,
  }: ConnectorInstancesTableProps) => {
    const { t } = useTranslation();
    const columnLabels = {
      name: t('name'),
      connector_type_id: t('connector'),
      state: t('status'),
    } as { [key in typeof CONNECTOR_INSTANCES_COLUMNS[number]]: string };
    return (
      <PageSection
        padding={{ default: 'noPadding' }}
        variant={'default'}
        className={'connector-instances-table__wrapper'}
      >
        <Card isPlain className={'pf-u-p-lg'}>
          <TableView
            ariaLabel="Sortable Connectors Instance Table"
            columns={CONNECTOR_INSTANCES_COLUMNS}
            data={items}
            renderHeader={({ column, Th, key }) => (
              <Th
                key={key}
                sort={{
                  sortBy: {
                    index:
                      CONNECTOR_INSTANCES_COLUMNS.indexOf(
                        activeSortColumn as typeof CONNECTOR_INSTANCES_COLUMNS[number]
                      ) || 0,
                    direction: (activeSortDirection as 'asc') || 'desc',
                    defaultDirection: 'asc',
                  },
                  onSort: (_event, index, direction) =>
                    onSort({ [CONNECTOR_INSTANCES_COLUMNS[index]]: direction }),
                  columnIndex: CONNECTOR_INSTANCES_COLUMNS.indexOf(column),
                }}
              >
                {columnLabels[column]}
              </Th>
            )}
            renderActions={({ row, ActionsColumn }) => (
              <ConnectorActions
                ActionsColumn={ActionsColumn}
                connectorRef={row}
                onConnectorDetail={onConnectorDetail}
                onDuplicateConnector={onDuplicateConnector}
                onDelete={onDelete}
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
            toolbarBreakpoint={'lg'}
            filters={{
              name: {
                type: 'search',
                chips: namesChips,
                onSearch: onSearchName,
                onRemoveChip: onRemoveNameChip,
                onRemoveGroup: onRemoveNameChipGroup,
                validate: (_val) => true,
                errorMessage: t('input_field_invalid_message'),
              },
            }}
            tools={[
              <NavLink
                className="pf-c-button pf-m-primary"
                to={'/create-connector'}
                data-ouia-component-id={'button-create'}
              >
                {t('createConnectorsInstance')}
              </NavLink>,
            ]}
            itemCount={itemCount}
            page={page}
            perPage={size}
            onClearAllFilters={onClearAllFilters}
            isFiltered={isFiltered}
            onPageChange={onPageChange}
            emptyStateNoData={
              <EmptyStateGettingStarted
                onCreate={onCreateConnector}
                onHelp={onHelp}
              />
            }
            emptyStateNoResults={
              <EmptyStateNoMatchesFound onClear={onClearAllFilters} />
            }
          />
        </Card>
      </PageSection>
    );
  };
