import { DLQErrorHandler, ErrorHandler } from '@apis/api';
import { ErrorHandlerInfo } from '@app/components/ErrorHandlerInfo/ErrorHandlerInfo';
import { ErrorHandlerSelector } from '@app/components/ErrorHandlerSelector/ErrorHandlerSelector';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ERROR_HANDLING_STRATEGY } from '@constants/constants';
import React, { FC, useEffect, useState } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type ErrorHandlerStepProps = {
  editMode: boolean;
  schema: Record<string, any>;
  configuration: ErrorHandler | undefined;
  kafkaId: string;
  changeIsValid: (isValid: boolean) => void;
  onUpdateConfiguration: (type: string, update: any) => void;
};
export const ErrorHandlerStep: FC<ErrorHandlerStepProps> = ({
  editMode,
  schema,
  configuration,
  kafkaId,
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
            <ErrorHandlerSelector
              errorHandlersList={ErrorHandlersList}
              errorHandler={errorHandler}
              topic={topic}
              onSetTopic={updateTopic}
              selectErrorHandler={selectErrorHandler}
            />
          ) : (
            <ErrorHandlerInfo
              asForm
              errorHandler={configuration!}
              kafkaId={kafkaId}
            />
          )}
        </GridItem>
      </Grid>
    </StepBodyLayout>
  );
};
