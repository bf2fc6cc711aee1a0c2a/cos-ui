import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal,
  Button,
  ModalVariant,
  Form,
  TextInput,
  FormGroup,
} from '@patternfly/react-core';

import { ModalAlerts } from './ModalAlerts';

type RegisterEvalNamespaceProps = {
  isModalOpen: boolean;
  onModalToggle: () => void;
};

export const RegisterEvalNamespace: React.FC<RegisterEvalNamespaceProps> = ({
  isModalOpen,
  onModalToggle,
}) => {
  const [namespace, setNamespace] = React.useState<string>('');

  const { t } = useTranslation();
  // @TODO: WIP
  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('registrationEvalNamespace')}
      isOpen={isModalOpen}
      onClose={onModalToggle}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => {}}>
          {t('register')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => {}}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <ModalAlerts />
      <Form>
        <FormGroup label="Name" isRequired fieldId="name">
          <TextInput
            value={namespace}
            type="text"
            onChange={(value) => {
              setNamespace(value);
            }}
            aria-label="deployment namespace"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};
