import { ConnectorConfiguratorResponse } from '@kas-connectors/machines';
import { SampleConfigurator } from './SampleConfigurator';

const config: ConnectorConfiguratorResponse = {
  steps: ["first step", "second step", "third step"],
  Configurator: SampleConfigurator
};

export default config;