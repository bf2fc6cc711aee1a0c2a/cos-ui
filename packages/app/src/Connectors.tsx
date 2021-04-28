import React, { FunctionComponent } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  compoundExpand,
  sortable,
} from '@patternfly/react-table';
import { NavLink } from 'react-router-dom';
import CubeIcon from '@patternfly/react-icons/dist/js/icons/cube-icon';

const KafkaConnectors: FunctionComponent = () => {
  const columns = [
    'Connector',
    'Version',
    'Owner',
    'Time Created',
    'Time Updated',
    'Status',
  ];
  const rows = [
    [
      'foo',
      'v1.0.1',
      'rforina',
      '2021/04/02 12:43:32',
      '2021/04/02 15:43:32',
      'Running',
    ],
    [
      'bar',
      'v1.0.2',
      'foobar',
      '2021/04/02 12:43:32',
      '2021/04/02 15:43:32',
      'Created',
    ],
    [
      'baz',
      'v0.0.7',
      'zomg',
      '2021/04/02 12:43:32',
      '2021/04/02 15:43:32',
      'Deleted',
    ],
  ];
  return (
    <Table
      aria-label="Sortable Table"
      variant={'compact'}
      sortBy={{}}
      onSort={() => false}
      cells={columns}
      rows={rows}
      className="pf-m-no-border-rows"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export const Connectors: FunctionComponent = () => {
  const columns = [
    'Kafka instances',
    {
      title: 'Connectors',
      cellTransforms: [compoundExpand],
    },
    { title: 'Cloud_provider', transforms: [sortable] },
    { title: 'Region', transforms: [sortable] },
    { title: 'Owner', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: 'Time_created', transforms: [sortable] },
    { title: '', dataLabel: 'Actions' },
  ];
  const rows = [
    {
      isOpen: true,
      cells: [
        {
          title: <a href="#">some-istance-name</a>,
          props: { component: 'th' },
        },
        {
          title: (
            <>
              <CubeIcon /> 3
            </>
          ),
          props: { isOpen: true, ariaControls: 'compound-expansion-table-1' },
        },
        'AWS',
        'US_EAST1',
        'rforina',
        'Created',
        '2021/03/31 00:00:00',
        {
          title: (
            <NavLink
              className="pf-c-button pf-m-secondary"
              to={'/create-connector'}
            >
              Create Connector
            </NavLink>
          ),
        },
      ],
    },
    {
      parent: 0,
      compoundParent: 1,
      cells: [
        {
          title: <KafkaConnectors />,
          props: { colSpan: 8, className: 'pf-m-no-padding' },
        },
      ],
    },
    {
      isOpen: true,
      cells: [
        { title: <a href="#">foo-bar</a>, props: { component: 'th' } },
        {
          title: (
            <>
              <CubeIcon /> 3
            </>
          ),
          props: { isOpen: true, ariaControls: 'compound-expansion-table-2' },
        },
        'AWS',
        'US_EAST1',
        'rforina',
        'Created',
        '2021/03/31 00:00:00',
        {
          title: (
            <NavLink
              className="pf-c-button pf-m-secondary"
              to={'/create-connector'}
            >
              Create Connector
            </NavLink>
          ),
        },
      ],
    },
    {
      parent: 1,
      compoundParent: 1,
      cells: [
        {
          title: <KafkaConnectors />,
          props: { colSpan: 8, className: 'pf-m-no-padding' },
        },
      ],
    },
  ];

  const onExpand = (
    _event: any,
    rowIndex: number,
    colIndex: number,
    isOpen: boolean
  ) => {
    if (!isOpen) {
      // set all other expanded cells false in this row if we are expanding
      rows[rowIndex].cells.forEach((cell: any) => {
        if (cell.props) cell.props.isOpen = false;
      });
      (rows[rowIndex].cells[colIndex] as any).props.isOpen = true;
      rows[rowIndex].isOpen = true;
    } else {
      (rows[rowIndex].cells[colIndex] as any).props.isOpen = false;
      rows[rowIndex].isOpen = rows[rowIndex].cells.some(
        (cell: any) => cell.props && cell.props.isOpen
      );
    }
  };

  return (
    <Table
      aria-label="Compound expandable table"
      onExpand={onExpand}
      rows={rows}
      cells={columns}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
