import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { toHtmlSafeId } from '@utils/shared';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Form,
  FormGroup,
  Popover,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Text,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { Connector } from '@rhoas/connector-management-sdk';

// error_handler does not yet seem to be available in the SDK
export type LogErrorHandler = {
  log: object;
};

export type StopErrorHandler = {
  stop: object;
};

export type DLQErrorHandlerTopic = {
  topic: string;
};

export type DLQErrorHandler = {
  dead_letter_queue: DLQErrorHandlerTopic;
};

export type ErrorHandler = LogErrorHandler | StopErrorHandler | DLQErrorHandler;

// Create an extended connector type that includes this missing attribute
export type ConnectorWithErrorHandler = Connector & {
  error_handler: ErrorHandler;
  [key: string]: any; // workaround to allow indexing by key for now
};

export type ErrorHandlerStepProps = {
  editMode: boolean;
  schema: Record<string, any>;
  configuration: ErrorHandler | undefined;
  changeIsValid: (isValid: boolean) => void;
  onUpdateConfiguration: (type: string, update: any) => void;
};
export const ErrorHandlerStep: FC<ErrorHandlerStepProps> = ({
  editMode,
  schema,
  configuration,
  changeIsValid,
  onUpdateConfiguration,
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>();
  const [errorHandler, setErrorHandler] = useState<any>();
  const { t } = useTranslation();
  const { error_handler } = schema.properties;
  const oneOf = error_handler['oneOf'];
  const onToggle = () => setOpen((isOpen) => !isOpen);

  const checkValidity = (value: string) => {
    if (value !== 'dead_letter_queue') {
      changeIsValid(true);
    } else if (topic) {
      changeIsValid(true);
    } else {
      changeIsValid(false);
    }
  };

  const onSelect = (
    _: any,
    value: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    } else {
      const selection = typeof value === 'string' ? value : value.toString();
      setOpen(false);
      setTopic('');
      setErrorHandler(selection);
      checkValidity(selection);
      onUpdateConfiguration('error', { [selection]: {} });
    }
  };

  const clearSelection = () => {
    setOpen(false);
  };

  useEffect(() => {
    setErrorHandler(
      configuration
        ? Object.keys(configuration)[0]
        : Object.keys(error_handler.default)[0]
    );
    if (
      configuration &&
      typeof (configuration as DLQErrorHandler).dead_letter_queue === 'object'
    ) {
      const { dead_letter_queue: deadLetterQueue } =
        configuration as DLQErrorHandler;
      setTopic(deadLetterQueue.topic);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  const updateTopic = (val: string) => {
    setTopic(val);
    val ? changeIsValid(true) : changeIsValid(false);
    onUpdateConfiguration('error', { dead_letter_queue: { topic: val } });
  };

  const dropdownItems = oneOf.map((item: any) => {
    const keys = Object.keys(item.properties);
    return (
      <SelectOption
        data-testid={toHtmlSafeId(keys[0], 'option-')}
        key={keys[0]}
        value={keys[0]}
      />
    );
  });
  return (
    <StepBodyLayout
      title={t('errorHandling')}
      description={t('errorHandlingStepDescription')}
    >
      <Form>
        <FormGroup
          label={t('errorHandler')}
          fieldId="error-handler_strategy"
          className="error-handler_strategy"
        >
          {editMode ? (
            <Select
              variant={SelectVariant.single}
              aria-label="Select Error handler"
              onToggle={onToggle}
              onSelect={onSelect}
              selections={errorHandler}
              isOpen={isOpen}
              placeholderText="Select type"
              data-testid={'select-error-handler'}
              ouiaId={'select-error-handler'}
            >
              {dropdownItems}
            </Select>
          ) : (
            <Text component={TextVariants.p}>{errorHandler}</Text>
          )}
        </FormGroup>
        {errorHandler === 'dead_letter_queue' && (
          <FormGroup
            label="Dead Letter Topic Name"
            isRequired
            fieldId="topic"
            labelIcon={
              <Popover
                bodyContent={
                  <p>The name of the Kafka topic used as dead letter queue</p>
                }
              >
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
              <TextInput value={topic} onChange={updateTopic} id="topic" />
            ) : (
              <Text component={TextVariants.p}>{topic}</Text>
            )}
          </FormGroup>
        )}
      </Form>
    </StepBodyLayout>
  );
};
