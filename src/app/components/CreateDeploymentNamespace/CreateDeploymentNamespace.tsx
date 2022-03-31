import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal,
  Button,
  ModalVariant,
  Form,
  TextInput,
  FormGroup,
  Switch,
  Radio,
} from '@patternfly/react-core';

import { ClusterTiles } from './ClusterTiles';
import { ModalAlerts } from './ModalAlerts';

type CreateDeploymentNamespaceProps = {
  isModalOpen: boolean;
  onModalToggle: () => void;
};

export const CreateDeploymentNamespace: React.FC<CreateDeploymentNamespaceProps> =
  ({ isModalOpen, onModalToggle }) => {
    //   const [isModalOpen, setIsModalOpen] = React.useState<boolean>(true);
    const [namespace, setNamespace] = React.useState<string>('');
    const [isEvalutionChecked, setIsEvalutionChecked] =
      React.useState<boolean>(true);
    const [tenant, _] = React.useState<boolean>(true);

    const { t } = useTranslation();
    const onCreateNameSpace = () => {
      console.log('namespace creating');
    };
    const onEvalutionToggle = () => {
      console.log('onEvalutionToggle');
      setIsEvalutionChecked((prev) => !prev);
    };
    return (
      <Modal
        variant={ModalVariant.medium}
        title={t('Create deployment namespace')}
        isOpen={isModalOpen}
        onClose={onModalToggle}
        actions={[
          <Button key="confirm" variant="primary" onClick={onCreateNameSpace}>
            {t('createNamespace')}
          </Button>,
          <Button key="cancel" variant="link" onClick={onModalToggle}>
            Cancel
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
          <Switch
            id="simple-switch"
            label="Evaluation"
            labelOff="Evaluation"
            isChecked={isEvalutionChecked}
            onChange={onEvalutionToggle}
          />
          <ClusterTiles />
          <Radio
            isChecked={tenant}
            name="tenant"
            id="tenant"
            // onChange={handleChange}
            label="Tenant"
            value="check1"
          />
        </Form>
      </Modal>
    );
  };
