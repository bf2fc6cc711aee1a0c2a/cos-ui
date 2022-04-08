import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Text, TextVariants } from '@patternfly/react-core';
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
          <Th>{t('name')}</Th>
          <Th>{t('connector')}</Th>
          {/* <Th>{t('Category')}</Th> */}
          <Th>{t('status')}</Th>
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
  onDuplicateConnector: (id: string) => void;
  onDelete: () => void;
  openDetail: (target: string) => void;
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
  openDetail,
  onSelect,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();

  const actions: IActions = [
    {
      title: t('start'),
      onClick: onStart,
      isDisabled: !canStart,
    },
    {
      title: t('stop'),
      onClick: onStop,
      isDisabled: !canStop,
    },
    {
      title: t('delete'),
      onClick: onDelete,
      isDisabled: !canDelete,
    },
    {
      title: t('edit'),
      onClick: () => openDetail('configuration'),
      isDisabled: false,
    },
    {
      title: t('duplicateConnector'),
      onClick: () => onDuplicateConnector(connectorId),
      isDisabled: false,
    },
    {
      isSeparator: true,
    },
    {
      title: t('details'),
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
      <Td dataLabel={t('name')}>
        <Text
          component={TextVariants.a}
          isVisitedLink
          onClick={() => openDetail('overview')}
        >
          {name}
        </Text>
      </Td>
      <Td dataLabel={t('type')}>{type}</Td>
      {/* <Td dataLabel={t('Category')}>{category}</Td> */}
      <Td dataLabel={t('status')}>
        <ConnectorStatus name={name} status={status} />
      </Td>
      <Td
        actions={{ items: actions }}
        data-testid={`actions-for-${connectorId}`}
      />
    </Tr>
  );
};
