import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Button,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import { OutlinedClockIcon } from '@patternfly/react-icons';

import { KafkaInstance } from '@rhoas/app-services-ui-shared';

import './ConnectorInfoTextList.css';

type AlertType = 'info' | 'warning' | 'danger' | undefined;

export type ConnectorInfoTextListProps = {
  name: string;
  id: string;
  type?: string;
  bootstrapServer: string;
  kafkaId: string | KafkaInstance | ReactNode;
  owner: string;
  namespaceId: string | ReactNode;
  namespaceMsg?: string | undefined;
  namespaceMsgVariant: AlertType;
  createdAt: Date;
  modifiedAt: Date;
  error?: string;
};

export const ConnectorInfoTextList: FunctionComponent<ConnectorInfoTextListProps> =
  ({
    name,
    id,
    type,
    bootstrapServer,
    kafkaId,
    owner,
    namespaceId,
    namespaceMsg,
    namespaceMsgVariant,
    createdAt,
    modifiedAt,
    error,
  }) => {
    const { t } = useTranslation();
    const [failureReasonExpand, setFailureReasonExpand] = React.useState(false);
    const getFailureReason = (value: string): ReactNode => {
      if ((value as string).length > 200) {
        return (
          <>
            {!failureReasonExpand && (value as string).length > 200
              ? (value as string).substring(0, 200) + '... '
              : value}

            <Button
              onClick={() => setFailureReasonExpand(!failureReasonExpand)}
              variant={'link'}
            >
              {failureReasonExpand ? t('viewLess') : t('viewMore')}
            </Button>
          </>
        );
      }
      return value;
    };
    const textListItem = (
      title: string,
      value?: string | KafkaInstance | ReactNode
    ) => (
      <>
        {value && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              {title}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {(() => {
                switch (title) {
                  case t('failureReason'):
                    return getFailureReason(value as string);
                  case t('kafkaInstance'):
                    return (value as KafkaInstance)?.name ? (
                      <Button
                        className="Kafka-link-button"
                        variant="link"
                        onClick={() => {
                          window.open(
                            'https://console.redhat.com/application-services/streams/kafkas/' +
                              (value as KafkaInstance).id,
                            '_blank'
                          );
                        }}
                      >
                        {(value as KafkaInstance).name}
                      </Button>
                    ) : typeof value === 'string' ? (
                      <Text
                        component={TextVariants.p}
                        className="pf-u-color-400"
                      >
                        {value}
                      </Text>
                    ) : (
                      value
                    );
                  default:
                    return value;
                }
              })()}
            </TextListItem>
          </>
        )}
      </>
    );
    return (
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {textListItem(t('connector'), name)}
          {textListItem(t('connectorId'), id)}
          {textListItem(t('connectorType'), type)}
          {textListItem(t('bootstrapServer'), bootstrapServer)}
          {textListItem(t('kafkaInstance'), kafkaId)}
          {textListItem(t('namespace'), namespaceId)}
          {namespaceMsg &&
            textListItem(
              t(''),
              <Alert
                customIcon={<OutlinedClockIcon />}
                className="my-class"
                variant={namespaceMsgVariant}
                isInline
                isPlain
                title={namespaceMsg}
              />
            )}
          {textListItem(t('owner'), owner)}
          {textListItem(
            t('timeCreated'),
            <time
              title={t('{{date}}', { date: createdAt })}
              dateTime={createdAt.toISOString()}
            >
              {t('{{ date, ago }}', { date: createdAt })}
            </time>
          )}
          {textListItem(
            t('timeUpdated'),
            <time
              title={t('{{date}}', { date: modifiedAt })}
              dateTime={modifiedAt.toISOString()}
            >
              {t('{{ date, ago }}', { date: modifiedAt })}
            </time>
          )}
          {textListItem(t('failureReason'), error)}
        </TextList>
      </TextContent>
    );
  };
