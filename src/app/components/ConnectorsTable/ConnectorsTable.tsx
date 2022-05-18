import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  ClipboardCopy,
  Popover,
  PopoverPosition,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
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
  desiredState: string;
  name: string;
  type: string;
  category: string;
  state: string;
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
  desiredState,
  name,
  type,
  state,
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

  const popoverRef = React.useRef(null);

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
      title: t('details'),
      onClick: onSelect,
    },
    {
      title: t('edit'),
      onClick: () => openDetail('configuration'),
      isDisabled: false,
    },
    {
      title: t('duplicate'),
      onClick: () => onDuplicateConnector(connectorId),
      isDisabled: false,
    },
    {
      isSeparator: true,
    },
    {
      title: t('delete'),
      onClick: onDelete,
      isDisabled: !canDelete,
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
        
        <Popover
          aria-label="Failed connector popover"
          position={PopoverPosition.auto}
          hideOnOutsideClick={true}
          headerContent={
            <h1 className="connectors-failed_pop_over">
              <ExclamationCircleIcon /> Failed
            </h1>
          }
          bodyContent={
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
          reference={popoverRef}
        />
        <div
          id="connector-status"
          onClick={(e) =>
            state?.toLowerCase() === 'failed' ? e.stopPropagation() : null
          }
          ref={state?.toLowerCase() === 'failed' ? popoverRef : null}
        >
          <ConnectorStatus
          desiredState={desiredState}
          name={name}
          state={state}
        />
        </div>
      </Td>
      <Td
        actions={{ items: actions }}
        data-testid={`actions-for-${connectorId}`}
      />
    </Tr>
  );
};
