import React, { FunctionComponent, useCallback } from 'react';
import { useSelector, useService } from '@xstate/react';
import {
  creationWizardMachine,
  useCreationWizardMachineService,
} from '@cos-ui/machines';
import {
  UncontrolledWizard,
  getFlattenedSteps,
  WizardStep,
} from './UncontrolledWizard';
import { SelectKafkaInstance } from './SelectKafkaInstance';
import { SelectCluster } from './SelectCluster';
import { SelectConnectorType } from './SelectConnectorType';
import { Configuration } from './Configuration';
import { Review } from './Review';
import { StepErrorBoundary } from './StepErrorBoundary';
import './CreationWizard.css';
import { useTranslation } from 'react-i18next';

function useKafkaInstanceStep() {
  const { t } = useTranslation();
  const service = useCreationWizardMachineService();
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
    name: t('Kafka instance'),
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

function useConfigurationStep() {
  const { t } = useTranslation();
  const service = useCreationWizardMachineService();
  const {
    isActive,
    activeStep,
    canJumpTo,
    canJumpToStep,
    enableNext,
    steps,
  } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('configureConnector'),
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToConfigureConnector')
            .changed || state.matches('configureConnector'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
        steps: state.context.configurationSteps,
        activeStep: state.context.activeConfigurationStep,
        canJumpToStep: (idx: number) =>
          creationWizardMachine.transition(state, {
            type: 'jumpToConfigureConnector',
            subStep: idx,
          }).changed,
      }),
      [service]
    )
  );
  return {
    name: t('Configurations'),
    isActive,
    canJumpTo,
    steps: steps
      ? steps.map((step, idx) => ({
          name: step,
          isActive: isActive && activeStep === idx,
          canJumpTo: canJumpToStep(idx),
          enableNext,
          component: (
            <StepErrorBoundary>
              <Configuration />
            </StepErrorBoundary>
          ),
        }))
      : undefined,
    enableNext,
    component: (
      <StepErrorBoundary>
        <Configuration />
      </StepErrorBoundary>
    ),
  };
}

export type CreationWizardProps = {
  onClose: () => void;
};

export const CreationWizard: FunctionComponent<CreationWizardProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const service = useCreationWizardMachineService();
  const [state, send] = useService(service);

  const kafkaInstanceStep = useKafkaInstanceStep();
  const configurationStep = useConfigurationStep();

  if (state.value === 'saved') return null;

  const steps = [
    {
      name: t('Connector category'),
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
      name: t('OSD cluster'),
      isActive: state.matches('selectCluster'),
      component: (
        <StepErrorBoundary>
          <SelectCluster />
        </StepErrorBoundary>
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectCluster')
          .changed || state.matches('selectCluster'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    configurationStep,
    {
      name: t('Review'),
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
      nextButtonText: 'Create connector',
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
        send('jumpToSelectCluster');
        break;
      // case 4:
      //   send('jumpToConfigureConnector');
      //   break;
      case flattenedSteps.length:
        send('jumpToReviewConfiguration');
        break;
      default:
        if (stepIndex < flattenedSteps.length) {
          send({ type: 'jumpToConfigureConnector', subStep: stepIndex - 4 });
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
