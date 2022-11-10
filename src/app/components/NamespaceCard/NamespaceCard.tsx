import { getCluster } from '@apis/api';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Card,
  CardHeader,
  Stack,
  StackItem,
  CardTitle,
  Alert,
  Spinner,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Truncate,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  ConnectorCluster,
  ConnectorNamespaceState,
} from '@rhoas/connector-management-sdk';

type NamespaceCardProps = {
  state: string;
  id: string;
  name: string;
  clusterId: string;
  createdAt: string;
  selectedNamespace: string;
  onSelect: (selectedNamespace: string) => void;
  connectorsApiBasePath: string;
  getToken: () => Promise<string>;
};

export const NamespaceCard: React.FunctionComponent<NamespaceCardProps> = ({
  state,
  id,
  name,
  clusterId,
  createdAt,
  selectedNamespace,
  onSelect,
  connectorsApiBasePath,
  getToken,
}) => {
  const { t } = useTranslation();

  const [clusterDetails, setClusterDetails] = useState<ConnectorCluster>();

  const onNamespaceSelection = () => {
    state === ConnectorNamespaceState.Ready && onSelect(id);
  };

  const getClusterInfo = useCallback((data) => {
    setClusterDetails(data as ConnectorCluster);
  }, []);

  useEffect(() => {
    if (id) {
      getCluster({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        clusterId: clusterId,
      })(getClusterInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterId]);

  return (
    <Card
      isHoverable={state === ConnectorNamespaceState.Ready}
      isSelectable={state === ConnectorNamespaceState.Ready}
      isSelected={selectedNamespace === id}
      onClick={onNamespaceSelection}
      className={
        state === ConnectorNamespaceState.Deleting ||
        state === ConnectorNamespaceState.Deleted
          ? 'pf-u-background-color-disabled-color-200'
          : ''
      }
    >
      <CardHeader>
        <Stack>
          <StackItem>
            {' '}
            <CardTitle>{name}</CardTitle>
          </StackItem>
          <StackItem>
            {state === ConnectorNamespaceState.Disconnected && (
              <div className="pf-u-pt-md status">
                <Alert
                  variant="info"
                  customIcon={
                    <Spinner
                      size="md"
                      aria-label={t('Provisioning')}
                      aria-valuetext="Please wait..."
                    />
                  }
                  isInline
                  isPlain
                  title={t('Provisioning')}
                />
              </div>
            )}
            {(state === ConnectorNamespaceState.Deleting ||
              state === ConnectorNamespaceState.Deleted) && (
              <div className="pf-u-pt-md">
                <Alert
                  variant="danger"
                  isInline
                  isPlain
                  title={
                    state === ConnectorNamespaceState.Deleting
                      ? t('namespaceDeleting')
                      : t('deleted')
                  }
                />
              </div>
            )}
          </StackItem>
        </Stack>
      </CardHeader>
      <CardBody>
        <DescriptionList>
          {/*
           TODO 
          <DescriptionListGroup>
            <DescriptionListTerm>{t('owner')}</DescriptionListTerm>
            <DescriptionListDescription>
              {namespace.owner}
            </DescriptionListDescription>
          </DescriptionListGroup> */}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('clusterId')}</DescriptionListTerm>
            <DescriptionListDescription>{clusterId}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('clusterName')}</DescriptionListTerm>
            <DescriptionListDescription>
              {clusterDetails?.name ? (
                <Truncate position="end" content={clusterDetails?.name} />
              ) : (
                <Spinner size="md" />
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('created')}</DescriptionListTerm>
            <DescriptionListDescription>
              <time
                title={t('{{date}}', {
                  date: new Date(createdAt),
                })}
                dateTime={new Date(createdAt)?.toISOString()}
              >
                {t('{{ date, ago }}', {
                  date: new Date(createdAt),
                })}
              </time>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
