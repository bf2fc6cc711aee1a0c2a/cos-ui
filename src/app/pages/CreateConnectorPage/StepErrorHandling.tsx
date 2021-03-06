import { useErrorHandlingMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { createValidator } from '@utils/createValidator';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

import {
  Grid,
  Form,
  FormGroup,
  TextInput,
  SelectOption,
  Select,
  SelectVariant,
} from '@patternfly/react-core';

import { ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

export const StepErrorHandling: FunctionComponent = () => {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const { t } = useTranslation();

  const {
    connector,
    topic,
    errorHandler,
    onSetTopic,
    onSetErrorHandler,
    duplicateMode,
  } = useErrorHandlingMachine();

  if (duplicateMode && typeof errorHandler === 'object') {
    const unkownKey = Object.keys(errorHandler);
    onSetErrorHandler(unkownKey[0]);
    errorHandler[unkownKey[0]] === undefined
      ? onSetTopic('')
      : onSetTopic(errorHandler[unkownKey[0]].topic);
  }

  const onToggle = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const onSelect = useCallback((_, selection: any, isPlaceholder: any) => {
    if (isPlaceholder) {
      clearSelection();
    } else {
      setOpen(false);
      onSetTopic('');
      onSetErrorHandler(selection);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setOpen(false);
  }, []);

  const schemaValidator = createValidator(
    (connector as ConnectorTypeAllOf).schema!
  );
  const bridge = new JSONSchemaBridge(
    (connector as ConnectorTypeAllOf).schema!,
    schemaValidator
  );
  const { error_handler } = bridge.schema?.properties;
  const oneOf = error_handler['oneOf'];

  const dropdownItems = oneOf.map((item: any) => {
    const keys = Object.keys(item.properties);
    return <SelectOption key={keys[0]} value={keys[0]} />;
  });

  useEffect(() => {
    errorHandler ?? onSetErrorHandler(Object.keys(error_handler['default'])[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepBodyLayout
      title={t('errorHandling')}
      description={t('errorHandlingStepDescription')}
    >
      <Grid hasGutter>
        <Form className="pf-m-9-col-on-lg">
          <FormGroup
            label={t('errorHandlingMethod')}
            fieldId="error-handler_strategy"
            className="error-handler_strategy pf-u-mb-0"
          >
            <Select
              variant={SelectVariant.single}
              aria-label="Select Error handler"
              onToggle={onToggle}
              onSelect={onSelect}
              selections={errorHandler}
              isOpen={isOpen}
              placeholderText="Select type"
            >
              {dropdownItems}
            </Select>
          </FormGroup>
          {errorHandler === 'dead_letter_queue' && (
            <FormGroup
              label={t('deadLetterTopicName')}
              isRequired
              fieldId="topic"
              helperText={t('deadLetterTopicHelper')}
            >
              <TextInput value={topic} onChange={onSetTopic} id="topic" />
            </FormGroup>
          )}
        </Form>
      </Grid>
    </StepBodyLayout>
  );
};
