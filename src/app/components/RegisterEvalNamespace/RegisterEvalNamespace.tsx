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
    setEvalNamespace(`preview-namespace-${short.generate()}`);
  }, []);

  const onSuccess = useCallback((name: string | undefined) => {
    refreshResponse();
    setIsLoading(false);
    onModalToggle();
    alert?.addAlert({
      id: 'preview-namespace-register-success',
      variant: AlertVariant.success,
      title: t(`namespaceReady`),
      description: t('creationSuccessAlertDescription', { name }),
    });
  }, []);

  const onError = useCallback(
    (description: string) => {
      setIsLoading(false);
      alert?.addAlert({
        id: 'preview-namespace-register-error',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
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
      title={t('createPreviewNamespace')}
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
          {t('create')}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          isDisabled={isLoading}
          onClick={onModalToggle}
        >
          {t('cancel')}
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
        <FormGroup label={t('name')} isRequired fieldId="name">
          <Text component={TextVariants.p}>{evalNamespace}</Text>
        </FormGroup>
        <FormGroup label={t('duration')} isRequired fieldId="name">
          <Text component={TextVariants.p}>48 hours</Text>
        </FormGroup>
      </Form>
      <Alert variant="info" isInline isPlain title={t('namespaceModelAlert')} />
    </Modal>
  );
};
