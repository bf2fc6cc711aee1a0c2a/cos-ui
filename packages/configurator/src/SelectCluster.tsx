import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateIcon,
  Gallery,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useActor } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { clustersMachine } from '@kas-connectors/machines';
import React from 'react';

export type SelectClusterProps = {
  actor: ActorRefFrom<typeof clustersMachine>;
};

export function SelectCluster({ actor }: SelectClusterProps) {
  const [state, send] = useActor(actor);

  const onSelect = (selectedCluster: string) => {
    send({ type: 'selectCluster', selectedCluster });
  };

  switch (true) {
    case state.matches('loading'):
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );
    case state.matches('failure'):
      return (
        <EmptyState>
          <EmptyStateIcon icon={ExclamationCircleIcon} />
          <Title size="lg" headingLevel="h4">
            Error message
          </Title>
        </EmptyState>
      );
    default:
      return (
        <PageSection padding={{ default: 'noPadding' }}>
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1" id="select-kafka-instance-title">
                Select OCM Cluster
              </Text>
              <Text component="p">
                This is a demo that showcases Patternfly Cards.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection isFilled>
            <Gallery hasGutter>
              {state.context.clusters?.items.map(i => (
                <Card
                  isHoverable
                  key={i.id}
                  isSelectable
                  isSelected={state.context.selectedCluster?.id === i.id}
                  onClick={() => onSelect(i.id!)}
                >
                  <CardHeader>
                    <CardTitle>{i.metadata?.name}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Group</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.metadata?.group}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Owner</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.metadata?.owner}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.metadata?.created_at}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              ))}
            </Gallery>
          </PageSection>
        </PageSection>
      );
  }
}
