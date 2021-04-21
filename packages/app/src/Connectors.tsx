import React, { FunctionComponent } from 'react';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

export const Connectors: FunctionComponent = () => {
  const columns = [
    'Repositories',
    'Branches',
    'Pull requests',
    'Workspaces',
    'Last commit',
  ];
  const rows = [
    ['Repository one', 'Branch one', 'PR one', 'Workspace one', 'Commit one'],
    ['Repository two', 'Branch two', 'PR two', 'Workspace two', 'Commit two'],
    [
      'Repository three',
      'Branch three',
      'PR three',
      'Workspace three',
      'Commit three',
    ],
  ];
  return (
    <Table
      aria-label="Compound expandable table"
      onExpand={() => false}
      rows={rows}
      cells={columns}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
