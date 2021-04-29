import * as React from 'react';
import { ConnectorConfiguratorProps } from '@cos-ui/machines';

export const SimpleConfigurator: React.FunctionComponent<ConnectorConfiguratorProps> = ({
  activeStep,
  connector,
  configuration,
  onChange,
}) => (
  <div>
    <h2>Simple configurator</h2>
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
