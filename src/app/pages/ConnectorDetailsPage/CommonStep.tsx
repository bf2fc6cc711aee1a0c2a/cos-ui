import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ClipboardCopy,
  Form,
  FormGroup,
  Popover,
  Text,
  TextInput,
  TextVariants,
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

  const onNameChange = (val: any) => {
    onUpdateConfiguration('common', { ...configuration, name: val });
    val === '' ? changeIsValid(false) : changeIsValid(true);
  };

  return (
    <StepBodyLayout title={t('core')} description={t('basicStepDescription')}>
      <Form>
        <FormGroup
          label={t('connectorName')}
          isRequired
          fieldId="connector-name"
          labelIcon={
            <Popover bodyContent={<p>{t('connectorNamePopoverBody')}</p>}>
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
              onChange={(val) => onNameChange(val)}
              id="connector-name"
            />
          ) : (
            <Text component={TextVariants.p}>{configuration.name}</Text>
          )}
        </FormGroup>
        <FormGroup label={t('serviceAccount')} fieldId="service-account">
          {true !== undefined && (
            <>
              <FormGroup label={t('clientId')} isRequired fieldId="clientId">
                <ClipboardCopy isReadOnly hoverTip="copy" clickTip="Copied">
                  {configuration?.service_account?.client_id}
                </ClipboardCopy>
              </FormGroup>
            </>
          )}
        </FormGroup>
      </Form>
    </StepBodyLayout>
  );
};
