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
import { kafkasMachine } from '@kas-connectors/machines';
import React from 'react';

export type SelectKafkaInstanceProps = {
  actor: ActorRefFrom<typeof kafkasMachine>;
};

export function SelectKafkaInstance({ actor }: SelectKafkaInstanceProps) {
  const [state, send] = useActor(actor);

  const onSelect = (selectedInstance: string) => {
    send({ type: 'selectInstance', selectedInstance });
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
                Select Kafka instance
              </Text>
              <Text component="p">
                This is a demo that showcases Patternfly Cards.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection isFilled>
            <Gallery hasGutter>
              {state.context.instances?.items.map(i => (
                <Card
                  isHoverable
                  key={i.id}
                  isSelectable
                  isSelected={state.context.selectedInstance?.id === i.id}
                  onClick={() => onSelect(i.id!)}
                >
                  <CardHeader>
                    <CardTitle>{i.name}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Region</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.region}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Owner</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.owner}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>
                          {i.created_at}
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
