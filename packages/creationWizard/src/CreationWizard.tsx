import * as React from 'react';
import { useSelector, useService } from '@xstate/react';
import {
  creationWizardMachine,
  KafkaMachineActorRef,
  ConnectorsMachineActorRef,
  ClusterMachineActorRef,
} from '@kas-connectors/machines';
import {
  UncontrolledWizard,
  getFlattenedSteps,
  WizardStep,
} from './UncontrolledWizard';
import { SelectKafkaInstance } from './SelectKafkaInstance';
import { SelectCluster } from './SelectCluster';
import { SelectConnector } from './SelectConnector';
import { Configuration } from './Configuration';
import {
  useCreationWizardMachineService,
} from './CreationWizardContext';
import { Review } from './Review';

function useKafkaInstanceStep() {
  const service = useCreationWizardMachineService();
  const { isActive, actor, canJumpTo, enableNext } = useSelector(
    service,
    React.useCallback(
      (state: typeof service.state) => ({
        isActive: state.matches('selectKafka'),
        actor: state.children.selectKafkaInstance as KafkaMachineActorRef,
        canJumpTo:
          creationWizardMachine.transition(state, 'jumpToSelectKafka')
            .changed || state.matches('selectKafka'),
        enableNext: creationWizardMachine.transition(state, 'next').changed,
      }),
      [service]
    )
  );
  return {
    name: 'Select Kafka instance',
    isActive,
    component: <SelectKafkaInstance actor={actor} />,
    canJumpTo,
    enableNext,
  };
}

function useConfigurationStep() {
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
    React.useCallback(
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
    name: 'Configuration',
    isActive,
    canJumpTo,
    steps: steps
      ? steps.map((step, idx) => ({
          name: step,
          isActive: isActive && activeStep === idx,
          canJumpTo: canJumpToStep(idx),
          enableNext,
          component: <Configuration />,
        }))
      : undefined,
    enableNext,
    component: <Configuration />,
  };
}

export const CreationWizard: React.FunctionComponent = () => {
  const service = useCreationWizardMachineService();
  const [state, send] = useService(service);
  const kafkaInstanceStep = useKafkaInstanceStep();
  const configurationStep = useConfigurationStep();
  const steps = [
    kafkaInstanceStep,
    {
      name: 'Select OCM cluster',
      isActive: state.matches('selectCluster'),
      component: (
        <SelectCluster
          actor={
            state.children.selectCluster as ClusterMachineActorRef
          }
        />
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectCluster')
          .changed || state.matches('selectCluster'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    {
      name: 'Connector',
      isActive: state.matches('selectConnector'),
      component: (
        <SelectConnector
          actor={
            state.children.selectConnector as ConnectorsMachineActorRef
          }
        />
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectConnector')
          .changed || state.matches('selectConnector'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    configurationStep,
    {
      name: 'Review',
      isActive: state.matches('reviewConfiguration'),
      component: <Review />,
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToReviewConfiguration')
          .changed || state.matches('reviewConfiguration'),
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
  const onClose = () => false;
  const onSave = () => false;
  const goToStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        send('jumpToSelectKafka');
        break;
      case 2:
        send('jumpToSelectCluster');
        break;
      case 3:
        send('jumpToSelectConnector');
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
      steps={steps}
      currentStep={currentStep}
      onNext={onNext}
      onBack={onBack}
      onClose={onClose}
      onSave={onSave}
      goToStep={goToStep}
      goToStepById={goToStepById}
      goToStepByName={goToStepByName}
      hasNoBodyPadding={true}
    />
  );
};