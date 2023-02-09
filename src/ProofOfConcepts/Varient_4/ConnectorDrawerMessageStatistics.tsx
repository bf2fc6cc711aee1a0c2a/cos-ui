import React from 'react';
import { FunctionComponent } from 'react';

import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Flex,
  FlexItem,
  TextContent,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  Title,
  TitleSizes,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExclamationIcon } from '@patternfly/react-icons';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorDrawer.css';

type ConnectorDrawerMessageStatisticsProps = {
  expireTime: string;
  numberSent: string;
  numberNotSent: string;
  errorHandlingMethodInfo: string;
  deadLetterQueueTopicInfo: string;
};

export const ConnectorDrawerMessageStatistics: FunctionComponent<ConnectorDrawerMessageStatisticsProps> =
  ({
    expireTime,
    numberSent,
    numberNotSent,
    errorHandlingMethodInfo,
    deadLetterQueueTopicInfo,
  }) => {
    const { t } = useTranslation('cos-ui');
    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Alert
            variant="warning"
            isInline
            title={
              <Trans
                ns={'cos-ui'}
                i18nKey={'expireTimeLimit'}
                values={{
                  expireTime,
                }}
              />
            }
          />
        </FlexItem>
        <FlexItem>
          {/** headingLevel="h3" size={TitleSizes['lg']}*/}
          <Card>
            <CardBody>
              <DescriptionList columnModifier={{ default: '2Col' }}>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    <Title headingLevel="h3" size={TitleSizes['lg']}>
                      {t('messagesSentV4')}
                    </Title>
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <CheckIcon className="pf-u-icon-color-green" />
                    {numberSent}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    <Title headingLevel="h3" size={TitleSizes['lg']}>
                      {t('messagesNotSentV4')}
                    </Title>
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <ExclamationIcon className="pf-u-icon-color-red" />
                    {numberNotSent}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
            <CardFooter className="grey-text">
              {t('processedMessagesInfo')}
            </CardFooter>
          </Card>
        </FlexItem>
        <FlexItem>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {t('errorHandlingMethod')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {errorHandlingMethodInfo}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {t('deadLetterQueueTopic')}
              </TextListItem>
              <TextListItem
                className="pf-u-link-color"
                component={TextListItemVariants.dd}
              >
                {deadLetterQueueTopicInfo}
              </TextListItem>
            </TextList>
          </TextContent>
        </FlexItem>
        <FlexItem>
          <Divider />
        </FlexItem>
      </Flex>
    );
  };
