import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC } from 'react';

import {
  Button,
  ClipboardCopy,
  Form,
  FormGroup,
  InputGroup,
  Popover,
  Text,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  HelpIcon,
} from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type CommonStepProp = {
  editMode: boolean;
  configuration: any;
  changeIsValid: (isValid: boolean) => void;
  onUpdateConfiguration: (type: string, update: any) => void;
};

export const CommonStep: FC<CommonStepProp> = ({
  editMode,
  configuration,
  changeIsValid,
  onUpdateConfiguration,
}) => {
  const { t } = useTranslation();

  const [passwordHidden, setPasswordHidden] = React.useState<boolean>(true);
  const configurationCopy = Object.assign({}, configuration);
  const { name: connectorName, service_account } = configurationCopy;

  const onNameChange = (val: any) => {
    onUpdateConfiguration('common', { ...configuration, name: val });
    val === '' || service_account.client_id === ''
      ? changeIsValid(false)
      : changeIsValid(true);
  };

  const onSAIDChange = (clientId: string) => {
    onUpdateConfiguration('common', {
      ...configurationCopy,
      service_account: {
        client_id: clientId,
        client_secret: service_account.client_secret,
      },
    });

    if (clientId === '' || connectorName === '') {
      changeIsValid(false);
    } else {
      changeIsValid(true);
    }
  };

  const onSASecretChange = (secret: string) => {
    onUpdateConfiguration('common', {
      ...configurationCopy,
      service_account: {
        client_id: service_account.client_id,
        client_secret: secret,
      },
    });
  };

  return (
    <StepBodyLayout title={t('core')} description={t('basicStepDescription')}>
      <Form>
        <FormGroup
          label={t('connectorName')}
          isRequired
          validated={connectorName ? 'default' : 'error'}
          helperTextInvalid={t('connectorNameIsRequired')}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          fieldId="connector-name"
          labelIcon={
            <Popover bodyContent={<p>{t('connectorNamePopoverBody')}</p>}>
              <button
                type="button"
                aria-label="More info for name field."
                onClick={(e) => e.preventDefault()}
                aria-describedby="connector-name-helper"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
        >
          {editMode ? (
            <TextInput
              value={configuration.name}
              onChange={(val) => onNameChange(val)}
              id="connector-name"
            />
          ) : (
            <Text component={TextVariants.p}>{configuration.name}</Text>
          )}
        </FormGroup>
        <FormGroup
          label={t('serviceAccount')}
          isRequired
          fieldId="service-account"
          labelIcon={
            <Popover
              bodyContent={
                <>
                  <p>{t('serviceAccountDesc_intro')}</p>
                  <p>{t('serviceAccountDesc_credentials')}</p>
                  <p>{t('serviceAccountDesc_accessKafkaInstance')}</p>
                </>
              }
            >
              <button
                type="button"
                aria-label="More info for name field."
                onClick={(e) => e.preventDefault()}
                aria-describedby="service-account-helper"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
        >
          <Text component={TextVariants.p}>
            {t('serviceAccountEditDescription')}
          </Text>
        </FormGroup>
        <FormGroup
          label={t('clientId')}
          isRequired
          validated={service_account?.client_id ? 'default' : 'error'}
          helperTextInvalid={t('clientIdRequired')}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          fieldId="clientId"
        >
          {editMode ? (
            <TextInput
              value={service_account?.client_id}
              validated={service_account?.client_id ? 'default' : 'error'}
              onChange={onSAIDChange}
              id="connector-sa-id"
            />
          ) : (
            <ClipboardCopy isReadOnly hoverTip="copy" clickTip="Copied">
              {service_account?.client_id}
            </ClipboardCopy>
          )}
        </FormGroup>

        {editMode ? (
          <FormGroup
            label={t('clientSecret')}
            helperText={t('credentialEditFieldHelpText')}
            fieldId="clientSecret"
          >
            <InputGroup>
              <TextInput
                value={service_account?.client_secret}
                type={passwordHidden ? 'password' : 'text'}
                onChange={onSASecretChange}
                id="connector-sa-secret"
              />

              <Button
                variant="control"
                onClick={() => setPasswordHidden(!passwordHidden)}
                aria-label={passwordHidden ? 'Show password' : 'Hide password'}
              >
                {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
            </InputGroup>
          </FormGroup>
        ) : (
          <FormGroup label={t('clientSecret')} fieldId="clientSecret">
            <Text component={TextVariants.p}>{t('secretValue')}</Text>
          </FormGroup>
        )}
      </Form>
    </StepBodyLayout>
  );
};
