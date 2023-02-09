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
  CardTitle,
  Grid,
  GridItem,
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
    expireTime = 'whhw',
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
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size={TitleSizes['lg']}>
                {t('processedMessagesTitle')}
              </Title>
            </CardTitle>
            {/** split, grid, --desc list */}
            <CardBody className="sent-spacing">
              <Grid hasGutter span={3}>
                <GridItem span={8}>
                  <CheckIcon className="pf-u-icon-color-green" />
                  <Trans
                    ns={'cos-ui'}
                    i18nKey={'messagesSent'}
                    values={{
                      numberSent,
                    }}
                  />
                </GridItem>
                <GridItem>
                  <ExclamationIcon className="pf-u-icon-color-red" />
                  <Trans
                    ns={'cos-ui'}
                    i18nKey={'messagesNotSent'}
                    values={{
                      numberNotSent,
                    }}
                  />
                </GridItem>
              </Grid>
            </CardBody>
            <CardFooter className="processed-messages-info">
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
