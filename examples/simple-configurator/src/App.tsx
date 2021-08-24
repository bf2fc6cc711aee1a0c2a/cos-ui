import * as React from 'react';

import { SimpleConfigurator } from './SimpleConfigurator';

const App = () => (
  <div>
    <h1>Sample Configurator</h1>
    <SimpleConfigurator
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
