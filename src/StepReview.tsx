import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  AlertGroup,
  Card,
  CardBody,
  Form,
  FormAlert,
  FormGroup,
  Radio,
  TextArea,
  TextInput,
} from '@patternfly/react-core';

import { useReviewMachine } from './CreateConnectorWizardContext';
import { StepBodyLayout } from './StepBodyLayout';

export function Review() {
  const { t } = useTranslation();
  const {
    name,
    serviceAccount,
    configString,
    configStringError,
    configStringWarnings,
    isSaving,
    savingError,
    onSetName,
    onSetServiceAccount,
    onUpdateConfiguration,
  } = useReviewMachine();
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
            {savingError && (
              <FormAlert>
                <Alert
                  variant="danger"
                  title={savingError}
                  aria-live="polite"
                  isInline
                />
              </FormAlert>
            )}
            <FormGroup
              label="Name"
              isRequired
              fieldId="name"
              helperText="Please provide a unique name for the connector"
            >
              <TextInput
                isDisabled={isSaving}
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
                isDisabled={isSaving}
                isChecked={serviceAccount === undefined}
                name="service-account"
                onChange={() => onSetServiceAccount(undefined)}
                label="Automatically create a Service Account for this connector"
                id="service-account-automatic"
                value="automatic"
              />
              <Radio
                isDisabled={isSaving}
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
                      isDisabled={isSaving}
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
                      isDisabled={isSaving}
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
            <FormGroup
              label="Configuration"
              isRequired
              fieldId="configuration"
              helperText="Please review the configuration data."
              helperTextInvalid={configStringError}
              validated={
                configStringError !== undefined
                  ? 'error'
                  : configStringWarnings !== undefined
                  ? 'warning'
                  : 'default'
              }
            >
              <TextArea
                value={configString}
                onChange={onUpdateConfiguration}
                autoResize={true}
              />
              <AlertGroup>
                {configStringWarnings?.map((w, idx) => (
                  <Alert key={idx} title={w} variant="warning" isInline />
                ))}
              </AlertGroup>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
    </StepBodyLayout>
  );
}
