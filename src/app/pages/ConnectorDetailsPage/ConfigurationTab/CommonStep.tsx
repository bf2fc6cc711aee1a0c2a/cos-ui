import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

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

  const [isSAUpdate, setIsSAUpdate] = React.useState(false);
  const [passwordHidden, setPasswordHidden] = React.useState<boolean>(true);

  const onNameChange = (val: any) => {
    onUpdateConfiguration('common', { ...configuration, name: val });
    val === '' ? changeIsValid(false) : changeIsValid(true);
  };

  const onSAChange = (
    val: string,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.id === 'connector-sa-id') {
      onUpdateConfiguration('common', {
        ...configuration,
        service_account: {
          client_id: val,
          client_secret: configuration.service_account.client_secret,
        },
      });
      !isSAUpdate &&
        setIsSAUpdate((prev) => {
          if (!prev) {
            changeIsValid(false);
          }
          return true;
        });
    } else {
      onUpdateConfiguration('common', {
        ...configuration,
        service_account: {
          client_id: configuration.service_account.client_id,
          client_secret: val,
        },
      });
    }

    val === '' ? changeIsValid(false) : changeIsValid(true);
  };

  return (
    <StepBodyLayout title={t('core')} description={t('basicStepDescription')}>
      <Form>
        <FormGroup
          label={t('connectorName')}
          isRequired
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
            <Popover bodyContent={<p>{t('serviceAccountDescText')}</p>}>
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
          validated={
            configuration?.service_account?.client_id ? 'default' : 'error'
          }
          helperTextInvalid={t('clientIdRequired')}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          fieldId="clientId"
        >
          {editMode ? (
            <TextInput
              value={configuration?.service_account?.client_id}
              validated={
                configuration?.service_account?.client_id ? 'default' : 'error'
              }
              onChange={onSAChange}
              id="connector-sa-id"
            />
          ) : (
            <ClipboardCopy isReadOnly hoverTip="copy" clickTip="Copied">
              {configuration?.service_account?.client_id}
            </ClipboardCopy>
          )}
        </FormGroup>
        {isSAUpdate && editMode ? (
          <FormGroup
            label={t('clientSecret')}
            isRequired
            validated={
              configuration?.service_account?.client_secret
                ? 'default'
                : 'error'
            }
            helperTextInvalid={t('clientSecretRequired')}
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            fieldId="clientSecret"
          >
            <InputGroup>
              <TextInput
                value={configuration?.service_account?.client_secret}
                type={passwordHidden ? 'password' : 'text'}
                validated={
                  configuration?.service_account?.client_secret
                    ? 'default'
                    : 'error'
                }
                onChange={onSAChange}
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
          <></>
        )}
      </Form>
    </StepBodyLayout>
  );
};
