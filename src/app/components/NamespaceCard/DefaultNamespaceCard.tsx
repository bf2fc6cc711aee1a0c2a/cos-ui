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
  Skeleton,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  ConnectorCluster,
  ConnectorNamespaceState,
} from '@rhoas/connector-management-sdk';

type DefaultNamespaceCardProps = {
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

export const DefaultNamespaceCard: React.FunctionComponent<DefaultNamespaceCardProps> =
  ({
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
        isSelected={selectedNamespace === id}
        isDisabledRaised={state !== ConnectorNamespaceState.Ready}
        onSelectableInputChange={onNamespaceSelection}
        isSelectableRaised
        id={`${id}-card`}
        onClick={onNamespaceSelection}
        hasSelectableInput
      >
        <CardHeader>
          <Stack>
            <StackItem>
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
                        aria-label={t('provisioning')}
                        aria-valuetext="Please wait..."
                      />
                    }
                    isInline
                    isPlain
                    title={t('provisioning')}
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
            <DescriptionListGroup>
              <DescriptionListTerm>{t('clusterId')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterId}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('clusterName')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterDetails?.name ? (
                  <Truncate position="end" content={clusterDetails?.name} />
                ) : (
                  <Skeleton fontSize="sm" screenreaderText="Loading cluster name" />
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
