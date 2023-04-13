import { DLQErrorHandler, ErrorHandler } from '@apis/api';
import { ERROR_HANDLING_STRATEGY } from '@constants/constants';
import React, { FC } from 'react';

import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Form,
  FormGroup,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { returnErrorHandlersNames } from '../ErrorHandlerSelector/ErrorHandlerSelector';

export type ErrorHandlerInfoProps = {
  asForm?: boolean;
  isHorizontal?: boolean;
  kafkaId?: string;
  errorHandler: ErrorHandler;
};

export const ErrorHandlerInfo: FC<ErrorHandlerInfoProps> = ({
  asForm,
  isHorizontal,
  // When not present, "stop" is the default error handling strategy
  errorHandler = { stop: {} },
  kafkaId,
}) => {
  const { t } = useTranslation();
  const errorHandlerName = Object.keys(errorHandler)[0];
  const topic = (errorHandler as DLQErrorHandler).dead_letter_queue?.topic;
  const topicUrl = `https://console.redhat.com/application-services/streams/kafkas/${kafkaId}/topics/${topic}`;
  const {
    errorHandler: i18nErrorHandlerName,
    description: i18nErrorHandlerDescription,
  } = returnErrorHandlersNames(errorHandlerName);
  if (asForm) {
    return (
      <Form>
        <FormGroup
          label={t('errorHandlingMethod')}
          isRequired
          fieldId="error-handler_strategy"
          className="error-handler_strategy"
          labelIcon={
            <Popover
              headerContent={`${t(
                'errorHandlingMethod'
              )}: ${i18nErrorHandlerName}`}
              bodyContent={i18nErrorHandlerDescription}
            >
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
        >
          <TextContent>
            <Text component={TextVariants.p} className="pf-u-m-0">
              {i18nErrorHandlerName}
            </Text>
          </TextContent>
        </FormGroup>
        {errorHandlerName === ERROR_HANDLING_STRATEGY.DeadLetterQueue && (
          <FormGroup
            label={t('deadLetterQueueTopic')}
            isRequired
            fieldId="topic"
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
            {kafkaId ? (
              <Button
                className="pf-u-p-0"
                variant="link"
                onClick={() => {
                  window.open(topicUrl);
                }}
              >
                {topic}
              </Button>
            ) : (
              <TextContent>
                <Text component={TextVariants.p} className="pf-u-m-0">
                  {topic}
                </Text>
                <Text component={TextVariants.small}>
                  {t('kafkaInstanceExpired')}
                </Text>
              </TextContent>
            )}
          </FormGroup>
        )}
      </Form>
    );
  }
  return (
    <DescriptionList
      isHorizontal={isHorizontal}
      horizontalTermWidthModifier={{
        default: '19ch',
      }}
    >
      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={`${t(
              'errorHandlingMethod'
            )}: ${i18nErrorHandlerName}`}
            bodyContent={i18nErrorHandlerDescription}
          >
            <DescriptionListTermHelpTextButton>
              {t('errorHandlingMethod')}
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {i18nErrorHandlerName}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {errorHandlerName === ERROR_HANDLING_STRATEGY.DeadLetterQueue && (
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              headerContent={t('deadLetterQueueTopic')}
              bodyContent={t('deadLetterQueueHelper')}
            >
              <DescriptionListTermHelpTextButton>
                {t('deadLetterQueueTopic')}
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {kafkaId ? (
              <Button
                className="pf-u-p-0"
                variant="link"
                onClick={() => {
                  window.open(topicUrl);
                }}
              >
                {topic}
              </Button>
            ) : (
              <>
                <Text component={TextVariants.p} className="pf-u-m-0">
                  {topic}
                </Text>
                <Text component={TextVariants.small}>
                  {t('kafkaInstanceExpired')}
                </Text>
              </>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};
