import React from 'react';

import {
  Card,
  CardHeader,
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
  CardActions,
  Label,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

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
  selectedNamespace: string;
  onSelect: (selectedNamespace: string) => void;
};

export const NamespaceCard: React.FunctionComponent<NamespaceCardProps> = ({
  state,
  id,
  isEval,
  name,
  owner,
  clusterId,
  clusterName,
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
        <CubesIcon size="lg" />
        {isEval && (
          <CardActions>
            <Label>{t('preview')}</Label>
          </CardActions>
        )}
      </CardHeader>
      <CardTitle>
        {name}
        {state === ConnectorNamespaceState.Disconnected && (
          <div className="pf-u-pt-sm">
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
          <div className="pf-u-pt-sm">
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
      </CardTitle>
      <CardBody>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('owner')}</DescriptionListTerm>
            <DescriptionListDescription>{owner}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('clusterId')}</DescriptionListTerm>
            <DescriptionListDescription>{clusterId}</DescriptionListDescription>
          </DescriptionListGroup>
          {!isEval && (
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
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
