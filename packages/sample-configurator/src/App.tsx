import * as React from 'react';

import { SampleConfigurator } from './SampleConfigurator';

const App = () => (
  <div>
    <h1>Sample Configurator</h1>
    <SampleConfigurator
      activeStep={123}
      configuration={{ foo: 'bar' }}
      connector={{ id: 'test', name: 'test', version: '123' }}
      onChange={(configuration, isValid) =>
        console.log('clicked', configuration, isValid)
      }
    />
  </div>
);

export default App;
