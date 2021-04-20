#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { App } from './App';
import { MachineProvider } from './Context';

const cli = meow(
  `
	Usage
	  $ %NAME%

	Options
		--token  Your OCM token
		--server  API base path

	Examples
	  $ %NAME% --token=xxx
`,
  {
    flags: {
      token: {
        type: 'string',
        isRequired: true,
      },
      server: {
        type: 'string',
        default: 'https://api.openshift.com',
      },
    },
  }
);

render(
  <MachineProvider authToken={cli.flags.token} basePath={cli.flags.server}>
    <App />
  </MachineProvider>
);
