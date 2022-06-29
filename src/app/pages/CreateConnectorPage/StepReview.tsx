import { useReviewMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ViewJSONFormat } from '@app/components/ViewJSONFormat/ViewJSONFormat';
import { getPasswordType } from '@utils/shared';
import _ from 'lodash';
import React, { useState, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
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

import { ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

export function Review() {
  const { t } = useTranslation();
  const [toggleView, setToggleView] = useState(false);
  const [toggleMaskView, setToggleMaskView] = useState<{
    [key: string]: boolean;
  }>({
    clientId: true,
    clientSecret: true,
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
    }
  };
  const {
    kafka,
    namespace,
    connectorType,
    name,
    topic,
    userErrorHandler,
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
  const schema: Record<string, any> = (connectorType as ConnectorTypeAllOf)
    .schema!;
  const dataToHide = getPasswordType(schema);

  const modifiedObject = _.mapKeys(config, (_, key) => {
    return (key = key.replace(/\./g, '_'));
  });
  try {
    delete modifiedObject['error_handler'];
  } catch (e) {}

  const maskValue = (value: any) => {
    return '*'.repeat(value.length);
  };
  return (
    <StepBodyLayout
      title={t('review')}
      description={
        !toggleView
          ? t('reviewStepDescription')
          : t('reviewJSONStepDescription')
      }
      component={
        <Switch
          id="toggle-json-view"
          label={t('viewJSONFormat')}
          labelOff={t('viewJSONFormat')}
          isChecked={toggleView}
          onChange={onToggleJSONView}
          ouiaId={'toggle'}
        />
      }
    >
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
                <strong>{t('connectorCategory')}</strong>
              </GridItem>
              <GridItem span={8}>
                {(connectorType as ConnectorTypeAllOf).description}
              </GridItem>
            </Grid>
            <Grid>
              <GridItem span={4}>
                <strong>{t('kafkaInstance')}</strong>
              </GridItem>
              <GridItem span={8}>{kafka.name}</GridItem>
            </Grid>
            <Grid>
              <GridItem span={4}>
                <strong>{t('namespace')}</strong>
              </GridItem>
              <GridItem span={8}>{namespace.name}</GridItem>
            </Grid>

            <Title headingLevel="h3" size={TitleSizes['2xl']}>
              {t('basic')}
            </Title>
            <Grid>
              <GridItem span={4}>
                <strong>{t('connectorName')}</strong>
              </GridItem>
              <GridItem span={8}>{name}</GridItem>
            </Grid>
            <Grid>
              <GridItem span={4}>
                <strong>{t('type')}</strong>
              </GridItem>
              <GridItem span={8}>
                {(connectorType as ConnectorTypeAllOf).labels?.map(
                  (type) => type
                )}
              </GridItem>
            </Grid>
            {userServiceAccount?.clientId && (
              <Grid>
                <GridItem span={4}>
                  <strong>{t('clientId')}</strong>
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
                      {toggleMaskView.clientId ? <EyeIcon /> : <EyeSlashIcon />}
                    </FlexItem>
                  </Flex>
                </GridItem>
              </Grid>
            )}
            {userServiceAccount?.clientSecret && (
              <Grid>
                <GridItem span={4}>
                  <strong>{t('clientSecret')}</strong>
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
              {t('connectorSpecific')}
            </Title>
            {connector &&
              Object.keys(connector).map((el) => {
                return (
                  <Grid key={el}>
                    <GridItem span={4}>
                      <strong>{_.startCase(el)}</strong>
                    </GridItem>
                    <GridItem span={8}>
                      {dataToHide.includes(el) ? (
                        <Flex>
                          <FlexItem>{maskValue(connector[el])}</FlexItem>
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
                  <Grid key={el}>
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
                  <Grid key={el}>
                    <GridItem span={4}>
                      <strong>{_.startCase(el)}</strong>
                    </GridItem>
                    <GridItem span={8}>
                      {dataToHide.includes(el) ? (
                        maskValue(modifiedObject[el])
                      ) : typeof modifiedObject[el] === 'object' ? (
                        el === 'data_shape' ? (
                          <DataShape data={modifiedObject[el]} />
                        ) : (
                          JSON.stringify(modifiedObject[el])
                        )
                      ) : (
                        modifiedObject[el]
                      )}
                    </GridItem>
                  </Grid>
                );
              })}
            {userErrorHandler && (
              <>
                <Title headingLevel="h3" size={TitleSizes['2xl']}>
                  {t('errorHandling')}
                </Title>
                <Grid>
                  <GridItem span={4}>
                    <strong>{t('errorHandling')}</strong>
                  </GridItem>
                  <GridItem span={8}>{userErrorHandler}</GridItem>
                </Grid>
                {topic && (
                  <Grid>
                    <GridItem span={4}>
                      <strong>{t('topic')}</strong>
                    </GridItem>
                    <GridItem span={8}>{topic}</GridItem>
                  </Grid>
                )}
              </>
            )}
          </>
        )}
      </Form>
    </StepBodyLayout>
  );
}

type DataShape = {
  data: any;
};
export const DataShape: FC<DataShape> = ({ data }) => {
  return (
    <>
      {Object.keys(data).map((key) => {
        return (
          <Grid key={key}>
            <GridItem span={2}>
              <strong>{_.startCase(key)}:</strong>
            </GridItem>
            <GridItem span={10}>
              {typeof data[key] === 'string' ? data[key] : data[key].format}
            </GridItem>
          </Grid>
        );
      })}
    </>
  );
};
