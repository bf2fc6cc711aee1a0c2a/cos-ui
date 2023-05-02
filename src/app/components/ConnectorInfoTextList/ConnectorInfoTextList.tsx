import { getPendingTime, warningType } from '@utils/shared';
import React, { FunctionComponent, ReactNode } from 'react';

import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import {
  ClockIcon,
  HelpIcon,
  OutlinedClockIcon,
} from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { KafkaInstance } from '@rhoas/app-services-ui-shared';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import './ConnectorInfoTextList.css';

export type ConnectorInfoTextListProps = {
  name: string;
  id: string;
  type?: string;
  bootstrapServer: string;
  kafkaInstanceData: string | KafkaInstance | ReactNode;
  owner?: string;
  namespaceData: ConnectorNamespace | ReactNode;
  createdAt?: Date;
  modifiedAt?: Date;
  onDuplicateConnector: (id: string) => void;
};

export const ConnectorInfoTextList: FunctionComponent<
  ConnectorInfoTextListProps
> = ({
  name,
  id,
  type,
  bootstrapServer,
  kafkaInstanceData,
  owner,
  namespaceData,
  createdAt,
  modifiedAt,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();

  const getConnectorExpireInlineAlert = (expiration: string): string => {
    const { hours, min } = getPendingTime(new Date(expiration));
    if (hours < 0 || min < 0) {
      return t('connectorExpiredInline');
    }
    return t('connectorExpireInline', { hours, min });
  };

  const textListItem: (
    title: string,
    value?: string | KafkaInstance | ReactNode
  ) => ReactNode = (title, value?) => (
    <>
      {value && (
        <>
          <TextListItem component={TextListItemVariants.dt}>
            {title}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {(() => {
              switch (title) {
                case t('kafkaInstance'):
                  return (value as KafkaInstance)?.name ? (
                    <Button
                      className="pf-u-p-0"
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
                    <>
                      <Text
                        component={TextVariants.p}
                        className="pf-u-color-400"
                      >
                        {value}
                      </Text>
                      <Button
                        className="pf-u-p-0"
                        variant="link"
                        onClick={() => onDuplicateConnector(id)}
                      >
                        {t('duplicateConnectorsInstance')}
                      </Button>
                      <Popover
                        aria-label="Duplicate button helper"
                        bodyContent={<div>{t('duplicateButtonHelper')}</div>}
                      >
                        <Button variant="link" icon={<HelpIcon />}></Button>
                      </Popover>
                    </>
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
    <>
      {(namespaceData as ConnectorNamespace)?.expiration && (
        <Alert
          customIcon={<ClockIcon />}
          className="pf-u-mt-md"
          variant={warningType(
            new Date((namespaceData as ConnectorNamespace)?.expiration!)
          )}
          isInline
          title={getConnectorExpireInlineAlert(
            (namespaceData as ConnectorNamespace)?.expiration!
          )}
        />
      )}
      <div className="connector-drawer__tab-content">
        <TextContent>
          <TextList component={TextListVariants.dl}>
            {textListItem(t('connector'), name)}
            {textListItem(t('connectorId'), id)}
            {textListItem(t('connectorType'), type)}
            {textListItem(t('bootstrapServer'), bootstrapServer)}
            {textListItem(t('kafkaInstance'), kafkaInstanceData)}
            {textListItem(
              t('deployment'),
              (namespaceData as ConnectorNamespace).name
                ? (namespaceData as ConnectorNamespace).name
                : namespaceData
            )}
            {(namespaceData as ConnectorNamespace)?.expiration &&
              textListItem(
                t(''),
                <Alert
                  customIcon={<OutlinedClockIcon />}
                  className="namespace-expiration-alert"
                  variant={warningType(
                    new Date((namespaceData as ConnectorNamespace)?.expiration!)
                  )}
                  isInline
                  isPlain
                  title={getConnectorExpireInlineAlert(
                    (namespaceData as ConnectorNamespace)?.expiration!
                  )}
                />
              )}
            {textListItem(t('owner'), owner)}
            {createdAt ? (
              textListItem(
                t('timeCreated'),
                <time
                  title={t('{{date}}', { date: createdAt })}
                  dateTime={createdAt.toISOString()}
                >
                  {t('{{ date, ago }}', { date: createdAt })}
                </time>
              )
            ) : (
              <></>
            )}
            {modifiedAt ? (
              textListItem(
                t('timeUpdated'),
                <time
                  title={t('{{date}}', { date: modifiedAt })}
                  dateTime={modifiedAt.toISOString()}
                >
                  {t('{{ date, ago }}', { date: modifiedAt })}
                </time>
              )
            ) : (
              <></>
            )}
          </TextList>
        </TextContent>
      </div>
    </>
  );
};
