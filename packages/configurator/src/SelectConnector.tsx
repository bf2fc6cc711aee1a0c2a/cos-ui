import { ConnectorsMachineActorRef } from '@kas-connectors/machines';
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
import React from 'react';

export type SelectConnectorProps = {
  actor: ConnectorsMachineActorRef;
};

export function SelectConnector({ actor }: SelectConnectorProps) {
  const [state, send] = useActor(actor);

  const onSelect = (selectedConnector: string) => {
    send({ type: 'selectConnector', selectedConnector });
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
                Select connector
              </Text>
              <Text component="p">
                This is a demo that showcases Patternfly Cards.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection isFilled>
            <Gallery hasGutter>
              {state.context.connectors?.items.map(c => (
                <Card
                  isHoverable
                  key={c.id}
                  isSelectable
                  isSelected={state.context.selectedConnector?.id === c.id}
                  onClick={() => onSelect(c.id!)}
                >
                  <CardHeader>
                    <CardTitle>{c.name}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          {c.description}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Version</DescriptionListTerm>
                        <DescriptionListDescription>
                          {c.version}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>ID</DescriptionListTerm>
                        <DescriptionListDescription>
                          {c.id}
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
