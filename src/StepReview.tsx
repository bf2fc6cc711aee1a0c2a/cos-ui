import React, {useState, useCallback} from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash'
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
  TitleSizes
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
    return key = key.replace(/\./g, "_");
  })

  const maskValue = (value: any) => {
    return "*".repeat(value.length)
  }

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
            ):(
            <>
              <Grid>
                <GridItem span={4}>{t('Connector category')}</GridItem>
                <GridItem span={8}>AWS SQS S3</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('Kafka instance')}</GridItem>
                <GridItem span={8}>{kafka.name}</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('OSD Cluster')}</GridItem>
                <GridItem span={8}>{cluster.metadata?.name}</GridItem>
              </Grid>

              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                Basic
              </Title>
              <Grid>
                <GridItem span={4}>{t('Connector name')}</GridItem>
                <GridItem span={8}>{name}</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('Type')}</GridItem>
                <GridItem span={8}>{connectorType.labels?.map(type => type)}</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('API Key')}</GridItem>
                <GridItem span={8}>{maskValue(userServiceAccount?.clientId)}</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('API Secret')}</GridItem>
                <GridItem span={8}>{maskValue(userServiceAccount?.clientSecret)}</GridItem>
              </Grid>
              <Grid>
                <GridItem span={4}>{t('Topic')}</GridItem>
                <GridItem span={8}>Topic</GridItem>
              </Grid>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                Connector specific
              </Title>
              {connector &&
              Object.keys(connector).map(el => {
                console.log(connector[el])
                return (
                  <Grid>
                    <GridItem span={4}>{_.startCase(el)}</GridItem>
                    <GridItem span={8}>{_.startCase(el) === 'Access Key' || _.startCase(el) === 'Secret Key' ? maskValue(connector[el]) : t(connector[el]) }</GridItem>
                  </Grid>                                                
                )
              })}
              {kafkaTopic &&
              Object.keys(kafkaTopic).map(el => {
                return (
                  <Grid>
                    <GridItem span={4}>{_.startCase(el)}</GridItem>
                    <GridItem span={8}>{t(kafkaTopic[el])}</GridItem>
                  </Grid>                                                
                )
              })}
              {connector === undefined &&
              Object.keys(modifiedObject).map(el => {
                console.log(modifiedObject[el])
                return (
                  <Grid>
                    <GridItem span={4}>{_.startCase(el)}</GridItem>
                    <GridItem span={8}>{t(modifiedObject[el])}</GridItem>
                  </Grid>                                                
                )
              })}
            </>
            )}
          </Form>
        </CardBody>
      </Card>
    </StepBodyLayout>
  );
}