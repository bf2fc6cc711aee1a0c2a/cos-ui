import { inspect } from '@xstate/inspect';
import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DemoApp } from '@cos-ui/app';

inspect({
  iframe: false,
});

ReactDOM.render(<DemoApp />, document.getElementById('root'));
