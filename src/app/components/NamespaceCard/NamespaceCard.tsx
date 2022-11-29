import React from 'react';

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
import { ConnectorNamespaceState } from '@rhoas/connector-management-sdk';

type NamespaceCardProps = {
  state: string;
  id: string;
  isEval: boolean;
  name: string;
  owner: string;
  clusterId: string;
  clusterName: string;
  createdAt: string;
  selectedNamespace: string;
  onSelect: (selectedNamespace: string) => void;
  connectorsApiBasePath: string;
  getToken: () => Promise<string>;
};

export const NamespaceCard: React.FunctionComponent<NamespaceCardProps> = ({
  state,
  id,
  isEval,
  name,
  owner,
  clusterId,
  clusterName,
  createdAt,
  selectedNamespace,
  onSelect,
}) => {
  const { t } = useTranslation();

  const onNamespaceSelection = () => {
    state === ConnectorNamespaceState.Ready && onSelect(id);
  };

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
            <DescriptionListDescription>{clusterId}</DescriptionListDescription>
          </DescriptionListGroup>
          {isEval ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('owner')}</DescriptionListTerm>
              <DescriptionListDescription>{owner}</DescriptionListDescription>
            </DescriptionListGroup>
          ) : (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('clusterName')}</DescriptionListTerm>
              <DescriptionListDescription>
                {clusterName ? (
                  <Truncate position="end" content={clusterName} />
                ) : (
                  <Skeleton
                    fontSize="sm"
                    screenreaderText="Loading cluster name"
                  />
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

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
