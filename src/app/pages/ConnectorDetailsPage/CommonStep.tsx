import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Form,
  FormGroup,
  Popover,
  Text,
  TextInput,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

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

  const onNameChange = (val: any ) =>{
    onUpdateConfiguration('common', { ...configuration, name: val });
    val === '' ? changeIsValid(false) : changeIsValid(true);
  }

  return (
    <>
      <Title
        headingLevel="h3"
        size={TitleSizes['2xl']}
        className={'pf-u-pr-md pf-u-pb-md'}
      >
        {t('Common')}
      </Title>
      <Form>
        <FormGroup
          label={t('Connector name')}
          isRequired
          fieldId="connector-name"
          labelIcon={
            <Popover bodyContent={<p>{t('Unique name for the connector.')}</p>}>
              <button
                type="button"
                aria-label="More info for name field."
                onClick={(e) => e.preventDefault()}
                aria-describedby="simple-form-name-01"
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
              onChange={(val) =>
                onNameChange(val)
              }
              id="connector-name"
            />
          ) : (
            <Text component={TextVariants.p}>{configuration.name}</Text>
          )}
        </FormGroup>
        <FormGroup label={t('Service account')} fieldId="service-account">
          {true !== undefined && (
            <>
              <FormGroup label={t('Client ID')} isRequired fieldId="clientId">
                {editMode ? (
                  <TextInput
                    value={configuration?.service_account?.client_id}
                    // onChange={()=>{}}
                    id="clientId"
                    isDisabled
                  />
                ) : (
                  <Text component={TextVariants.p}>
                    {configuration?.service_account?.client_id}
                  </Text>
                )}
              </FormGroup>
              <FormGroup
                label={t('Client Secret')}
                isRequired
                fieldId="clientSecret"
              >
                {editMode ? (
                  <TextInput
                    value="***********************"
                    // onChange={() => {}}
                    id="clientSecret"
                    isDisabled
                  />
                ) : (
                  <Text component={TextVariants.p}>
                    ***********************
                  </Text>
                )}
              </FormGroup>
            </>
          )}
        </FormGroup>
      </Form>
    </>
  );
};
