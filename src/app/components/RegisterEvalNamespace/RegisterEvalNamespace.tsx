import { registerEvalNamespace } from '@apis/api';
import { useCos } from '@context/CosContext';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal,
  Button,
  ModalVariant,
  Form,
  Text,
  FormGroup,
  TextVariants,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';

import { useAlert } from '@rhoas/app-services-ui-shared';

import { ModalAlerts } from './ModalAlerts';

type RegisterEvalNamespaceProps = {
  isModalOpen: boolean;
  onModalToggle: () => void;
  refreshResponse: () => void;
};

export const RegisterEvalNamespace: React.FC<RegisterEvalNamespaceProps> = ({
  isModalOpen,
  onModalToggle,
  refreshResponse,
}) => {
  const { t } = useTranslation();

  const { connectorsApiBasePath, getToken } = useCos();
  const alert = useAlert();

  const onSuccess = useCallback((data?: any) => {
    console.log(data);
    refreshResponse();
    onModalToggle();
  }, []);

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'eval-namespace-register-error',
        variant: AlertVariant.danger,
        title: t('something_went_wrong'),
        description,
      });
    },
    [alert, t]
  );

  const onRegister = () => {
    registerEvalNamespace({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      evalName: 'default-eval-namespace',
    })(onSuccess, onError);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('registrationEvalNamespace')}
      isOpen={isModalOpen}
      onClose={onModalToggle}
      actions={[
        <Button key="confirm" variant="primary" onClick={onRegister}>
          {t('register')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onModalToggle}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <ModalAlerts />
      <Text
        component={TextVariants.h3}
        className="pf-c-title pf-m-lg pf-u-pt-lg"
      >
        {t('namespaceInformation')}
      </Text>
      <Form className="pf-u-mt-lg pf-u-mb-lg">
        <FormGroup label={t('Name')} isRequired fieldId="name">
          <Text component={TextVariants.p}>default-eval-namespace</Text>
        </FormGroup>
        <FormGroup label={t('Duration')} isRequired fieldId="name">
          <Text component={TextVariants.p}>48 hours</Text>
        </FormGroup>
      </Form>
      <Alert variant="info" isInline isPlain title={t('namespaceModelAlert')} />
    </Modal>
  );
};
