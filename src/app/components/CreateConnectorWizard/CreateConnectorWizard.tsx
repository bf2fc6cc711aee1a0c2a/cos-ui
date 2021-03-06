import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import {
  getFlattenedSteps,
  UncontrolledWizard,
  WizardStep,
} from '@app/components/UncontrolledWizard/UncontrolledWizard';
import { creationWizardMachine } from '@app/machines/CreateConnectorWizard.machine';
import { ConfiguratorActorRef } from '@app/machines/StepConfigurator.machine';
import { StepCommon } from '@app/pages/CreateConnectorPage/StepCommon';
import { ConfiguratorStep } from '@app/pages/CreateConnectorPage/StepConfigurator';
import { SelectConnectorType } from '@app/pages/CreateConnectorPage/StepConnectorTypes';
import { StepErrorHandling } from '@app/pages/CreateConnectorPage/StepErrorHandling';
import { SelectKafkaInstance } from '@app/pages/CreateConnectorPage/StepKafkas';
import { SelectNamespace } from '@app/pages/CreateConnectorPage/StepNamespace';
import { Review } from '@app/pages/CreateConnectorPage/StepReview';
import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSelector, useActor } from '@xstate/react';

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

function useBasicStep() {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { isActive, canJumpTo, enableNext } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('basicConfiguration'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToBasicConfiguration')
            .changed || state.matches('basicConfiguration'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
        activeStep: state.context.activeConfigurationStep,
      }),
      [service]
    )
  );
  return {
    name: t('core'),
    isActive,
    component: (
      <StepErrorBoundary>
        <StepCommon />
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

export const CreateConnectorWizard: FunctionComponent<CreateConnectorWizardProps> =
  ({ onClose }) => {
    const { t } = useTranslation();
    const service = useCreateConnectorWizardService();
    const [state, send] = useActor(service);

    let { hasCustomConfigurator, activeStep, configureSteps } = useSelector(
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
    const basicStep = useBasicStep();
    const connectorSpecificStep = useConnectorSpecificStep();
    const errorHandlingStep = useErrorHandlingStep();

    if (state.value === 'saved') return null;
    const canJumpToStep = (idx: number) => {
      return creationWizardMachine.transition(state, {
        type: 'jumpToConfigureConnector',
        subStep: idx,
      }).changed;
    };

    const loadSubSteps = () => {
      let finalSteps: any = [basicStep];
      if (hasCustomConfigurator && configureSteps !== undefined) {
        configureSteps
          ? configureSteps.map((step, idx) => {
              finalSteps.push({
                name: step,
                isActive:
                  state.matches('configureConnector') && activeStep === idx,
                component: (
                  <StepErrorBoundary>
                    <ConfiguratorStep />
                  </StepErrorBoundary>
                ),
                canJumpTo: canJumpToStep(idx + 1),
                enableNext: creationWizardMachine.transition(state, 'next')
                  .changed,
              });
            })
          : undefined;
      }
      if (
        (!hasCustomConfigurator && configureSteps === undefined) ||
        configureSteps === false
      ) {
        finalSteps.push(connectorSpecificStep);
        finalSteps.push(errorHandlingStep);
      }
      return finalSteps;
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
        isActive: state.matches('basicConfiguration'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToBasicConfiguration')
            .changed || state.matches('basicConfiguration'),

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
      flattenedSteps.reduceRight<number>(
        (idx, s, currentIdx) =>
          s.isActive && currentIdx > idx ? currentIdx : idx,
        -1
      ) + 1;

    const onNext = () => send('next');
    const onBack = () => send('prev');
    const goToStep = (stepIndex: number) => {
      switch (stepIndex) {
        case 1:
          send('jumpToSelectConnector');
          break;
        case 2:
          send('jumpToSelectKafka');
          break;
        case 3:
          send('jumpToSelectNamespace');
          break;
        case 4:
          send('jumpToBasicConfiguration');
          break;
        case 5:
          send('jumpToConfigureConnector');
          break;
        case 6:
          send('jumpToErrorConfiguration');
          break;
        case flattenedSteps.length:
          send('jumpToReviewConfiguration');
          break;
        default:
          if (stepIndex < flattenedSteps.length) {
            send({ type: 'jumpToConfigureConnector', subStep: stepIndex - 6 });
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
