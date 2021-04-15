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
import { useSelector } from '@xstate/react';
import {
  ConnectorConfiguratorProps,
  ConnectorConfiguratorType,
  MultistepConfiguratorActorRef,
} from '@kas-connectors/machines';
import React from 'react';
import { useCreationWizardMachineService } from './CreationWizardContext';

const MultistepConfiguration: React.FunctionComponent<{
  Configurator: ConnectorConfiguratorType;
  actor: MultistepConfiguratorActorRef;
}> = ({ actor, Configurator }) => {
  const { activeStep, configuration, connector } = useSelector(
    actor,
    React.useCallback(
      (state: typeof actor.state) => ({
        connector: state.context.connector,
        activeStep: state.context.activeStep,
        configuration: state.context.configuration,
      }),
      [actor]
    )
  );

  return (
    <Configurator
      activeStep={activeStep!}
      configuration={configuration}
      connector={connector}
      onChange={(configuration, isValid) =>
        actor.send({ type: 'change', configuration, isValid })
      }
    />
  );
};

export type ConfigurationProps = {
  Configurator: React.ComponentType<ConnectorConfiguratorProps> | false;
};

export function Configuration() {
  const service = useCreationWizardMachineService();
  const {
    isLoading,
    hasErrors,
    Configurator,
    multistepConfiguratorRef,
  } = useSelector(
    service,
    React.useCallback(
      (state: typeof service.state) => ({
        isLoading: state.matches({ configureConnector: 'loadConfigurator' }),
        hasErrors: state.matches('failure'),
        Configurator: state.context.Configurator!,
        multistepConfiguratorRef: state.children.multistepConfiguratorRef as
          | MultistepConfiguratorActorRef
          | undefined,
      }),
      [service]
    )
  );

  switch (true) {
    case isLoading:
      return (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <Title size="lg" headingLevel="h4">
            Loading
          </Title>
        </EmptyState>
      );
    case hasErrors:
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
          <PageSection isFilled style={{ minHeight: 400 }}>
            {multistepConfiguratorRef && (
              <MultistepConfiguration
                actor={multistepConfiguratorRef}
                Configurator={Configurator}
              />
            )}
          </PageSection>
        </PageSection>
      );
  }
}
