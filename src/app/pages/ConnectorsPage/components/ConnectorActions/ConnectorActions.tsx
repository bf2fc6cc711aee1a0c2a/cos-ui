import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import React, { FunctionComponent } from 'react';

import {
  ActionsColumn as ActionsColumnType,
  IActions,
} from '@patternfly/react-table';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  ConnectorDesiredState,
  Connector,
} from '@rhoas/connector-management-sdk';

type ConnectorActionsProps = {
  ActionsColumn: typeof ActionsColumnType;
  connectorRef: ConnectorMachineActorRef;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
  onDelete: (connector: Connector) => void;
};
export const ConnectorActions: FunctionComponent<ConnectorActionsProps> = ({
  ActionsColumn,
  connectorRef,
  onConnectorDetail,
  onDuplicateConnector,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { connector, canStart, canStop, canDelete, onStart, onStop, onSelect } =
    useConnector(connectorRef);
  const { id } = connector;
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
      onClick: () => onDelete(connector),
      isDisabled: !canDelete,
    },
  ];
  return (
    <ActionsColumn
      items={actions}
      isDisabled={connector.desired_state === ConnectorDesiredState.Deleted}
      rowData={{ actionProps: { menuAppendTo: document.body } }}
      data-testid={`actions-for-${connector.id!}`}
    />
  );
};
