import * as React from 'react';
import { ActorRefFrom } from 'xstate';
import { useMachine } from '@xstate/react';
import {
  configuratorMachine,
  kafkaInstancesMachine,
} from '@kas-connectors/machines';
import { UncontrolledWizard } from './UncontrolledWizard';
import { SelectKafkaInstance } from './SelectKafkaInstance';

type ConnectorConfiguratorProps = {
  authToken?: Promise<string>;
  basePath?: string;
}

export function ConnectorConfigurator({ authToken, basePath }: ConnectorConfiguratorProps) {
  const [state, send] = useMachine(configuratorMachine, {
    devTools: true,
    context: {
      authToken,
      basePath
    }
  });

  const steps = [
    {
      name: 'Select Kafka instance',
      isActive: state.matches('selectKafka'),
      component: (
        <SelectKafkaInstance
          actor={
            state.children.selectKafkaInstance as ActorRefFrom<
              typeof kafkaInstancesMachine
            >
          }
        />
      ),
      canJumpTo:
        configuratorMachine.transition(state, 'jumpToSelectKafka').changed ||
        state.matches('selectKafka'),
      enableNext: configuratorMachine.transition(state, 'next').changed,
    },
    {
      name: 'Select OCM cluster',
      isActive: state.matches('selectCluster'),
      component: <p>Clusters</p>,
      canJumpTo:
        configuratorMachine.transition(state, 'jumpToSelectCluster').changed ||
        state.matches('selectCluster'),
      enableNext: configuratorMachine.transition(state, 'next').changed,
    },
    {
      name: 'Connector',
      isActive: state.matches('selectConnector'),
      component: <p>Connector</p>,
      canJumpTo:
        configuratorMachine.transition(state, 'jumpToSelectConnector')
          .changed || state.matches('selectConnector'),
      enableNext: configuratorMachine.transition(state, 'next').changed,
    },
    {
      name: 'Configuration',
      isActive: state.matches('configureConnector'),
      component: <p>Configuration</p>,
      canJumpTo:
        configuratorMachine.transition(state, 'jumpToConfigureConnector')
          .changed || state.matches('configureConnector'),
      enableNext: configuratorMachine.transition(state, 'next').changed,
    },
    {
      name: 'Review',
      isActive: state.matches('reviewConfiguration'),
      component: <p>Review</p>,
      canJumpTo:
        configuratorMachine.transition(state, 'jumpToReviewConfiguration')
          .changed || state.matches('reviewConfiguration'),
      nextButtonText: 'Create connector',
    },
  ];

  const currentStep = steps.findIndex(s => s.isActive) + 1;

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
      case 4:
        send('jumpToConfigureConnector');
        break;
      case 5:
        send('jumpToReviewConfiguration');
        break;
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
      height={600}
    />
  );
}
