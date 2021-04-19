import * as React from 'react';
import { ConnectorType } from '@kas-connectors/api';
import { Properties } from './Properties';
import { FilterDefinition } from './FiltersDefinition';
import { DataOptions } from './DataOptions';
import { RuntimeOptions } from './RuntimeOptions';

export interface IDebeziumConfiguratorProps {
  activeStep: number;
  connector: ConnectorType;
  // internalState: unknown; // ???
  configuration: Map<string, unknown>;
  onChange: (configuration: Map<string, unknown>, isValid: boolean) => void;
}

export const DebeziumConfigurator: React.FC<IDebeziumConfiguratorProps> = props => {
  const PROPERTIES_STEP_ID = 0;
  const FILTER_CONFIGURATION_STEP_ID = 1;
  const DATA_OPTIONS_STEP_ID = 2;
  const RUNTIME_OPTIONS_STEP_ID = 3;

  function chooseStep(stepId: number) {
    switch (stepId) {
      case PROPERTIES_STEP_ID:
        return (
          <Properties
            configuration={props.configuration}
            onChange={(conf: Map<string, unknown>, status: boolean) =>
              props.onChange(conf, status)
            }
          ></Properties>
        );
      case FILTER_CONFIGURATION_STEP_ID:
        return (
          <FilterDefinition
            configuration={props.configuration}
            onChange={(conf: Map<string, unknown>, status: boolean) =>
              props.onChange(conf, status)
            }
          ></FilterDefinition>
        );
      case DATA_OPTIONS_STEP_ID:
        return (
          <DataOptions
            configuration={props.configuration}
            onChange={(conf: Map<string, unknown>, status: boolean) =>
              props.onChange(conf, status)
            }
          ></DataOptions>
        );
      case RUNTIME_OPTIONS_STEP_ID:
        return (
          <RuntimeOptions
            configuration={props.configuration}
            onChange={(conf: Map<string, unknown>, status: boolean) =>
              props.onChange(conf, status)
            }
          ></RuntimeOptions>
        );
      default:
        return <></>;
    }
  }

  return chooseStep(props.activeStep);
};
