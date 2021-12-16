import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Radio,
  TextInput
} from '@patternfly/react-core';

import { useBasicMachine } from './CreateConnectorWizardContext';
import { StepBodyLayout } from './StepBodyLayout';

export function Basic() {
  const { t } = useTranslation();

  const {
    name,
    serviceAccount,
    onSetName,
    onSetServiceAccount,
  } = useBasicMachine();

  return (
    <StepBodyLayout
      title={t('Review')}
      description={
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit error adipisci, ducimus ipsum dicta quo beatae ratione aliquid nostrum animi eos, doloremque laborum quasi sed, vitae ipsa illo delectus! Quos'
      }
    >
      <Card>
        <CardBody>
          <Form>
              <FormGroup
                label="Name"
                isRequired
                fieldId="name"
                helperText="Please provide a unique name for the connector"
              >
                <TextInput
                  value={name}
                  onChange={onSetName}
                  id="name"
                />
              </FormGroup>
              <FormGroup
                label="Service Account"
                isRequired
                fieldId="service-account"
              >
                <Radio
                  isChecked={serviceAccount === undefined}
                  name="service-account"
                  onChange={() => onSetServiceAccount(undefined)}
                  label="Automatically create a Service Account for this connector"
                  id="service-account-automatic"
                  value="automatic"
                />
                <Radio
                  isChecked={serviceAccount !== undefined}
                  name="service-account"
                  onChange={() =>
                    onSetServiceAccount({ clientId: '', clientSecret: '' })
                  }
                  label="Provide the credentials manually"
                  id="service-account-user"
                  value="user"
                />
                {serviceAccount !== undefined && (
                  <>
                    <FormGroup label="Client ID" isRequired fieldId="clientId">
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
        </CardBody>
      </Card>
    </StepBodyLayout>
  );
}