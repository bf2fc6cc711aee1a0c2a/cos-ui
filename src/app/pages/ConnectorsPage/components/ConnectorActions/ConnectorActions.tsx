import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import React, { FunctionComponent, useState } from 'react';

import {
  ActionsColumn as ActionsColumnType,
  IActions,
} from '@patternfly/react-table';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorDesiredState } from '@rhoas/connector-management-sdk';

type ConnectorActionsProps = {
  ActionsColumn: typeof ActionsColumnType;
  connectorRef: ConnectorMachineActorRef;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};
export const ConnectorActions: FunctionComponent<ConnectorActionsProps> = ({
  ActionsColumn,
  connectorRef,
  onConnectorDetail,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();
  const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
    useState(false);
  const {
    connector,
    canStart,
    canStop,
    canDelete,
    onStart,
    onStop,
    onDelete,
    onSelect,
  } = useConnector(connectorRef);
  const { id, name } = connector;
  const doCancelDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
  };

  const doDeleteConnector = () => {
    setShowDeleteConnectorConfirm(false);
    onDelete();
  };

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
      onClick: () => setShowDeleteConnectorConfirm(true),
      isDisabled: !canDelete,
    },
  ];
  return (
    <>
      <DialogDeleteConnector
        connectorName={name}
        showDialog={showDeleteConnectorConfirm}
        onCancel={doCancelDeleteConnector}
        onConfirm={doDeleteConnector}
      />
      <ActionsColumn
        items={actions}
        isDisabled={connector.desired_state === ConnectorDesiredState.Deleted}
        data-testid={`actions-for-${id!}`}
      />
    </>
  );
};
