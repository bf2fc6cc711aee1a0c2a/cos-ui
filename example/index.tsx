import { inspect } from '@xstate/inspect';
import 'react-app-polyfill/ie11';
import "@patternfly/react-core/dist/styles/base.css";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectorConfigurator } from '@kas-connectors/configurator';

inspect({
  iframe: () => document.querySelector('iframe[data-xstate]')
});

const App = () => {
  return (
    <div data-test-id="zop">
      <ConnectorConfigurator />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
