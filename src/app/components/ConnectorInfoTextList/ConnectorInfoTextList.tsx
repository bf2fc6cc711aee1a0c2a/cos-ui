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
  owner: string;
  namespaceData: ConnectorNamespace | ReactNode;
  createdAt: Date;
  modifiedAt: Date;
  error?: string;
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
  error,
  onDuplicateConnector,
}) => {
  const { t } = useTranslation();
  const [failureReasonExpand, setFailureReasonExpand] = React.useState(false);

  const getConnectorExpireInlineAlert = (expiration: string): string => {
    const { hours, min } = getPendingTime(new Date(expiration));
    if (hours < 0 || min < 0) {
      return t('connectorExpiredInline');
    }
    return t('connectorExpireInline', { hours, min });
  };

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
                        {t('duplicateConnector')}
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
              t('namespace'),
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
      </div>
    </>
  );
};
