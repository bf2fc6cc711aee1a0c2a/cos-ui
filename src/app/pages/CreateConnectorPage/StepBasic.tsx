import { useBasicMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Form,
  FormGroup,
  Radio,
  TextInput,
} from '@patternfly/react-core';

export function Basic() {
  const { t } = useTranslation();
  const { name, serviceAccount, onSetName, onSetServiceAccount } =
    useBasicMachine();

  return (
    <StepBodyLayout title={t('Common')} description={t('basicStepDescription')}>
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
              isChecked={serviceAccount === undefined}
              name="service-account"
              onChange={() => onSetServiceAccount(undefined)}
              label="Automatically create a service account for this connector."
              id="service-account-automatic"
              value="automatic"
            />
            <Radio
              isChecked={serviceAccount !== undefined}
              name="service-account"
              onChange={() =>
                onSetServiceAccount({ clientId: '', clientSecret: '' })
              }
              label="Provide the credentials manually."
              id="service-account-user"
              value="user"
            />
            {serviceAccount !== undefined && (
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
  );
}
