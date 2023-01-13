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
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
          <DescriptionList
            isHorizontal
            horizontalTermWidthModifier={{
              default: '12ch',
              sm: '15ch',
              md: '20ch',
              lg: '28ch',
              xl: '30ch',
              '2xl': '35ch',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('connectorCategory')}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {(connectorType as ConnectorTypeAllOf).description}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('kafkaInstance')}</DescriptionListTerm>
              <DescriptionListDescription>
                {kafka.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {namespace.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <Title
              headingLevel="h3"
              size={TitleSizes['lg']}
              className="--pf-c-title--Title-size"
            >
              {t('basic')}
            </Title>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('connectorName')}</DescriptionListTerm>
              <DescriptionListDescription>{name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('type')}</DescriptionListTerm>
              <DescriptionListDescription>
                {(connectorType as ConnectorTypeAllOf).labels?.map(
                  (type) => type
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {userServiceAccount?.clientId && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('clientId')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex>
                    <FlexItem id="clientId">
                      {userServiceAccount?.clientId}
                    </FlexItem>
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {userServiceAccount?.clientSecret && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('clientSecret')}</DescriptionListTerm>
                <DescriptionListDescription>
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
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <Title
              headingLevel="h3"
              size={TitleSizes['lg']}
              className="--pf-c-title--Title-size"
            >
              {t('connectorSpecific')}
            </Title>
            {connector &&
              Object.keys(connector).map((el) => {
                return (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{_.startCase(el)}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {dataToHide.includes(el) ? (
                        <Flex>
                          <FlexItem>{'*'.repeat(5)}</FlexItem>
                        </Flex>
                      ) : (
                        connector[el]
                      )}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                );
              })}
            {kafkaTopic &&
              Object.keys(kafkaTopic).map((el) => {
                return (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{_.startCase(el)}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {kafkaTopic[el]}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                );
              })}
            {connector === undefined &&
              Object.keys(modifiedObject).map((el) => {
                return (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{_.startCase(el)}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {ConnectorProperties(el, modifiedObject, dataToHide)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                );
              })}
            {userErrorHandler && !configurationSteps && (
              <>
                <Title
                  headingLevel="h3"
                  size={TitleSizes['lg']}
                  className="--pf-c-title--Title-size"
                >
                  {t('errorHandling')}
                </Title>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {t('errorHandlingMethod')}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {returnErrorHandlersNames(userErrorHandler).errorHandler}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {topic && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t('deadLetterQueueTopic')}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {topic}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </>
            )}
          </DescriptionList>
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
          <DescriptionListGroup>
            <DescriptionListTerm>{_.startCase(key)}:</DescriptionListTerm>
            <DescriptionListDescription>
              {typeof data[key] === 'string' ? data[key] : data[key].format}
            </DescriptionListDescription>
          </DescriptionListGroup>
        );
      })}
    </>
  );
};
