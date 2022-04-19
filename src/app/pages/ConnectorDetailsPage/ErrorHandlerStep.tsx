import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { createValidator } from '@utils/createValidator';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

import {
  Form,
  FormGroup,
  Popover,
  Select,
  SelectOption,
  SelectVariant,
  Text,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export type ErrorHandler = {
  [key: string]: any;
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

  const schemaValidator = createValidator(schema);
  const bridge = new JSONSchemaBridge(schema, schemaValidator);
  const { error_handler } = bridge.schema?.properties;
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

  const onSelect = (_: any, selection: any, isPlaceholder: any) => {
    if (isPlaceholder) {
      clearSelection();
    } else {
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
      Object.keys(configuration)[0] === 'dead_letter_queue' &&
      !_.isEmpty(configuration.dead_letter_queue)
    ) {
      setTopic(
        configuration.dead_letter_queue[
          Object.keys(configuration.dead_letter_queue)[0]
        ]
      );
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
    return <SelectOption key={keys[0]} value={keys[0]} />;
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
