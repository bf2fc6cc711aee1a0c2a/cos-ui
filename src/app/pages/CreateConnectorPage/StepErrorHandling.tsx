import { useErrorHandlingMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { ErrorHandlerSelector } from '@app/components/ErrorHandlerSelector/ErrorHandlerSelector';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { createValidator } from '@utils/createValidator';
import React, { FunctionComponent, useEffect } from 'react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

import { Grid, GridItem } from '@patternfly/react-core';

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

  return (
    <StepBodyLayout
      title={t('errorHandling')}
      description={t('errorHandlingStepDescription')}
    >
      <Grid hasGutter className="pf-u-p-md ">
        <GridItem span={8}>
          <ErrorHandlerSelector
            errorHandlersList={ErrorHandlersList}
            errorHandler={errorHandler}
            topic={topic}
            onSetTopic={onSetTopic}
            selectErrorHandler={selectErrorHandler}
          />
        </GridItem>
      </Grid>
    </StepBodyLayout>
  );
};
