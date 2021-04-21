import { ConnectorConfiguratorResponse } from '@kas-connectors/machines';
import { SimpleConfigurator } from './SimpleConfigurator';

const config: ConnectorConfiguratorResponse = {
  steps: false,
  Configurator: SimpleConfigurator
};

export default config;