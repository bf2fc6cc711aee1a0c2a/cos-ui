import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import {
  getFlattenedSteps,
  UncontrolledWizard,
  WizardStep,
} from '@app/components/UncontrolledWizard/UncontrolledWizard';
import { creationWizardMachine } from '@app/machines/CreateConnectorWizard.machine';
import { ConfiguratorActorRef } from '@app/machines/StepConfigurator.machine';
import { ConfiguratorStep } from '@app/pages/CreateConnectorPage/StepConfigurator';
import { SelectConnectorType } from '@app/pages/CreateConnectorPage/StepConnectorTypes';
import { StepCoreConfiguration } from '@app/pages/CreateConnectorPage/StepCoreConfiguration';
import { StepErrorHandling } from '@app/pages/CreateConnectorPage/StepErrorHandling';
import { SelectKafkaInstance } from '@app/pages/CreateConnectorPage/StepKafkas';
import { SelectNamespace } from '@app/pages/CreateConnectorPage/StepNamespace';
import { Review } from '@app/pages/CreateConnectorPage/StepReview';
import {
  CONNECTOR_SPECIFIC,
  CORE_CONFIGURATION,
  ERROR_HANDLING,
  REVIEW_CONFIGURATION,
  SELECT_CONNECTOR_TYPE,
  SELECT_KAFKA_INSTANCE,
  SELECT_NAMESPACE,
} from '@constants/constants';
import React, { FunctionComponent, useCallback } from 'react';

import { useSelector, useActor } from '@xstate/react';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './CreateConnectorWizard.css';
import { useCreateConnectorWizardService } from './CreateConnectorWizardContext';

function useKafkaInstanceStep() {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { isActive, canJumpTo, enableNext } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('selectKafka'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToSelectKafka')
            .changed || state.matches('selectKafka'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
      }),
      [service]
    )
  );
  return {
    name: t('kafkaInstance'),
    isActive,
    component: (
      <StepErrorBoundary>
        <SelectKafkaInstance />
      </StepErrorBoundary>
    ),
    canJumpTo,
    enableNext,
  };
}

function useCoreConfigurationStep() {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { isActive, canJumpTo, enableNext } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('coreConfiguration'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToCoreConfiguration')
            .changed || state.matches('coreConfiguration'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
      }),
      [service]
    )
  );
  return {
    name: t('core'),
    isActive,
    component: (
      <StepErrorBoundary>
        <StepCoreConfiguration />
      </StepErrorBoundary>
    ),
    canJumpTo,
    enableNext,
  };
}

function useConnectorSpecificStep() {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { isActive, canJumpTo, enableNext } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('configureConnector'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToConfigureConnector')
            .changed || state.matches('configureConnector'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
      }),
      [service]
    )
  );
  return {
    name: t('connectorSpecific'),
    isActive,
    component: (
      <StepErrorBoundary>
        <ConfiguratorStep />
      </StepErrorBoundary>
    ),
    canJumpTo,
    enableNext,
  };
}

function useErrorHandlingStep() {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { isActive, canJumpTo, enableNext } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('errorConfiguration'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToErrorConfiguration')
            .changed || state.matches('errorConfiguration'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
        activeStep: state.context.activeConfigurationStep,
      }),
      [service]
    )
  );
  return {
    name: t('errorHandling'),
    isActive,
    component: (
      <StepErrorBoundary>
        <StepErrorHandling />
      </StepErrorBoundary>
    ),
    canJumpTo,
    enableNext,
  };
}

export type CreateConnectorWizardProps = {
  onClose: () => void;
};

export const CreateConnectorWizard: FunctionComponent<
  CreateConnectorWizardProps
