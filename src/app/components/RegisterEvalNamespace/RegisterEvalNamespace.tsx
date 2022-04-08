import { registerEvalNamespace } from '@apis/api';
import { useCos } from '@context/CosContext';
import React, { useCallback, useEffect, useState } from 'react';
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
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import { ModalAlerts } from './ModalAlerts';

const short = require('short-uuid');

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
  const [evalNamespace, setEvalNamespace] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { connectorsApiBasePath, getToken } = useCos();
  const alert = useAlert();

  useEffect(() => {
    setEvalNamespace(`eval-namespace-${short.generate()}`);
  }, []);

  const onSuccess = useCallback((data?: ConnectorNamespace) => {
    refreshResponse();
    setIsLoading(false);
    onModalToggle();
    alert?.addAlert({
      id: 'eval-namespace-register-success',
      variant: AlertVariant.success,
      title: t(`${data?.name} registered successfully.`),
    });
  }, []);

  const onError = useCallback(
    (description: string) => {
      setIsLoading(false);
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
    setIsLoading(true);
    registerEvalNamespace({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      evalName: evalNamespace,
    })(onSuccess, onError);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('registrationEvalNamespace')}
      isOpen={isModalOpen}
      onClose={onModalToggle}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          isLoading={isLoading}
          spinnerAriaValueText={isLoading ? t('Loading') : undefined}
          isDisabled={isLoading}
          onClick={onRegister}
        >
          {t('register')}
        </Button>,
        <Button key="cancel" variant="link" isDisabled={isLoading} onClick={onModalToggle}>
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
          <Text component={TextVariants.p}>{evalNamespace}</Text>
        </FormGroup>
        <FormGroup label={t('Duration')} isRequired fieldId="name">
          <Text component={TextVariants.p}>48 hours</Text>
        </FormGroup>
      </Form>
      <Alert variant="info" isInline isPlain title={t('namespaceModelAlert')} />
    </Modal>
  );
};
