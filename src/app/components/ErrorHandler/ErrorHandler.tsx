import { ERROR_HANDLING_STRATEGY } from '@constants/constants';
import { toHtmlSafeId } from '@utils/shared';
import { t } from 'i18next';
import React from 'react';

import {
  Form,
  Radio,
  FormGroup,
  Popover,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type ErrorHandlerProps = {
  errorHandlersList: string[];
  errorHandler: string;
  topic: string;
  onSetTopic: (topic: string) => void;
  selectErrorHandler: (
    checked: boolean,
    event: React.FormEvent<HTMLInputElement>
  ) => void;
};

type ErrorHandlerObj = {
  errorHandler: string;
  description: string;
};
/**
 * This method returns the error handler object based on the error handler strategy string
 * @param errorHandler
 * @returns ErrorHandlerObj
 */
export const returnErrorHandlersNames = (
  errorHandler: string
): ErrorHandlerObj => {
  switch (errorHandler) {
    case ERROR_HANDLING_STRATEGY.Log:
      return {
        errorHandler: t('ignore'),
        description: t('ignoreDescription'),
      };
    case ERROR_HANDLING_STRATEGY.DeadLetterQueue:
      return {
        errorHandler: t('deadLetterQueue'),
        description: t('deadLetterQueueDescription'),
      };
    case ERROR_HANDLING_STRATEGY.Stop:
      return {
        errorHandler: t('stop'),
        description: t('stopDescription'),
      };
    default:
      return {
        errorHandler: errorHandler,
        description: '',
      };
  }
};

export const ErrorHandler: React.FunctionComponent<ErrorHandlerProps> = ({
  errorHandlersList,
  errorHandler,
  topic,
  onSetTopic,
  selectErrorHandler,
}) => {
  return (
    <Form>
      {errorHandlersList.map((item: any) => {
        return (
          <Radio
            key={item}
            id={item}
            data-testid={toHtmlSafeId(item, 'option-')}
            isChecked={errorHandler === item}
            label={returnErrorHandlersNames(item).errorHandler}
            description={returnErrorHandlersNames(item).description}
            name={'error-handler'}
            onChange={selectErrorHandler}
            body={
              returnErrorHandlersNames(item).errorHandler ===
              'Dead letter queue' ? (
                <>
                  <FormGroup
                    label={t('deadLetterQueueTopic')}
                    isRequired
                    fieldId="topic"
                    helperText={t('deadLetterTopicHelper')}
                    labelIcon={
                      <Popover
                        headerContent={t('deadLetterQueueTopic')}
                        bodyContent={t('deadLetterQueueHelper')}
                      >
                        <button
                          type="button"
                          aria-label={t('deadLetterTopicHelper')}
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="Dead letter queue topic"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </button>
                      </Popover>
                    }
                  >
                    <TextInput
                      isDisabled={
                        errorHandler !== ERROR_HANDLING_STRATEGY.DeadLetterQueue
                      }
                      placeholder={'Topic input here'}
                      value={topic}
                      onChange={onSetTopic}
                      id="topic"
                    />
                  </FormGroup>
                </>
              ) : (
                <></>
              )
            }
          />
        );
      })}
    </Form>
  );
};
