import { useCreateConnectorWizardService } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { JsonSchemaConfigurator } from '@app/components/JsonSchemaConfigurator/JsonSchemaConfigurator';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { ConfiguratorActorRef } from '@app/machines/StepConfigurator.machine';
import {
  ConfigurationMode,
  ConnectorConfiguratorComponent,
  ConnectorConfiguratorProps,
} from '@app/machines/StepConfiguratorLoader.machine';
import {
  clearEmptyObjectValues,
  mapToObject,
  patchConfigurationObject,
} from '@utils/shared';
import _ from 'lodash';
import React, { ComponentType, FunctionComponent, useCallback } from 'react';

import { useSelector } from '@xstate/react';

import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

const ConnectedCustomConfigurator: FunctionComponent<{
  Configurator: ConnectorConfiguratorComponent;
  actor: ConfiguratorActorRef;
  duplicateMode: boolean | undefined;
}> = ({ actor, Configurator, duplicateMode }) => {
  let { activeStep, configuration, connector } = useSelector(
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
  if (duplicateMode) {
    let combineConfiguration = {};
    if (configuration instanceof Map) {
      combineConfiguration = {
        ...clearEmptyObjectValues(mapToObject(configuration)),
      };
    } else {
      combineConfiguration = {
        ...clearEmptyObjectValues(configuration),
      };
    }
    configuration = new Map(Object.entries(combineConfiguration));
  }
  return (
    <Configurator
      activeStep={activeStep}
      configuration={configuration}
      connector={connector}
      uiPath={
        duplicateMode ? ConfigurationMode.DUPLICATE : ConfigurationMode.CREATE
      }
      onChange={(configuration, isValid) => {
        actor.send({ type: 'change', configuration, isValid });
      }}
    />
  );
};

const ConnectedJsonSchemaConfigurator: FunctionComponent<{
  actor: ConfiguratorActorRef;
  duplicateMode: boolean | undefined;
}> = ({ actor, duplicateMode }) => {
  const { configuration, connector } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        connector: state.context.connector,
        configuration: state.context.configuration,
      }),
      [actor]
    )
  );
  const schema = (connector as ConnectorTypeAllOf).schema!;
  const initialConfiguration = patchConfigurationObject(schema, {} as any);
  return (
    <JsonSchemaConfigurator
      schema={schema}
      configuration={
        configuration
          ? patchConfigurationObject(schema, configuration as any)
          : initialConfiguration
      }
      duplicateMode={duplicateMode || false}
      onChange={(configuration, isValid) =>
        actor.send({ type: 'change', configuration, isValid })
      }
    />
  );
};

export const ConfiguratorStepDescription: FunctionComponent<{
  actor: ConfiguratorActorRef;
}> = ({ actor }) => {
  const { t } = useTranslation();
  let {
    activeStep,
    configuration: _configuration,
    connector: _connector,
  } = useSelector(
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
  const configuratorStepDescriptionText =
    activeStep === 1
      ? t('debeziumFilterStepDescription')
      : t('configurationStepDescription');
  return <>{configuratorStepDescriptionText}</>;
};

export type ConfiguratorStepProps = {
  Configurator: ComponentType<ConnectorConfiguratorProps> | false;
};

export const ConfiguratorStep: FunctionComponent = () => {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const {
    isLoading,
    hasErrors,
    Configurator,
    configuratorRef,
    hasCustomConfigurator,
    duplicateMode,
    configurationSteps,
    activeConfigurationStep,
  } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => {
        const isLoading = state.matches({
          configureConnector: 'loadConfigurator',
        });
        const hasErrors = state.matches('failure');
        const hasCustomConfigurator =
          state.context.Configurator !== false &&
          state.context.Configurator !== undefined;
        return {
          isLoading,
          hasErrors,
          hasCustomConfigurator,
          configuration: state.context.connectorConfiguration,
          Configurator: state.context.Configurator,
          duplicateMode: state.context.duplicateMode,
          configuratorRef: state.children
            .configuratorRef as ConfiguratorActorRef,
          configurationSteps: state.context.configurationSteps,
          activeConfigurationStep: state.context.activeConfigurationStep,
        };
      },
      [service]
    )
  );
  return (
    <StepBodyLayout
      title={
        typeof configurationSteps === 'object' &&
        activeConfigurationStep !== undefined
          ? t(configurationSteps[activeConfigurationStep])
          : t('connectorSpecific')
      }
      description={
        hasCustomConfigurator ? (
          <ConfiguratorStepDescription actor={configuratorRef} />
        ) : (
          t('configurationStepDescription')
        )
      }
    >
      {(() => {
        switch (true) {
          case isLoading:
            return (
              <EmptyState>
                <EmptyStateIcon variant="container" component={Spinner} />
                <Title size="lg" headingLevel="h4">
                  {t('loading')}
                </Title>
              </EmptyState>
            );
          case hasErrors:
            return (
              <EmptyState>
                <EmptyStateIcon icon={ExclamationCircleIcon} />
                <Title size="lg" headingLevel="h4">
                  {t('errorMessage')}
                </Title>
              </EmptyState>
            );
          case hasCustomConfigurator:
            return (
              <React.Suspense fallback={null}>
                <ConnectedCustomConfigurator
                  actor={configuratorRef}
                  Configurator={Configurator as ConnectorConfiguratorComponent}
                  duplicateMode={duplicateMode}
                />
              </React.Suspense>
            );
          default:
            return (
              <ConnectedJsonSchemaConfigurator
                actor={configuratorRef}
                duplicateMode={duplicateMode}
              />
            );
        }
      })()}
    </StepBodyLayout>
  );
};
