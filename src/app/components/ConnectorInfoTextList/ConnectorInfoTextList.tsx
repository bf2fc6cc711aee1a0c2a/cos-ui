import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';

export type ConnectorInfoTextListProps = {
  name: string;
  id: string;
  type?: string;
  bootstrapServer: string;
  kafkaId: string;
  owner: string;
  namespaceId: string;
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
    createdAt,
    modifiedAt,
    error,
  }) => {
    const { t } = useTranslation();
    const textListItem = (title: string, value?: ReactNode) => (
      <>
        {value && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              {title}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {value}
            </TextListItem>
          </>
        )}
      </>
    );
    return (
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {textListItem('Connector', name)}
          {textListItem('Connector Id', id)}
          {textListItem('Connector type', type)}
          {textListItem('Bootstrap server', bootstrapServer)}
          {textListItem('Kafka_instance', kafkaId)}
          {textListItem('Deployment namespace', namespaceId)}
          {textListItem('Owner', owner)}
          {textListItem(
            'Time created',
            <time
              title={t('{{date}}', { date: createdAt })}
              dateTime={createdAt.toISOString()}
            >
              {t('{{ date, ago }}', { date: createdAt })}
            </time>
          )}
          {textListItem(
            'Time updated',
            <time
              title={t('{{date}}', { date: modifiedAt })}
              dateTime={modifiedAt.toISOString()}
            >
              {t('{{ date, ago }}', { date: modifiedAt })}
            </time>
          )}
          {textListItem('Failure Reason', error)}
        </TextList>
      </TextContent>
    );
  };
