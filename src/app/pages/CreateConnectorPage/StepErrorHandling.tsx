import { useErrorHandlingMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ERROR_HANDLING_STRATEGY } from '@constants/constants';
import { createValidator } from '@utils/createValidator';
import React, { FunctionComponent, useEffect } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

import {
  Form,
  FormGroup,
  Grid,
  GridItem,
  Popover,
  Radio,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

export const StepErrorHandling: FunctionComponent = () => {
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

  const selectErrorHandler = (
    _checked: boolean,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    onSetTopic('');
    onSetErrorHandler(event.currentTarget.id);
  };

  const schemaValidator = createValidator(
    (connector as ConnectorTypeAllOf).schema!
  );
  const bridge = new JSONSchemaBridge(
    (connector as ConnectorTypeAllOf).schema!,
    schemaValidator
  );
  const { error_handler } = bridge.schema?.properties;
  const oneOf = error_handler['oneOf'];

  const ErrorHandlersList = oneOf
    .map((item: any) => {
      const keys = Object.keys(item.properties);
      return keys;
    })
    .flat()
    .sort()
    .reverse();

  useEffect(() => {
    errorHandler ?? onSetErrorHandler(Object.keys(error_handler['default'])[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnErrorHAndlersNames = (errorHandler: string) => {
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

  return (
    <StepBodyLayout
      title={t('errorHandling')}
      description={t('errorHandlingStepDescription')}
    >
      <Grid hasGutter className="pf-u-p-md ">
        <GridItem span={8}>
          <Form>
            {ErrorHandlersList.map((item: any) => {
              return (
                <Radio
                  key={item}
                  id={item}
                  isChecked={errorHandler === item}
                  label={returnErrorHAndlersNames(item).errorHandler}
                  description={returnErrorHAndlersNames(item).description}
                  name={'error-handler'}
                  onChange={selectErrorHandler}
                  body={
                    returnErrorHAndlersNames(item).errorHandler ===
                    'Dead letter queue' ? (
                      <>
                        <FormGroup
                          label={t('deadLetterQueueTopic')}
                          isRequired
                          fieldId="topic"
                          helperText={t('deadLetterTopicHelper')}
                          labelIcon={
                            <Popover
                              bodyContent={
                                <div>{t('deadLetterQueueHelper')}</div>
                              }
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
                              errorHandler !==
                              ERROR_HANDLING_STRATEGY.DeadLetterQueue
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
        </GridItem>
      </Grid>
    </StepBodyLayout>
  );
};
