import { createServiceAccount, UserProvidedServiceAccount } from '@apis/api';
import { useCos } from '@context/CosContext';
import { t } from 'i18next';
import React, { FormEvent, useCallback, useState } from 'react';
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

import { ServiceAccount, useAlert } from '@rhoas/app-services-ui-shared';

type CreateServiceAccountProps = {
  isOpen: boolean;
  sACreated: boolean;
  handleModalToggle: () => void;
  serviceAccount: UserProvidedServiceAccount;
  onSetServiceAccount: (data: UserProvidedServiceAccount) => void;
  onSetSaCreated: (val: boolean) => void;
};
type Validate = 'error' | 'success' | 'default' | 'warning' | undefined;

export const CreateServiceAccount: FC<CreateServiceAccountProps> = ({
  isOpen,
  sACreated,
  handleModalToggle,
  serviceAccount,
  onSetServiceAccount,
  onSetSaCreated,
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
    setValidated(
      /^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(value) ? 'success' : 'error'
    );
    setSortDesc(value);
  };

  const onSuccess = useCallback(
    (data?: ServiceAccount) => {
      onSetSaCreated(true);
      setLoading(false);
      const SA = data
        ? { clientId: data.client_id!, clientSecret: data.client_secret! }
        : { clientId: '', clientSecret: '' };
      onSetServiceAccount(SA);
    },
    [onSetSaCreated, setLoading, onSetServiceAccount]
  );

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connectors-table-error',
        variant: AlertVariant.danger,
        title: t('something_went_wrong'),
        description,
      });
      setLoading(false);
    },
    [alert]
  );

  const createSA = async () => {
    if (validated === 'default' && sortDesc.length === 0) {
      setValidated('error');
    } else {
      createServiceAccount({
        accessToken: getToken,
        kafkaManagementApiBasePath: kafkaManagementApiBasePath,
        sortDesc: sortDesc,
      })(onSuccess, onError);
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={sACreated ? '' : t('create_service_account')}
      isOpen={isOpen}
      onClose={handleModalToggle}
      actions={
        sACreated
          ? []
          : [
              <Button
                key="Create"
                variant="primary"
                spinnerAriaValueText={loading ? t('Loading') : undefined}
                isLoading={loading}
                isDisabled={validated === 'error' || loading}
                onClick={createSA}
              >
                {t('Create')}
              </Button>,
              <Button key="cancel" variant="link" onClick={handleModalToggle}>
                {t('Cancel')}
              </Button>,
            ]
      }
    >
      {sACreated ? (
        <EmptyState variant={EmptyStateVariant.large}>
          <EmptyStateIcon icon={KeyIcon} />
          <Title headingLevel="h4" size="lg">
            {t('credentials-generated')}
          </Title>

          <TextContent className={'pf-u-mt-lg'}>
            <Text component={TextVariants.small}>
              {t('connect-kafka-with-sa')}
            </Text>
          </TextContent>
          <InputGroup className={'pf-u-mt-lg'}>
            <InputGroupText
              style={{ whiteSpace: 'nowrap' }}
              id="Client-id-value"
            >
              {t('client-id')}
            </InputGroupText>
            <ClipboardCopy
              isReadOnly
              className="pf-u-w-100"
              hoverTip={t('copy')}
              clickTip={t('copied')}
            >
              {serviceAccount.clientId}
            </ClipboardCopy>
          </InputGroup>
          <InputGroup className={'pf-u-mt-lg'}>
            <InputGroupText
              style={{ whiteSpace: 'nowrap' }}
              id="Client-secret-value"
            >
              {t('client-secret')}
            </InputGroupText>
            <ClipboardCopy
              className="pf-u-w-100"
              isReadOnly
              hoverTip={t('copy')}
              clickTip={t('copied')}
            >
              {serviceAccount.clientSecret}
            </ClipboardCopy>
          </InputGroup>
          <TextContent className={'pf-u-mt-lg'}>
            <Text component={TextVariants.small}>
              {t('service-account-alert-msg')}
            </Text>
          </TextContent>
          <Bullseye className="pf-u-mt-lg">
            <Checkbox
              id="copied"
              label={t('copied-clientid-secret')}
              aria-label={t('copied-clientid-secret')}
              onChange={() => setCopied(!copied)}
              isChecked={copied}
            />
          </Bullseye>

          <Button
            variant="primary"
            isDisabled={!copied}
            onClick={handleModalToggle}
          >
            {t('close')}
          </Button>
        </EmptyState>
      ) : (
        <Form>
          <FormGroup
            label={t('short-description')}
            labelIcon={
              <Popover
                headerContent={<div>{t('short-description')}</div>}
                bodyContent={<div>{t('short-description-help-text')}</div>}
              >
                <button
                  type="button"
                  aria-label={t('short-description-tooltip')}
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
            helperText={t('short-description-example-text')}
            helperTextInvalid={
              sortDesc.length > 0
                ? t('short-description-example-text')
                : t('required')
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
