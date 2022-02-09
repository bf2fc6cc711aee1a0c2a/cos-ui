import { useErrorHandlingMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { createValidator } from '@utils/createValidator';
import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

import {
  Card,
  CardBody,
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

  const { connector, topic, errorHandler, onSetTopic, onSetErrorHandler } =
    useErrorHandlingMachine();

  const onToggle = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const onSelect = useCallback((_: any, selection: any, isPlaceholder: any) => {
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

  return (
    <StepBodyLayout
      title={t('Error handler')}
      description={t(
        'Configure error handling stop, log and dead letter queues'
      )}
    >
      <Card>
        <CardBody>
          <Form>
            <FormGroup
              label={t('Error handler')}
              fieldId="error-handler_strategy"
              className="error-handler_strategy"
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
                label="Dead Letter Topic Name"
                isRequired
                fieldId="topic"
                helperText="The name of the Kafka topic used as dead letter queue"
              >
                <TextInput value={topic} onChange={onSetTopic} id="topic" />
              </FormGroup>
            )}
          </Form>
        </CardBody>
      </Card>
    </StepBodyLayout>
  );
};
