import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Form,
  FormGroup,
  TextInput,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

export type CommonStepProp = {
  connectorName: string;
};
export const CommonStep: FC<CommonStepProp> = ({ connectorName }) => {
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
          label={t('Name')}
          isRequired
          fieldId="name"
          helperText="Please provide a unique name for the connector"
        >
          <TextInput value={connectorName} onChange={() => {}} id="name" />
        </FormGroup>
        {/* <FormGroup label="Service account" isRequired fieldId="service-account">
          {true !== undefined && (
            <> */}
        <FormGroup label="Client ID" isRequired fieldId="clientId">
          <TextInput value="" onChange={() => {}} id="clientId" />
        </FormGroup>
        <FormGroup label="Client Secret" isRequired fieldId="clientSecret">
          <TextInput value="" onChange={() => {}} id="clientSecret" />
        </FormGroup>
        {/* </>
          )}
        </FormGroup> */}
      </Form>
    </>
  );
};
