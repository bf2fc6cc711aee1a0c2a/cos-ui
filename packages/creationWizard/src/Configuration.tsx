import {
  ConnectorConfiguratorComponent,
  ConnectorConfiguratorProps,
  ConfiguratorActorRef,
} from '@kas-connectors/machines';
import {
  EmptyState,
  EmptyStateIcon,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useSelector } from '@xstate/react';
import React, { ComponentType, FunctionComponent, useCallback } from 'react';
import { useCreationWizardMachineService } from './CreationWizardContext';

const ConnectedCustomConfigurator: FunctionComponent<{
  Configurator: ConnectorConfiguratorComponent;
  actor: ConfiguratorActorRef;
}> = ({ actor, Configurator }) => {
  const { activeStep, configuration, connector } = useSelector(
    actor,
    useCallback(
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
      activeStep={activeStep}
      configuration={configuration}
      connector={connector}
      onChange={(configuration, isValid) =>
        actor.send({ type: 'change', configuration, isValid })
      }
    />
  );
};

export type ConfigurationProps = {
  Configurator: ComponentType<ConnectorConfiguratorProps> | false;
};

export const Configuration: FunctionComponent = () => {
  const service = useCreationWizardMachineService();
  const {
    isLoading,
    hasErrors,
    Configurator,
    configuratorRef,
    hasCustomConfigurator,
  } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => {
        const isLoading = state.matches({ configureConnector: 'loadConfigurator' });
        const hasErrors = state.matches('failure');
        const hasCustomConfigurator = state.context.Configurator !== false && state.context.Configurator !== undefined;
        return {
          isLoading,
          hasErrors,
          hasCustomConfigurator,
          configuration: state.context.connectorData,
          Configurator: state.context.Configurator,
          configuratorRef: state.children.configuratorRef as ConfiguratorActorRef,
        };
      },
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
    case hasCustomConfigurator:
      return (
        <PageSection variant="light">
          <ConnectedCustomConfigurator
            actor={configuratorRef}
            Configurator={Configurator as ConnectorConfiguratorComponent}
          />
        </PageSection>
      );
    default:
      return (
        <PageSection variant="light">
          TODO: json-schema based form
        </PageSection>
      )
  }
};
