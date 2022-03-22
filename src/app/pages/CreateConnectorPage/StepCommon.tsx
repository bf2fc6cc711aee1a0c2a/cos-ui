import { useBasicMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { CreateServiceAccount } from '@app/components/CreateServiceAccont/CreateServiceAccount';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { Approach } from '@app/machines/StepBasic.machine';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Form,
  FormGroup,
  Radio,
  TextInput,
} from '@patternfly/react-core';

export const StepCommon: FC = () => {
  const { t } = useTranslation();

  const {
    name,
    approach,
    serviceAccount,
    onSetName,
    onSetApproach,
    onSetServiceAccount,
  } = useBasicMachine();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
    if (
      serviceAccount &&
      serviceAccount.clientId.length <= 0 &&
      serviceAccount.clientSecret.length <= 0
    ) {
      onSetApproach('');
    }
  };

  const onCreateSelection = () => {
    onSetServiceAccount({ clientId: '', clientSecret: '' });
    onSetApproach(Approach.AUTOMATIC);
    handleModalToggle();
  };

  const onManualCredential = () => {
    onSetApproach(Approach.MANUAL);
    onSetServiceAccount({ clientId: '', clientSecret: '' });
  };

  return (
    <>
      <StepBodyLayout
        title={t('Common')}
        description={t('basicStepDescription')}
      >
        <Grid hasGutter>
          <Form className="pf-m-9-col-on-lg">
            <FormGroup
              label="Name"
              isRequired
              fieldId="name"
              helperText="Please provide a unique name for the connector"
              className="pf-u-mb-0"
            >
              <TextInput value={name} onChange={onSetName} id="name" />
            </FormGroup>
            <FormGroup
              label="Service account"
              isRequired
              fieldId="service-account"
              className="pf-u-mb-0"
            >
              <Radio
                isChecked={approach === Approach.AUTOMATIC}
                name="service-account"
                onChange={onCreateSelection}
                label="Automatically create a service account for this connector."
                id="service-account-automatic"
                value={Approach.AUTOMATIC}
              />
              <Radio
                isChecked={approach === Approach.MANUAL}
                isDisabled={
                  approach === Approach.AUTOMATIC &&
                  serviceAccount.clientId.length > 0 &&
                  serviceAccount.clientSecret.length > 0
                }
                name="service-account"
                onChange={onManualCredential}
                label="Provide the credentials manually."
                id="service-account-user"
                value={Approach.MANUAL}
              />
              {approach === Approach.MANUAL && (
                <>
                  <FormGroup
                    label="Client ID"
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
                    label="Client Secret"
                    isRequired
                    fieldId="clientSecret"
                    className="pf-u-mb-0"
                  >
                    <TextInput
                      value={serviceAccount.clientSecret}
                      onChange={(clientSecret) =>
                        onSetServiceAccount({ ...serviceAccount, clientSecret })
                      }
                      id="clientSecret"
                    />
                  </FormGroup>
                </>
              )}
            </FormGroup>
          </Form>
        </Grid>
      </StepBodyLayout>
      <CreateServiceAccount
        isOpen={isOpen}
        handleModalToggle={handleModalToggle}
        serviceAccount={serviceAccount}
        onSetServiceAccount={onSetServiceAccount}
      />
    </>
  );
};
