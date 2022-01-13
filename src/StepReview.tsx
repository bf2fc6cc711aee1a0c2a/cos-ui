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
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { useReviewMachine } from './CreateConnectorWizardContext';
import { StepBodyLayout } from './StepBodyLayout';
import { ViewJSONFormat } from './ViewJSONFormat';

export function Review() {
  const { t } = useTranslation();
  const [toggleView, setToggleView] = useState(false);
  const [toggleMaskView, setToggleMaskView] = useState<{
    [key: string]: boolean;
  }>({
    clientId: true,
    clientSecret: true,
    accessKey: true,
    secretKey: true,
  });

  const updateMaskView = (ele: any) => {
    let updatedState = { ...toggleMaskView };
    switch (ele.currentTarget.id) {
      case 'clientId':
        updatedState.clientId = !toggleMaskView.clientId;
        setToggleMaskView(updatedState);
        break;
      case 'clientSecret':
        updatedState.clientSecret = !toggleMaskView.clientSecret;
        setToggleMaskView(updatedState);
        break;
      case 'accessKey':
        updatedState.accessKey = !toggleMaskView.accessKey;
        setToggleMaskView(updatedState);
        break;
      case 'secretKey':
        updatedState.secretKey = !toggleMaskView.secretKey;
        setToggleMaskView(updatedState);
        break;
    }
  };
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
        !toggleView
          ? t('reviewStepDescription')
          : t('reviewJSONStepDescription')
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
                      <Flex>
                        <FlexItem>
                          {toggleMaskView.clientId
                            ? maskValue(userServiceAccount?.clientId)
                            : userServiceAccount?.clientId}
                          {}
                        </FlexItem>
                        <FlexItem onClick={updateMaskView} id="clientId">
                          {toggleMaskView.clientId ? (
                            <EyeIcon />
                          ) : (
                            <EyeSlashIcon />
                          )}
                        </FlexItem>
                      </Flex>
                    </GridItem>
                  </Grid>
                )}
                {userServiceAccount?.clientSecret && (
                  <Grid>
                    <GridItem span={4}>
                      <strong>{t('Client Secret')}</strong>
                    </GridItem>
                    <GridItem span={8}>
                      <Flex>
                        <FlexItem>
                          {toggleMaskView.clientSecret
                            ? maskValue(userServiceAccount?.clientSecret)
                            : userServiceAccount?.clientSecret}
                          {}
                        </FlexItem>
                        <FlexItem onClick={updateMaskView} id="clientSecret">
                          {toggleMaskView.clientSecret ? (
                            <EyeIcon />
                          ) : (
                            <EyeSlashIcon />
                          )}
                        </FlexItem>
                      </Flex>
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
                          _.startCase(el) === t('Secret Key') ? (
                            <Flex>
                              <FlexItem>
                                {toggleMaskView[el]
                                  ? maskValue(connector[el])
                                  : connector[el]}
                                {}
                              </FlexItem>
                              <FlexItem onClick={updateMaskView} id={el}>
                                {toggleMaskView[el] ? (
                                  <EyeIcon />
                                ) : (
                                  <EyeSlashIcon />
                                )}
                              </FlexItem>
                            </Flex>
                          ) : (
                            connector[el]
                          )}
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
