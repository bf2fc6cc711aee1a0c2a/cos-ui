import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import { useConnector } from '@app/machines/Connector.machine';
import { ConnectorMachineActorRef } from '@app/machines/Connector.machine';
import React, { FunctionComponent } from 'react';

import { ClipboardCopy, Text, TextVariants } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { Td } from '@patternfly/react-table';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorDesiredState } from '@rhoas/connector-management-sdk';

import { CONNECTOR_INSTANCES_COLUMNS } from '../../constants';

export type ConnectorCellProps = {
  Td: typeof Td;
  column: (typeof CONNECTOR_INSTANCES_COLUMNS)[number];
  columnLabels: {
    [key in (typeof CONNECTOR_INSTANCES_COLUMNS)[number]]: string;
  };
  connectorRef: ConnectorMachineActorRef;
  tdKey: string;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
};
export const ConnectorCell: FunctionComponent<ConnectorCellProps> = ({
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
