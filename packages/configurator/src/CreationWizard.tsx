import * as React from 'react';
import { ActorRefFrom } from 'xstate';
import { useMachine } from '@xstate/react';
import {
  creationWizardMachine,
  kafkasMachine,
  clustersMachine,
  connectorsMachine,
  configuratorMachine,
  ConnectorConfiguratorType, 
  ConnectorConfiguratorProps
} from '@kas-connectors/machines';
import { ConnectorType } from "@kas-connectors/api";
import { UncontrolledWizard, getFlattenedSteps, WizardStep } from './UncontrolledWizard';
import { SelectKafkaInstance } from './SelectKafkaInstance';
import { SelectCluster } from './SelectCluster';
import { SelectConnector } from './SelectConnector';
import { Configuration } from './Configuration';


const SampleMultiStepConfigurator: React.FunctionComponent<ConnectorConfiguratorProps> = props => (
  <div>
    <p>Active step {props.activeStep} of {props.connector.id}</p>
    <button onClick={() => props.onChange(props.activeStep === 2 ? {foo: "bar"} : undefined, true)}>Set valid</button>
  </div>
);

const fetchConfigurator = (
  connector: ConnectorType
): Promise<ConnectorConfiguratorType> => {

  switch (connector.id) {
    case 'aws-kinesis-source':
      // this will come from a remote entry point, eg. debezium
      return Promise.resolve({
        steps: ['First step', 'Second step', 'Third step'],
        configurator: SampleMultiStepConfigurator,
        isValid: false,
        activeStep: 0
      });
    default:
      return Promise.resolve(null);
  }
};

type CreationWizardProps = {
  authToken?: Promise<string>;
  basePath?: string;
};

export function CreationWizard({
  authToken,
  basePath,
}: CreationWizardProps) {
  const [state, send] = useMachine(creationWizardMachine, {
    devTools: true,
    context: {
      authToken,
      basePath,
    },
    services: {
      makeConfiguratorMachine: () => configuratorMachine.withConfig({
        services: {
          fetchConfigurator: (context) => fetchConfigurator(context.connector)
        }
      })
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
              typeof kafkasMachine
            >
          }
        />
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectKafka').changed ||
        state.matches('selectKafka'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    {
      name: 'Select OCM cluster',
      isActive: state.matches('selectCluster'),
      component: (
        <SelectCluster
          actor={
            state.children.selectCluster as ActorRefFrom<typeof clustersMachine>
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
            state.children.selectConnector as ActorRefFrom<
              typeof connectorsMachine
            >
          }
        />
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToSelectConnector')
          .changed || state.matches('selectConnector'),
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    {
      name: 'Configuration',
      isActive: state.matches('configureConnector'),
      component: (
        <Configuration
          actor={
            state.children.configureConnector as ActorRefFrom<
              typeof configuratorMachine
            >
          }
        />
      ),
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToConfigureConnector')
          .changed || state.matches('configureConnector'),
      steps: state.context.configurationSteps
        ? state.context.configurationSteps.map((s, idx) => ({
            id: idx,
            name: s,
            isActive: state.matches('configureConnector') && state.context.activeConfigurationStep === idx,
            canJumpTo: creationWizardMachine.transition(state, { type:'jumpToConfigureConnector', subStep: idx })
            .changed,
            enableNext: (creationWizardMachine.transition(state, 'next').value === "reviewConfiguration") || state.context.isConfigurationValid,
            component: (
              <Configuration
                actor={
                  state.children.configureConnector as ActorRefFrom<
                    typeof configuratorMachine
                  >
                }
              />
            ),
          }))
        : undefined,
      enableNext: creationWizardMachine.transition(state, 'next').changed,
    },
    {
      name: 'Review',
      isActive: state.matches('reviewConfiguration'),
      component: <p>Review</p>,
      canJumpTo:
        creationWizardMachine.transition(state, 'jumpToReviewConfiguration')
          .changed || state.matches('reviewConfiguration'),
      nextButtonText: 'Create connector',
    },
  ];

  const flattenedSteps = (getFlattenedSteps(steps) as Array<WizardStep & {isActive: boolean}>);
  const currentStep = flattenedSteps.reduceRight<number>((idx, s, currentIdx) => (s.isActive && currentIdx > idx) ? currentIdx : idx, -1) + 1;

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
      case flattenedSteps.length:
        send('jumpToReviewConfiguration');
        break;
      default:
        if (stepIndex < flattenedSteps.length) {
          send({ type: 'jumpToConfigureConnector', subStep: stepIndex - 4 })
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
      height={600}
    />
  );
}
