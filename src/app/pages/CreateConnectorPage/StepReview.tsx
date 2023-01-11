import { UserProvidedServiceAccount } from '@apis/api';
import { useReviewMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { returnErrorHandlersNames } from '@app/components/ErrorHandler/ErrorHandler';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ViewJSONFormat } from '@app/components/ViewJSONFormat/ViewJSONFormat';
import { getPasswordType } from '@utils/shared';
import _ from 'lodash';
import React, { useState, useCallback, FC } from 'react';

import {
  Alert,
  FormAlert,
  Switch,
  Title,
  TitleSizes,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  ConnectorNamespace,
  ConnectorType,
  ConnectorTypeAllOf,
} from '@rhoas/connector-management-sdk';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

import './StepReview.css';

export function Review() {
  const {
    kafka,
    namespace,
    connectorType,
    name,
    topic,
    userErrorHandler,
    userServiceAccount,
    configString,
    configurationSteps,
    savingError,
  } = useReviewMachine();
  return (
    <StepReviewComponent
      kafka={kafka}
      namespace={namespace}
      connectorType={connectorType}
      name={name}
      topic={topic}
      userErrorHandler={userErrorHandler}
      userServiceAccount={userServiceAccount}
      configString={configString}
      savingError={savingError}
      configurationSteps={configurationSteps}
    ></StepReviewComponent>
  );
}

const ConnectorProperties = (
  property: string,
  connectorProperties: { [key: string]: any },
  dataToHide: string[]
) => {
  switch (typeof connectorProperties[property]) {
    case 'object':
      return property === 'data_shape' ? (
        <DataShape data={connectorProperties[property]} />
      ) : (
        JSON.stringify(connectorProperties[property])
      );
    case 'boolean':
      return connectorProperties[property].toString();
    default:
      return dataToHide.includes(property)
        ? '*'.repeat(5)
        : connectorProperties[property];
  }
};

type StepReviewComponentProps = {
  kafka: KafkaRequest;
  namespace: ConnectorNamespace;
  connectorType: ConnectorType;
  name: string;
  topic: string;
  userErrorHandler: string;
  userServiceAccount: UserProvidedServiceAccount;
  configString: string;
  configurationSteps?: string[] | false;
  savingError: string | undefined;
};

