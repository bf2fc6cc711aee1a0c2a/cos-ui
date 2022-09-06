import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import {
  ConnectorMachineActorRef,
  useConnector,
} from '@app/machines/Connector.machine';
import { useConnectorsMachine } from '@app/pages/ConnectorsPage/ConnectorsPageContext';
import React, { FunctionComponent, SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownItem,
  Dropdown,
  KebabToggle,
  DropdownPosition,
  DropdownSeparator,
} from '@patternfly/react-core';

import { ConnectorDesiredState } from '@rhoas/connector-management-sdk';

type connectorActionsMenuProps = {
  onClose: () => void;
  onConnectorDetail: (id: string, goToConnectorDetails: string) => void;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorActionsMenu: FunctionComponent<connectorActionsMenuProps> =
  ({ onConnectorDetail, onDuplicateConnector }) => {
    const { response, selectedConnector } = useConnectorsMachine();

    const currentConnectorRef = response?.items?.filter((ref: any) => {
      return ref.id == `connector-${selectedConnector?.id}`;
    })[0];

    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState<boolean>(false);
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
    } = useConnector(currentConnectorRef as ConnectorMachineActorRef);

    const onToggle = (isOpen: boolean) => {
      setIsOpen(isOpen);
    };
    const onSelect = (
      _event?: SyntheticEvent<HTMLDivElement, Event> | undefined
    ) => {
      setIsOpen(!isOpen);
      onFocus();
    };

    const onFocus = () => {
      const element = document.getElementById('connector-action');
      element?.focus();
    };
    const doCancelDeleteConnector = () => {
      setShowDeleteConnectorConfirm(false);
    };
    const doDeleteConnector = () => {
      setShowDeleteConnectorConfirm(false);
      onDelete();
    };

    const dropdownItems = [
      <DropdownItem
        key="start action"
        component="button"
        onClick={onStart}
        isDisabled={!canStart}
      >
        {t('startInstance')}
      </DropdownItem>,
      <DropdownItem
        key="stop action"
        component="button"
        onClick={onStop}
        isDisabled={!canStop}
      >
        {t('stopInstance')}
      </DropdownItem>,
      <DropdownSeparator key="separator_1" />,
      <DropdownItem
        key="edit action"
        component="button"
        onClick={() => onConnectorDetail(connector.id!, 'configuration')}
      >
        {t('editInstance')}
      </DropdownItem>,
      <DropdownItem
        key="Duplicate action"
        component="button"
        onClick={() => onDuplicateConnector(connector.id!)}
      >
        {t('duplicateInstance')}
      </DropdownItem>,
      <DropdownSeparator key="separator_2" />,
      <DropdownItem
        key="delete action"
        component="button"
        onClick={() => setShowDeleteConnectorConfirm(true)}
        isDisabled={!canDelete}
      >
        {t('deleteInstance')}
      </DropdownItem>,
    ];
    return (
      <>
        <DialogDeleteConnector
          connectorName={connector.name}
          showDialog={showDeleteConnectorConfirm}
          onCancel={doCancelDeleteConnector}
          onConfirm={doDeleteConnector}
        />
        <Dropdown
          onSelect={onSelect}
          toggle={
            <KebabToggle
              onToggle={onToggle}
              isDisabled={
                connector.desired_state === ConnectorDesiredState.Deleted
              }
              id="connector-action"
            />
          }
          isOpen={isOpen}
          isPlain
          dropdownItems={dropdownItems}
          position={DropdownPosition.right}
        />
      </>
    );
  };
