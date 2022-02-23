import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { css } from '@patternfly/react-styles';
import {
  IActions,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import './ConnectorsTable.css';

export const ConnectorsTable: FunctionComponent = ({ children }) => {
  const { t } = useTranslation();
  return (
    <TableComposable
      aria-label="Sortable Table"
      className={css('connectors-table-view__table')}
    >
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Connector')}</Th>
          {/* <Th>{t('Category')}</Th> */}
          <Th>{t('Status')}</Th>
        </Tr>
      </Thead>
      <Tbody>{children}</Tbody>
    </TableComposable>
  );
};

type ConnectorsTableRowProps = {
  connectorId: string;
  name: string;
  type: string;
  category: string;
  status: string;
  isSelected: boolean;
  canStart: boolean;
  canStop: boolean;
  canDelete: boolean;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
};
export const ConnectorsTableRow: FunctionComponent<ConnectorsTableRowProps> = ({
  connectorId,
  name,
  type,
  status,
  isSelected,
  canStart,
  canStop,
  canDelete,
  onStart,
  onStop,
  onDelete,
  onEdit,
  onSelect,
}) => {
  const { t } = useTranslation();

  const actions: IActions = [
    {
      title: 'Start',
      onClick: onStart,
      isDisabled: !canStart,
    },
    {
      title: 'Stop',
      onClick: onStop,
      isDisabled: !canStop,
    },
    {
      title: 'Delete',
      onClick: onDelete,
      isDisabled: !canDelete,
    },
    {
      title: 'Edit',
      onClick: onEdit,
      isDisabled: false,
    },
    {
      isSeparator: true,
    },
    {
      title: 'Details',
      onClick: onSelect,
    },
  ];

  return (
    <Tr
      onClick={(event) => {
        // send the event only if the click didn't happen on the actions button
        if ((event.target as any | undefined)?.type !== 'button') {
          onSelect();
        }
      }}
      className={css(
        'pf-c-table-row__item',
        'pf-m-selectable',
        isSelected && 'pf-m-selected'
      )}
    >
      <Td dataLabel={t('Name')}>{name}</Td>
      <Td dataLabel={t('Type')}>{type}</Td>
      {/* <Td dataLabel={t('Category')}>{category}</Td> */}
      <Td dataLabel={t('Status')}>
        <ConnectorStatus name={name} status={status} />
      </Td>
      <Td
        actions={{ items: actions }}
        data-testid={`actions-for-${connectorId}`}
      />
    </Tr>
  );
};
