import { ConnectorConfiguratorResponse } from '@cos-ui/machines';
import { SampleConfigurator } from './SampleConfigurator';

const config: ConnectorConfiguratorResponse = {
  steps: ["first step", "second step", "third step"],
  Configurator: SampleConfigurator
};

export default config;