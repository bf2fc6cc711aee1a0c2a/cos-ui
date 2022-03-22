import { createNewServiceAccount, UserProvidedServiceAccount } from '@apis/api';
import { useCos } from '@context/CosContext';
import { t } from 'i18next';
import React, { FormEvent, useState } from 'react';
import { FC } from 'react';

import {
  Modal,
  ModalVariant,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Title,
  Text,
  TextContent,
  TextVariants,
  InputGroup,
  InputGroupText,
  ClipboardCopy,
  Bullseye,
  Checkbox,
  Form,
  FormGroup,
  Popover,
  TextInput,
  AlertVariant,
} from '@patternfly/react-core';
import { KeyIcon, HelpIcon } from '@patternfly/react-icons';

import { useAlert } from '@rhoas/app-services-ui-shared';

type CreateServiceAccountProps = {
  isOpen: boolean;
  handleModalToggle: () => void;
  serviceAccount: UserProvidedServiceAccount;
  onSetServiceAccount: (data: UserProvidedServiceAccount) => void;
};
type Validate = 'error' | 'success' | 'default' | 'warning' | undefined;

export const CreateServiceAccount: FC<CreateServiceAccountProps> = ({
  isOpen,
  handleModalToggle,
  serviceAccount,
  onSetServiceAccount,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [sortDesc, setSortDesc] = useState<string>('');
  const [validated, setValidated] = useState<Validate>('default');

  const [loading, setLoading] = useState<boolean>(false);

  const { kafkaManagementApiBasePath, getToken } = useCos();
  const alert = useAlert();

  const handleDescChange = (
    value: string,
    _event: FormEvent<HTMLInputElement>
  ) => {
    setValidated(/^[A-Za-z0-9-]+$/.test(value) ? 'success' : 'error');
    setSortDesc(value);
  };

  const createServiceAccount = async () => {
    if (validated === 'default' && sortDesc.length === 0) {
      setValidated('error');
    } else {
      //   onSetServiceAccount({ clientId: 'test', clientSecret: 'test' });
      setLoading(true);
      let response;
      try {
        response = await createNewServiceAccount({
          accessToken: getToken,
          kafkaManagementApiBasePath: kafkaManagementApiBasePath,
          sortDesc: sortDesc,
        });

        onSetServiceAccount(response);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        alert?.addAlert({
          id: 'connectors-table-error',
          variant: AlertVariant.danger,
          title: t('something_went_wrong'),
          description: 'error',
        });
      }
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={
        serviceAccount &&
        serviceAccount.clientId.length > 0 &&
        serviceAccount.clientSecret.length > 0
          ? ''
          : t('Create a service account')
      }
      isOpen={isOpen}
      onClose={handleModalToggle}
      actions={
        serviceAccount &&
        serviceAccount.clientId.length > 0 &&
        serviceAccount.clientSecret.length > 0
          ? []
          : [
              <Button
                key="Create"
                variant="primary"
                spinnerAriaValueText={loading ? t('Loading') : undefined}
                isLoading={loading}
                isDisabled={validated === 'error' || loading}
                onClick={createServiceAccount}
              >
                {t('Create')}
              </Button>,
              <Button key="cancel" variant="link" onClick={handleModalToggle}>
                {t('Cancel')}
              </Button>,
            ]
      }
    >
      {serviceAccount &&
      serviceAccount.clientId.length > 0 &&
      serviceAccount.clientSecret.length > 0 ? (
        <EmptyState variant={EmptyStateVariant.large}>
          <EmptyStateIcon icon={KeyIcon} />
          <Title headingLevel="h4" size="lg">
            {t('Credentials successfully generated')}
          </Title>

          <TextContent className={'pf-u-mt-lg'}>
            <Text component={TextVariants.small}>
              {t(
                'Connect to the Kafka instance using this client ID and secret'
              )}
            </Text>
          </TextContent>
          <InputGroup className={'pf-u-mt-lg'}>
            <InputGroupText
              style={{ whiteSpace: 'nowrap' }}
              id="Client-id-value"
            >
              {t('Client ID')}
            </InputGroupText>
            <ClipboardCopy
              isReadOnly
              className="pf-u-w-100"
              hoverTip={t('Copy')}
              clickTip={t('Copied')}
            >
              {serviceAccount.clientId}
            </ClipboardCopy>
          </InputGroup>
          <InputGroup className={'pf-u-mt-lg'}>
            <InputGroupText
              style={{ whiteSpace: 'nowrap' }}
              id="Client-secret-value"
            >
              {t('Client secret')}
            </InputGroupText>
            <ClipboardCopy
              className="pf-u-w-100"
              isReadOnly
              hoverTip={t('Copy')}
              clickTip={t('Copied')}
            >
              {serviceAccount.clientSecret}
            </ClipboardCopy>
          </InputGroup>
          <TextContent className={'pf-u-mt-lg'}>
            <Text component={TextVariants.small}>
              {t(
                "Make a copy of the client ID and secret to store in a safe place. The client secret won't appear again after closing this screen."
              )}
            </Text>
          </TextContent>
          <Bullseye className="pf-u-mt-lg">
            <Checkbox
              id="copied"
              label={t('I have copied the client ID and secret')}
              aria-label={t('I have copied the client ID and secret')}
              onChange={() => setCopied(!copied)}
              isChecked={copied}
            />
          </Bullseye>

          <Button
            variant="primary"
            isDisabled={!copied}
            onClick={handleModalToggle}
          >
            Close
          </Button>
        </EmptyState>
      ) : (
        <Form>
          <FormGroup
            label={t('Short description')}
            labelIcon={
              <Popover
                headerContent={<div>{t('Short description')}</div>}
                bodyContent={
                  <div>
                    {t(
                      'The short description is the same as the client name in the underlying OAuth system.'
                    )}
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label={t('More info for short description')}
                  onClick={(e) => e.preventDefault()}
                  aria-describedby="short-description"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="short-description-01"
            helperText={t(
              'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).'
            )}
            helperTextInvalid={
              sortDesc.length > 0
                ? t(
                    'Must start with a letter and end with a letter or number. Valid characters include lowercase letters from a to z, numbers from 0 to 9, and hyphens ( - ).'
                  )
                : t('Required')
            }
            validated={validated}
          >
            <TextInput
              isRequired
              validated={validated}
              type="text"
              id="short-description-01"
              name="short-description-01"
              aria-describedby="short-description"
              value={sortDesc}
              onChange={handleDescChange}
            />
          </FormGroup>
        </Form>
      )}
    </Modal>
  );
};
