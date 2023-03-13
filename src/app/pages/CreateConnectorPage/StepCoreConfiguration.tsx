import { UserProvidedServiceAccount } from '@apis/api';
import { useCoreConfigurationMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { CreateServiceAccount } from '@app/components/CreateServiceAccount/CreateServiceAccount';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC, useState } from 'react';

import {
  Grid,
  Form,
  FormGroup,
  Text,
  TextInput,
  TextContent,
  Button,
  TextVariants,
  ButtonVariant,
  Checkbox,
} from '@patternfly/react-core';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import './StepCoreConfiguration.css';

export const StepCoreConfiguration: FC = () => {
  const {
    name,
    serviceAccount,
    sACreated,
    sAConfiguredConfirmed,
    onSetSaCreated,
    onSetSaConfiguredConfirmed,
    onSetName,
    onSetServiceAccount,
    duplicateMode,
  } = useCoreConfigurationMachine();
  return (
    <StepCoreConfigurationInner
      duplicateMode={duplicateMode!}
      name={name}
      serviceAccount={serviceAccount}
      sACreated={sACreated}
      sAConfiguredConfirmed={sAConfiguredConfirmed}
      onSetName={onSetName}
      onSetSaCreated={onSetSaCreated}
      onSetSaConfiguredConfirmed={onSetSaConfiguredConfirmed}
      onSetServiceAccount={onSetServiceAccount}
    />
  );
};

export type StepCoreConfigurationInnerProps = {
  duplicateMode: boolean;
  name: string;
  serviceAccount?: UserProvidedServiceAccount;
  sACreated?: boolean;
  sAConfiguredConfirmed?: boolean;
  onSetName: (name: string) => void;
  onSetSaCreated: (sACreated: boolean) => void;
  onSetSaConfiguredConfirmed: (sAConfiguredConfirmed: boolean) => void;
  onSetServiceAccount: (serviceAccount: UserProvidedServiceAccount) => void;
};

export const StepCoreConfigurationInner: FC<
  StepCoreConfigurationInnerProps
> = ({
  duplicateMode,
  name = '',
  serviceAccount = { clientId: '', clientSecret: '' },
  sACreated = false,
  sAConfiguredConfirmed = false,
  onSetName,
  onSetSaCreated,
  onSetSaConfiguredConfirmed,
  onSetServiceAccount,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <StepBodyLayout title={t('core')} description={t('basicStepDescription')}>
        <Grid hasGutter>
          <Form className="pf-m-9-col-on-lg">
            <FormGroup
              label={t('connectorsInstanceName')}
              isRequired
              fieldId="name"
              helperText={t('connectorsInstanceHelper')}
              className="pf-u-mb-0"
            >
              <TextInput value={name} onChange={onSetName} id="name" />
            </FormGroup>
            <FormGroup
              label={t('serviceAccount')}
              fieldId="service-account"
              className="pf-u-mb-0"
            >
              <TextContent>
                <Text
                  component={TextVariants.small}
                  className={'step-common_service_account-desc'}
                >
                  {t('serviceAccountDesc_intro')}
                </Text>
                <Text
                  component={TextVariants.small}
                  className={'step-common_service_account-desc'}
                >
                  {t('serviceAccountDesc_credentials')}
                </Text>
                <Text
                  component={TextVariants.small}
                  className={'step-common_service_account-desc'}
                >
                  {t('serviceAccountDesc_accessKafkaInstance')}
                </Text>
              </TextContent>
              <Button
                variant="secondary"
                onClick={handleModalToggle}
                className="pf-u-mt-md"
                isDisabled={sACreated}
                ouiaId={'button-create-service-acct'}
              >
                {t('createServiceAccount')}
              </Button>
            </FormGroup>

            <FormGroup
              label={t('clientId')}
              isRequired
              fieldId="clientId"
              className="pf-u-mb-0"
            >
              <TextInput
                value={serviceAccount.clientId}
                onChange={(clientId) =>
                  onSetServiceAccount({ ...serviceAccount, clientId })
                }
                id="clientId"
              />
            </FormGroup>
            <FormGroup
              label={t('clientSecret')}
              isRequired
              fieldId="clientSecret"
              className="pf-u-mb-0"
              helperText={
                duplicateMode ? t('credentialDuplicateFieldHelpText') : ''
              }
            >
              <TextInput
                value={serviceAccount.clientSecret}
                type={'password'}
                onChange={(clientSecret) =>
                  onSetServiceAccount({ ...serviceAccount, clientSecret })
                }
                id="clientSecret"
              />
            </FormGroup>
            <FormGroup fieldId="saConfiguredConfirmation">
              <Checkbox
                label={
                  <Trans
                    i18nKey={'serviceAccountInstructionsConfirmationLabel'}
                  >
                    I have set the Kafka instance to allow access for this
                    service account.
                  </Trans>
                }
                description={
                  <Trans
                    i18nKey={
                      'serviceAccountInstructionsConfirmationDescription'
                    }
                  >
                    I configured the service account as described in{' '}
                    <Button
                      variant={ButtonVariant.link}
                      isSmall
                      isInline
                      component={'a'}
                      href={t('setPermissionsServiceAccountForKafkaGuideLink')}
                      target={'_blank'}
                      ouiaId={'description-service-account-guide-link'}
                    >
                      Setting permissions for a service account in a Kafka
                      instance in OpenShift Streams for Apache Kafka.
                    </Button>
                  </Trans>
                }
                id="saConfiguredConfirmation"
                name="saConfiguredConfirmation"
                ouiaId={'sa-configured-confirmation-checkbox'}
                data-testid={'sa-configured-confirmation-checkbox'}
                aria-label="service account configured confirmation"
                isRequired={true}
                isChecked={sAConfiguredConfirmed}
                onChange={() =>
                  onSetSaConfiguredConfirmed(!sAConfiguredConfirmed)
                }
              />
            </FormGroup>
          </Form>
        </Grid>
      </StepBodyLayout>
      <CreateServiceAccount
        isOpen={isOpen}
        handleModalToggle={handleModalToggle}
        serviceAccount={serviceAccount!}
        onSetServiceAccount={onSetServiceAccount}
        onSetSaCreated={onSetSaCreated}
        sACreated={sACreated}
      />
    </>
  );
};
