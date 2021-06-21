import React, { FunctionComponent } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  SortByDirection,
  IRowData,
  IExtraData,
  IAction,
  headerCol,
  cellWidth,
  IRow,
} from '@patternfly/react-table';
import { PageSection } from '@patternfly/react-core';
import { ConnectorsToolbar } from './ConnectorsPage';
import { useTranslation } from 'react-i18next';
import { Connector } from '@cos-ui/api';
import { PaginatedApiResponse } from '@cos-ui/machines';

export type ConnectorTableViewProps = {
  data: PaginatedApiResponse<Connector>;
  selectConnector: (conn: Connector | null) => void;
};

const getTableRow = (data: PaginatedApiResponse<Connector>) => {
  const rows = data?.items?.map(c => ({
    cells: [
      c.metadata?.name,
      c.connector_type_id,
      // using owner as dummy value for category
      c.metadata?.owner,
      c.status,
    ],
    originalData: c,
  }));
  return rows;
};

export const ConnectorTableView: FunctionComponent<ConnectorTableViewProps> = ({
  data,
  selectConnector,
}: ConnectorTableViewProps) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = React.useState({});
  const [rows, setRows] = React.useState(getTableRow(data));

  const columns = [
    {
      title: t('name'),
      transforms: [sortable, cellWidth(30)],
      cellTransforms: [headerCol()],
    },
    { title: t('type'), transforms: [sortable, cellWidth(20)] },
    { title: t('category'), transforms: [sortable] },
    { title: t('status'), transforms: [sortable] },
  ];

  const onSort = (
    _event: React.MouseEvent,
    index: number,
    direction: SortByDirection
  ) => {
    const sortedRows = rows?.sort((a: any, b: any) =>
      a[index] < b[index] ? -1 : a[index] > b[index] ? 1 : 0
    );
    setRows(
      direction === SortByDirection.asc ? sortedRows : sortedRows?.reverse()
    );
    setSortBy({
      index,
      direction,
    });
  };

  const onRowClick = (event: any, row: IRow) => {
    const { originalData } = row;
    const clickedEventType = event?.target?.type;
    const tagName = event?.target?.tagName;

    // Open modal on row click except kebab button click
    if (clickedEventType !== 'button' && tagName?.toLowerCase() !== 'a') {
      selectConnector(originalData);
    }
  };

  const tableActionResolver = (_row: IRowData, _extraData: IExtraData) => {
    let returnVal = [] as IAction[];
    returnVal = [
      {
        title: 'Start',
        onClick: () => console.log('clicked on Start ACTION, on row: '),
      },
      {
        title: 'Stop',
        onClick: () => console.log('clicked on Stop ACTION, on row: '),
      },
      {
        title: 'Delete',
        onClick: () => console.log('clicked on Delete ACTION, on row: '),
      },
      {
        isSeparator: true,
      },
      {
        title: 'Overview',
        onClick: () => console.log('clicked on Overview ACTION, on row: '),
      },
    ];
    return returnVal;
  };

  return (
    <PageSection padding={{ default: 'noPadding' }} isFilled>
      <ConnectorsToolbar />

      <Table
        aria-label="Sortable Table"
        cells={columns}
        rows={rows}
        // className="pf-m-no-border-rows"
        actionResolver={tableActionResolver}
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody onRowClick={onRowClick} />
      </Table>
    </PageSection>
  );
};
