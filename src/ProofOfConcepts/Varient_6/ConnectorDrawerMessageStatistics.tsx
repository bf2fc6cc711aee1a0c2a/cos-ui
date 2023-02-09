import React from 'react';
import { FunctionComponent } from 'react';

import {
  Alert,
  Card,
  Divider,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  TextVariants,
  Title,
  TitleSizes,
  CardTitle,
  Split,
  SplitItem,
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
        {/** size={TitleSizes['lg'] */}
        <FlexItem>
          <Title headingLevel="h3">{t('processedMessagesTitle')}</Title>
        </FlexItem>

        <FlexItem>
          <Split hasGutter>
            <SplitItem isFilled>
              <Card>
                <CardTitle>
                  <Title headingLevel="h3" size={TitleSizes['lg']}>
                    <Flex>
                      <FlexItem>
                        <CheckIcon className="pf-u-icon-color-green" />
                      </FlexItem>
                      <FlexItem>
                        <Trans
                          ns={'cos-ui'}
                          i18nKey={'messagesSent'}
                          values={{
                            numberSent,
                          }}
                        />
                      </FlexItem>
                    </Flex>
                  </Title>
                </CardTitle>
              </Card>
            </SplitItem>
            <SplitItem isFilled>
              <Card>
                <CardTitle>
                  <Title headingLevel="h3" size={TitleSizes['lg']}>
                    <Flex>
                      <FlexItem>
                        <ExclamationIcon className="pf-u-icon-color-red" />
                      </FlexItem>
                      <FlexItem>
                        <Trans
                          ns={'cos-ui'}
                          i18nKey={'messagesNotSent'}
                          values={{
                            numberNotSent,
                          }}
                        />
                      </FlexItem>
                    </Flex>
                  </Title>
                </CardTitle>
              </Card>
            </SplitItem>
          </Split>
        </FlexItem>
        <FlexItem>
          <TextContent>
            <Text component={TextVariants.small}>
              {t('processedMessagesInfo')}
            </Text>
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
