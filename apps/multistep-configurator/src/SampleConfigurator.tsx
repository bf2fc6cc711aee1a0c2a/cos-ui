import * as React from 'react';
import { ConnectorConfiguratorProps } from '@kas-connectors/machines';

export const SampleConfigurator: React.FunctionComponent<ConnectorConfiguratorProps> = ({
  activeStep,
  connector,
  configuration,
  onChange,
}) => (
  <div>
    <p>Connector: {connector.name}</p>
    <p>Active step: {activeStep}</p>
    <p>
      Configuration: {JSON.stringify(configuration) || typeof configuration}
    </p>
    <button
      onClick={() =>
        onChange(
          {
            ...(configuration && configuration),
            ts: Date.now(),
          },
          true
        )
      }
    >
      Set valid
    </button>
  </div>
);
