import {
  EmptyState,
  EmptyStateIcon,
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
import { configuratorMachine } from '@kas-connectors/machines';
import React from 'react';

export type ConfigurationProps = {
  actor: ActorRefFrom<typeof configuratorMachine>;
};

export function Configuration({ actor }: ConfigurationProps) {
  const [state, send] = useActor(actor);
  const { Configurator, activeStep, connector, configuration } = state.context;
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
                Connector Configuration
              </Text>
              <Text component="p">
                This is a demo that showcases Patternfly Cards.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection isFilled style={{ minHeight: 600 }}>
            {Configurator ? (
              <Configurator
                activeStep={activeStep!}
                configuration={configuration}
                connector={connector}
                onChange={(configuration, isValid) =>
                  send({ type: 'configurationChange', configuration, isValid })
                }
              />
            ) : (
              <p>TODO json-schema based form</p>
            )}
          </PageSection>
        </PageSection>
      );
  }
}
