import * as React from "react";
import { ConnectorType } from "@kas-connectors/api";
import { Title } from "@patternfly/react-core";
  
  export interface IDebeziumConfiguratorProps {
    activeStep: number;
    connector: ConnectorType;
    // internalState: unknown; // ???
    configuration: unknown;
    onChange: (configuration: unknown, isValid: boolean) => void;
  }
  
  export const DebeziumConfigurator: React.FC<IDebeziumConfiguratorProps> = (props) => {

    const PROPERTIES_STEP_ID = 0;
    const FILTER_CONFIGURATION_STEP_ID = 1;
    const DATA_OPTIONS_STEP_ID = 2;
    const RUNTIME_OPTIONS_STEP_ID = 3;

    function chooseStep(stepId: number) {
      switch (stepId) {
        case PROPERTIES_STEP_ID:
          return (
            <div>
              <Title headingLevel="h2">Properties</Title>
              <p>Active step {props.activeStep} of {props.connector.id}</p>
              <button onClick={() => props.onChange(props.activeStep === 3 ? {foo: "bar"} : undefined, true)}>Set valid</button>
            </div>
          );
        case FILTER_CONFIGURATION_STEP_ID:
          return (
            <div>
              <Title headingLevel="h2">Filter Configuration</Title>
              <p>Active step {props.activeStep} of {props.connector.id}</p>
              <button onClick={() => props.onChange(props.activeStep === 3 ? {foo: "bar"} : undefined, true)}>Set valid</button>
            </div>
          );
        case DATA_OPTIONS_STEP_ID:
          return (
            <div>
              <Title headingLevel="h2">Data Options</Title>
              <p>Active step {props.activeStep} of {props.connector.id}</p>
              <button onClick={() => props.onChange(props.activeStep === 3 ? {foo: "bar"} : undefined, true)}>Set valid</button>
            </div>
          );
        case RUNTIME_OPTIONS_STEP_ID:
          return (
            <div>
              <Title headingLevel="h2">Runtime Options</Title>
              <p>Active step {props.activeStep} of {props.connector.id}</p>
              <button onClick={() => props.onChange(props.activeStep === 3 ? {foo: "bar"} : undefined, true)}>Set valid</button>
            </div>
          );
        default:
          return <></>;
      }
    }
  
    return chooseStep(props.activeStep);
  
  };
  