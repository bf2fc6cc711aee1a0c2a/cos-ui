import { DialogDeleteConnector } from '@app/components/DialogDeleteConnector/DialogDeleteConnector';
import React, { FunctionComponent, useState, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

import { Connector } from '@rhoas/connector-management-sdk';

export type ConnectorDetailsActionMenuProps = {
  connector: Connector;
  canStart: boolean;
  canStop: boolean;
  canDelete: boolean;
  isDisabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onConnectorEdit: () => void;
  onDuplicateConnector: (id: string) => void;
};
export const ConnectorDetailsActionMenu: FunctionComponent<ConnectorDetailsActionMenuProps> =
  ({
    connector,
    canStart,
    canStop,
    canDelete,
    isDisabled,
    onStart,
    onStop,
    onDelete,
    onConnectorEdit,
    onDuplicateConnector,
  }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showDeleteConnectorConfirm, setShowDeleteConnectorConfirm] =
      useState(false);

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
        onClick={onConnectorEdit}
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
            <DropdownToggle
              onToggle={onToggle}
              id="connector-action"
              toggleIndicator={CaretDownIcon}
              toggleVariant="secondary"
              isPrimary
              isDisabled={isDisabled}
            >
              {t('actions')}
            </DropdownToggle>
          }
          isOpen={isOpen}
          dropdownItems={dropdownItems}
          position={DropdownPosition.right}
        />
      </>
    );
  };