export const StepReviewComponent: React.FC<StepReviewComponentProps> = ({
  kafka,
  namespace,
  connectorType,
  name,
  topic,
  userErrorHandler,
  userServiceAccount,
  configString,
  configurationSteps,
  savingError,
}) => {
  const { t } = useTranslation();
  const [toggleView, setToggleView] = useState(false);
  const [toggleMaskView, setToggleMaskView] = useState<{
    [key: string]: boolean;
  }>({
    clientSecret: true,
  });

  const updateMaskView = (ele: any) => {
    let updatedState = { ...toggleMaskView };
    switch (ele.currentTarget.id) {
      case 'clientSecret':
        updatedState.clientSecret = !toggleMaskView.clientSecret;
        setToggleMaskView(updatedState);
        break;
    }
  };

  const onToggleJSONView = useCallback(
    () => setToggleView((prev) => !prev),
    []
  );
  const config = JSON.parse(configString);
  const connector = JSON.parse(configString).connector;
  const kafkaTopic = JSON.parse(configString).kafka;
  const schema: Record<string, any> = (connectorType as ConnectorTypeAllOf)
    .schema!;
  const dataToHide = getPasswordType(schema).map((item) =>
    item.replace(/\./g, '_')
  );

  const modifiedObject = _.mapKeys(config, (_, key) => {
    return (key = key.replace(/\./g, '_'));
  });
  try {
    delete modifiedObject['error_handler'];
  } catch (e) {}

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
        <ViewJSONFormat
          kafka={kafka}
          namespace={namespace}
          connectorType={connectorType}
          name={name}
          topic={topic}
          userErrorHandler={userErrorHandler}
          userServiceAccount={userServiceAccount}
          configString={configString}
          configurationSteps={configurationSteps}
        />
      ) : (
        <>
          <dl className="pf-c-description-list pf-m-horizontal">
            <div className="pf-c-description-list__group">
              <dt className="pf-c-description-list__term">
                {t('connectorCategory')}
              </dt>
              <dd className="pf-c-description-list__description">
                {(connectorType as ConnectorTypeAllOf).description}
              </dd>
            </div>
            <div className="pf-c-description-list__group">
              <dt className="pf-c-description-list__term">
                {t('kafkaInstance')}
              </dt>
              <dd className="pf-c-description-list__description">
                {kafka.name}
              </dd>
            </div>
            <div className="pf-c-description-list__group">
              <dt className="pf-c-description-list__term">{t('namespace')}</dt>
              <dd className="pf-c-description-list__description">
                {namespace.name}
              </dd>
            </div>
            <Title
              headingLevel="h3"
              size={TitleSizes['xl']}
              className="--pf-c-title--Size"
            >
              {t('basic')}
            </Title>
            <div className="pf-c-description-list__group">
              <dt className="pf-c-description-list__term">
                {t('connectorName')}
              </dt>
              <dd className="pf-c-description-list__description">{name}</dd>
            </div>
            <div className="pf-c-description-list__group">
              <dt className="pf-c-description-list__term">{t('type')}</dt>
              <dd className="pf-c-description-list__description">
                {(connectorType as ConnectorTypeAllOf).labels?.map(
                  (type) => type
                )}
              </dd>
            </div>
            {userServiceAccount?.clientId && (
              <div className="pf-c-description-list__group">
                <dt className="pf-c-description-list__term">{t('clientId')}</dt>
                <dd className="pf-c-description-list__description">
                  <Flex>
                    <FlexItem id="clientId">
                      {userServiceAccount?.clientId}
                    </FlexItem>
                  </Flex>
                </dd>
              </div>
            )}
            {userServiceAccount?.clientSecret && (
              <div className="pf-c-description-list__group">
                <dt className="pf-c-description-list__term">
                  {t('clientSecret')}
                </dt>
                <dd className="pf-c-description-list__description">
                  <Flex>
                    <FlexItem>
                      {toggleMaskView.clientSecret
                        ? '*'.repeat(5)
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
                </dd>
              </div>
            )}
            <Title
              headingLevel="h3"
              size={TitleSizes['xl']}
              className="--pf-c-title--Size"
            >
              {t('connectorSpecific')}
            </Title>
            {connector &&
              Object.keys(connector).map((el) => {
                return (
                  <div className="pf-c-description-list__group">
                    <dt className="pf-c-description-list__term">
                      {_.startCase(el)}
                    </dt>
                    <dd className="pf-c-description-list__description">
                      {dataToHide.includes(el) ? (
                        <Flex>
                          <FlexItem>{'*'.repeat(5)}</FlexItem>
                        </Flex>
                      ) : (
                        connector[el]
                      )}
                    </dd>
                  </div>
                );
              })}
            {kafkaTopic &&
              Object.keys(kafkaTopic).map((el) => {
                return (
                  <div className="pf-c-description-list__group">
                    <dt className="pf-c-description-list__term">
                      {_.startCase(el)}
                    </dt>
                    <dd className="pf-c-description-list__description">
                      {kafkaTopic[el]}
                    </dd>
                  </div>
                );
              })}
            {connector === undefined &&
              Object.keys(modifiedObject).map((el) => {
                return (
                  <div className="pf-c-description-list__group">
                    <dt className="pf-c-description-list__term">
                      {_.startCase(el)}
                    </dt>
                    <dd className="pf-c-description-list__description">
                      {ConnectorProperties(el, modifiedObject, dataToHide)}
                    </dd>
                  </div>
                );
              })}
            {userErrorHandler && !configurationSteps && (
              <>
                <Title
                  headingLevel="h3"
                  size={TitleSizes['xl']}
                  className="--pf-c-title--Size"
                >
                  {t('errorHandling')}
                </Title>
                <div className="pf-c-description-list__group">
                  <dt className="pf-c-description-list__term">
                    {t('errorHandlingMethod')}
                  </dt>
                  <dd className="pf-c-description-list__description">
                    {returnErrorHandlersNames(userErrorHandler).errorHandler}
                  </dd>
                </div>
                {topic && (
                  <div className="pf-c-description-list__group">
                    <dt className="pf-c-description-list__term">
                      {t('deadLetterQueueTopic')}
                    </dt>
                    <dd className="pf-c-description-list__description">
                      {topic}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </>
      )}
    </StepBodyLayout>
  );
};

type DataShape = {
  data: any;
};
export const DataShape: FC<DataShape> = ({ data }) => {
  return (
    <>
      {Object.keys(data).map((key) => {
        return (
          <div className="pf-c-description-list__group">
            <dt className="pf-c-description-list__term">{_.startCase(key)}:</dt>
            <dd className="pf-c-description-list__description">
              {typeof data[key] === 'string' ? data[key] : data[key].format}
            </dd>
          </div>
        );
      })}
    </>
  );
};
