import _ from 'lodash';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Card,
  CardBody,
  Form,
  FormAlert,
  Switch,
  Grid,
  GridItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { useReviewMachine } from './CreateConnectorWizardContext';
import { StepBodyLayout } from './StepBodyLayout';
import { ViewJSONFormat } from './ViewJSONFormat';

export function Review() {
  const { t } = useTranslation();
  const [toggleView, setToggleView] = useState(false);

  const {
    kafka,
    cluster,
    connectorType,
    name,
    userServiceAccount,
    configString,
    savingError,
  } = useReviewMachine();

  const onToggleJSONView = useCallback(
    () => setToggleView((prev) => !prev),
    []
  );

  const config = JSON.parse(configString);
  const connector = JSON.parse(configString).connector;
  const kafkaTopic = JSON.parse(configString).kafka;

  const modifiedObject = _.mapKeys(config, (_, key) => {
    return (key = key.replace(/\./g, '_'));
  });

  const maskValue = (value: any) => {
    return '*'.repeat(value.length);
  };

  return (
    <StepBodyLayout
      title={t('Review')}
      description={
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit error adipisci, ducimus ipsum dicta quo beatae ratione aliquid nostrum animi eos, doloremque laborum quasi sed, vitae ipsa illo delectus! Quos'
      }
      component={
        <Switch
          id="toggle-json-view"
          label={t('ViewJSONFormat')}
          labelOff={t('ViewJSONFormat')}
          isChecked={toggleView}
          onChange={onToggleJSONView}
        />
      }
    >
      <Card>
        <CardBody>
          <Form>
            {savingError && (
              <FormAlert>
                <Alert
                  variant="danger"
                  title={savingError}
                  aria-live="polite"
                  isInline
                />
              </FormAlert>
            )}
            {toggleView ? (
              <ViewJSONFormat />
            ) : (
              <>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('Connector category')}</strong>
                  </GridItem>
                  <GridItem span={8}>{connectorType.description}</GridItem>
                </Grid>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('Kafka instance')}</strong>
                  </GridItem>
                  <GridItem span={8}>{kafka.name}</GridItem>
                </Grid>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('OSD Cluster')}</strong>
                  </GridItem>
                  <GridItem span={8}>{cluster.metadata?.name}</GridItem>
                </Grid>

                <Title headingLevel="h3" size={TitleSizes['2xl']}>
                  {t('Basic')}
                </Title>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('Connector name')}</strong>
                  </GridItem>
                  <GridItem span={8}>{name}</GridItem>
                </Grid>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('Type')}</strong>
                  </GridItem>
                  <GridItem span={8}>
                    {connectorType.labels?.map((type) => type)}
                  </GridItem>
                </Grid>
                {userServiceAccount?.clientId && (
                  <Grid>
                    <GridItem span={4}>
                      <strong>{t('Client ID')}</strong>
                    </GridItem>
                    <GridItem span={8}>
                      {maskValue(userServiceAccount?.clientId)}
                    </GridItem>
                  </Grid>
                )}
                {userServiceAccount?.clientSecret && (
                  <Grid>
                    <GridItem span={4}>
                      <strong>{t('Client Secret')}</strong>
                    </GridItem>
                    <GridItem span={8}>
                      {maskValue(userServiceAccount?.clientSecret)}
                    </GridItem>
                  </Grid>
                )}
                <Title headingLevel="h3" size={TitleSizes['2xl']}>
                  {t('Connector specific')}
                </Title>
                {connector &&
                  Object.keys(connector).map((el) => {
                    return (
                      <Grid>
                        <GridItem span={4}>
                          <strong>{_.startCase(el)}</strong>
                        </GridItem>
                        <GridItem span={8}>
                          {_.startCase(el) === t('Access Key') ||
                          _.startCase(el) === t('Secret Key')
                            ? maskValue(connector[el])
                            : connector[el]}
                        </GridItem>
                      </Grid>
                    );
                  })}
                {kafkaTopic &&
                  Object.keys(kafkaTopic).map((el) => {
                    return (
                      <Grid>
                        <GridItem span={4}>
                          <strong>{_.startCase(el)}</strong>
                        </GridItem>
                        <GridItem span={8}>{kafkaTopic[el]}</GridItem>
                      </Grid>
                    );
                  })}
                {connector === undefined &&
                  Object.keys(modifiedObject).map((el) => {
                    return (
                      <Grid>
                        <GridItem span={4}>
                          <strong>{_.startCase(el)}</strong>
                        </GridItem>
                        <GridItem span={8}>
                          {_.startCase(el) === t('Database Password') ||
                          _.startCase(el) === t('Password')
                            ? maskValue(modifiedObject[el])
                            : modifiedObject[el]}
                        </GridItem>
                      </Grid>
                    );
                  })}
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </StepBodyLayout>
  );
}
