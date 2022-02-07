import { useErrorHandlingMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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

export function StepErrorHandling() {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<string>('');
  const { t } = useTranslation();
  const { topic, errorHandler, onSetTopic, onSetErrorHandler } =
    useErrorHandlingMachine();

  const onToggle = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const onSelect = useCallback((_: any, selection: any, isPlaceholder: any) => {
    if (isPlaceholder) {
      clearSelection();
    } else {
      setOpen(false);
      setSelected(selection);
      onSetErrorHandler(selection);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setOpen(false);
    setSelected('');
  }, []);

  const dropdownItems = ['dead_letter_queue', 'log', 'stop'].map(
    (item: string) => {
      return <SelectOption key={item} value={item} />;
    }
  );

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
            {selected === 'dead_letter_queue' && (
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
}
