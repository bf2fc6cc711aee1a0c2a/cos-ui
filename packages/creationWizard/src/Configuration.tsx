import {
  ConnectorConfiguratorComponent,
  ConnectorConfiguratorProps,
  MultistepConfiguratorActorRef,
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

const MultistepConfiguration: FunctionComponent<{
  Configurator: ConnectorConfiguratorComponent;
  actor: MultistepConfiguratorActorRef;
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
  Configurator: ComponentType<ConnectorConfiguratorProps> | false;
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
    useCallback(
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
        <PageSection variant="light">
          {multistepConfiguratorRef && Configurator && (
            <MultistepConfiguration
              actor={multistepConfiguratorRef}
              Configurator={Configurator}
            />
          )}
          {!multistepConfiguratorRef && <>TODO json-schema based form</>}
        </PageSection>
      );
  }
}
