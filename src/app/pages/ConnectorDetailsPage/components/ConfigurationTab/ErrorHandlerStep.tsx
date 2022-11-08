import {
  ErrorHandler,
  returnErrorHandlersNames,
} from '@app/components/ErrorHandler/ErrorHandler';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ERROR_HANDLING_STRATEGY } from '@constants/constants';
import React, { FC, useEffect, useState } from 'react';

import {
  Form,
  FormGroup,
  Grid,
  GridItem,
  Popover,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';
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
  const [topic, setTopic] = useState<string>('');
  const [errorHandler, setErrorHandler] = useState<any>();
  const { t } = useTranslation();
  const { error_handler } = schema.properties;
  const oneOf = error_handler['oneOf'];

  const checkValidity = (value: string) => {
    if (value !== ERROR_HANDLING_STRATEGY.DeadLetterQueue) {
      changeIsValid(true);
    } else if (topic) {
      changeIsValid(true);
    } else {
      changeIsValid(false);
    }
  };

  const selectErrorHandler = (
    _checked: boolean,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setTopic('');
    setErrorHandler(event.currentTarget.id);
    checkValidity(event.currentTarget.id);
    onUpdateConfiguration('error', { [event.currentTarget.id]: {} });
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

  const ErrorHandlersList = oneOf
    .map((item: any) => {
      const keys = Object.keys(item.properties);
      return keys;
    })
    .flat()
    .sort()
    .reverse();

  return (
    <StepBodyLayout
      title={t('errorHandling')}
      description={t('errorHandlingStepDescription')}
    >
      <Grid hasGutter>
        <GridItem span={8}>
          {editMode ? (
            <ErrorHandler
              errorHandlersList={ErrorHandlersList}
              errorHandler={errorHandler}
              topic={topic}
              onSetTopic={updateTopic}
              selectErrorHandler={selectErrorHandler}
            />
          ) : (
            <Form>
              <FormGroup
                label={t('errorHandlingMethod')}
                fieldId="error-handler_strategy"
                className="error-handler_strategy"
                labelIcon={
                  <Popover
                    bodyContent={
                      <div>
                        {returnErrorHandlersNames(errorHandler).description}
                      </div>
                    }
                  >
                    <button
                      type="button"
                      aria-label={t('errorHandlingMethod')}
                      onClick={(e) => e.preventDefault()}
                      aria-describedby={t('errorHandlingMethod')}
                      className="pf-c-form__group-label-help"
                    >
                      <HelpIcon noVerticalAlign />
                    </button>
                  </Popover>
                }
              >
                <Text component={TextVariants.p}>
                  {returnErrorHandlersNames(errorHandler).errorHandler}
                </Text>
              </FormGroup>
              {errorHandler === ERROR_HANDLING_STRATEGY.DeadLetterQueue && (
                <FormGroup
                  label={t('deadLetterQueueTopic')}
                  isRequired
                  fieldId="topic"
                >
                  <Text component={TextVariants.p}>{topic}</Text>
                </FormGroup>
              )}
            </Form>
          )}
        </GridItem>
      </Grid>
    </StepBodyLayout>
  );
};
