import React, {useEffect} from 'react';
import {
  Modal,
  Button,
  Stack,
  StackItem,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';

export interface IDeleteConnectorConfirmDialogProps {
  connectorName: string | undefined;
  i18nCancel: string;
  i18nDelete: string;
  i18nTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  showDialog: boolean;
}

/**
 * A modal dialog to display confirmation for connector deletion.
 */
export const DeleteConnectorConfirmDialog: React.FunctionComponent<IDeleteConnectorConfirmDialogProps> = ({
  connectorName,
  i18nCancel,
  i18nDelete,
  i18nTitle,
  onCancel,
  onConfirm,
  showDialog,
}) => {

  const [nameValue, setNameValue] = React.useState("");
  const [canDelete, setCanDelete] = React.useState(false);

  // enable delete button if entered name matches
  useEffect(() => {
    setCanDelete(nameValue === connectorName);
  }, [nameValue]);

  const onCancelDelete = () => {
    setNameValue("");
    onCancel();
  }

  const onConfirmDelete = () => {
    setNameValue("");
    onConfirm();
  }
  
  return (
    <Modal
      variant={ModalVariant.small}
      title={i18nTitle}
      titleIconVariant="warning"
      isOpen={showDialog}
      onClose={onCancel}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          isDisabled={!canDelete}
          onClick={onConfirmDelete}
        >
          {i18nDelete}
        </Button>,
        <Button key="cancel" variant="link" onClick={onCancelDelete}>
          {i18nCancel}
        </Button>,
      ]}
    >
      <Stack>
        <StackItem>
          <Trans i18nKey="deleteConfirmMessage">
            Connector <strong>{{ connectorName }}</strong> will be deleted.
          </Trans>
        </StackItem>
        <StackItem>
          <Trans i18nKey="deleteTypeNameMessage">
            Type <strong>{{connectorName}}</strong> to confirm the deletion.
          </Trans>
        </StackItem>
        <StackItem>
          <TextInput
            value={nameValue}
            type="text"
            onChange={setNameValue}
            aria-label="name input"
          />
        </StackItem>
      </Stack>
    </Modal>
  );
};