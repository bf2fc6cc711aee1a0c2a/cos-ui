import { useBasicMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { CreateServiceAccount } from '@app/components/CreateServiceAccount/CreateServiceAccount';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Form,
  FormGroup,
  TextInput,
  TextContent,
  Button,
} from '@patternfly/react-core';

import './StepCommon.css';

export const StepCommon: FC = () => {
  const { t } = useTranslation();

  const {
    name,
    serviceAccount,
    sACreated,
    onSetSaCreated,
    onSetName,
    onSetServiceAccount,
    duplicateMode,
  } = useBasicMachine();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    serviceAccount ?? onSetServiceAccount({ clientId: '', clientSecret: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <span className="step-common_service_account-desc">
                  {t('serviceAccountDescText')}
                </span>
              </TextContent>
              <Button
                variant="secondary"
                onClick={handleModalToggle}
                className="pf-u-mt-md"
                isDisabled={sACreated}
              >
                {t('createServiceAccount')}
              </Button>
            </FormGroup>

            {serviceAccount && (
              <>
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
                  helperText={duplicateMode ? t('credentialDuplicateFieldHelpText') : ''}
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
              </>
            )}
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