> = ({ onClose }) => {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const [state, send] = useActor(service);
  const { hasCustomConfigurator, activeStep, configureSteps } = useSelector(
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
          activeStep: state.context.activeConfigurationStep,
          configuration: state.context.connectorConfiguration,
          configureSteps: state.context.configurationSteps,
          Configurator: state.context.Configurator,
          configuratorRef: state.children
            .configuratorRef as ConfiguratorActorRef,
        };
      },
      [service]
    )
  );
  const kafkaInstanceStep = useKafkaInstanceStep();
  const coreConfigurationStep = useCoreConfigurationStep();
  const connectorSpecificStep = useConnectorSpecificStep();
  const errorHandlingStep = useErrorHandlingStep();

  if (state.value === 'saved') return null;

  const determineStepNameFromState = () => {
    switch (true) {
      case state.hasTag(SELECT_CONNECTOR_TYPE):
        return SELECT_CONNECTOR_TYPE;
      case state.hasTag(SELECT_KAFKA_INSTANCE):
        return SELECT_KAFKA_INSTANCE;
      case state.hasTag(SELECT_NAMESPACE):
        return SELECT_NAMESPACE;
      case state.hasTag(CORE_CONFIGURATION):
        return CORE_CONFIGURATION;
      case state.hasTag(CONNECTOR_SPECIFIC):
        return CONNECTOR_SPECIFIC;
      case state.hasTag(ERROR_HANDLING):
        return ERROR_HANDLING;
      case state.hasTag(REVIEW_CONFIGURATION):
        return REVIEW_CONFIGURATION;
      default:
        throw `Can't figure out the current step name from current state tags: ${state.tags} `;
    }
  };

  const canJumpToStep = (idx: number) => {
    return creationWizardMachine.transition(state, {
      type: 'jumpToConfigureConnector',
      subStep: idx,
    }).changed;
  };

  const loadSubSteps = () => {
    if (
      hasCustomConfigurator &&
      configureSteps &&
      typeof configureSteps !== 'undefined'
    ) {
      return [
        coreConfigurationStep,
        ...(configureSteps as string[]).map((step, idx) => {
          const isActive: boolean =
            state.matches('configureConnector') && activeStep === idx;
          return {
            name: step,
            isActive,
            component: (
              <StepErrorBoundary>
                <ConfiguratorStep />
              </StepErrorBoundary>
            ),
            canJumpTo: canJumpToStep(idx + 1),
            enableNext: creationWizardMachine.transition(state, 'next').changed,
          };
        }),
      ];
    } else {
      return [coreConfigurationStep, connectorSpecificStep, errorHandlingStep];
    }
  };

  const steps = [
    {
      name: t('connector'),
      isActive: state.matches('selectConnector'),
      component: (
        <StepErrorBoundary>
          <SelectConnectorType />
        </StepErrorBoundary>
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectConnector')
          .changed || state.matches('selectConnector'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    kafkaInstanceStep,
    {
      name: t('namespace'),
      isActive: state.matches('selectNamespace'),
      component: (
        <StepErrorBoundary>
          <SelectNamespace />
        </StepErrorBoundary>
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectNamespace')
          .changed || state.matches('selectNamespace'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    {
      name: t('configuration'),
      isActive: state.matches('coreConfiguration'),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToCoreConfiguration')
          .changed || state.matches('coreConfiguration'),

      steps: loadSubSteps(),
    },
    {
      name: t('review'),
      isActive: state.matches('reviewConfiguration'),
      component: (
        <StepErrorBoundary>
          <Review />
        </StepErrorBoundary>
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToReviewConfiguration')
          .changed || state.matches('reviewConfiguration'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
      nextButtonText: t('createConnector'),
    },
  ];

  const flattenedSteps = getFlattenedSteps(steps) as Array<
    WizardStep & { isActive: boolean }
  >;

  const currentStep =
    flattenedSteps.reduceRight<number>((idx, s, currentIdx) => {
      return s.isActive && currentIdx > idx ? currentIdx : idx;
    }, -1) + 1;

  const onNext = () => send('next');
  const onBack = () => send('prev');
  const goToStep = (stepIndex: number) => {
    const fromStep = determineStepNameFromState();
    switch (stepIndex) {
      case 1:
        send({ type: 'jumpToSelectConnector', fromStep });
        break;
      case 2:
        send({ type: 'jumpToSelectKafka', fromStep });
        break;
      case 3:
        send({ type: 'jumpToSelectNamespace', fromStep });
        break;
      case 4:
        send({ type: 'jumpToCoreConfiguration', fromStep });
        break;
      case flattenedSteps.length:
        send({ type: 'jumpToReviewConfiguration', fromStep });
        break;
      default:
        // this combo represents the error handling step
        if (!hasCustomConfigurator && stepIndex === flattenedSteps.length - 1) {
          send({ type: 'jumpToErrorConfiguration', fromStep });
          return;
        }
        // if it's not the error handling step, it's some
        // sub-step of configuration
        const subStep = stepIndex - loadSubSteps().length - 1;
        const currentSubStep = currentStep - loadSubSteps().length - 1;
        if (stepIndex < flattenedSteps.length) {
          send({
            type: 'jumpToConfigureConnector',
            fromStep: `${fromStep} page ${currentSubStep}`,
            subStep,
          });
        }
    }
  };
  const goToStepById = (...args: any[]) => console.log('goToStepById', args);
  const goToStepByName = (...args: any[]) =>
    console.log('goToStepByName', args);

  return (
    <UncontrolledWizard
      className="cos"
      steps={steps}
      currentStep={currentStep}
      onNext={onNext}
      onBack={onBack}
      onClose={onClose}
      onSave={() => false}
      goToStep={goToStep}
      goToStepById={goToStepById}
      goToStepByName={goToStepByName}
      hasNoBodyPadding={true}
    />
  );
};
