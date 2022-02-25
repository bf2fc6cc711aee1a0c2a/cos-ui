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

import './CommonStep.css';

export type CommonStepProp = {
  editMode: boolean;
  connectorName: string;
  clientID: string;
};
export const CommonStep: FC<CommonStepProp> = ({
  editMode,
  connectorName,
  clientID,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Title
        headingLevel="h3"
        size={TitleSizes['2xl']}
        className={'pf-u-pr-md pf-u-pb-md'}
      >
        Common
      </Title>
      <Form>
        <FormGroup
          label={t('Connector name')}
          isRequired
          fieldId="name"
          labelIcon={
            <Popover bodyContent={<p>Unique name for the connector.</p>}>
              <button
                type="button"
                aria-label="More info for name field"
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
            <TextInput value={connectorName} onChange={() => {}} id="name" />
          ) : (
            <Text component={TextVariants.p}>{connectorName}</Text>
          )}
        </FormGroup>
        <FormGroup label="Service account" fieldId="service-account">
          {true !== undefined && (
            <>
              <FormGroup label="Client ID" isRequired fieldId="clientId">
                {editMode ? (
                  <TextInput
                    value={clientID}
                    onChange={() => {}}
                    id="clientId"
                    isDisabled
                  />
                ) : (
                  <Text component={TextVariants.p}>{clientID}</Text>
                )}
              </FormGroup>
              <FormGroup
                label="Client Secret"
                isRequired
                fieldId="clientSecret"
              >
                {editMode ? (
                  <TextInput
                    value="***********************"
                    onChange={() => {}}
                    id="clientSecret"
                    isDisabled
                  />
                ) : (
                  <Text component={TextVariants.p}>***********************</Text>
                )}
              </FormGroup>
            </>
          )}
        </FormGroup>
      </Form>
    </>
  );
};
