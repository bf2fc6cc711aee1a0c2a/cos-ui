import { useBasicMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { CreateServiceAccount } from '@app/components/CreateServiceAccount/CreateServiceAccount';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Grid,
  Form,
  FormGroup,
  Text,
  TextInput,
  TextVariants,
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
      <StepBodyLayout
        title={t('Common')}
        description={t('basicStepDescription')}
      >
        <Grid hasGutter>
          <Form className="pf-m-9-col-on-lg">
            <FormGroup
              label={t('Name')}
              isRequired
              fieldId="name"
              helperText="Please provide a unique name for the connector"
              className="pf-u-mb-0"
            >
              <TextInput value={name} onChange={onSetName} id="name" />
            </FormGroup>
            <FormGroup
              label={t('Service account')}
              fieldId="service-account"
              className="pf-u-mb-0"
            >
              <TextContent>
                <Text component={TextVariants.small}>
                  {t(
                    'A service account enables the Connector instance to authenticate with the Kafka instance. Provide credentials of an existing service account that has access to the Kafka instance or create a new service account.'
                  )}
                </Text>
              </TextContent>
              <Button
                variant="link"
                onClick={handleModalToggle}
                className="step-common_create_sa_button"
                isDisabled={sACreated}
              >
                {t('Create service account')}
              </Button>
              {serviceAccount && (
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
        onSetSaCreated={onSetSaCreated}
        sACreated={sACreated}
      />
    </>
  );
};
